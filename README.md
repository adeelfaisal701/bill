# BillBook — Bill Management App (Phase 1)

A mobile-first bill management app for a business that currently manages
bills on paper. This phase builds the complete app shell, navigation,
dashboard, bill history, product management, and settings — with the two
final physical bill layouts intentionally deferred until real reference
designs are provided (see `docs/ARCHITECTURE.md`, "Where the two physical
bill formats will plug in").

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v3
- lucide-react for icons
- No backend yet — see "Data & cloud setup" below

## Folder structure

```
src/
  app/                 routes (App Router)
    (app)/             the four main screens, behind the bottom nav + auth gate
      bills/
      products/
      settings/
    login/, signup/    outside the app shell
  components/
    ui/                generic primitives (Button, Input, Card, Modal, ...)
    layout/            BottomNavigation, SideNavigation, PageHeader, AppShell
    bills/, products/, common/   feature-specific presentational components
  services/            business logic + validation (billService, productService, ...)
  repositories/        interfaces + mock (localStorage) + firebase (stub) implementations
  types/               Bill, BillItem, Product, BusinessProfile, AppUser
  hooks/                useBills, useProducts
  context/             AuthContext, ToastContext
  lib/                 formatting + validation helpers
docs/
  ARCHITECTURE.md      UI → Services → Repositories → Data store, explained
```

## Installation

```bash
npm install
npm run dev
```

Open http://localhost:3000. You'll land on `/login`.

**Demo auth**: any email + password combination signs you in — there's no
real backend yet (see below). Your session and all app data are stored in
your browser's `localStorage`.

## Environment variables

Copy `.env.example` to `.env.local` if/when you're ready to connect
Firebase. Until all six `NEXT_PUBLIC_FIREBASE_*` variables are set (and the
Firebase repository classes are implemented — see below), the app runs
entirely on local mock data and clearly reports "Not configured" for cloud
sync in Settings → Data.

## Data & cloud setup (current status)

The app is **cloud-ready but not cloud-connected**. Concretely:

- Every screen reads/writes through `src/services/*`, which call
  `src/repositories/*` — never `localStorage` or a database directly.
- `src/repositories/mock/*` is the active implementation today: real
  business logic (validation, independent serial-number counters per bill
  type, product-name snapshots on bills) running against `localStorage`,
  seeded with a few example products/bills so the app isn't empty on first
  run.
- `src/repositories/firebase/*` contains the matching classes for a real
  Firestore backend, but their methods currently throw a clear
  "requires Firebase to be configured" error rather than silently
  pretending to sync — per the project requirement not to fake cloud
  functionality.
- To actually go live on Firebase: implement the bodies of the
  `Firebase*Repository` classes against Firestore (using a transaction for
  serial-number reservation — see `docs/ARCHITECTURE.md`), set the env
  vars, and flip `USE_CLOUD_WHEN_CONFIGURED` to `true` in
  `src/repositories/index.ts`.

## Authentication setup (current status)

`src/context/AuthContext.tsx` and `src/repositories/mock/MockAuthRepository.ts`
implement a demo auth flow (sign in/up with any credentials, session stored
locally) so the protected app shell and `/login`, `/signup` routes are
fully wired and testable. Swapping in real authentication (e.g. Firebase
Auth) means implementing `src/repositories/firebase/FirebaseAuthRepository.ts`
— no changes needed to `AuthContext`, the login/signup pages, or the
protected-route redirect in `app/(app)/layout.tsx`.

## Development commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Deployment

Any Next.js hosting target works (Vercel, etc.) — this is a standard App
Router project with no custom server requirements. Set the Firebase env
vars in your hosting provider's dashboard if/when cloud mode is enabled;
never commit real values to `.env.local` or source control.

## What's implemented vs. intentionally deferred

**Implemented and working:**
- Bottom navigation (mobile) / side navigation (tablet+desktop) across Home, Bills, Products, Settings
- Home dashboard: today's total, today's bill count, recent bills, empty state
- Create New Bill → bill type selection → bill creation foundation screen
  (party info, multi-product line items with manual rate entry and
  auto-calculated amounts, subtotal/total, notes, save/preview)
- Bills list: search (party name or serial number), bill-type filter, empty states
- Bill detail screen with placeholder actions for PDF/Share/Print/Duplicate, and working Delete (with confirmation)
- Full product management: add, edit, activate/deactivate, delete (with confirmation), duplicate-name validation
- Settings: business info (editable), per-bill-type serial number status, cloud sync status (accurately reports "not configured"), about/help/privacy placeholders, sign out
- Independent serial-number counters per bill type (see `docs/ARCHITECTURE.md`)
- Product-name snapshotting so edited/deactivated products don't alter historical bills
- Toasts, loading states, error states with retry, empty states, confirmation dialogs throughout
- Responsive layout: bottom nav + full-width cards on mobile, side nav + centered column on desktop
- Full repository/service architecture ready to swap in Firebase

**Intentionally deferred (per the spec):**
- The two physical bill layouts (`BillType1Renderer` / `BillType2Renderer`) — both bill screens currently show a labeled placeholder instead
- Real PDF generation, WhatsApp/share integration, and printing — currently placeholder toasts explaining they arrive with the bill renderers
- Real Firebase/Firestore connection and real authentication — architecture and stub classes are in place; env vars + implementation are the remaining steps
- Business logo upload (needs cloud storage)

## Adding the two physical bill formats later

See `docs/ARCHITECTURE.md` → "Where the two physical bill formats will plug
in" for the exact plan (two new renderer components, swapped into the two
existing placeholder locations — no data model or navigation changes
expected).
