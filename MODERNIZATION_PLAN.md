# Modernization plan

## Goals

- Upgrade the application to a supported Next.js, React, and TypeScript stack.
- Secure credentials and modernize dependencies without unnecessarily rewriting the app.
- Improve discovery, search, detail pages, and the watchlist across mobile and desktop.
- Preserve existing URLs and watchlist data throughout the migration.
- Establish automated testing, deployment checks, and a maintainable foundation for future features.
- Revisit AI after the platform and user experience work; its scope and technical approach are not decided yet.

## Starting state

- Next.js 10, React 17, TypeScript 4, the Pages Router, SWR, and Sass.
- TMDB powers discovery and details; a RapidAPI IMDb request provides additional ratings.
- The watchlist is stored in browser cookies and does not require an account.
- No test files or test scripts were found, and TypeScript strict mode is disabled.
- API credentials are hard-coded in source, including a browser-side request. Treat them as exposed.
- Some poster-card actions are desktop-only, and several interactive elements are not semantic links or buttons.

## Phase 1: Security and baseline

**Goal:** Secure the existing application and document behavior before changing the stack.

- [ ] Rotate or revoke the exposed TMDB and RapidAPI credentials; review account usage and billing.
- [x] Move the identified credentials to server-only environment variables and remove them from client-side requests and current source code. Rotating credentials remains necessary even after removal.
- [ ] Evaluate whether the IMDb integration should remain; if so, proxy it through the server and handle failures gracefully.
- [ ] Document local setup, required environment variables, and deployment. Add an `.env.example` without secrets and ensure local environment files are ignored.
- [ ] Capture baseline screenshots and verify discovery, search, details, trailers, providers, and watchlist behavior.
- [ ] Add initial automated coverage for critical flows using mocked external APIs.
- [ ] Add CI checks for build, lint, type checking, and tests.

**Acceptance criteria:** Exposed credentials have been rotated, the application can be set up from documented instructions, and critical flows have a regression baseline.

**Progress:** Environment setup is documented; mocked server-side tests, a fixture-backed build, route smoke tests, and CI are in place. Firefox MCP validation with fixture data covered desktop search, watchlist persistence, and mobile-width menu navigation; it also identified and verified fixes for overlapping cards and search submission. Full browser-flow coverage, lint checks, and credential rotation remain outstanding.

## Phase 2: Platform and dependency upgrades

**Goal:** Move to a supported stack while keeping the existing product working.

- [x] Target the latest patched Next.js 16 release, a compatible React 19 release, TypeScript 5+, and a supported Node.js LTS version. Confirm compatibility and current supported versions when work begins.
- [x] Use the official upgrade guides and applicable codemods. Upgrade in controlled steps and verify each major change.
- [x] Keep the Pages Router during the initial framework upgrade; treat App Router migration as a separate phase.
- [x] Audit dependencies individually for maintenance, security, usage, and React/Next.js compatibility:
  - Update SWR and adapt pagination and initial-data APIs.
  - Evaluate replacing Axios with native `fetch`.
  - Remove or replace unnecessary or incompatible packages, including device detection where responsive CSS is sufficient.
  - Update Sass, Sharp, icons, linting, formatting, and associated type packages.
- [x] Update `next/image` usage and image configuration, old `Link` markup, and other breaking APIs.
- [x] Remove the unused custom SVG Webpack configuration and build with Turbopack.
- [x] Introduce stricter TypeScript checks incrementally and address dependency audit findings.

**Acceptance criteria:** The production build and regression checks pass on the upgraded stack, with existing functionality intact.

**Progress:** Next.js 16.4.6 and React 19.3.1 match the latest releases checked; Node 24 and TypeScript 5.9.3 meet the framework and tooling requirements. The installed version's upgrade guide was followed manually: the applicable config, async route params, image, and Link migrations were verified without running a broad codemod over the existing work. SWR 2, Sass, Sharp, icons, types, ESLint 10, and Prettier 3 are current for the chosen major versions. `strictNullChecks` is enabled, lint runs without warnings, and CI checks lint, types, unit/component tests, fixture build, smoke, and desktop/mobile Playwright flows, including media identity after search and browser Back. A real-key build, live server-response checks, and a Chromium discovery/watchlist/search/detail flow passed in an isolated copy. The full dependency audit below records the retained tradeoffs.

### Dependency audit and decisions

- **Next.js, React and React DOM:** Next.js 16.4.6 supports React 19; React and React DOM are pinned together at 19.3.1. Node 24 satisfies their and the build tools' engine requirements. Use the installed Next.js documentation for further breaking changes.
- **TypeScript and types:** TypeScript 5.9.3 is the latest 5.x release and satisfies the installed TypeScript-ESLint peer range (`>=4.8.4 <6.1.0`); TypeScript 7 is deferred until the lint tooling supports it. Node and React types match the runtime majors. Full strict mode is a later incremental improvement.
- **SWR:** Updated to 2.5.1, including infinite pagination and `fallbackData`; hook, component, and browser tests cover the current behavior.
- **Axios:** Retained for server-side TMDB/IMDb calls and existing Nock fixtures; client-side requests use native `fetch`. Replacing Axios is deferred to the typed server-client work in Phase 3 rather than changing caching, mocking, and error contracts during the platform upgrade. Never log credential-bearing upstream errors.
- **js-cookie:** Retained to preserve existing watchlist data. Its storage and identity migration is explicitly planned in Phase 3.
- **pure-react-carousel:** Version 3.5.2 declares React 19 support and remains in use for cast. Device detection was removed; responsive behavior now uses CSS and a viewport media query. Browser tests cover cast rendering on desktop and touch-sized viewports; multi-slide carousel interaction remains a future UI validation task.
- **react-icons, Sass and Sharp:** Current releases are compatible with the selected React/Node stack; retain them for existing UI, styling, and Next image optimization. Poster fallback is browser-tested.
- **nprogress:** Retained for navigation feedback in the App Router and legacy Pages shell. The App Router listener handles internal links and programmatic navigation and includes a timeout for cancelled transitions.
- **Lint, formatting and tests:** Replaced the unsupported ESLint 7 configuration and old direct plugins with the version-matched Next.js flat config and ESLint 10; updated Prettier to 3. Vitest, React Testing Library, and Playwright provide unit, component, and browser coverage. Nock 14 is retained for the working fixture preload; a major-version change is deferred until separately validated.
- **Audit and compatibility warnings:** `yarn audit` reports no vulnerabilities after narrowly resolving the affected ESLint-chain `minimatch` dependencies to 11.0.8. Those overrides cross the requested 10.x range; ESLint, tests, and the build must continue to be checked, and the overrides should be removed when upstream adopts a patched compatible version. Some Next ESLint plugins also declare ESLint peers only through 9 even though the installed Next.js docs support ESLint 10; monitor upstream and revalidate on upgrades.

## Phase 3: Architecture and data preservation

**Goal:** Simplify data access and migrate incrementally without breaking existing users.

- [x] Create a typed, server-only TMDB client with input validation, consistent error handling, timeouts, and explicit caching policies.
- [x] Gradually migrate pages to the App Router. Use React Server Components for server-side data and rendering where appropriate; keep interactive features such as search controls, pagination, and the watchlist in Client Components.
- [x] Define and test caching and revalidation per route, including discovery's existing revalidation behavior; compare client JavaScript and performance before and after migration.
- [x] Preserve `/movies`, `/series`, `/search/[title]`, `/info/[mediaType]/[mediaId]`, and `/to-watch`, or provide tested redirects where URLs change.
- [x] Retire the old `pages/[type].tsx` route when its replacements are ready to avoid route conflicts.
- [x] Move the local-only watchlist from cookies to versioned browser storage:
  - Import and validate existing cookies once on the same origin.
  - Retain the original cookies until migration succeeds.
  - Identify entries by media type and ID together.
  - Handle malformed data and storage failures without silently losing the list.
- [x] Decide separately whether accounts and cross-device sync are needed. For this iteration the watchlist remains local-only; no accounts or sync are added. Firebase is an option if a later product decision requires a database, subject to a separate evaluation.
- [ ] If cloud sync is added, plan authentication, per-user data access rules, privacy, offline/conflict behavior, and a safe migration from the local watchlist. Keep local-only use unless the product requirements change.

**Acceptance criteria:** Existing links and watchlists survive migration, and external API failures show useful error states.

**Progress:** All user-facing pages and working API proxies use the App Router; only the pre-existing, nonfunctional category placeholders remain in the Pages Router. The typed TMDB client is marked `server-only`, validates inputs and provider response shapes, applies an 8-second timeout, and returns safe errors without retaining upstream credentials. Discovery is statically generated with 5,600-second revalidation, while search, detail, and API proxies are request-time reads; API responses explicitly use `no-store`. Discovery keeps the last successful TMDB payload in memory and on disk (`.next/cache/last-good`, 179-day limit) so an upstream outage re-renders the last generated catalog instead of the error screen; search and detail still show the safe recovery screen when nothing can be cached. Component and desktop/mobile browser tests cover navigation, preserved links, provider failures, watchlist migration, same-ID titles, and cross-tab synchronization. Original cookies are retained unchanged; malformed or conflicting data blocks edits with a visible warning, and storage failures keep a temporary in-memory list with a warning. Cloud sync is not part of this iteration; the conditional sync item above applies only if the product requirement changes.

### Migration measurement

A local, unthrottled Chromium comparison used three fresh browser contexts per route and fixture-backed production builds: Pages Router baseline commit `d5ea02c` versus the current App Router build. Images and YouTube embeds were intercepted, and results below are medians; times are indicative, not production Core Web Vitals. The baseline also predates subsequent UI, storage, and dependency changes, so this is not a router-only experiment.

| Route | Encoded JS bytes, before → after | TTFB ms, before → after | Load ms, before → after |
| --- | ---: | ---: | ---: |
| `/movies` | 147,011 → 181,694 | 9 → 9 | 132 → 168 |
| `/search/fixture` | 139,814 → 174,425 | 26 → 23 | 179 → 134 |
| `/info/movie/101` | 155,378 → 189,796 | 15 → 22 | 131 → 147 |

The measured client JavaScript increased by roughly 22–25%; performance optimization and production Core Web Vitals measurement remain Phase 4 work.

## Phase 4: UI and UX refresh

**Goal:** Explore a distinctive new visual identity while improving usability, accessibility, and performance.

### Design direction

- A dark theme is essential. Explore a cinematic look that gives movie and series artwork room to stand out without sacrificing readability.
- Avoid a generic AI-product aesthetic: don't default to purple gradients, glowing cards, or interchangeable dashboard layouts. Develop a deliberate visual identity through typography, composition, color, and interaction details.
- Explore a few visual directions before committing, and validate them on both discovery and detail pages at mobile and desktop sizes.
- Keep contrast, legibility, keyboard focus, and reduced-motion preferences central to the design.

- [x] Define a small design system covering colors, typography, spacing, buttons, cards, and loading states. Retain Sass/CSS Modules unless another approach has a clear benefit.
- [x] Redesign discovery with responsive poster grids, readable title information, and visible watchlist actions on touch and desktop.
- [x] Improve search with a labeled form, correctly encoded queries, useful empty/error states, and filters where supported by the data source.
- [x] Refresh detail pages with poster fallbacks, clear metadata, trailers, cast, providers, and an accessible watchlist action.
- [x] Retain automatic infinite loading using a reliable visibility observer, with clear loading, retry, and end-of-results states. This supersedes the earlier manual Load more proposal at the user's request.
- [x] Use semantic links and buttons, keyboard navigation, visible focus, alt text, adequate contrast, and reduced-motion support.
- [x] Make the application English-only, including interface text, accessibility labels, page metadata, and TMDB language settings; do not add a language switcher.
- [x] Keep the current Brazil streaming-provider region unless a separate product decision changes it, and make the region explicit in the interface.
- [ ] Measure Core Web Vitals and optimize poster sizes, image loading, and client-side JavaScript.
- [ ] Verify TMDB and watch-provider attribution and usage requirements before release.

**Acceptance criteria:** Core flows work on touch and keyboard, include loading/error/empty states, and pass responsive and accessibility review.

**Progress:** The chosen direction is a compact, artwork-first catalog: restrained branding, dark neutral surfaces, warm accents, and minimal space above the posters. This favors the user's request over a large editorial masthead or full-screen promotional hero. Shared colors, typography, spacing, controls, cards, and loading states live in `src/styles/_system.scss`; detail-specific layout remains in its CSS Module. Motion is centralized in `src/styles/components/_transitions.scss` and follows the `transitions.dev` recipes: the header menu uses a scale/fade dropdown with a matching icon swap, headings and grids use staggered reveals, and cast, trailer, and provider placeholders use lightweight pulsing skeletons that keep document flow. All animation respects `prefers-reduced-motion`. Desktop and mobile fixture screenshots were inspected for discovery, search, and detail layouts. Search loads additional TMDB pages on request, keeps existing results on failure, and scopes filters and counts to loaded results. Discovery continues to load automatically.

Visible interface text, page language, and TMDB content requests use English. Provider availability continues to use Brazil and is labeled accordingly. Fixture-backed desktop and mobile Chromium tests cover the main flows, the Brazil label, search filters and retries, pagination, reduced motion, keyboard navigation, image URL sizes, and automated accessibility checks. These checks do not replace a complete manual accessibility review or live-provider validation.

### Performance and attribution notes

- Poster, backdrop, and cast image sizes now use sizes listed in [TMDB's configuration documentation](https://developer.themoviedb.org/reference/configuration-details). The first card image is prioritized, remaining cards are lazy-loaded, and responsive image `sizes` match the grid. An actual TMDB example poster returned HTTP 200 at `w500`; the former `w300` example also returned 200, so this change is alignment with documented sizes, not a confirmed image outage.
- `yarn playwright test tests/e2e/performance.spec.ts` records LCP, CLS, TTFB and encoded script bytes and saves layout screenshots for desktop and mobile. Separating the unused Pages Router from the App Router navigation bundle reduced encoded desktop script transfers in one local fixture run from 189,419 to 162,037 bytes on discovery, 190,717 to 165,285 on search, and 199,794 to 164,959 on detail. The latter run observed desktop LCP of 296–736 ms and CLS of 0–0.0002. These are single unthrottled samples, not controlled production measurements: fixture images are intercepted, and INP and field Core Web Vitals require a deployed site and real user traffic.
- [TMDB's FAQ](https://developer.themoviedb.org/docs/faq) and [API terms](https://www.themoviedb.org/api-terms-of-use) specify different attribution notices; Credits displays the notice from the API terms. Confirm the differing wording with TMDB before release. `public/tmdb-logo.svg` matches the approved [primary full logo](https://www.themoviedb.org/assets/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg) byte-for-byte (SHA-256 `d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b`). The [movie](https://developer.themoviedb.org/reference/movie-watch-providers) and [TV](https://developer.themoviedb.org/reference/tv-series-watch-providers) provider documentation requires JustWatch attribution, which appears alongside availability.
- **Release blocker:** TMDB's API terms prohibit caching TMDB information for longer than six months. The local watchlist stores title metadata indefinitely and retains legacy cookies for recovery; review the terms and design a compliant expiration/refresh migration that preserves watchlist identities before release. Do not silently remove legacy data. Commercial use also requires an appropriate written TMDB agreement; the operator must determine the applicable license.

## Phase 5: AI exploration — deferred

**Goal:** Decide whether and how AI should improve the product after the foundation and UX are in place.

- [ ] Revisit the user problem, potential features, provider, budget, privacy, and success criteria later.
- [ ] Review data-source terms, security, reliability, and operational costs before committing to an implementation.
- [ ] Create a separate AI proposal and implementation plan once those decisions are made.

No AI feature, provider, or architecture is selected in this plan.
TMDB's current API terms prohibit using TMDB APIs or content in connection with an AI/ML application, including training; any future AI proposal must account for that restriction and obtain any required permissions.

## Release and validation

- [ ] Use preview deployments and release platform and UX changes in manageable increments.
- [ ] Run build, lint, type, unit/integration, and critical end-to-end checks before release.
- [ ] Test direct navigation and refresh on existing routes, watchlist migration, API failures, and responsive layouts.
- [ ] Monitor production errors and Core Web Vitals, and retain a tested rollback path.
- [ ] Document support and maintenance procedures, including dependency updates and credential rotation.

## Estimate and open decisions

The platform, architecture, and UX work is roughly **6–10 weeks for one developer**, subject to a working baseline, dependency compatibility, test coverage, and the scope of the visual redesign. AI is excluded from this estimate.

Decisions to make before or during implementation:

1. Is a local-only watchlist sufficient, or is cross-device sync needed? If a database is needed, Firebase is an option.
2. Which proposed dark-theme visual direction best fits the product? Explore alternatives before selecting one.
3. Should the IMDb/RapidAPI integration be retained after reviewing cost, reliability, and value?

## References

- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Pages-to-App Router migration guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
