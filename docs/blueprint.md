# LawnCast Build Blueprint & Prompt Set

This document contains:

1. **Three‑layer build roadmap** (top‑level blueprint, iterative chunks, microsteps).
2. **Standalone prompt set (17 prompts)** you can copy into any code‑generation LLM to implement LawnCast in a fully test‑driven, incremental manner.

---

## 1 · Top‑Level Blueprint

| Phase                       | Purpose                                           | Major Deliverables                                                            | “Definition of Done” checkpoints                       |
| --------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| **0 – Scaffold & Tooling**  | Spin up project skeleton with linting, tests, CI. | Vite + React TS app, ESLint + Prettier config, Vitest, Playwright, GitHub CI. | `npm test` & `npm run e2e` both green. CI builds pass. |
| **1 – Core State & Models** | Centralize settings, log, cache.                  | Zustand store slices + type‑safe selectors, persistence.                      | Unit tests prove read/write, serialization, reset.     |
| **2 – API Adapters**        | Wrap NOAA + Nominatim.                            | Fetch utils, retry + cache layer.                                             | Mock Service Worker tests (200, timeout, 429).         |
| **3 – Business Logic**      | Hydrate weekly dataset & compute verdict.         | `calculateDecision()` pure function; progress‑bar reducer.                    | Edge‑case coverage (exact, surplus, deficit).          |
| **4 – UI Foundation**       | Layout, routing, theming.                         | BottomNav + Routed pages, theme toggle.                                       | Lighthouse PWA/A11y ≥ 90.                              |
| **5 – Home Tab MVP**        | Show verdict + progress bar.                      | DecisionCard, StackedBar, Explanation.                                        | Storybook + RTL tests pass.                            |
| **6 – Log Tab MVP**         | CRUD watering minutes.                            | WeekLogTable dialog; validation.                                              | CRUD E2E scenario passes.                              |
| **7 – Onboarding Wizard**   | First‑run setup & defaults.                       | 4‑step modal wizard.                                                          | Mobile E2E passes.                                     |
| **8 – Settings Tab**        | Edit all user prefs.                              | Forms, calibration helper, notifications.                                     | RTL tests & state sync.                                |
| **9 – PWA & Offline**       | Installability + offline mode B.                  | Manifest, icons, offline screen.                                              | Chrome audit installable.                              |
| **10 – Push Notifications** | Daily FCM reminder.                               | Service‑worker listener, Cloud Function.                                      | Test token receives push.                              |
| **11 – Release**            | Amplify deploy & smoke tests.                     | Amplify pipeline, env secrets.                                                | Live URL passes smoke E2E.                             |

---

## 2 · Iterative Chunks → Microsteps (sample)

Below shows Phases 0 & 1 fully exploded. Follow the same pattern for later phases when assigning tickets.

### Phase 0 – Scaffold & Tooling

| Chunk                      | Microsteps                                                                 |
| -------------------------- | -------------------------------------------------------------------------- |
| **C0‑1 · Repo & Init**     | 0‑1‑a `git init` + MIT LICENSE · 0‑1‑b Vite scaffold · 0‑1‑c Path aliases. |
| **C0‑2 · Quality Gates**   | 0‑2‑a ESLint + React/TS plugins · 0‑2‑b Prettier · 0‑2‑c Husky pre‑commit. |
| **C0‑3 · Testing Harness** | 0‑3‑a Vitest + jsdom · 0‑3‑b React Testing Library starter test.           |
| **C0‑4 · E2E Setup**       | 0‑4‑a Install Playwright · 0‑4‑b Smoke spec.                               |
| **C0‑5 · CI**              | 0‑5‑a GitHub Actions workflow.                                             |

### Phase 1 – Core State & Models

| Chunk                        | Microsteps                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| **C1‑1 · Types**             | 1‑1‑a Define domain models · 1‑1‑b Type‑guard tests.                               |
| **C1‑2 · Zustand Store**     | 1‑2‑a Install Zustand · 1‑2‑b settingsSlice · 1‑2‑c logSlice · 1‑2‑d weatherSlice. |
| **C1‑3 · Persistence Tests** | 1‑3‑a Mock `localStorage` round‑trip · 1‑3‑b Reset clears all.                     |

_(Phases 2‑10 follow in roadmap above; see prompt set for concrete implementation tasks.)_

---

## 3 · Code‑Generation Prompt Set

Copy each prompt **exactly as shown** into your LLM of choice—run them sequentially.

### Prompt 01 – Repo & Project Scaffold

```text
You are an expert full‑stack engineer.
Create a new public Git repository named **lawncast** initialized with:

1. Vite + React + TypeScript template (`npm create vite@latest lawncast -- --template react-ts`).
2. Path alias `@/` mapped to `src` in both `tsconfig.json` and `vite.config.ts`.
3. MIT LICENSE authored by “YOUR_NAME”.
4. Empty `README.md` containing project title and a one‑sentence description.

Return **only** the file system diff in unified format.
```

### Prompt 02 – Code Quality Tooling

```text
You have the freshly scaffolded `lawncast` repo.

Tasks:
1. Add ESLint with `eslint:recommended`, React, TypeScript, and Prettier plugins.
2. Add `.eslintrc.cjs` extending the above configs and enabling React hooks rules.
3. Add `.prettierrc` with trailing comma = "all" and singleQuote = true.
4. Add Husky pre‑commit hook that runs `npm run lint` and `npm test`.

Include updated `package.json` scripts: `lint`, `format`, `prepare`.

Provide the full diff only.
```

### Prompt 03 – Testing Harness

```text
The repository now includes ESLint and Prettier.

Add unit‑testing support:

1. Install Vitest, jsdom test environment, and @testing-library/react.
2. Configure `vite.config.ts` with a `test` block (globals = true, environment = 'jsdom').
3. Create `src/__tests__/App.test.tsx` that renders `<App />` and asserts the component mounts.
4. Add script `"test": "vitest"` to `package.json`.

Return the file diff.
```

### Prompt 04 – E2E Starter

```text
Extend the project with Playwright E2E tests:

1. Run `npx playwright install`.
2. Add Playwright config targeting Chromium, viewport 390×844.
3. Create a test `e2e/smoke.spec.ts` that:
   - launches dev server (`viteDevServer()`),
   - navigates to `/`,
   - asserts page title contains "LawnCast".

Add script `"e2e": "playwright test"`.

Provide the diff.
```

### Prompt 05 – CI Workflow

```text
Add GitHub Actions workflow `.github/workflows/ci.yml` that:

- Triggers on push / pull_request to any branch.
- Uses `actions/setup-node@v4` with Node 20.
- Caches npm deps.
- Runs `npm ci`, `npm run lint`, `npm test`, and `npm run e2e`.
- Uploads Playwright HTML report as workflow artifact.

Return the workflow file.
```

### Prompt 06 – Domain Models

```text
Inside `src/models`, create `types.ts` with the following exported TypeScript types:

<insert type definitions from spec>

Add a Vitest suite `src/__tests__/types.test.ts` that confirms the types compile (no runtime assertions needed).

Return diff.
```

### Prompt 07 – Zustand Stores

```text
Create three Zustand slices persisted to localStorage key `lawncast_v1`.

1. `settingsSlice` with state of type `Settings` plus actions `update(partial)` and `reset`.
2. `logSlice` with state `{ entries: Record<string, WaterLogEntry> }` and actions `setEntry(date, minutes)` (overwrites) and `clearWeek(isoWeek)`.
3. `weatherSlice` with `cache: WeatherCache | null` and action `setCache`.

Provide unit tests mocking localStorage.

Return diff.
```

### Prompt 08 – API Adapters

```text
Add two fetch helpers under `src/api`:

1. `getNOAAWeather(lat, lon)` ➜ { observed: Record<date, inches>, forecast: Array<{ date, pop, amount }> }
   - Hit `https://api.weather.gov/points/{lat},{lon}` then grid endpoints.
   - Retry twice with exponential backoff.

2. `searchZip(query)` using Nominatim JSON API.

Implement 1‑hour cache via `weatherSlice.cache`.

Provide Vitest tests with MSW mocking success, timeout, and HTTP 429.

Return diff.
```

### Prompt 09 – Business Logic

```text
Create `src/lib/calculateDecision.ts` exporting interfaces DecisionInput & Decision (see spec),
and function `calculateDecision(input): Decision`.

Rules:
1. Sum `observed` (all days), `forecast` where pop ≥ 0.6, and `logged` converted to inches.
2. shouldWater = totalProjected < target.
3. deficit = max(target − totalProjected, 0).

Include unit tests: exact target, just under, far over.

Return diff.
```

### Prompt 10 – Home UI Skeleton

```text
Add routing with react-router-dom:

1. Layout: BottomNavigation (Home | Log | Settings).
2. HomePage renders placeholder DecisionCard ("Loading...").
3. Light/dark theme Context using MUI createTheme.

Add Playwright test verifying navigation.

Return diff.
```

### Prompt 11 – DecisionCard + ProgressBar

```text
Implement DecisionCard and StackedProgressBar components per spec:

- DecisionCard color-coded (green when no‑water, orange when water).
- ProgressBar normalizes to target=100%.

Wire HomePage: fetch decision on mount.

RTL tests: colors & stacking.

Return diff.
```

### Prompt 12 – Log Tab CRUD

```text
Build WeekLogTable:

- Rows Sunday-Saturday (date-fns).
- Edit icon opens MUI dialog to enter minutes (0‑240).
- Updates zustand logSlice.

Vitest tests mocking store.

Return diff.
```

### Prompt 13 – Onboarding Wizard

```text
Create modal OnboardingWizard that appears when settingsSlice.zone undefined.

Steps:
1. Geolocation / ZIP autocomplete.
2. Sun exposure + species pre-select based on zone.
3. Sprinkler calibration helper.
4. Notifications toggle + time picker.

Playwright: complete wizard & skip path.

Return diff.
```

### Prompt 14 – Settings Tab

```text
Build SettingsPage with editable sections:

- ZIP autocomplete, grass species, sun exposure radios.
- Sprinkler calibration rerun.
- Theme toggle.
- Notifications enable & time picker.
- "Clear data" button.

RTL tests: store updates.

Return diff.
```

### Prompt 15 – PWA Manifest & Offline Mode

```text
Add vite-plugin-pwa manifest (short_name LawnCast, theme_color #4A7C59, background #F5F5F5).
Generate icons; service worker shows /offline.html when offline.

Lighthouse installable audit must pass.

Return diff.
```

### Prompt 16 – Browser Push Notifications

```text
Integrate Firebase Cloud Messaging:

1. Add Firebase web SDK init.
2. Service-worker listener for push.
3. Cloud Function sendWaterReminder scheduled daily 04:00 local (Node 18) that queries Firestore users, computes shouldWater, sends notification.

Unit tests using Firebase emulator.

Return diff.
```

### Prompt 17 – AWS Amplify Deploy

```text
Add amplify.yml, SPA redirect, and provide instructions to connect GitHub repo main branch to Amplify Hosting.

Return diff.
```

---

## End of Document
