import { AuthForm } from "../../components/AuthForm";
import { AuthShell } from "../../components/AuthShell";

export const metadata = { title: "Sign in — Pathway" };

export default function SignInPage() {
  return (
    <AuthShell>
      <AuthForm mode="signin" initialRole="seeker" />
    </AuthShell>
  );
}
