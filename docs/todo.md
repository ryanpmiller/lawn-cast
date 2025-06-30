# LawnCast Development Checklist

Mark each task with `[x]` when complete.
Use `⌘/Ctrl+F` to jump to phases.

---

## Phase 0 · Scaffold & Tooling

- [x] **C0‑1 · Repository & Init**
    - [x] git init + add MIT LICENSE
    - [x] `npm create vite@latest lawncast -- --template react-ts`
    - [x] Configure path alias `@/` in `tsconfig.json`
    - [x] Configure alias in `vite.config.ts`
- [x] **C0‑2 · Quality Gates**
    - [x] Install ESLint (React, TS) + Prettier
    - [x] `.eslintrc.cjs` rules & hooks linting
    - [x] `.prettierrc` (trailing comma all, singleQuote true)
    - [x] Husky pre‑commit running lint & test
- [x] **C0‑3 · Testing Harness**
    - [x] Install Vitest, jsdom env, @testing‑library/react
    - [x] Configure vitest block in vite config
    - [x] Add sample test that mounts `<App />`
- [x] **C0‑4 · E2E Setup**
    - [x] Install Playwright & browsers
    - [x] Add Playwright config (Chromium 390×844)
    - [x] Write smoke spec to load `/` and assert title
- [x] **C0‑5 · CI Pipeline**
    - [x] Create `.github/workflows/ci.yml`
    - [x] Setup node caching, npm ci, lint, unit, e2e
    - [x] Upload Playwright report artifact

---

## Phase 1 · Core State & Models

- [x] **C1‑1 · Domain Types**
    - [x] Create `src/models/types.ts`
    - [x] Add Vitest compile test for types
- [x] **C1‑2 · Zustand Stores**
    - [x] Install Zustand + persist middleware
    - [x] Implement `settingsSlice`
    - [x] Implement `logSlice`
    - [x] Implement `weatherSlice`
- [x] **C1‑3 · Persistence Tests**
    - [x] Mock `localStorage` and verify round‑trip
    - [x] Ensure `reset()` clears slices

---

## Phase 2 · API Adapters

- [x] Install fetch helper (axios or native fetch wrapper)
- [x] **NOAA Adapter**
    - [x] Call points endpoint, resolve grid id
    - [x] Fetch observed precipitation
    - [x] Fetch forecast precipitation & PoP
    - [x] Exponential‑backoff retry (max 2)
- [x] **Nominatim Adapter**
    - [x] Implement ZIP autocomplete search
    - [x] Rate‑limit requests & debounce
- [x] **Cache Layer**
    - [x] Read/write 1‑hour weather cache via `weatherSlice`
- [x] **Tests**
    - [x] MSW mock success
    - [x] MSW mock timeout
    - [x] MSW mock HTTP 429

---

## Phase 3 · Business Logic

- [x] Implement `calculateDecision` (inputs/outputs per spec)
- [x] Convert logged minutes to inches using sprinkler rate
- [x] Unit tests: exact target, slight deficit, surplus
- [x] Utility: `getWeeklyTarget(zone, sunExposure)`

---

## Phase 4 · UI Foundation

- [x] Install `react-router-dom`
- [x] Create `BottomNavigation` component (+ icons)
- [x] Configure routes: Home, Log, Settings
- [x] Implement ThemeProvider with light/dark toggle
- [x] Placeholder pages render
- [x] Playwright nav test passes
- [x] Lighthouse baseline ≥ 90 (PWA, A11y, Perf)

---

## Phase 5 · Home Tab MVP

- [x] Create `DecisionCard` (color‑coded)
- [x] Create `StackedProgressBar`
- [x] Create `ExplanationSection`
- [x] Load weather + logs, compute decision on mount
- [x] Storybook stories snapshot
- [x] RTL tests for color logic & bar normalization

---

## Phase 6 · Log Tab MVP

- [x] Build `WeekLogTable` with Sunday‑Saturday rows
- [x] Add minutes edit dialog (0‑240 validation)
- [x] Save to `logSlice`
- [x] Disable edits when offline
- [x] Playwright CRUD test scenario

---

## Phase 7 · Onboarding Wizard

- [x] Modal route triggered when `settings.zone` undefined
- [x] Step 1: Geolocation → ZIP autocomplete fallback
- [x] Step 2: Sun exposure + species suggestion
- [x] Step 3: Sprinkler calibration helper (tuna‑can)
- [x] Step 4: Notification toggle + time picker
- [x] Skip for now path sets defaults
- [x] Mobile Playwright test for both paths

---

## Phase 8 · Settings Tab

- [x] LocationSection with manual ZIP entry (autocomplete removed)
- [x] LawnSettingsSection (species, sun)
- [x] SprinklerSection (rerun calibration)
- [x] ThemeToggle
- [x] NotificationSection (enable + time)
- [x] DangerZone clear data
- [x] RTL tests on form/state sync

---

## Phase 9 · PWA & Offline

- [ ] Add vite‑plugin‑pwa manifest (short_name LawnCast)
- [ ] Generate icons from logo.svg
- [ ] Service worker caches static assets
- [ ] Create `/offline.html` fallback screen
- [ ] Disable Log inputs when offline
- [ ] Lighthouse PWA audit installable

---

## Phase 10 · Push Notifications

- [ ] Add Firebase SDK + env vars
- [ ] Request notification permission in onboarding / settings
- [ ] Store FCM token in Firestore

---

## Phase 11 · AWS Amplify

- [ ] Add amplify.yml, SPA redirect
- [ ] Provide instructions to connect GitHub repo main branch to Amplify Hosting
