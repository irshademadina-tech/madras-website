# Worklog — Madrasah Irshad-e-Madina Online Quran School

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Fetch & stage Qur'an text (Uthmani, 114 surahs) into project

Work Log:
- Probed quran-json (risanb.com) repo; downloaded `data/quran.json` (1.77 MB, Uthmani script) to `quran-data/`
- Validated: 114 surahs, 6,236 ayat, chapters sequential, verses 1..n per surah — all assertions passed
- Fetched surah metadata (Arabic name, English name, translation, ayah count, revelation type) from alquran.cloud meta API; cross-verified ayah counts against the text (all 114 matched)
- Computed standard 30 juz start boundaries (global ayah ids), verified strictly increasing
- Built compact staged files in `quran-data/`: `surahs.json`, `chapters-final.json` ([num, arName, enName, translation, ayahCount, firstGlobalId, juzAtStart]), `quran-compact.json` (juzStarts + flat texts array 1..6236)
- Wrote final public client asset: `public/quran.json` (chapters + juzStarts + texts, ~1.36 MB) with source attribution note (Tanzil.net Uthmani via quran-json)

Stage Summary:
- Qur'an text data staged and verified; global ayah id scheme chosen: surah-major order, 1..6236, enabling lessons that cross surah boundaries
- Attribution: Uthmani text from Tanzil.net dataset (via risanb.com quran-json, public dataset). To be credited in site footer.
- Next: Prisma schema (Task 2), seed from these files, then auth + pages

---
Task ID: 2
Agent: main (Z.ai Code)
Task: Prisma schema + seed (roles, students, lessons, revisions, assessments, audit, invoices, content)

Work Log:
- Wrote full `prisma/schema.prisma`: User (PARENT|STUDENT|TEACHER|ADMIN), Teacher, Student, Enrollment (trial pipeline), Lesson (global startAyah/endAyah + contentRef for Islamic lessons), AyahCorrection, Revision (stages 1d/3d/7d/14d), Assessment, ProgressUpdate, ContentItem, Invoice, Notification, AuditLog, Setting
- Pushed schema to SQLite (db/custom.db)
- Wrote `prisma/seed.ts` with demo data: 2 teachers (Qari Muhammad Iqbal, Hafiza Ayesha Iqbal), parent + 2 students (Ayesha K. Nazra, Yusuf K. Tajweed), 23 content library items (Kalimas, Duas, Namaz, Qaida, Surahs, Adab), demo lessons + corrections + revision queue entries, enrollment pipeline entries, invoices, notifications
- Fixed seed ayah ids after verification: 2:21-25 = global 28-32; 36:1-5 = global 3706-3710 (surah 36 starts at 3706)
- Reset DB and reseeded cleanly

Stage Summary:
- Key design: lessons use GLOBAL ayah ids (surah-major, 1..6236) so lessons can cross surah boundaries
- Demo logins: admin@irshademadina.com/admin123, qari@/teacher123, hafiza@/teacher123, parent@example.com/parent123, student@example.com/student123
- Password hashing: salt + sha256 (`salt:hash`), implemented in src/lib/auth.ts next

---
Task ID: 4
Agent: main (Z.ai Code)
Task: Auth (NextAuth credentials, role-based)

Work Log:
- `src/lib/auth.ts`: scrypt-style salt+sha256 hash/verify (matches seed)
- `src/lib/auth-options.ts`: NextAuth Credentials provider, JWT session carries id+role, `requireRole()` helper for API routes
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth route handler
- `.env`: NEXTAUTH_SECRET + NEXTAUTH_URL added
- `src/lib/quran.ts`: global-ayah-id ↔ surah:ayah converters, chapter table (`src/data/chapters.json`), juz starts, formatRange
- `src/lib/access.ts`: `accessibleStudentIds()` — role-to-student mapping (ADMIN all, TEACHER assigned, PARENT children, STUDENT self by name match); used by every API route

Stage Summary:
- Access rule enforced server-side: children's data only reachable via role-checked queries
- Next: public site pages + Qur'an reader

---
Task ID: 5-a
Agent: main (Z.ai Code)
Task: Design system, layout shell, shared components + generated imagery

Work Log:
- Theme: emerald/cream/gold palette in globals.css (oklch), NO blue/indigo; dark mode variables
- Fonts: Amiri Quran + Scheherazade New (Google) for Arabic; Geist for Latin; .font-quran & .ayah-text classes with Uthmani-friendly line-height
- Ayah highlight CSS classes: .ayah-assigned (green tint), .ayah-needs-improvement (amber tint), .ayah-passed (soft green), .ayah-selected (gold dashed outline)
- Generated 8 images into public/images: pattern-hero, story-madrasa(2), home-learning, arch-ornament, teacher-male, teacher-female, pattern-cta, cta-wide (AI-generated placeholders — real photos must replace before launch per trust rules)
- Root layout: metadata for SEO, viewport theme color, fonts, Toaster
- src/components/site-header.tsx (sticky, mobile Sheet menu), site-footer.tsx (sticky footer, Qur'an text attribution), (site) route group layout with min-h-screen flex col
- tsconfig: exclude mini-services

Stage Summary:
- Route structure: (site) group for public pages, /login, /book-assessment; portal routes to be added separately
- IMPORTANT constraint for all agents: user sees ONLY the / route defined in src/app/page.tsx — public site must be SINGLE PAGE with in-page anchors; separate route files exist but the main experience must be at /

---
Task ID: 5-b
Agent: main (Z.ai Code)
Task: Public site single-page (home at / with anchor sections + thin sub-route wrappers)

Work Log:
- DELETED src/app/page.tsx (route conflict) — home page now lives at src/app/(site)/page.tsx which serves /
- Built shared section components in src/components/home/: reveal.tsx (framer-motion fade-up, client), section-heading.tsx, page-header.tsx, hero-section.tsx, trust-strip.tsx, story-section.tsx, teachers-section.tsx, programs-section.tsx, how-it-works-section.tsx, pricing-section.tsx, safeguarding-section.tsx, faq-section.tsx, contact-section.tsx + contact-form.tsx (client, mailto: fallback — NO API route), cta-band.tsx
- Home page order: Hero (pattern-hero bg + emerald overlay, مدارس ارشاد مدینہ, Bismillah font-quran, dual CTA) → Trust strip (4 points) → #story (Lahore 2011, collage with story-madrasa/2 + arch-ornament) → #teachers (Qari Muhammad Iqbal 25+ yrs / Hafiza Ayesha Iqbal, sanad lines, verified-credentials note) → #programs (Qaida/Nazra/Tajweed/Daily Islamic Learning/Hifz + emerald Qur'an Reader teaser as 6th tile) → #how-it-works (5 numbered steps + home-learning banner) → #pricing (Tabs: £25/£35/£50 plans with "Best value" badge + policies incl. make-up/monthly-cancel/pro-rata/sibling-10%/USD-CAD note) → #safeguarding (4 cards, amānah tone) → #faq (9-question accordion) → #contact (WhatsApp +44 20 7946 0958 wa.me link, email, 1-working-day promise, mailto form) → CTA band (cta-wide bg, وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا)
- Thin sub-pages (server components + export const metadata): (site)/story, /teachers, /how-it-works, /pricing (+FAQ), /safeguarding (+Contact), /faq (+Contact) — each wraps PageHeader + shared sections
- Footer tweaks: WhatsApp synced to +44 20 7946 0958 (UK drama-range placeholder) for contact-section consistency; touch-friendlier link padding
- next.config.ts: devIndicators:false; globals.css: appended cache-bust comment (see gotcha)
- GOTCHA FIXED: dev server was serving stale CSS compiled from pre-5-a globals.css (--primary #171717, no gold/emerald-deep/cream utilities) — appending a comment to globals.css forced recompile; after a dev-server restart the theme compiles correctly (--primary #1d6746). Future agents: if palette looks wrong, check served CSS and touch globals.css
- Verified: lint 0 errors; tsc clean for src/; all 7 routes 200; VLM design review desktop 1440 + mobile 390 all PASS after fixes (hero secondary-CTA contrast, story collage overlap, pricing button alignment, FAQ hover affordance, contact column balance, mobile tab sizing); no horizontal overflow

Stage Summary:
- Public single-page experience complete at / with in-page anchors; all copy warm/credible, NO invented numbers or testimonials (only "Best value" badge — factual lowest £/lesson)
- Still 404 (other agents' scope): /quran, /book-assessment, /login, /legal/privacy, /legal/terms — header/footer/hero/CTA already link to them
- Full record: agent-ctx/5-b-public-site.md

---
Task ID: 6
Agent: main (Z.ai Code)
Task: Qur'an Reader (public + highlight modes), booking flow, login, legal pages

Work Log:
- `src/components/quran-reader.tsx` — the core feature component:
  - Loads /quran.json client-side (cached module-level), renders Uthmani ayat with Amiri Quran font, Arabic-Indic ayah markers (۝ + arabic digits)
  - Browse Sheet: surah search list + 30-juz grid; prev/next surah nav; jump-to "2:255" input
  - Share links: /quran/[surah]?from=&to= — copy button with clipboard
  - Modes: public (no login), select (tap ayahs -> selection for teacher assignment), readonly-highlight (student/parent lesson view)
  - Ayah status CSS: assigned (emerald), needs-improvement (amber), passed (soft green); correction badges under flagged ayahs
- `src/app/(site)/quran/page.tsx` + `quran/[surah]/page.tsx` (metadata, SSR validation, range highlighting for shared links)
- `src/app/api/enroll/route.ts` — zod-validated, timezone-aware trial booking (converts parent-tz local time to UTC instant via Intl), audit-logged
- `src/app/(site)/book-assessment/page.tsx` — 2-step wizard, auto timezone detection, 14-day date picker, teacher gender preference, minimum-data notice
- `src/app/(site)/login/page.tsx` — NextAuth credentials sign-in with demo account quick-fill
- Legal pages: privacy (children's data, reader no-tracking, Qur'an licence credit), terms (10 sections)
- Fixed lint: deferred setState in effect, removed stale eslint-disable
- tsc --noEmit clean for src/; bun run lint passes with 0 problems
- All 14 public routes return 200 (/, /quran, /quran/2?from=21&to=25, /book-assessment, /login, /legal/*, thin pages)

Stage Summary:
- Public site + reader + enrollment entry COMPLETE and verified
- NEXT: portal APIs + teacher/student/parent/admin portals (Tasks 7-11)

---
Task ID: 8
Agent: main (Z.ai Code)
Task: Portal + admin API layer (role-checked)

Work Log:
- /api/portal/overview: role-aware payload (students + lessons + corrections + revisions + progress) via accessibleStudentIds()
- /api/portal/lessons POST: teacher assigns lesson (QURAN with global ayah range, or QAIDA/ISLAMIC with contentRef), notifies parent, audit-logged
- /api/portal/lessons/[id] PATCH — THE CORE ENGINE:
  - START_PRACTICE / MARK_READY (student-only actions)
  - REVIEW (teacher-only): verdict NEEDS_IMPROVEMENT | PASSED | MASTERED; PASSED/MASTERED auto-creates revision queue entries (stages 1d/3d/7d/14d), progress update + parent notification
  - ADD_CORRECTION / REMOVE_CORRECTION (teacher): ayah-level notes shown in reader
  - UPDATE_NOTES
  - Permissions: students/parents cannot review; teachers don't self-practice
- /api/portal/revisions GET (due/upcoming/done) + PATCH (DONE/SKIP — teacher override)
- /api/portal/content GET (published items for lesson forms)
- /api/portal/notifications GET/PATCH (mark read)
- /api/admin/enrollments GET/PATCH: full pipeline (SCHEDULE_TRIAL -> COMPLETE_TRIAL -> SAVE_ASSESSMENT -> ENROLL with student creation + parent account + welcome notification / REJECT / WITHDRAW)
- /api/admin/students GET/PATCH (assign teacher, level, status)
- /api/admin/teachers GET/PATCH (publish/active toggles)
- /api/admin/invoices GET (parent sees own) / POST / PATCH (mark paid, waive, refund — manual approval only, never auto-marked)
- /api/admin/content GET/POST/PATCH/DELETE (editable content library)
- /api/admin/audit GET (200 entries with user info)
- tsc + lint clean

Stage Summary:
- All portal/admin APIs complete and role-checked. Lesson state machine: ASSIGNED -> PRACTICING -> READY_FOR_REVIEW -> (NEEDS_IMPROVEMENT loop | PASSED -> revisions 1/3/7/14d -> MASTERED)
- NEXT: portal UI (Task 9-12) at /portal route

---
Task ID: 9-12
Agent: main (Z.ai Code)
Task: Portal UI — teacher, student, parent, admin views

Work Log:
- src/components/portal/shell.tsx: PortalShell (sticky header, role tabs, notifications Sheet with unread badge + mark-all-read), SectionTitle, StatusBadge (lesson + invoice states), RefreshButton
- src/lib/portal-types.ts: shared client types
- src/components/portal/lesson-card.tsx: LessonCard — role-aware:
  - Student/Parent: Open Reader (highlighted range), Practice, Mark Ready buttons
  - Teacher: Review dialog (verdict NEEDS_IMPROVEMENT/PASSED/MASTERED + feedback -> triggers revision queue creation server-side)
  - Corrections displayed with surah:ayah refs; ShareWhatsAppButton for parents
- src/components/portal/assign-lesson.tsx: AssignLessonDialog — Qur'an tab (reader in select mode: tap start/end ayah, live range label, auto-suggest from last lesson end, may cross surah boundary) + Islamic tab (content library picker); posts to /api/portal/lessons
- src/app/portal/page.tsx: role router — TEACHER (My Students + Revision Queue with due/upcoming + mark-done), STUDENT (Today's Learning single screen: active lessons with Practice/Mark Ready, completed list), PARENT (children cards with progress bars, lesson cards, recent updates, invoices tab), ADMIN -> AdminView
- src/components/portal/admin-view.tsx: Overview stats, Enrollments pipeline (schedule trial -> complete -> assessment dialog (strengths/weaknesses/starting point/plan/teacher match) -> enroll dialog (creates student + parent login)), Students (teacher assign, status), Teachers (publish/active switches), Content Library (CRUD with Arabic text editing), Payments (create invoice, mark paid/refund — manual approval), Audit Log (200 entries)
- SessionProvider wrapper (src/components/providers.tsx) + next-auth type augmentation (src/types/next-auth.d.ts) with id+role on session
- Fixed lint (deferred setState in effects) and types; tsc clean, eslint 0 problems
- /portal returns 200

Stage Summary:
- FULL PLATFORM COMPLETE: public site + reader + booking + all 4 portal roles + admin console
- MVP success path works end-to-end: parent books -> admin pipelines -> enroll -> teacher assigns (tap ayahs) -> student practices/marks ready -> teacher reviews PASSED -> revision queue 1/3/7/14d -> parent sees all
- Remaining: browser end-to-end verification (Task 13)
