# ZaraSuno Admin Panel

Control center for **ZaraSuno.app** — audiobook / book-summary platform (coin-based unlock, English + Urdu). Same Supabase project as the public website.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · lucide-react · recharts · Supabase (`@supabase/supabase-js` + `@supabase/ssr`) · SheetJS (xlsx) + pdf-lib for server-side exports.

Everything runs **server-side** (Server Actions / Route Handlers) with the `service_role` key. Search, pagination, sorting, filtering and exports are all done in SQL on the server — never in the browser.

## Getting started
```bash
npm install
npm run dev          # runs on http://localhost:3000
```
> The public website already runs on port 3000. Run the admin on another port:
> ```bash
> PORT=3100 npm run dev
> ```

Env is in `.env.local` (already filled with the ZaraSuno Supabase URL + keys). The `SUPABASE_SERVICE_ROLE_KEY` is server-only and never imported into a client component.

Login with the demo admin: `demo@zarasuno.app` / `ZaraSuno123!` (only `profiles.role = 'admin'` may enter).

## Colors
ZaraSuno palette in `tailwind.config.ts`: primary `brand` `#0B5D4B`, dark `brand-900` `#031D18`, accent `gold` `#D9A94C`, `clay`, `cream`, `ivory`, `sage`. Fonts: Plus Jakarta Sans (UI) + Fraunces (display).

## Structure
```
app/(auth)/login          login page (email + password, admin-only)
app/admin/<module>        one folder per module: page.tsx + actions.ts
app/api/export/[report]   server-side Excel/PDF export routes
app/api/upload            server-side storage upload route
components/admin           Sidebar, Topbar, DataTable, Charts, Filters, EntityForm, FileUploader…
components/ui              Modal, ConfirmDialog, Toggle, StatusBadge
lib/repositories/*Repository.ts   one repository per entity (public functions, server-only)
lib/supabase/{server,client,admin}.ts
lib/auth.ts · lib/export.ts · lib/utils.ts
middleware.ts             guards every /admin route (session + admin role)
```

## Repositories
Data access lives in `lib/repositories/` — one file per entity, exporting plain public functions:
`publisherRepository`, `publisherCountryRepository`, `categoryRepository`, `subcategoryRepository`,
`authorRepository`, `bookRepository`, `chapterRepository`, `coinPackageRepository`, `promocodeRepository`,
`userRepository`, `transactionRepository`, `collectionRepository`, `homeScreenRepository`,
`notificationRepository`, `faqRepository`, `contentPageRepository`, `feedbackRepository`,
`paymentRepository`, `settingsRepository`, `dashboardRepository`, `reportRepository`, `storageRepository`.

All list functions take `ListParams` and return `{ rows, count, page, perPage }` using SQL `.range()` + `count: 'exact'`.

## Modules
Dashboard · Publisher · Publisher Country · Category · Subcategory · Author · Book (+ chapters/audio) ·
Product Coins · Promocode · User (+ detail, add coins, transactions) · Sales · Collection · Home Screen
(hero + carousels) · Notifications · FAQ · Privacy · Terms · Feedback · Payments (manual queue + configs) ·
Settings · Reports (Consumption, Statistics, Purchase, Coin Purchase, Promocode, Top Selling, Language, Package).

## Database types
After first run, regenerate typed schema:
```bash
npm run types   # supabase gen types typescript → lib/database.types.ts
```

# admin-zarasuno
