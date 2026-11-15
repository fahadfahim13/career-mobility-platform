import { ProfileForm } from "../../components/ProfileForm";
import { HeroStats, PageHero } from "../../components/PageHero";
import { wrap } from "../../components/ui";
import seeker from "../../../public/images/seeker.webp";

export const metadata = { title: "Your profile — Pathway" };

export default function ProfilePage() {
  return (
    <>
      <PageHero
        eyebrow="Step 1 of 3"
        title="Your career profile"
        intro="One profile is compared with every role. A blank field is shown as “not provided” and never counts as a match."
        photo={seeker}
        photoAlt="A person applying for jobs on a laptop"
      >
        <HeroStats items={[{ value: "5 min", label: "To complete" }, { value: "6", label: "Criteria scored" }, { value: "0", label: "Shared until you apply" }]} />
      </PageHero>
      <div className={`${wrap} py-12 sm:py-16`}>
        <ProfileForm />
      </div>
    </>
  );
}
