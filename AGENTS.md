# Repository guide

## Setup and checks

- Use Node 24 (`.nvmrc`, `engines`) and Yarn 1; install with `yarn install --frozen-lockfile`.
- CI runs `yarn typecheck`, `yarn test`, `yarn build:mock`, then `yarn test:smoke`. There is no lint script or CI lint step yet.
- Run one test file with `yarn vitest run tests/unit/media.test.ts`; filter cases with `yarn vitest run -t 'normalizeMediaItem'`. Interactive watch mode: `yarn test:watch`.
- `build:mock` preloads `tests/fixtures/mock-tmdb.cjs` and writes fixture data to `.next`; `test:smoke` requires that build and starts its own server. Never deploy the mock build. Fixture poster paths are not real images; smoke tests do not exercise browser interaction or live TMDB.
- A real `yarn build` needs `API_KEY` during prerendering as well as at runtime. See `.env.example`; `RAPIDAPI_KEY` is optional. Keep both server-only, and do not log upstream Axios errors containing request credentials. Old committed credentials require rotation, not reuse.

## Architecture and constraints

- The app still uses the **Pages Router**: `src/pages/[type].tsx` statically generates `/movies` and `/series`; search and detail routes use server-side rendering. `next.config.js` redirects `/` to `/movies`.
- `src/actions/` contains client SWR hooks; `src/pages/api/` proxies TMDB for those hooks. `@/` resolves to `src/`. Category API files are placeholders, not working endpoints.
- `src/pages/_app.tsx` provides content type and watchlist contexts. The watchlist currently persists JSON in the `itemsId` and `ToWatchList` cookies; preserve existing data when changing storage or identity handling.
- Unit and component tests use **Vitest + React Testing Library** (`vitest.config.mts`; `tests/unit/`, `tests/component/`). Node-only suites (API routes, data loaders, fetcher) declare `// @vitest-environment node`; everything else runs in jsdom. `tests/setup.tsx` stubs `next/image` and `react-device-detect` globally. These tests do not run against a real Next server — that is the smoke test's job.
- The smoke test covers server responses of a fixture-backed production build, not hydration or touch interaction; browser-level E2E (e.g. Playwright) is not set up yet.
- `next-env.d.ts` and `.next/` are generated. For version-specific Next.js behavior, consult the installed documentation under `node_modules/next/dist/docs/`.
- `MODERNIZATION_PLAN.md` records the agreed direction: retain a dark theme, avoid generic AI aesthetics, and defer AI feature/provider decisions. Firebase is only an option if cloud storage becomes necessary.
