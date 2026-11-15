import { ProfileForm } from "../../components/ProfileForm";
import { pageTitle } from "../../components/ui";

export const metadata = { title: "Your profile — Pathway" };

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-8">
        <h1 className={pageTitle}>Your career profile</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Tell us what you can do, where you want to work and which languages you work in. One profile is compared with
          every role. A field left blank is shown as &ldquo;not provided&rdquo; and is never counted as a match.
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}
