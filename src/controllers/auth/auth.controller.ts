import { type Request, type Response } from "express";
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { User } from "../../models/user.model.ts";
import { signToken } from "../../utils/jwt.ts";
import {
  loginSchema,
  oauthExchangeSchema,
  registerSchema,
} from "../../schemas/auth.schema.ts";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { AppError } from "../../utils/app-error.ts";
import type { AuthedRequest } from "../../middlewares/auth.middleware.ts";
import {
  hashAccessToken,
  RevokedToken,
} from "../../models/revoked-token.model.ts";
import { env } from "../../config/env.ts";

type OAuthAccountDocument = {
  user: mongoose.Types.ObjectId;
  provider: string;
  providerAccountId: string;
  email: string;
};

const OAuthAccount: mongoose.Model<OAuthAccountDocument> =
  (mongoose.models.OAuthAccount as mongoose.Model<OAuthAccountDocument>) ??
  mongoose.model<OAuthAccountDocument>(
    "OAuthAccount",
    new mongoose.Schema<OAuthAccountDocument>(
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        provider: { type: String, required: true },
        providerAccountId: { type: String, required: true },
        email: { type: String, required: true },
      },
      { timestamps: true },
    ),
  );

type OAuthAccountLoginDocument = {
  codeHash: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  usedAt?: Date;
};

const OAuthAccountLogin: mongoose.Model<OAuthAccountLoginDocument> =
  (mongoose.models.OAuthAccountLogin as mongoose.Model<OAuthAccountLoginDocument>) ??
  mongoose.model<OAuthAccountLoginDocument>(
    "OAuthAccountLogin",
    new mongoose.Schema(
      {
        codeHash: { type: String, required: true, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        expiresAt: { type: Date, required: true },
        usedAt: { type: Date },
      },
      { timestamps: true },
    ),
  );

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const OAUTH_STATE_COOKIE = "ticket-booking.oauth-state";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

type GoogleClaims = {
  sub?: string;
  email?: string;
  name?: string;
  email_verified?: string;
  iss?: string;
  aud?: string;
  exp?: string;
  nonce?: string;
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing)
    throw new AppError(409, "Email already in use", {
      email: ["Email already in use"],
    });

  const user = await User.create({ name, email, password });
  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.status(201).json({ success: true, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select("+password");
  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  res.status(200).json({ success: true, token });
};

export const logout = async (req: AuthedRequest, res: Response) => {
  const expiresAt = req.user?.exp;
  const token = req.accessToken;

  if (!token || !expiresAt) throw new AppError(401, "Invalid or expired token");

  await RevokedToken.updateOne(
    { tokenHash: hashAccessToken(token) },
    { $setOnInsert: { expiresAt: new Date(expiresAt * 1000) } },
    { upsert: true },
  );

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const startGoogleOAuth = (_req: Request, res: Response) => {
  const google = getGoogleConfig();

  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const signedState = signOAuthState({
    state,
    nonce,
    codeVerifier,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
  });
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  res.setHeader(
    "Set-Cookie",
    serializeCookie(OAUTH_STATE_COOKIE, signedState, OAUTH_STATE_TTL_MS / 1000),
  );

  const params = new URLSearchParams({
    client_id: google.clientId,
    redirect_uri: google.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });

  res.redirect(`${GOOGLE_AUTHORIZE_URL}?${params.toString()}`);
};

export const handleGoogleOAuthCallback = async (
  req: Request,
  res: Response,
) => {
  const google = getGoogleConfig();
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const returnedState =
    typeof req.query.state === "string" ? req.query.state : "";
  const signedState = parseCookies(req.headers.cookie ?? "")[
    OAUTH_STATE_COOKIE
  ];

  if (!code || !returnedState || !signedState)
    throw new AppError(400, "Invalid OAuth callback");

  const oauthState = verifyOAuthState(signedState);
  if (oauthState.state !== returnedState)
    throw new AppError(400, "OAuth state validation failed");

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: google.clientId,
      client_secret: google.clientSecret,
      redirect_uri: google.callbackUrl,
      grant_type: "authorization_code",
      code_verifier: oauthState.codeVerifier,
    }),
  });

  if (!tokenResponse.ok)
    throw new AppError(401, "Google authorization could not be completed");
  const tokenPayload = (await tokenResponse.json()) as { id_token?: string };
  if (!tokenPayload.id_token)
    throw new AppError(401, "Google did not return an identity token");

  const claims = await verifyGoogleIdToken(
    tokenPayload.id_token,
    oauthState.nonce,
    google.clientId,
  );
  const user = await findOrCreateGoogleUser(claims);
  const loginCode = randomBytes(32).toString("base64url");

  await OAuthAccountLogin.create({
    codeHash: hashOAuthCode(loginCode),
    user: user._id,
    expiresAt: new Date(Date.now() + 60_000),
  });

  res.setHeader("Set-Cookie", serializeCookie(OAUTH_STATE_COOKIE, "", 0));
  const redirect = new URL("/oauth/callback", google.frontendUrl);
  redirect.searchParams.set("code", loginCode);
  res.redirect(redirect.toString());
};

export const exchangeGoogleOAuthCode = async (req: Request, res: Response) => {
  const { code } = oauthExchangeSchema.parse(req.body);
  const record = await OAuthAccountLogin.findOneAndUpdate(
    {
      codeHash: hashOAuthCode(code),
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: true },
  );
  if (!record) throw new AppError(401, "OAuth code is invalid or expired");

  const user = await User.findById(record.user);
  if (!user) throw new AppError(401, "User account no longer exists");
  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  res.status(200).json({ success: true, token });
};

function getGoogleConfig() {
  if (
    !env.googleClientId ||
    !env.googleClientSecret ||
    !env.googleCallbackUrl ||
    !env.frontendUrl
  ) {
    throw new AppError(503, "Google sign-in is not configured");
  }

  return {
    clientId: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackUrl: env.googleCallbackUrl,
    frontendUrl: env.frontendUrl,
  };
}

function signOAuthState(payload: {
  state: string;
  nonce: string;
  codeVerifier: string;
  expiresAt: number;
}) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", env.jwtSecret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyOAuthState(value: string) {
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) throw new AppError(400, "OAuth state is invalid");
  const expected = createHmac("sha256", env.jwtSecret)
    .update(encoded)
    .digest("base64url");
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) throw new AppError(400, "OAuth state is invalid");
  let payload: {
    state: string;
    nonce: string;
    codeVerifier: string;
    expiresAt: number;
  };
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as typeof payload;
  } catch {
    throw new AppError(400, "OAuth state is invalid");
  }
  if (payload.expiresAt <= Date.now())
    throw new AppError(400, "OAuth state has expired");
  return payload;
}

async function verifyGoogleIdToken(
  idToken: string,
  expectedNonce: string,
  clientId: string,
): Promise<Required<Pick<GoogleClaims, "sub" | "email">> & GoogleClaims> {
  const response = await fetch(
    `${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!response.ok) throw new AppError(401, "Google identity token is invalid");
  const claims = (await response.json()) as GoogleClaims;
  if (
    claims.iss !== "https://accounts.google.com" &&
    claims.iss !== "accounts.google.com"
  )
    throw new AppError(401, "Google identity issuer is invalid");
  if (claims.aud !== clientId || claims.nonce !== expectedNonce)
    throw new AppError(401, "Google identity token validation failed");
  if (
    !claims.sub ||
    !claims.email ||
    claims.email_verified !== "true" ||
    Number(claims.exp) <= Math.floor(Date.now() / 1000)
  )
    throw new AppError(401, "Google account identity is not verified");
  return claims as Required<Pick<GoogleClaims, "sub" | "email">> & GoogleClaims;
}

async function findOrCreateGoogleUser(
  claims: Required<Pick<GoogleClaims, "sub" | "email">> & GoogleClaims,
) {
  const existingAccount = await OAuthAccount.findOne({
    provider: "google",
    providerAccountId: claims.sub,
  });
  if (existingAccount) {
    const user = await User.findById(existingAccount.user);
    if (user) return user;
  }

  const existingUser = await User.findOne({
    email: claims.email.toLowerCase(),
  });
  const user =
    existingUser ??
    (await User.create({
      name: claims.name?.trim() || claims.email.split("@")[0] || "Google user",
      email: claims.email.toLowerCase(),
      role: "user",
      password: randomBytes(32).toString("base64url"),
    }));
  await OAuthAccount.create({
    user: user._id,
    provider: "google",
    providerAccountId: claims.sub,
    email: claims.email,
  });
  return user;
}

function hashOAuthCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

function serializeCookie(name: string, value: string, maxAge: number) {
  const secure = env.nodeEnv === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Max-Age=${Math.max(0, Math.floor(maxAge))}; Path=/auth/oauth; HttpOnly; SameSite=Lax${secure}`;
}

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name && value) result[name] = decodeURIComponent(value);
  }
  return result;
}
