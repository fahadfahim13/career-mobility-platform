import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import { Mark, Nav } from "../components/Nav";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "Pathway — Find work abroad. Hire from abroad.",
  description:
    "International job matching for candidates and employers. Every match gets a clear score, and right to work is shown separately.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${archivo.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-paper focus:text-ink focus:px-3 focus:py-2 focus:font-bold">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">{children}</main>
        <footer className="mt-12 bg-ink text-paper">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <p className="flex items-center gap-2.5 text-lg font-extrabold">
                <Mark className="size-6" /> Pathway
              </p>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                Prototype built for a technical assessment. All organisations, roles and salaries are fictional.
              </p>
            </div>
            <div className="text-sm sm:col-span-4">
              <p className="font-bold">Pathway explains. You decide.</p>
              <p className="mt-2 text-slate-300">
                Match results are guidance, not an employer&apos;s hiring decision. Eligibility information is for reference only
                and is not legal or immigration advice. Always confirm with the official authority.
              </p>
            </div>
            <ul className="space-y-1 text-sm sm:col-span-3">
              <li><Link href="/how-it-works" className="hover:underline">How matching works</Link></li>
              <li><Link href="/how-it-works#privacy" className="hover:underline">Your data stays in this browser</Link></li>
              <li><a href="https://github.com/fahadfahim13/career-mobility-platform" className="hover:underline">Source code</a></li>
            </ul>
          </div>
        </footer>
      </body>
    </html>
  );
}
