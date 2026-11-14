import { ProfileForm } from "../../components/ProfileForm";

export const metadata = { title: "Your profile — Pathway" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your career profile</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Your profile is compared with every opportunity. Any field left blank is shown as “not provided” in your results and is never counted as a match.
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}
