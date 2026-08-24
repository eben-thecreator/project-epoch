# Pentagram.com Design System — Reference for the SCHIS Overhaul

> Captured 2026-08-23 from live site HTML + `index-DojLlKIn.css` (524KB build asset).
> Everything below is **verified from source**, not recalled from memory.
> Purpose: single source of truth for redesigning SCHIS (Ghana Heritage Atlas) in
> Pentagram's structural/typographic language.

---

## 1. Philosophy

- One typeface, three weights, no bold. Hierarchy via **size only**.
- Near-monochrome: black text on white, one red accent used sparingly.
- Content IS the interface — huge imagery, hairline structure, almost no chrome.
- Utility-first Tailwind codebase (same as ours), px-based numeric spacing scale
  (`gap-16` = 16px, `mt-48` = 48px — their config remaps numbers to px).
- No border radius anywhere. No drop shadows. Depth comes from imagery and gray steps.
- Grayscale antialiasing, `font-feature-settings: "case" on` globally.

## 2. Typography

### Typeface
**Plain** (Commercial Type) — weights **350** (Thin), **375** (Light), **400** (Regular) ONLY.
No italic, no bold anywhere on the site. Stack var: `--plain: Plain, Arial, Sans-Serif`.
Fallbacks declared but unused: `--sans`, `--serif`, `--mono`.
All faces `font-display: swap`.

> ⚠️ Plain is a commercial license — we cannot hotlink or bundle it.
> Closest open substitutes: Inter Tight / Hanken Grotesk / Schibsted Grotesk,
> or stay on Inter with weight discipline (400/500 only).

### Type scale (`f-*` classes; base → sm/md/lg → xl+)

| Token | Base | Mid ramps | xl/xxl | Notes |
|---|---|---|---|---|
| display-1 | 58px / lh 1.05 / ls −0.02em / **w375** | 73px → 92px (w350) | **131px** / lh 1 / −0.04em | Hero statements |
| heading-1 | 36px / 1.05 / −0.01em / 400 | 41 → 46px | 52px / −0.02em | Page titles (Work, About…) |
| heading-2 | 32px / 1.2 / −0.02em / 400 | 41 → 46px (w375 at md) | 65px / 1.05 | Section statements |
| heading-3 | 28px / 1.2 / −0.02em | 32 → 36px | 41px | |
| heading-4 | 24px / 1.2 / −0.01em | — 40px? no: 28px | 32px | Search input, mobile nav links |
| heading-5 | 16px / 1.2 / −0.02em | 20px | 24px | Card titles |
| body-1 | 16px / 1.25 / 0 | — | — | Nav, body copy |
| body-2 | 13px / 1.25 | — | 16px | Dense UI |
| caption | 13px / 1.25 | — | — | Meta lines |
| number | 13px / lh 1 | — | — | Counters ("(28)", "1 of N") |

Negative tracking grows with size. Weight *drops* as size grows (display uses 350).

### Implemented as Tailwind utilities (tailwind.css, `f-*` classes)

The scale above is now code — `.f-display-1` … `.f-number`, three steps
(base → `md:` 768px → `xl:` 1280px), values verbatim from the reference CSS.
**Rule: no ad-hoc `text-[Npx]` for headings/body anywhere; always an `f-*`
token.** Inter Tight's variable axis makes weights 375/350 available exactly.
Spacing rule from the same source: page gutters only via the container ramp
(12/16/24/32px), section rhythm in multiples of 8 (24 / 32 / 40 / 56 / 64).

## 3. Color

Direct hex in `:root`; no semantic CSS vars.

| Role | Value | Usage |
|---|---|---|
| Primary text | `#1A1A1A` (gray-900) | All default text, active nav |
| Secondary text / links | `#767676` (gray-550) | Inactive nav, meta, tags |
| Secondary alt (footer news) | `#8C8C8C` | |
| White | `#FFFFFF` | Page ground |
| Black / inverse bg | `#000000` | Mobile menu overlay, dark pages |
| Dark neutral | `#222222`, `#282828` | |
| Red accent | `#E52222` (red-500) | Rare: live states, markers |
| Carousel placeholder | `#E3E4E5` (gray-100) | Image skeleton |
| Gray ladder | `#F5F5F5` … `#0D0D0D` in 50 named steps | |
| theme-color meta | `#000000` | Browser chrome |

Dark/portfolio context flips: text `#fff` / secondary `#666` / bg black.

## 4. Layout

- Container: `width = min(1792px, 100%) − 2×outer-gutter`, centered. xl/xxl cap **1792px**; contextual caps 1728/1776px.
- Outer gutter responsive: **12px** (xs/sm) → **16px** (md) → **24px** (lg) → **32px** (xl+). Inner gutter 12–16px.
- Header height: fixed **60px**, all breakpoints (`--spacing-header: 3.75rem`).
- 12-col grid with hairline "grid-line" system offset by inner-gutter/2.
- Aspect utilities in heavy rotation: `1/1, 3/2, 4/5, 5/7, 16/10, 3/4→7/3` (hero).
- Work cards: ratio **~1.59:1** (padding-bottom 62.903…%), skeleton bg `#E3E4E5`,
  title block `min-height 75px` with **2-line clamp**, ≥800px hover swaps title→tagline.

## 5. Motion

- Signature ease: `cubic-bezier(0.59, 0.01, 0.28, 1)` (26 usages) — decelerate-in.
- Others: `(0.4,0,0.2,1)`, `(0.25,0.46,0.45,94)`. Durations: **0.15–0.6s**, mostly 0.25–0.35s.
- Image lazy fade: opacity 0.25s; header entrance 0.5s.
- Home hero: Swiper carousel of full-bleed project stills (mobile aspect 3/4 → desktop 7:3),
  synced to a rotating statement "We design **Everything** for **Everyone**" where the
  nouns cycle through disciplines/sectors as slides change (filterAnimationCarousel).

## 6. Components & patterns

### Header (60px, white)
```
[Logo SVG 103×20]                                    [Work About News Contact ⌕(20px icon) Archive]
```
- Left: logo (SVG symbol sprite). Right: nav `f-body-1`, gap-x-24, item spacing ramps 20→35px per bp.
- Hover: **color-only** transition gray-550 → gray-900 (guarded `@media(hover:hover)`). NO underline animation.
- Current page: gray-900 (full); its own hover drops back to gray-550.
- Search = icon button toggling overlay; Archive styled like a nav item.
- Second variant `.stickyTop` re-renders same bar over portfolio/dark contexts.
- Mobile (<md): hamburger top-right at outer gutter; opens full-screen black overlay:
  logo row (h-60) → big links stack `f-heading-4` gap-16 mt-48 (Work/About/News/Contact/Search/Archive)
  → pinned bottom: social row (Instagram LinkedIn X Facebook Newsletter Careers) + Privacy + © 1972–2026.

### Search overlay (full-screen white panel)
- Giant input `f-heading-4`, placeholder "Find work by sector, discipline, location, year"
  (shrinks to "Find work" on small screens), maxlength 50.
- Two chip groups beneath: **Sector** (17) and **Discipline** (17).
- Chip `.typo--toggle`: padding-left 19px; `::before` = 10×10px circle outline 1px #767676;
  hover/active: text #1a1a1a, dot fills solid. Selected chips show ✕ clear glyph.
- Live results grid under form; after scroll a sticky search bar (`stickySearch`) with
  current query title + close button replaces the panel.

### Work index (/work)
- H1 "Work", subline "Showing the latest 40 projects".
- Masonry-ish 12-col grid, mixed card sizes, some rows paired 2-up.
- Card = image + title (clamp 2) + tag chips linking to sector/discipline archives.
- "Load more" pagination (?page=2). Filter state lives in the mega-menu/search, not the grid.

### Project detail (/work/:slug)
- Title (heading-1) + one-line standfirst + tag chips (discipline ×N, sector).
- Full-width media stream: images, videos (Vimeo), pull-quote blocks between media runs.
- Long-form case study copy with bold lead-ins per section.
- Credits rail (right/below): Client / Sector list / Discipline list / Office / Partner link /
  Project team (names list) / Collaborators ("Name, role").
- Footer band: "Next Project →" giant card (image + title + tags) — infinite chain.

### Home
1. Hero carousel (aspect 3/4 → 7:3, max-w 1728) linked to rotating filter statement.
2. Themed editorial sections: essay paragraph + horizontal rails of related projects
   ("The Secret Life of Things", "Our Future is the Ultimate Project", "Past as Prologue",
   "Type Has Spirit") each tagged (Set N).
3. Retrospective modules: intro essay, count "(28)", year-labeled thumb rail, "Show more".
4. Pull quotes from partners between sections (blockquote + name).
5. "8 latest [Discipline] projects" mini-grids.
6. Latest projects grid + News teasers + contact/jobs/about footer block.

### About
- Intro paragraphs, careers link.
- **Partners**: uniform square-portrait grid (400×400 crop), name (heading-5) + office city caption.
- Grouped lists: Partner at Large / Associates (plain name list) / Partners Emeriti.

### News (/news)
- Category chips row: All / Work / Preview / Events / Publications / Press / Commentary.
- Events strip: date (#### "17 September"), location caption, external link.
- Chronological feed: category label + date, headline; internal items link to work slugs,
  press items link externally. "Load more".

### Contact
- H1 + office carousel ("1 of N"): office name, address, phone, email, Get directions, blurb.
- Sections: News / New Business Inquiries (per-office emails) / Open Positions / About blurb.

### Footer (every page)
Social row · Newsletter subscribe inline form · Careers · Privacy · "© 1972 – 2026 Pentagram".
Plus a pre-footer content block: News teasers (4) / New Business emails / Open positions / About paragraph.

### Global behaviors
- PJAX-style client routing (`data-namespace` per page), SVG symbol sprite icons.
- Sticky search bar appears on scroll in filtered states.
- Tracking attrs everywhere (`data-tracking-event-category="Navigation Use"`).

---

## 7. Translation map → SCHIS

| Pentagram | Ours | Note |
|---|---|---|
| Work | Catalogue (`/case-studies`) + Gallery | Merge mental model: everything is "work items" (artifacts, museums) |
| Sector/Discipline filters | Region/Era/Type filters for heritage data | Same 17-chip pattern, dot-bullet toggle |
| Partners grid | Museums/Sites directory | Square portraits → site/museum imagery |
| Retrospectives (year rails) | Era timelines / TimeSlider narrative | Year-labeled rails map beautifully to historical eras |
| Next Project footer | Next Artifact / Next Site | Chain through catalogue |
| News categories | Research/Blog categories | |
| Offices carousel | Ghana regions or partner institutions | |
| Red #E52222 | Keep our `brand` #E4002B (Ghana red) | Same "signal only" discipline |
| White/black | Keep paper `#F2EFE7` / ink `#191613` OR go true white/#1A1A1A | Decide: full Pentagram mono vs. keep warm archival paper |

## 8. Phased implementation plan

### Status
- **P0 ✅ Tokens**: Inter Tight variable self-hosted; mono palette; house ease;
  container 1792px + gutter ramp; `f-*` type utilities.
- **P1 ✅ Header**: 60px bar, colour-only hovers with the current-item hover quirk,
  Index dropdown with dot-bullet chips, fullscreen mobile sheet (`f-heading-4` links).
- **P2 ✅ Search overlay**: giant `f-heading-4` field, Collection/Region dot chips,
  debounced live results (FTS `search`, CSV `region`, single `collection`),
  `(N)` counter, focus trap.

### P3 — Home
Reference anatomy → our content:
1. **Hero carousel** under the header: full-bleed project/site stills,
   `aspect-3/4 → sm:aspect-[7/3]`, max-w 1728px, Swiper-style crossfade,
   each slide links to its catalogue record.
2. **Rotating statement** overlaid or beneath: "We map **Everything** for
   **Everyone**" where the nouns cycle (Everything ↔ Artifacts ↔ Museums ↔
   Textiles ↔ Documents / Everyone ↔ Regions…), set in `f-display-1`.
3. Themed editorial sections (essay paragraph + horizontal project rails):
   e.g. "The Gold Roads" (trade fortresses), "Cloth as Archive" (textiles),
   "Sacred Landscape" (groves/shrines) — pull from existing collections.
4. Pull quotes between sections: `f-heading-3` quote + `f-caption` attribution
   (use Ghana museum/heritage figures or project team).
5. "Latest records" grid + News/Journal teasers strip before footer.

### P4 — Catalogue index (/case-studies)
- H1 "Catalogue" in `f-heading-1`, subline "Showing the latest N records"
  in `f-body-2` gray (counts already exist via `/api/catalogue/summary`).
- Mixed 12-col grid of work items: image `aspect-[8/5]`, skeleton `#F0F0F0`
  wait — reference placeholder is gray-100 #E3E4E5 = our `hairline`; title
  block min-h 75px with 2-line clamp; ≥lg hover swaps title → one-line summary.
- Tag chips under titles link to collection scopes (dot-bullet language).
- "Load more" pagination (?page=N, limit 24) against `/api/heritage-assets`.

### P5 — Record detail (artifacts & museums)
- Title `f-heading-1` + one-line standfirst + tag chips.
- Full-width media stream (images/video), captions `f-caption`.
- Credits rail: Region / District / Community, Category, Period, Materials,
  Condition, Recorded date, Media credits — label `f-caption` gray over
  `f-body-2` ink rows.
- Long-form description blocks with bold lead-ins where available.
- Footer band: "Next record →" card chain within the same collection.

### P6 — Remaining chrome
- **About**: partners-grid pattern → institutions/sites directory (square crops),
  grouped name lists for contributors.
- **Journal (/blog)**: category chip row + chronological feed (Work/Press-style
  split: internal vs external links), Load more.
- **Contact**: office/contact carousel ("1 of N"), New Business-equivalent =
  per-institution inquiry emails, map link per location.
- **Gallery**: adopt dark-tone stickyTop header variant consistently; grid on
  the 12-col hairline system.
- **Atlas (Map)**: keep app chrome but align panel typography to `f-*` tokens;
  search inside map reuses SearchOverlay chip components.
- **Global cleanup pass**: replace every legacy `pt-[80px]/pt-32 md:pt-36`
  header offset with `pt-[calc(var(--header-h)+X)]`; purge remaining mono
  microtype labels outside true instrument contexts; all screens use the
  shared container gutter ramp instead of ad-hoc px-4/sm:px-6/lg:px-8.

## 9. Asset URLs (for reference during build)

- CSS: `https://www.pentagram.com/build/main/assets/index-DojLlKIn.css`
- Local copy of that CSS: `%TEMP%\opencode\pentagram.css`
- Fonts: `Plain-{Thin,Light,Regular}-*.woff2` under `/build/main/assets/` (do NOT hotlink — license)
- Images served via imgix: `pentagram-production.imgix.net` with `w=`,`h=`,`fit=crop`,`q=80`
  params — mirror this pattern for our media pipeline.
