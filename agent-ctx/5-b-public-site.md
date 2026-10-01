# Task 5-b — Public site single-page (work record)

Agent: main (Z.ai Code)
Date: completed in this session

## What was built

Single-page public website for Madrasah Irshad-e-Madina at `/` (rendered by
`src/app/(site)/page.tsx` inside the (site) route group) plus thin sub-route
wrappers reusing the same shared section components.

## Files created

- `src/components/home/reveal.tsx` — framer-motion fade-up-on-view wrapper (client)
- `src/components/home/section-heading.tsx` — eyebrow/title/description + pattern divider
- `src/components/home/page-header.tsx` — header for thin sub-pages
- `src/components/home/hero-section.tsx` — pattern-hero.png bg + emerald overlay,
  مدارس ارشاد مدینہ (font-arabic), Bismillah (font-quran), headline, dual CTAs
- `src/components/home/trust-strip.tsx` — 4 trust points on emerald band
- `src/components/home/story-section.tsx` — Lahore 2011 story + image collage
  (story-madrasa, story-madrasa2, arch-ornament backdrop, badge) + pull-quote
- `src/components/home/teachers-section.tsx` — Qari Muhammad Iqbal / Hafiza Ayesha
  Iqbal cards (portrait, bio, sanad line, languages, teaches, "teaches best") +
  verified-credentials note
- `src/components/home/programs-section.tsx` — Qaida/Nazra/Tajweed/Daily Islamic
  Learning/Hifz cards + emerald Qur'an Reader teaser card (6th tile)
- `src/components/home/how-it-works-section.tsx` — 5 numbered steps + dashed
  connector + home-learning.png banner
- `src/components/home/pricing-section.tsx` — Tabs: plans (£25/£35/£50, "Best
  value" on 5-day) + policies (trial free, make-up, monthly cancel, pro-rata
  refunds, sibling 10%) + USD/CAD note
- `src/components/home/safeguarding-section.tsx` — 4 cards + amānah note
- `src/components/home/faq-section.tsx` — 9-question accordion, hover affordance
- `src/components/home/contact-form.tsx` — client form, mailto: fallback (NO API)
- `src/components/home/contact-section.tsx` — WhatsApp (+44 20 7946 0958,
  wa.me/442079460958), email, 1-working-day promise + form card
- `src/components/home/cta-band.tsx` — cta-wide.png bg, وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
- `src/app/(site)/page.tsx` — home page composing all sections (= `/`)
- `src/app/(site)/story/page.tsx`, `teachers/page.tsx`, `how-it-works/page.tsx`,
  `pricing/page.tsx` (+FAQ), `safeguarding/page.tsx` (+Contact), `faq/page.tsx`
  (+Contact) — thin wrappers, server components, `export const metadata`

## Files modified

- `src/app/page.tsx` — DELETED (route conflict with `(site)/page.tsx` at `/`)
- `src/components/site-footer.tsx` — WhatsApp number synced to +44 20 7946 0958
  (Ofcom drama-range placeholder); footer links got touch-friendlier padding
- `next.config.ts` — added `devIndicators: false` (removes dev-only Next badge)
- `src/app/globals.css` — appended cache-bust comment only (see gotcha below)

## Gotcha for future agents

The running dev server was serving CSS compiled from a PRE-5-a globals.css
(`--primary: #171717`, no gold/emerald-deep/cream utilities, no pattern-divider).
Fix: append any comment/change to `src/app/globals.css` to force the postcss
worker to recompile, or let the server restart (config change triggers it).
Verified after fix: `--primary: #1d6746`, `text-gold`/`bg-emerald-deep`/
`pattern-divider` all present. If the palette suddenly looks wrong — check
served CSS first.

## Verification

- `bun run lint` — 0 errors/warnings
- `bunx tsc --noEmit` — clean for `src/` (pre-existing errors only in
  `examples/`, `skills/`)
- curl smoke tests: `/`, `/story`, `/teachers`, `/how-it-works`, `/pricing`,
  `/safeguarding`, `/faq` all 200; `/quran`, `/book-assessment`, `/login`,
  `/legal/*` 404 (other agents' scope)
- Headless-browser + VLM design review, desktop 1440px + mobile 390px — all
  sections PASS after fixes (hero CTA contrast, story collage, pricing button
  alignment, FAQ hover, contact column balance, mobile tabs)
- No horizontal overflow on mobile; footer sticky via (site) layout

## Deviations from spec

- WhatsApp placeholder uses UK drama number +44 20 7946 0958 (spec said "+44");
  footer synced to the same number for consistency
- "Best value" badge (factual, lowest £/lesson) instead of an invented
  "Most popular"
- No invented numbers/testimonials anywhere; USD/CAD handled as a note, not
  hardcoded prices
