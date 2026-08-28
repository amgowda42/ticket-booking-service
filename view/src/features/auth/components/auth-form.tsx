"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/features/auth/api/auth-api";
import {
  getApiErrorMessage,
  getApiFieldErrors,
} from "@/lib/api/get-api-error-message";
import { saveAccessToken } from "@/lib/auth/session";
import { toast } from "sonner";

type AuthMode = "login" | "register";

function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const isRegister = mode === "register";
  const isLoading = loginState.isLoading || registerState.isLoading;

  function continueWithGoogle() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
    router.push(`${apiUrl}/auth/oauth/google`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = isRegister
        ? await register({
            name: String(formData.get("name") ?? ""),
            email,
            password,
          }).unwrap()
        : await login({ email, password }).unwrap();

      saveAccessToken(result.token);
      toast.success(
        isRegister ? "Account created successfully" : "Signed in successfully",
      );
      router.replace("/");
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      setFieldErrors(getApiFieldErrors(requestError));
      toast.error(message);
    }
  }

  const title = isRegister ? "Create your account" : "Welcome back";
  const description = isRegister
    ? "Start discovering events worth attending."
    : "Sign in to manage your bookings and upcoming events.";

  return (
    <Card className="w-full p-6 sm:p-8">
      <div>
        <p className="text-sm font-medium text-accent">
          {isRegister ? "Join Seatwise" : "Sign in to Seatwise"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <form className="mt-6 space-y-4 md:mt-5" onSubmit={onSubmit} noValidate>
        {isRegister && (
          <FormField
            id="name"
            label="Full name"
            icon={<UserRound />}
            autoComplete="name"
            required
            error={fieldErrors.name?.[0]}
          />
        )}
        <FormField
          id="email"
          label="Email address"
          icon={<Mail />}
          type="email"
          autoComplete="email"
          required
          error={fieldErrors.email?.[0]}
        />
        <FormField
          id="password"
          label="Password"
          icon={<LockKeyhole />}
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={isRegister ? 8 : undefined}
          required
          hint={isRegister ? "Use at least 8 characters." : undefined}
          error={fieldErrors.password?.[0]}
        />
        {error && (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        <Button
          className="h-11 w-full rounded-xl"
          size="lg"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <>
              {isRegister ? "Create account" : "Sign in"}
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        className="h-11 w-full rounded-xl"
        type="button"
        variant="outline"
        onClick={continueWithGoogle}
      >
        <Globe2 aria-hidden="true" />
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isRegister ? "Already have an account?" : "New to Seatwise?"}{" "}
        <button
          type="button"
          className="font-medium text-primary hover:text-primary/80"
          onClick={() => router.push(isRegister ? "/login" : "/register")}
        >
          {isRegister ? "Sign in" : "Create an account"}
        </button>
      </p>
    </Card>
  );
}

function FormField({
  id,
  label,
  icon,
  hint,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  error?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
          {icon}
        </span>
        <Input
          id={id}
          name={id}
          className="pl-10"
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export { AuthForm };
