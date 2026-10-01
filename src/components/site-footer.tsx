import Link from "next/link";
import { BookOpen, Mail, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-sm font-bold">Madrasah Irshad-e-Madina</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Online Quran School
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Structured, one-to-one Qur&apos;an and Islamic learning with qualified teachers,
              daily revision and full parent visibility — for families in the UK, USA and Canada.
              Continuing the legacy of a madrasa founded in Lahore, 2011.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a
                href="https://wa.me/442079460958"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp: +44 20 7946 0958
              </a>
              <a
                href="mailto:info@irshademadina.com"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" aria-hidden /> info@irshademadina.com
              </a>
            </div>
          </div>

          <nav aria-label="Footer — explore">
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li><Link href="/story" className="inline-block py-1 hover:text-foreground">Our Story</Link></li>
              <li><Link href="/teachers" className="inline-block py-1 hover:text-foreground">Teachers</Link></li>
              <li><Link href="/quran" className="inline-block py-1 hover:text-foreground">Qur&apos;an Reader</Link></li>
              <li><Link href="/#programs" className="inline-block py-1 hover:text-foreground">Programs</Link></li>
              <li><Link href="/how-it-works" className="inline-block py-1 hover:text-foreground">How It Works</Link></li>
              <li><Link href="/book-assessment" className="inline-block py-1 hover:text-foreground">Book Free Assessment</Link></li>
            </ul>
          </nav>

          <nav aria-label="Footer — information">
            <h3 className="text-sm font-semibold">Information</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="inline-block py-1 hover:text-foreground">Pricing &amp; Policies</Link></li>
              <li><Link href="/safeguarding" className="inline-block py-1 hover:text-foreground">Safeguarding</Link></li>
              <li><Link href="/faq" className="inline-block py-1 hover:text-foreground">FAQ &amp; Contact</Link></li>
              <li><Link href="/legal/privacy" className="inline-block py-1 hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="inline-block py-1 hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </nav>
        </div>

        <div className="pattern-divider mt-8" />
        <div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Madrasah Irshad-e-Madina. All rights reserved.</p>
          <p className="max-w-xl">
            Qur&apos;an text: Uthmani script from Tanzil.net (public dataset), rendered with
            Amiri Quran &amp; Scheherazade New fonts (SIL Open Font License). Unedited verified text.
          </p>
        </div>
      </div>
    </footer>
  );
}
