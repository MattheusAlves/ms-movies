# Repository guide

## Setup and checks

- Use Node 24 (`.nvmrc`, `engines`) and Yarn 1; install with `yarn install --frozen-lockfile`.
- CI runs `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build:mock`, `yarn test:smoke`, and `yarn test:e2e` after installing Playwright Chromium. `typecheck` regenerates Next.js route types first.
- Run one test file with `yarn vitest run tests/unit/media.test.ts`; filter cases with `yarn vitest run -t 'normalizeMediaItem'`. Interactive watch mode: `yarn test:watch`.
- `build:mock` preloads `tests/fixtures/mock-tmdb.cjs` and writes fixture data to `.next`; `test:smoke` and `test:e2e` require that build and start their own servers. Never deploy the mock build. Fixture poster paths are not real images; browser tests intercept image requests. Neither test exercises live TMDB.
- A real `yarn build` needs `API_KEY` and the provider base URLs during prerendering as well as at runtime. See `.env.example`; `RAPIDAPI_KEY` is optional. Keep keys and API base URLs server-only, and do not log upstream Axios errors containing request credentials. Image/YouTube bases use `NEXT_PUBLIC_` and are embedded at build time. Old committed credentials require rotation, not reuse.

## Architecture and constraints

- User-facing pages and working API routes use the **App Router**. Discovery is statically generated with 5,600-second revalidation; search, detail, and API handlers are request-time reads. `next.config.js` redirects `/` to `/movies`.
- `src/actions/` contains client SWR hooks; `src/app/api/` proxies TMDB through the server-only `src/util/tmdb.ts` client. `@/` resolves to `src/`. The remaining `src/pages/api/*/by/category.ts` files are placeholders, not working endpoints.
- Put shared, non-secret application settings in focused files under `src/config/`; `src/config/endpoint.ts` centralizes API paths and external URLs, and `src/config/content.ts` holds shared content preferences. External base URLs come from environment variables; the Next.js image allowlist derives from the public image base. Keep credentials in server-side request code, not shared config. Keep local one-off constants close to their use and respect framework requirements for statically analyzable route exports.
- `src/pages/_app.tsx` and `src/app/providers.tsx` provide content type, navigation, and watchlist contexts for their respective routers. Watchlists use versioned local storage and identity by media type plus ID; validated legacy `itemsId` and `ToWatchList` cookies are retained unchanged for recovery. Never silently overwrite malformed or conflicting storage.
- Unit and component tests use **Vitest + React Testing Library** (`vitest.config.mts`; `tests/unit/`, `tests/component/`). Node-only suites (API routes, data loaders, fetcher) declare `// @vitest-environment node`; everything else runs in jsdom. `tests/setup.tsx` stubs `next/image` globally. These tests do not run against a real Next server.
- The smoke test covers fixture-backed server responses. Playwright runs against that build on desktop and mobile-sized Chromium and covers hydration, navigation, watchlist persistence, and image fallback, not live TMDB.
- `next-env.d.ts` and `.next/` are generated. For version-specific Next.js behavior, consult the installed documentation under `node_modules/next/dist/docs/`.
- `MODERNIZATION_PLAN.md` records the agreed direction: retain a dark theme, avoid generic AI aesthetics, and defer AI feature/provider decisions. Firebase is only an option if cloud storage becomes necessary.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
