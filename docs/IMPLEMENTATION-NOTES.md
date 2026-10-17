# Alive Luxury Retreats — Rebuild Implementation Notes

Phase 2 (frontend rebuild) — Next.js 15 App Router · JavaScript · CSS Modules · GSAP 3 + ScrollTrigger.
Everything is local. Nothing has been pushed to GitHub or deployed.

## Run it

```bash
npm install
npm run prepare-assets   # only needed if source-assets/ or docs/source-audit/content/ change
npm run dev              # http://localhost:3100  (port 3000 was already in use on this machine)
npm run build && npm run start   # production server on http://localhost:3100
node scripts/qa.mjs http://localhost:3100 --widths=390,1440   # crawl QA (status, console, overflow, images)
```

## How content flows

| Step | File | What it does |
|---|---|---|
| 1 | `scripts/build-content.mjs` | Parses the verbatim captures in `docs/source-audit/content/*.md` into `src/content/generated/pages/*.json` (sections → blocks), resolves CTA links from each page's link table, places every image from `data/page-asset-map.md` into its original section, extracts FAQ (7 categories / 43 Q&As), posts, routes and redirects. |
| 2 | `scripts/build-media.mjs` | Creates WebP derivatives (640 / 1280 / 2000 px, never upscaled) of the **exact original images** into `public/media/` and copies videos, PDFs and fonts into `public/`. Originals in `source-assets/` are untouched. The 24 Wix demo-product images are skipped. |
| 3 | `src/lib/sections.js` | Classifies each captured Wix section (hero, USP strip, program focus, PDF form, 360 system, pillars, call-back, team, accommodation levels, reviews, blog strip, support, gallery, video, cards, statement, editorial). Unrecognised sections fall back to the editorial layout, so no captured text is dropped. |
| 4 | `src/sections/*`, `src/templates/*` | Layouts per section type and per page type. |

## Image optimisation

`next.config.mjs` sets `images: { unoptimized: true }`. The site uses plain `<img srcset>` pointing at `/media/*.webp`; no `next/image` component is used and no request goes to `/_next/image` (verified in the QA crawl and in the rendered markup).

Background videos in `public/video` are 720p H.264 re-encodes (CRF 27, no audio, faststart; 17 MB → 6 MB) of the 1080p originals in `source-assets/video`; `build-media.mjs` no longer copies the originals over them.

## Deploy size

`.vercelignore` keeps `source-assets/`, `docs/`, `.qa/` and `scripts/` out of the Vercel upload, and `.gitignore` keeps `source-assets/` and `docs/source-audit/` out of git. Only `src/` and `public/` (≈ 77 MB) are needed to build.

## Route checklist (51 live pages from the audit)

All return 200 in the production build (`next build` → static HTML) and were crawled at 390 / 768 / 1280 / 1440 px.

| Group | Routes |
|---|---|
| Home & core | `/`, `/about-luxury-health-wellness-retreat`, `/faq-pricing`, `/blog`, `/download`, `/contact`, `/get-a-quote`, `/book-call`, `/instant-pricing-packages-chat` |
| Program focus | `/wellness-retreat-programs`, `/detox-cleanse-retreat`, `/de-stress-burn-out-retreat`, `/luxury-mental-health-retreat`, `/anxiety-retreat`, `/depression-retreat`, `/retreat-for-grief-loss-recovery`, `/trauma-ptsd-recovery-retreat-program` |
| Locations | `/bali`, `/mexico-wellness-retreat`, `/spain-europe`, `/wellness-retreat-australia` |
| Market / SEO pages | `/private-luxury-vip-burnout-retreats`, `/vip-one-on-one-private-retreats`, `/mental-health-retreat-australia`, `/usa-mental-health-retreat`, `/uae`, `/weight-loss-retreat`, `/relationship-help-retreats`, `/wellness-and-emotional-wellbeing-retreat` |
| Booking | `/book-online`, `/booking-calendar/speak-with-your-client-manager`, `/booking-calendar/design-your-ultimate-retreat`, `/service-page/speak-with-your-client-manager`, `/service-page/heidi-pre-retreat-program-manager-call`, `/service-page/interview`, `/service-page/pre-retreat-health-assessment` |
| Legal / downloads | `/booking-conditions`, `/nda`, `/privacy-policy`, `/pdf` |
| Utility | `/search` (rebuilt over real pages/posts/services, not Wix demo products), `/cart-page` (empty cart; nothing is sold) |
| Blog posts (9) | `/post/how-does-confidentiality-work-at-alive-for-high-profile-hnw-clients`, `/post/luxury-private-burn-out-retreat`, `/post/private-wellness-and-mental-health-retreat-bali`, `/post/the-alive-private-luxury-detox-for-body-mind-and-life-how-it-works-who-it-is-for`, `/post/the-search-for-bali-s-best-luxury-wellness-retreat-is-over-here-s-why`, `/post/the-world-s-leading-luxury-mental-health-retreat-and-why-the-old-system-isn-t-working-anymore`, `/post/what-a-true-luxury-wellness-retreat-actually-delivers-at-alive`, `/post/why-alive-is-still-one-of-australia-s-top-wellness-retreats`, `/post/why-alive-luxury-wellness-retreats-stand-out-in-luxury-holistic-wellness-retreats` |

Also: 44 `/blog/tags/<tag>` archives generated from the posts' tags (the audited sample `/blog/tags/luxury-wellness-retreat` included).
Not built (by design): the 12 `/product-page/i-m-a-product*` template URLs → branded 404 (`dynamicParams = false`).

### Redirects (`next.config.mjs`, permanent)

`/australia` → `/wellness-retreat-australia` · `/book` → `/get-a-quote` · `/luxury-detox-cleanse-retreat` → `/detox-cleanse-retreat` · `/luxury-health-wellness-spa-retreat` → `/wellness-retreat-programs` · `/vip-private-luxury-mental-health-retreat-facilities` → `/` · `/copy-of-de-stress-retreats` and `/private-executive-burn-out-recovery-retreat` → `/de-stress-burn-out-retreat` (the source chain ended in a 404; 07 A2).

## Decisions taken for broken or ambiguous source links

| Source issue (audit ref) | Rebuild behaviour |
|---|---|
| "VIEW PACKAGES" / "PACKAGES" linking to the page itself (07 A6) | Scrolls to that page's pricing form (`#packages`) |
| "Meet Your Team Here" linking to itself (07 A5) | Scrolls to the page's team section (`#team`) |
| Header Contact dropdown "Call / Whatsapp / Book A Discovery Call" all → `/contact` (07 A7) | Call → `tel:+628135925588`, Whatsapp → `wa.me/628135925588`, Book A Discovery Call → `/book-call` |
| Malformed `http://Apps.Courses`, `http://volcano.You` links (07 A3) | Link removed, text kept |
| ENQUIRY opened `/contact` in a new tab | Opens in the same tab |
| Unlisted live pages (07 B) | Kept and linked from a "More Retreats" footer column; not added to the main menu |

## Integrations that are NOT connected (frontend-only, documented in the UI)

| Feature | Behaviour in this build | To go live |
|---|---|---|
| Lead forms (PDF packages, call-back, custom quote) | Validation, loading state, then an explicit **"Demo mode: your details were not sent"** panel with one-tap email/WhatsApp fallbacks pre-filled with the visitor's details. PDF form also links the local PDFs. | Set `NEXT_PUBLIC_LEAD_ENDPOINT` to an API/CRM endpoint (`src/lib/leads.js` POSTs JSON there and only then shows success). Decide on Omnisend/email automations (07 E1). |
| Bookings (Wix Bookings) | Service list, service pages and a day/time **request** picker; it never claims a slot is reserved and sends the request by email/WhatsApp. | Connect Calendly / Cal.com / Wix Headless Bookings (07 E2). |
| "Ali" AI chat (Aura Suite) | Removed at the client's request (revision 3). The external ultimo-bots chat link is kept where the source linked it. | Vendor embed if wanted later (07 E3). |
| NDA digital signature | Full form (draw / type / upload signature); on submit shows that nothing was signed or stored. | E-signature service. |
| Cookie consent (Usercentrics) | Removed at the client's request; no analytics or advertising tags are installed, so nothing needs consent in this build. | Add a consent platform if tracking tags are introduced (07 E5–E6). |
| YouTube | Click-to-load embed (no YouTube request until play). | — |
| Blog CMS | Posts are static data from the captures. | MDX or headless CMS (07 E4). |

## Content conflicts preserved, not resolved (07 §C)

- **Pricing**: FAQ says "from $1,980 USD per night"; the packages PDF lists $695 / $875 / $1,295 / $2,195 per night; `/spain-europe` says "All Inclusive From $650 PN". Each appears only where the source published it.
- **Locations**: Home/FAQ "based in Bali"; PDF and `/book-call` "Bali, Mexico"; Spain and Australia pages; service pages list Queensland, Santa Monica, Majorca, London, Jalisco, Bali, Cape Town, Albuquerque. All kept per page.
- **Phone numbers**: +62 813 592 5588 (WhatsApp, header, footer, contact), +1 478 551 6454 (mobile Call button, `/get-a-quote`, `/pdf`), +44 7450 307150 (service pages), +27 64 955 5021 (Cape Town). Each kept in its original context.
- **Legal entity**: footer "© 2009 Alive Corporations" vs Booking Conditions "Alive Group LLC & Alive Wellness LLC"; NDA "The Alive Group LLC, Cinta Wellness LLC, Alive Wellness Limited".
- "2 unique levels" vs "three tailored levels" of accommodation (2 shown); minimum stays differ FAQ vs PDF; "15 years" vs "since 2009"; source typos; the truncated homepage testimonial — all verbatim.
- AggregateRating JSON-LD (5.0 / 1,029) is output exactly as published; flagged for an SEO decision (07 E8).

## Fonts

Cinzel (Google, via `next/font`) for display; **Barlow** stands in for DIN Next W01 Light (Wix-licensed, not available locally). The three owner-uploaded script fonts from `source-assets/fonts` are used for accents: "Breathing" for *Renew / Revitalise / Restore Me*, Gigi for the footer "alive", Playlist Script for "Loving What We Do Since 2009". Note: the "Breathing" file is a personal-use build that renders a watermark for digits, so it is only ever used for letters.

## Revision 2

- Cookie banner removed; header WhatsApp button replaced by **Ask Ali** (WhatsApp stays in the Contact Us menu, mobile quick bar, footer and contact pages).
- All content photographs use an **arch frame** (rounded top, flat base): `--arch` (portrait) and `--arch-wide` (landscape) tokens in `src/app/globals.css`.
- Smooth wheel scrolling via **Lenis**, driven by the GSAP ticker so ScrollTrigger stays in sync; native on touch, off for reduced motion.
- Spacing/alignment pass: tighter section rhythm, aligned card rows (no staggered offsets), centred short sections fully centred, headings that Wix stored at the end of a strip moved to the section they introduce, header switches to the menu button below 1240px so nothing is cut off.

## Revision 3

- Ask Ali removed from the header and the Ali chat panel removed from the site (no trigger left); a floating **WhatsApp** button (bottom-right, wa.me/628135925588) replaces it. Back-to-top moved to bottom-left.
- Photo frames changed from arches to **soft rounded corners** (14–24px, the --arch tokens in src/app/globals.css).

## Revision 4

- "Enquiry" button removed from the header (Contact Us stays in the menu).
- Floating WhatsApp button is now an icon-only green circle (56px desktop, 52px mobile).

## Revision 5

- Vertical spacing tightened sitewide: section padding tokens reduced (--section 40-72px, --section-sm 28-48px) and all large hard-coded gaps scaled to ~60%.

## Revision 6

- Alive News strip: feature post left, the other two posts as horizontal rows that stretch to the feature height (no empty space below); tablet shows the feature full-width with the others in two columns.
- Header: Contact Us is now a CTA button at the right end (dropdown items remain in the mobile menu and footer).

## Revision 7

- Program-focus cards: photos are matched to cards by the source alt text (then order). The audit capture had no photo for some cards (e.g. 2 of 6 on /wellness-retreat-programs); those now use the closest-matching original photograph from elsewhere on the site (src/lib/imagePick.js, catalogue in src/content/generated/images.json). Card grids get the same gap-filling when most cards already have photos.

## Revision 8

- Removed the decorative dash line before small labels (eyebrows).
- Source text no longer starts with a dash: leading "—/–/-" stripped (e.g. blog quote attributions), "•" lines rendered as list items (Booking Conditions, VIP page), and animated headings keep a dash attached to the previous word so no line starts with one.

## Revision 9

- Fonts reduced: Gigi and Playlist Script removed (footer "alive" now uses the Breathing script, footer slogan uses Cinzel, NDA typed signature uses the Breathing script). Fonts in use: Cinzel, Barlow, plus the Breathing script for accents. Only the Breathing file is published from source-assets/fonts.
- Homepage moving "Renew Me / Revitalise Me / Restore Me" strip removed.
- Section spacing reduced again (--section 32-56px, --section-sm 24-40px; large gaps ~75%).

## Revision 10

- "Choose Your Level" section: View Package button moved up beside the heading/intro; tighter spacing and shorter (4:3) photos.
- Footer compacted: smaller custom-package band with a single-row form on desktop, smaller logo/headings/links, two-column link lists, tighter padding (desktop footer ~600px tall).
- Floating WhatsApp button fades out while the footer is in view.

## Revision 11

- 360 system section: the diagram now fills the left column down to the end of the 12-point list (no empty space).
- Section spacing reduced slightly again (--section 28-46px, --section-sm 20-32px).

## Revision 12

- Text-only page headers (FAQ, Contact, Get a Quote, PDF, Booking Conditions, NDA, Privacy, Alive News + tag pages, Book Online, booking calendars, Search) now use a two-column layout with a matching original photograph on the right (src/components/PageHeadMedia.js); on phones the photo sits below as a short banner. Header padding reduced; Alive News title size reduced; search/cart header no longer forced to 70% of the screen height.

## Revision 13

- Uppercase "eyebrow" labels removed site-wide; where the label was source copy (small sub-headings, Skye intro line, "Welcome to Alive", booking service line) it is kept as a sentence-case kicker.
- Body text: Barlow Regular (400) instead of Light, slightly darker; paragraph spacing restored in all rich-text blocks (a CSS specificity bug had removed it); link underlines are a subtle gold instead of teal.
- USP strip: larger labels and sub-lines, higher-contrast teal.
- Footer: ~450px tall on desktop; shorter "More Retreats" labels (no wrapping), all column titles aligned with the "alive" script, social icons moved to the brand column, slimmer custom-package band.

## Revision 14

- Header enlarged: 100px tall (84px when scrolled; 84px on phones), larger logo, menu text and Contact Us button; nav still fits from 1240px up.
