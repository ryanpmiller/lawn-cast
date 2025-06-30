# LawnCast – Developer‑Ready Specification

## 1. Product Overview

**Goal:** Provide U.S. homeowners with a fast, reliable “Water or Not?” verdict for today, based on past rainfall, forecast rainfall (≥ 60 % probability), and user‑logged watering.
**Form factor:** Responsive Progressive Web App (PWA), mobile‑first, with offline fallback (mode B).
**Audience:** U.S. lawn owners across cool, warm, and transition climate zones.

---

## 2. Key Functional Requirements

| Area                       | Requirement                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Onboarding (skippable)** | Steps: ① ZIP geolocation permission → fallback ZIP search (Nominatim autocomplete), ② auto‑suggest grass species (cool/warm/transition) + sun exposure (default = Full Sun), ③ optional sprinkler‑calibration helper (tuna‑can test) saving inches / hour, default 0.5 in/h, ④ toggle watering reminders & pick time (default 08:00 local). Skipping loads sensible defaults. |
| **Home tab**               | Large color‑coded card: Green = “No need to water”; Orange (#FFB74D) = “Yes, water today”. Stacked horizontal progress bar (normalized to 100 % target): blue = past rainfall, green = logged watering, light‑gray = forecast rainfall. Below: explanatory paragraph listing totals, dates, and forecast details.                                                             |
| **Log tab**                | Calendar‑like list for current Sunday–Saturday week. Each day holds one editable entry (minutes). Converts minutes ➜ inches via stored sprinkler rate. CRUD allowed within the week.                                                                                                                                                                                          |
| **Settings tab**           | Edit ZIP, grass species, sun exposure, sprinkler rate (rerun helper), toggle light/dark theme, choose reminder time, enable/disable notifications, diagnostic “Clear all data”.                                                                                                                                                                                               |
| **Push reminders**         | One per watering day at chosen time via Firebase Cloud Messaging. Sent only if “Yes, water today” and notifications are enabled.                                                                                                                                                                                                                                              |
| **PWA / Offline**          | Manifest: short_name = “LawnCast”, theme_color #4A7C59, background #F5F5F5, generated icons. If offline: show “Offline—connect to update” screen; logging disabled.                                                                                                                                                                                                           |
| **Caching**                | NOAA & Nominatim responses cached in `localStorage` for ≤ 1 hour.                                                                                                                                                                                                                                                                                                             |
| **Weekly target table**    | Fixed lookup (see §3.1).                                                                                                                                                                                                                                                                                                                                                      |
| **Computation window**     | Fixed calendar week Sunday→Saturday.                                                                                                                                                                                                                                                                                                                                          |

---

## 3. Business Logic

### 3.1 Weekly Water Targets (inches / week)

| Zone (species)                                    | Full Sun | Partial Sun | Full Shade |
| ------------------------------------------------- | -------- | ----------- | ---------- |
| **Cool‑season** (Kentucky bluegrass, tall fescue) | **1.0**  | **0.75**    | **0.50**   |
| **Warm‑season** (Bermuda, Zoysia, St. Augustine)  | **0.75** | **0.50**    | **0.40**   |
| **Transition default**                            | **0.85** | **0.65**    | **0.45**   |

_Species → zone mapping comes from NOAA climate division of user ZIP._

### 3.2 Daily Decision Algorithm

1. Gather dataset **D** for the current week:
    - `rainPast` – sum observed precipitation (NOAA `/observations`).
    - `rainForecast` – sum predicted precipitation for days with PoP ≥ 60 % (NOAA `/forecast`).
    - `loggedWater` – sum user entries (minutes × sprinklerRate / 60).
2. `totalProjected` = `rainPast` + `rainForecast` + `loggedWater`.
3. If `totalProjected` \< `weeklyTarget` ➜ **Yes, water today**; else **No need to water**.
4. Show progress bar capped at 100 %.

---

## 4. Architecture & Tech Stack

| Layer                | Choice                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Frontend tooling** | Vite + React 18 + TypeScript 5                                                       |
| **UI Framework**     | Material UI v6 with custom palette (neutral surfaces, accent #4A7C59) & theme toggle |
| **State**            | **Zustand** with `persist` middleware (localStorage key `lawncast_v1`)               |
| **Geocoding**        | OpenStreetMap Nominatim (free tier)                                                  |
| **Weather**          | NOAA National Weather Service API (`api.weather.gov`)                                |
| **Push**             | Firebase Cloud Messaging; Node 18 Cloud Function scheduled daily 04:00 local         |
| **Hosting & CI/CD**  | GitHub → AWS Amplify Hosting (branch = main)                                         |
| **Domain**           | Start with `*.amplifyapp.com`; custom domain later via Route 53                      |
| **Service worker**   | Vite PWA plugin (static asset cache + FCM)                                           |
| **Testing tools**    | Vitest, React Testing Library, Playwright, Mock Service Worker                       |

---

## 5. Component Outline

```
App
 ├─ NavigationBar  (BottomNavigation)
 ├─ Router
 │   ├─ HomePage
 │   │   ├─ DecisionCard
 │   │   ├─ ProgressBarStacked
 │   │   └─ ExplanationSection
 │   ├─ LogPage
 │   │   └─ WeekLogTable → MinutesInputDialog
 │   ├─ SettingsPage
 │   │   ├─ LocationSection
 │   │   ├─ LawnSettingsSection
 │   │   ├─ NotificationSection
 │   │   ├─ ThemeToggle
 │   │   └─ DangerZone
 │   └─ OnboardingWizard (ModalRoute)
 └─ SnackbarProvider
```

---

## 6. Data Models (TypeScript)

```ts
type ClimateZone = 'cool' | 'warm' | 'transition';
type SunExposure = 'full' | 'partial' | 'shade';

interface Settings {
	zip: string;
	lat: number;
	lon: number;
	zone: ClimateZone;
	grassSpecies:
		| 'kentucky_bluegrass'
		| 'tall_fescue'
		| 'bermuda'
		| 'zoysia'
		| 'st_augustine';
	sunExposure: SunExposure;
	sprinklerRateInPerHr: number; // default 0.5
	notificationsEnabled: boolean;
	notificationHour: number; // 0‑23, default 8
	theme: 'light' | 'dark' | 'system';
}

interface WaterLogEntry {
	date: string; // YYYY‑MM‑DD
	minutes: number;
}

interface WeatherCache {
	timestamp: number; // epoch ms
	observedInches: Record<string, number>;
	forecastInches: Record<string, { pop: number; amount: number }>;
}
```

---

## 7. API Handling & Error Strategy

| Scenario                  | Handling                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **Geolocation denied**    | Prompt ZIP autocomplete modal; block onward until ZIP provided.                             |
| **NOAA fetch fails**      | Toast “Weather data unavailable; retrying in 1 h.” Keep last cache; card shows stale label. |
| **Nominatim 429**         | Debounce; fall back to plain text input.                                                    |
| **FCM permission denied** | Disable notifications UI; show hint to enable in browser settings.                          |
| **localStorage quota**    | Catch exception; show error banner prompting data clear.                                    |

---

## 8. Accessibility & Performance

- WCAG 2.1 AA color contrast.
- Icons labeled with `aria-label`.
- Lighthouse PWA/Performance/Accessibility ≥ 90 on Moto G4 simulated.

---

## 9. Testing Plan

| Layer | Type                  | Cases                                                           |
| ----- | --------------------- | --------------------------------------------------------------- |
| Logic | Vitest                | Edge totals (exact target, surplus, deficit)                    |
| UI    | React Testing Library | Card colors, Log CRUD                                           |
| API   | MSW                   | NOAA timeout, Nominatim 429                                     |
| E2E   | Playwright (mobile)   | Onboarding, skip flow, offline mode B, PWA install, push permit |
| Perf  | Lighthouse CI         | TTI < 3 s                                                       |

---

## 10. Environment Variables

```
VITE_NWS_USER_AGENT = "your.email@example.com (LawnCast)"
VITE_FCM_API_KEY    = <firebase key>
VITE_FCM_PROJECT_ID = <project id>
VITE_NOMINATIM_URL  = https://nominatim.openstreetmap.org
```

---

## 11. Deployment Checklist

1. Repo with MIT license, Prettier & ESLint.
2. Amplify build (`npm run build` ➜ `dist`).
3. Redirect rule `/* -> /index.html 200`.
4. Upload manifest & icons.
5. Configure FCM service‑worker + VAPID key.
6. Verify SSL on amplifyapp.com domain.
7. After MVP, map custom domain via Route 53.

---

### ✅ LawnCast spec complete — ready for development.
