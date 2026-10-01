import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Madrasah Irshad-e-Madina collects, uses and protects your family's data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

          <Card className="mt-8">
            <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-foreground/90">
              <section>
                <h2 className="mb-2 text-base font-semibold">1. Who we are</h2>
                <p>
                  Madrasah Irshad-e-Madina (&quot;we&quot;, &quot;the madrasa&quot;) is an online
                  Qur&apos;an school founded in Lahore, Pakistan in 2011, teaching families in the
                  UK, USA and Canada. For questions about this policy contact
                  info@irshademadina.com.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">2. What we collect — the minimum</h2>
                <p>
                  We follow a strict minimum-data principle for children&apos;s information. For
                  enrollment we collect: the student&apos;s first name, age, current level, and the
                  parent/guardian&apos;s name and contact details (email, phone/WhatsApp). For
                  teaching we keep records of lessons assigned, feedback and progress. We do not
                  collect or store payment card details — all payments run through a hosted
                  checkout provider.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">3. Children&apos;s data</h2>
                <p>
                  Students in our platform are children. Their profiles are visible only to their
                  assigned teacher, their parent/guardian and authorized administrators — enforced
                  by role-based access in our database. We never publish student names, photos or
                  progress publicly without a parent&apos;s written consent. Parents may request a
                  copy or deletion of their child&apos;s data at any time by emailing us.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">4. The public Qur&apos;an reader</h2>
                <p>
                  Our public Qur&apos;an reader at /quran is free and requires no login. We do not
                  track what you read in it. No student data or lesson highlights are ever shown in
                  the public reader.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">5. How we use data</h2>
                <p>
                  To assess and place students, schedule and teach lessons, share progress with
                  parents, process payments and improve our teaching. We use standard analytics that
                  do not profile children. We never sell data.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">6. Data sharing</h2>
                <p>
                  Only with: our teachers (for their assigned students), our payment provider
                  (hosted checkout), and email/message delivery services. Legal bases under UK GDPR
                  include contract performance (teaching your child) and legitimate interest
                  (operating the school).
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">7. Your rights</h2>
                <p>
                  Access, correction, deletion, restriction and objection. Email
                  info@irshademadina.com and we will respond within 30 days. UK/EU residents may
                  complain to the ICO.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">8. Retention</h2>
                <p>
                  Enrollment records are kept while your family is with us and for up to 2 years
                  afterwards, then deleted or anonymized. Lesson records may be retained in
                  anonymized form.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">9. Qur&apos;an text licence</h2>
                <p>
                  The Uthmani Qur&apos;an text is static, versioned reference data from Tanzil.net
                  (a public dataset), reproduced without any edit and credited as its terms require.
                  Arabic fonts (Amiri Quran, Scheherazade New) are used under the SIL Open Font
                  License.
                </p>
              </section>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            See also our <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
            <Link href="/safeguarding" className="text-primary hover:underline">Safeguarding policy</Link>.
          </p>
    </div>
  );
}
