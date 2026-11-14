import { ProfileForm } from "../../components/ProfileForm";

export const metadata = { title: "Your profile — Pathway" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Your career profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          We compare this profile with each opportunity. Fields you leave empty are marked as unknown in your results,
          not counted as a match.
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}
