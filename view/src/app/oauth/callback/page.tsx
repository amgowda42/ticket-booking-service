"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useExchangeGoogleOAuthCodeMutation } from "@/features/auth/api/auth-api";
import { saveAccessToken } from "@/lib/auth/session";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [exchangeCode] = useExchangeGoogleOAuthCodeMutation();
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).has("code")
      ? null
      : "Google sign-in did not return a login code.";
  });

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    let isCurrent = true;
    void exchangeCode({ code })
      .unwrap()
      .then((result) => {
        if (!isCurrent) return;
        saveAccessToken(result.token);
        router.replace("/");
      })
      .catch(() => {
        if (isCurrent) setError("Google sign-in could not be completed.");
      });

    return () => {
      isCurrent = false;
    };
  }, [exchangeCode, router]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Sign-in failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/login" className="mt-5 text-sm font-medium text-primary">
            Return to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
      Completing sign-in...
    </main>
  );
}
