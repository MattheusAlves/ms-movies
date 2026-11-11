# Repository guide

## Setup and checks

- Use Node 24 (`.nvmrc`, `engines`) and Yarn 1; install with `yarn install --frozen-lockfile`.
- CI runs `yarn lint`, `yarn typecheck`, `yarn test`, `yarn build:mock`, `yarn test:smoke`, and `yarn test:e2e` after installing Playwright Chromium. `typecheck` regenerates Next.js route types first.
- Run one test file with `yarn vitest run tests/unit/media.test.ts`; filter cases with `yarn vitest run -t 'normalizeMediaItem'`. Interactive watch mode: `yarn test:watch`.
- `build:mock` preloads `tests/fixtures/mock-tmdb.cjs` and writes fixture data to `.next`; `test:smoke` and `test:e2e` require that build and start their own servers. Never deploy the mock build. Fixture poster paths are not real images; browser tests intercept image requests. Neither test exercises live TMDB.
- A real `yarn build` needs `API_KEY` during prerendering as well as at runtime. See `.env.example`; `RAPIDAPI_KEY` is optional. Keep both server-only, and do not log upstream Axios errors containing request credentials. Old committed credentials require rotation, not reuse.

## Architecture and constraints

- User-facing pages use the **App Router**; API routes remain in the **Pages Router**. Discovery is statically generated with 5,600-second revalidation; search and detail are rendered on request. `next.config.js` redirects `/` to `/movies`.
- `src/actions/` contains client SWR hooks; `src/pages/api/` proxies TMDB for those hooks. `@/` resolves to `src/`. Category API files are placeholders, not working endpoints.
- `src/pages/_app.tsx` and `src/app/providers.tsx` provide content type, navigation, and watchlist contexts for their respective routers. The watchlist currently persists JSON in the `itemsId` and `ToWatchList` cookies; preserve existing data when changing storage or identity handling.
- Unit and component tests use **Vitest + React Testing Library** (`vitest.config.mts`; `tests/unit/`, `tests/component/`). Node-only suites (API routes, data loaders, fetcher) declare `// @vitest-environment node`; everything else runs in jsdom. `tests/setup.tsx` stubs `next/image` globally. These tests do not run against a real Next server.
- The smoke test covers fixture-backed server responses. Playwright runs against that build on desktop and mobile-sized Chromium and covers hydration, navigation, watchlist persistence, and image fallback, not live TMDB.
- `next-env.d.ts` and `.next/` are generated. For version-specific Next.js behavior, consult the installed documentation under `node_modules/next/dist/docs/`.
- `MODERNIZATION_PLAN.md` records the agreed direction: retain a dark theme, avoid generic AI aesthetics, and defer AI feature/provider decisions. Firebase is only an option if cloud storage becomes necessary.
