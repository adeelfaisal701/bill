# Architecture

```
UI (app/, components/)
   ↓
Hooks (hooks/) — React state glue for a screen
   ↓
Services (services/) — business logic, validation, calculations
   ↓
Repositories (repositories/) — interfaces + swappable implementations
   ↓
Data store — localStorage (mock, today) or Firestore (cloud, later)
```

## Why this shape

UI components never call `localStorage` or Firestore directly. They call a
**service** function (e.g. `createBill`, `listProducts`). Services validate
input, apply business rules (e.g. "a bill needs at least one item"), and
delegate the actual read/write to a **repository**.

Repositories are defined as TypeScript interfaces in
`src/repositories/interfaces.ts`. Two implementations exist today:

- `src/repositories/mock/*` — backed by `localStorage`, seeded with
  isolated demo data (`mock/mockData.ts`). This is what the app uses right
  now, in every environment, because Firebase is not configured.
- `src/repositories/firebase/*` — stub classes that throw a clear
  `CloudNotConfiguredError` on every method. They exist so the "shape" of
  the cloud integration is already correct, but they intentionally do NOT
  pretend to sync data, per the project's requirement not to fake cloud
  functionality.

`src/repositories/index.ts` is the **only** file that decides which
implementation is active (`repositories.mode` is `"mock"` or `"cloud"`).
Everything above it — services, hooks, components — is written against the
interfaces only, so switching to a real backend later means:

1. Implement the methods in `src/repositories/firebase/*` for real
   (Firestore reads/writes, and a Firestore **transaction** for
   `reserveNextSerialNumber` so two devices can never claim the same serial
   number for the same bill type — see the JSDoc on that method).
2. Set the six `NEXT_PUBLIC_FIREBASE_*` environment variables.
3. Flip `USE_CLOUD_WHEN_CONFIGURED` to `true` in `repositories/index.ts`.

No UI component or service needs to change.

## Serial numbers

Each `BillType` (`type-1`, `type-2`) stores its own `lastSerialNumber`.
`BillRepository.reserveNextSerialNumber(billType)` is the only place a
serial number is issued. The mock implementation does a local
read-increment-write, which is fine for a single browser tab but is **not**
safe against concurrent writers — that's explicitly called out in the
JSDoc so it isn't mistaken for the final implementation. The cloud
implementation must perform the increment inside a Firestore transaction
(or an equivalent atomic server-side operation) so simultaneous bill
creation from two devices never produces a duplicate serial number.

## Bill history / snapshots

`BillItem.productNameSnapshot` is captured at bill-creation time and never
recomputed from the live `Product` record. If a product is renamed or
deactivated later, existing bills keep showing the name (and rate) they
were created with. `BillItem` does not reference a live product price at
all — there isn't one; `rate` is entered manually per bill (see Product
Rules #3–#5 in the original spec).

## Where the two physical bill formats will plug in

Nothing in `bills/[id]/page.tsx` or `bills/new/[billTypeId]/page.tsx`
assumes a particular visual bill layout — both currently render a labeled
placeholder card ("physical bill layout will render here"). When the real
references are provided, the plan is:

1. Add `src/components/bills/renderers/BillType1Renderer.tsx` and
   `BillType2Renderer.tsx`, each taking a `Bill` (+ `BusinessProfile`) and
   rendering the exact physical layout.
2. Swap the placeholder `<Card>` in both pages for
   `billType === "type-1" ? <BillType1Renderer .../> : <BillType2Renderer .../>`.
3. Wire "PDF", "Print", and "Share" (currently placeholder toasts in
   `bills/[id]/page.tsx`) to render that same component to PDF/print output.

No data model or navigation changes should be required.
