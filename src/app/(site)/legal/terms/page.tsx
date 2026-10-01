import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Madrasah Irshad-e-Madina online Quran school.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="font-serif text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

          <Card className="mt-8">
            <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-foreground/90">
              <section>
                <h2 className="mb-2 text-base font-semibold">1. The service</h2>
                <p>
                  Madrasah Irshad-e-Madina provides one-to-one online Qur&apos;an and Islamic
                  learning for families in the UK, USA and Canada: a free assessment, a written
                  learning plan, scheduled lessons with a matched teacher, a daily revision cycle
                  and parent-visible progress.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">2. Enrolment and trials</h2>
                <p>
                  The assessment lesson is free and carries no obligation. After the assessment we
                  send a written summary and learning plan. Enrolment is confirmed once a schedule,
                  teacher and payment plan are agreed.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">3. Fees, missed lessons and make-ups</h2>
                <p>
                  Monthly fees are published on our{" "}
                  <Link href="/pricing" className="text-primary hover:underline">pricing page</Link>{" "}
                  and are payable in advance. A lesson cancelled by us is always made up or
                  refunded. A lesson missed by a family with more than 12 hours&apos; notice is
                  made up once per month; with less notice it counts as taken. See the pricing page
                  for the full policy.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">4. Parents&apos; responsibilities</h2>
                <p>
                  A parent or guardian must be present (at home and reachable) during lessons for
                  young children, ensure a quiet learning space and a working device with the
                  meeting link, and support daily revision between lessons. Our{" "}
                  <Link href="/safeguarding" className="text-primary hover:underline">safeguarding policy</Link>{" "}
                  forms part of these terms.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">5. Payments</h2>
                <p>
                  All card payments are taken on a hosted checkout page — we never see or store
                  card numbers. Manual methods (bank transfer, Wise) are approved by our admin team
                  and never auto-marked as paid. Invoices and receipts are available in the parent
                  portal.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">6. Cancellation and refunds</h2>
                <p>
                  You may cancel monthly at any time before the next billing date; the current
                  month is not pro-rata refunded but all remaining paid lessons in it are taught.
                  If we cancel a lesson and cannot make it up, it is refunded. Refunds are returned
                  by the original payment method.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">7. Conduct</h2>
                <p>
                  We expect respect between students, parents and teachers at all times. We may
                  pause or end enrolment for conduct that endangers or disrespects our teachers or
                  students, with a pro-rata refund of unused lessons.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">8. Intellectual property</h2>
                <p>
                  The Qur&apos;an text is the unedited verified Uthmani text from Tanzil.net,
                  credited per its terms and never altered. Lesson plans, our teaching materials and
                  the platform are the property of the madrasa. The public reader may be freely used
                  for reading and sharing links.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">9. Liability</h2>
                <p>
                  Our service is teaching. We do not warrant specific learning outcomes — progress
                  depends on attendance and daily revision. Our total liability is limited to fees
                  paid in the current month.
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold">10. Governing terms</h2>
                <p>
                  Questions and complaints: info@irshademadina.com. We resolve issues in dialogue
                  first; complaints follow the route in our safeguarding policy.
                </p>
              </section>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            See also our <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
    </div>
  );
}
