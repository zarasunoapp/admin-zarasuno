# CLAUDE CODE PROMPT — Wire the ZaraSuno WEBSITE to real data (driven by the Admin Panel)

> Paste this into a fresh Claude Code session **inside your existing ZaraSuno website repo**.
> The admin panel and the website share the **same Supabase project**. The admin panel writes the data;
> the website must now **read it live** and stop using any mock/hardcoded/sample content.

---

## 0. Goal
Replace every piece of static/placeholder data on the public website with **live queries to the shared Supabase project**, so that whatever an admin changes in the panel (books, toggles, home hero, carousels, collections, coin packages, promocodes, notifications, CMS pages, settings) immediately changes what the website renders.

## 1. Environment (SAME project as the admin panel)
```
NEXT_PUBLIC_SUPABASE_URL=https://ttxgowlsvutggtqauuza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key>
```
- The website uses the **anon key only** (browser + user session). **Never** put the service_role key in the website.
- All user-scoped reads/writes go through the logged-in user's session so **RLS** applies.
- Confirm RLS policies exist for public read of published content and per-user rows (see §9).

## 2. Rules
- No `Array.filter` over a full table in the browser for lists — query Supabase with `.eq/.ilike/.order/.range`.
- Respect visibility flags everywhere: only show `books.is_published = true`, `categories.is_active = true`, `subcategories.is_active = true`, `coin_packages.is_active = true`, `home_carousels.is_active = true`, `faqs.is_active = true`.
- Money/coins: the platform is **coin-based**. Users buy coins (coin_packages) then spend coins to unlock books (`books.coin_price`).
- Private audio: `chapters.audio_path` lives in the **private** `book-audio` bucket. The browser must never read it directly — serve it through a server route that (a) checks the user unlocked the book, then (b) returns a short-lived **signed URL**.

## 3. The shared schema (tables the website reads)

**Catalog**
- `books` — `id, title, display_title, subtitle, description, book_type ('summary'|'full'|'ebook'|'audiobook'), author_id, author_2_id, author_country, publisher_id, publisher_country, year_published, subcategory_id, language_code ('en'|'ur'), is_free, is_premium, coin_price, show_ads, is_published, cover_url, metadata (jsonb), is_book_of_day, is_top_selling, is_recommended, chapter_count, duration_seconds, listen_count, created_at`
- `chapters` — `id, book_id, chapter_number, title, audio_path (PRIVATE), duration_seconds, is_preview`
- `authors` — `id, name, designation, email, bio, avatar_url`
- `publishers` — `id, name, email, group_name`
- `publisher_countries` — `id, name`
- `categories` — `id, name, slug, icon_url, sort_order, is_active`
- `subcategories` — `id, name, slug, category_id, sort_order, is_active`

**Coins / commerce**
- `coin_packages` — `id, name, price, coin_amount, bundle_id, status, is_active, description`
- `promocodes` — `id, name, code, coin_reward, starts_at, expires_at, max_uses, used_count, per_user_limit, is_active, reward_type ('coins' | 'discount'), discount_percent, package_id (nullable)`. Two modes: **`reward_type='coins'`** → grant `coin_reward` free coins; **`reward_type='discount'`** → **`discount_percent`% off** a coin-package purchase (only `package_id` if set, else any package).
- `promocode_redemptions` — `id, promocode_id, user_id, coins_awarded, created_at`
- `transactions` — `id, user_id, type ('purchase'|'spend'|'admin_grant'), coin_change (+/-), amount, payment_provider, payment_status ('completed'|'pending'|'failed'), coin_package_id, book_id, note, created_at`
- `book_unlocks` — `id, user_id, book_id, method ('purchase'|'admin'), created_at`
- `payment_configs` — `id, country_code, provider ('jazzcash'|'easypaisa'|'manual'|...), display_name, description, account_details, qr_url`

**User activity**
- `profiles` — `id (=auth user id), full_name, username, customer_number, email, coin_balance, group_name, status ('active'|'blocked'), role, selected_category_id, created_at`
- `favourites` — `id, user_id, book_id`
- `listening_progress` — `id, user_id, book_id, position_seconds, is_completed, updated_at`

**Website content (fully admin-controlled)**
- `app_settings` — key/value jsonb. Keys: `home_hero`, `brand_name`, `logo_url`, `primary_color`, `accent_color`, `signup_free_coins`, `contact_email`, `socials`, and `featured_books` (an **array** of `{ id, book_id (nullable), title, image_url, sort_order, is_active }` — the admin CRUDs these; render the `is_active` ones, ordered by `sort_order`, in the website's **Featured Books** section using `image_url`, linking to `book_id` when set).
- `payment_configs` — `id, country, provider ('jazzcash'|'easypaisa'|'bank'|'stripe'), display_name, description, account_details, qr_code_url, is_active, sort_order`. The admin CRUDs these; on the coins/checkout page show the `is_active` rows for the user's provider with their **`qr_code_url`** image and `account_details`.
- `home_carousels` — `id, title, type, category_id, subcategory_id, language_code, collection_id, book_limit, requires_auth, sort_order, is_active`
- `carousel_books` — `carousel_id, book_id, sort_order` (only for `type='manual'`)
- `collections` — `id, title, status ('active'|'inactive'), description, image_url, country_include[], country_exclude[]`
- `collection_books` — `collection_id, book_id, sort_order`
- `notifications` — `id, user_id (null = broadcast), title, body, audience ('all'|'non_subscribed'|'specific'), show_in_popup, image_url, created_at`
- `content_pages` — `slug ('privacy'|'terms'), title, content (markdown)`
- `faqs` — `id, question, answer, sort_order, is_active`
- `feedback` — `id, user_id, message, rating, status` (website **writes** here)

**Storage buckets**: `book-covers` (public), `book-audio` (**private**), `category-icons`, `authors`, `collections`, `notification-images`, `home-hero`, `payment-qr`, `settings`.

## 4. Home page (fully data-driven)
1. **Hero** — read `app_settings` key `home_hero` (jsonb): `{ enabled, title, hero_title, hero_description, button_one_text, button_one_link, button_two_text, button_two_link, image_url }`. If `enabled` is false, hide the hero.
2. **Carousels** — read `home_carousels` where `is_active = true` order by `sort_order`. For each carousel, resolve its books by `type`:
   - `books_of_month` → `books.is_book_of_day = true`
   - `recently_added` → order by `created_at desc`
   - `most_popular` → order by `listen_count desc`
   - `recommended` → `books.is_recommended = true`
   - `top_selling` (if present) → `books.is_top_selling = true`
   - `category` → `subcategory_id in (subcategories of category_id)` (or filter by `category_id` if you denormalize)
   - `language` → `books.language_code = carousel.language_code`
   - `collection` → books in `collection_books` for `carousel.collection_id` (ordered)
   - `manual` → books in `carousel_books` for this carousel (ordered)
   - Always apply `is_published = true`, `.limit(carousel.book_limit)`, and if `requires_auth` show a sign-in gate when logged out.
3. Global brand (logo, name, colors, socials, contact) comes from `app_settings`.

## 5. Browse / Library / Search
- Categories nav → `categories` (is_active, sort_order) → drill into `subcategories`.
- Book list → `books` filtered by `subcategory_id` / `language_code` / `book_type`, `is_published=true`, server-side `.ilike` search on title, `.order`, `.range` pagination.
- Collections pages → `collections` (status='active') + `collection_books`; honor `country_include/country_exclude` against the visitor's country if you geolocate.

## 6. Book detail + player (the coin unlock model)
- Show book meta from `books` (+ joined `authors`, `publishers`, `subcategories`) and `metadata` jsonb fields (ISBN, edition, print length, audiobook length, etc.).
- List `chapters` ordered by `chapter_number`.
- **Access logic** for a chapter's audio:
  - `books.is_free = true` **or** `chapters.is_preview = true` → playable by anyone.
  - Otherwise require the user to have unlocked the book: a row in `book_unlocks` for `(user_id, book_id)`.
  - **Unlock action** (server route, user session): if `profiles.coin_balance >= books.coin_price`, then in one flow: decrement `coin_balance`, insert a `transactions` row `{ type:'spend', coin_change: -coin_price, book_id, payment_provider:'wallet', payment_status:'completed' }`, and insert `book_unlocks { user_id, book_id, method:'purchase' }`. (Prefer a Postgres RPC/function so it's atomic.)
- **Serving audio**: a server route validates unlock/preview/free, then returns `supabase.storage.from('book-audio').createSignedUrl(audio_path, 3600)`. Never expose `audio_path` directly.
- **Progress**: upsert `listening_progress { user_id, book_id, position_seconds, is_completed }` as the user listens; mark `is_completed=true` on finish. Optionally increment `books.listen_count` on first play (RPC).
- **Favourites**: toggle rows in `favourites { user_id, book_id }`.

## 7. Buy coins + promocodes
- Coins page → `coin_packages` where `is_active=true`, order by `price`. On successful payment insert a `transactions` row `{ type:'purchase', coin_package_id, amount, coin_change:+coin_amount, payment_provider, payment_status }` and add coins to `profiles.coin_balance`.
  - Card/stripe/apple/google → `payment_status:'completed'` immediately.
  - JazzCash / EasyPaisa / manual → insert `payment_status:'pending'` (the admin approves it in the panel, which credits the coins). Show the active `payment_configs` rows (`display_name`, `account_details`, `qr_code_url` image) for the user's provider so they can pay and submit proof/reference.
- **Redeem promocode** (server route): find `promocodes` by `code`, valid if `is_active`, within `starts_at..expires_at`, under `max_uses`, under `per_user_limit` for this user. Then branch on `reward_type`:
  - `'coins'` → add `coin_reward` to balance, insert `promocode_redemptions`, and a `transactions { type:'admin_grant', coin_change:+coin_reward, payment_provider:'promo', payment_status:'completed' }`.
  - `'discount'` → **don't add coins**; instead apply `discount_percent`% off the coin-package price at checkout (restrict to `package_id` when set). Record the redemption when the discounted purchase completes.

## 8. Auth, profile, notifications, CMS
- **Signup** → create `auth` user + `profiles` row; grant starting coins from `app_settings.signup_free_coins` (as an `admin_grant` transaction).
- **Profile** → show `profiles`, `coin_balance`, unlocked books (`book_unlocks`), favourites, listening history (`listening_progress`), transaction history (`transactions`).
- **Blocked users**: if `profiles.status='blocked'`, restrict access.
- **Notifications** → show `notifications` where `user_id is null` (broadcast) OR `user_id = me`; honor `audience` ('all' vs 'non_subscribed' [balance 0 / never purchased] vs 'specific'); if `show_in_popup=true` render as a popup once.
- **Feedback** → website form inserts into `feedback { user_id, message, rating, status:'new' }`.
- **FAQ page** → `faqs` where `is_active=true`, order by `sort_order`.
- **Privacy / Terms pages** → `content_pages` where `slug='privacy'` / `'terms'`, render the markdown `content`.

## 9. RLS checklist (verify in Supabase; add if missing)
- Public `select` on: `books (is_published), chapters, authors, publishers, categories (is_active), subcategories (is_active), coin_packages (is_active), collections (status='active'), collection_books, home_carousels (is_active), carousel_books, app_settings, content_pages, faqs (is_active), payment_configs`.
- Per-user `select/insert/update` (where `user_id = auth.uid()`) on: `profiles, favourites, listening_progress, transactions, book_unlocks, promocode_redemptions, feedback`.
- `notifications`: select where `user_id is null OR user_id = auth.uid()`.
- Private bucket `book-audio`: no public policy — access only via the server route's signed URL.
- Coin spending / promocode redemption / signup-bonus should be **RPC functions** (SECURITY DEFINER) so balances update atomically and can't be tampered with client-side.

## 10. Deliverable
- One typed data layer (e.g. `lib/queries/*` or repositories) mirroring these tables, used across the site.
- Home, browse, book detail+player, coins, profile, notifications, FAQ, privacy, terms all reading live data.
- Remove all mock/sample data. Confirm: toggling "Book of the Day"/"Recommended"/"Top Selling", editing the hero, adding a carousel/collection, or changing a coin package in the **admin panel** is reflected on the website after refresh.
```
```
