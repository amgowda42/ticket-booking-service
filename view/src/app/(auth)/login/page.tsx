import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function LoginPage() {
  return <AuthShell><AuthForm mode="login" /></AuthShell>;
}
