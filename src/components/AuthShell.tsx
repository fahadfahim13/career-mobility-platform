import { Check } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import hero from "../../public/images/hero.webp";

const POINTS = [
  "Every match scored 0–100, with the working shown",
  "Right to work shown separately, never assumed",
  "Official steps to verify for each country",
];

/** Full-width split for sign-in and sign-up: photo and promise on the field, the form on paper. */
export function AuthShell({ children, photo = hero }: { children: ReactNode; photo?: StaticImageData }) {
  return (
    <div className="grid grid-cols-1 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-2">
      <aside className="on-field relative overflow-hidden bg-field text-on-field">
        <Image src={photo} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-25" />
        <div className="relative flex h-full flex-col justify-center px-5 py-10 sm:px-10 lg:py-16 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
          <p className="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-5xl">The right match, across borders.</p>
          <ul className="mt-8 hidden space-y-4 sm:block">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">{children}</div>
    </div>
  );
}
