import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { wrap } from "./ui";

/**
 * Full-width navy header band shared by every page, matching the landing hero.
 * Right side shows either a photo (fading into the field) or a diagram (`aside`).
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  photo,
  photoAlt = "",
  aside,
  children,
  compact = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  photo?: StaticImageData;
  photoAlt?: string;
  aside?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
}) {
  const split = Boolean(photo || aside);
  return (
    <section className="on-field relative overflow-hidden bg-field text-on-field">
      {photo && (
        <div className="absolute inset-0 lg:left-1/2">
          <Image src={photo} alt={photoAlt} fill priority placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-20 lg:opacity-100" />
          <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-field to-transparent lg:block" aria-hidden />
        </div>
      )}
      <div className={`${wrap} relative grid gap-10 ${compact ? "py-10 sm:py-12" : "py-12 sm:py-16"} ${split ? "lg:grid-cols-2 lg:items-center" : ""}`}>
        <div className={split ? "lg:pr-10" : "max-w-3xl"}>
          {eyebrow && <div className="text-sm font-bold uppercase tracking-wider text-on-field-muted">{eyebrow}</div>}
          <h1 className={`${eyebrow ? "mt-2 " : ""}text-4xl font-extrabold leading-[1.02] tracking-tighter sm:text-6xl`}>{title}</h1>
          {intro && <div className="mt-5 max-w-xl text-lg text-on-field-muted">{intro}</div>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
        {photo && !aside && <div className="hidden min-h-64 lg:block" aria-hidden />}
      </div>
    </section>
  );
}

/** Big numbers for a hero band. */
export function HeroStats({ items }: { items: { value: ReactNode; label: string }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-px border border-on-field-muted/40 bg-on-field-muted/40">
      {items.map((s) => (
        <div key={s.label} className="bg-field/90 px-3 py-3 sm:px-4">
          <dt className="text-xs font-semibold text-on-field-muted">{s.label}</dt>
          <dd className="mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Full-width closing band with a faint photo behind. */
export function CtaBand({ title, photo, children }: { title: ReactNode; photo: StaticImageData; children: ReactNode }) {
  return (
    <section className="on-field relative overflow-hidden bg-field text-on-field" aria-labelledby="cta-h">
      <Image src={photo} alt="" fill sizes="100vw" className="object-cover opacity-15" />
      <div className={`${wrap} relative py-16 sm:py-20`}>
        <h2 id="cta-h" className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
        <div className="mt-6 flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
