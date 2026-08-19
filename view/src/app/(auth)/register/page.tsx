import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function RegisterPage() {
  return <AuthShell><AuthForm mode="register" /></AuthShell>;
}
