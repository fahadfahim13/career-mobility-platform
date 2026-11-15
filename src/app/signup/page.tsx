import { AuthForm } from "../../components/AuthForm";
import { AuthShell } from "../../components/AuthShell";

export const metadata = { title: "Create an account — Pathway" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return (
    <AuthShell>
      <AuthForm mode="signup" initialRole={role === "employer" ? "employer" : "seeker"} />
    </AuthShell>
  );
}
