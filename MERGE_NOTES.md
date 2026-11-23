# Merge notes

Sources: `main` (identical to `joseph-agent`), `feat-admin-management`, `feature-akerele-security-dashboard`, `feature-store-app`.

## 1. Conflicts found and how each was resolved

| Conflict | Resolution |
|---|---|
| Four different root layouts and global CSS | One Next.js app with route groups `(finance)`, `(admin)`, `(security)`, `(store)`, `(public)`; each keeps its own layout and `globals.css`. |
| Next 14 / 15 / 16, React 18 / 19, Tailwind 3 / 4 | Unified on Next 16.4.6, React 19.3, Tailwind 4. Finance and admin keep their Tailwind 3 configs (`tailwind.finance.config.ts`, `tailwind.admin.config.ts`) loaded with `@config`; the v3 default border colour is restored in their CSS. |
| Routes `/staffs`, `/finance`, `/store`, `/messages`, `/reports`, `/dashboard`, `/checkout` used by more than one module | Admin moved under `/admin/*`, store under `/store-app/*`, security already `/security/*`. All links and redirects inside those modules were prefixed (string literals only). |
| Same component and util names (`components/layout/Sidebar`, `lib/utils`, `components/dashboard/…`) | Admin → `components/admin`, `lib/admin`, `types/admin`; security → `components/security`, `lib/security`. Imports rewritten to match. No file contents changed apart from import paths. |
| Store API routes `/api/dashboard`, `/api/payments/*` | Moved to `/api/store/*`; the store's fetch calls and its relative import of `lib/checkout` were updated. |
| Three Laravel skeletons (11, 12, 13) | Security's Laravel 12 skeleton used as base (already has Sanctum and Spatie). Admin, finance and store code copied in; no controller logic changed. |
| `users` table created by both admin and default migrations | Default kept; admin's columns moved, unchanged, into `2024_01_01_000004_add_estate_columns_to_users_table.php`. |
| Two `StaffController`s | They live in different namespaces (`Api` and `Api\V1\Admin`) and different URLs (`/v1/staffs`, `/v1/admin/staff`); kept as written. Each module's routes stay in their own file under `routes/api/`. |
| Dependencies | `package.json` is the union of what the code actually imports (next, react, recharts, lucide-react, clsx, tailwind-merge). Security's react-query, axios, zustand, next-auth, zod and react-hook-form were dropped because nothing imports them. AI-tool files in the store zip (`.claude`, `.kiro`, `.mcp.json`, `AGENTS.md`, `CLAUDE.md`) were left out. |

## 2. Naming

Only namespacing was changed (folders and import paths, route prefixes). File names inside modules were left as their
authors wrote them: finance/admin/security use PascalCase components, the store uses kebab-case files in `app/components`.
Say if you want those renamed too.

## 3. Added to match the system design

- Login by email against the API, with set-password and forgot-password endpoints and page (KAN-14/15). Role selector gained "Store Owner". Landing per role: Admin `/admin`, Agent `/agent-portal`, Security `/security/dashboard`, Store Owner `/store-app`, User `/finance`.
- Role gate on `/admin` and `/security` layouts (client side) and Spatie `role:` middleware on API groups (enforced when `ESTATE_ENFORCE_AUTH=true`).
- Roles seeder; `users.role` mirrored into Spatie roles.
- Agent listings: rent / sale / other, admin approval queue, public landing page with search and filters, listing detail with inquiry form. Agent portal's "Add listing" now says it goes for approval and shows an "Awaiting approval" badge. The old `/` redirect to `/login` was removed; `/` is now the landing page.

## 4. Not done (needs a decision or more work)

1. **Resident app (KAN-30 to 36)**: no code for it was in the zips and I did not invent it. Residents who sign in land on `/finance`.
2. **Chat rooms, private messaging, meetings/alerts overlays, notifications (KAN-18 to 21)**: admin and store each have a messages page with sample data; there is no shared chat, no `/security/messages` page and no notification badges.
3. **Splash screens (KAN-15)** and a **single shared layout (KAN-16)**: four separate shells remain. Unifying them changes the look of finished work, so I left it for you to decide.
4. **Security app has no API**: its pages use sample data; the backend zip held only a bare skeleton.
5. **Most finance, admin and security screens still read sample data**; only login, listings and approvals call the API.
6. Agent accounts: the admin Users page can create role `agent`; the separate agents directory (`/agents`, "Add agent") still uses sample data.
7. Store module: `StoreDashboardController` and `Merchant` stand alone, not tied to `users` or the `store_owner` role.

## 5. Risks to know before first run

- **Admin controllers create every account with the same password `LincolnEstate2024!`** (and staff reset sets a temporary one). That conflicts with the set-password-link design. Replace with a random password plus a set-password email.
- **Existing API routes are open unless `ESTATE_ENFORCE_AUTH=true`.** Turn it on once the front end sends `Authorization: Bearer <token>` (the token is stored in the session by the new login).
- `lucide-react` was set to ^1.73 (what the security module used); the finance and admin code was written against 0.475, so a few icon names may need changing at first build.
- Next 16 options from the security/store `next.config.ts` (`cacheComponents`, the turbopack CSS rule) were not carried over; `@tailwindcss/postcss` is used instead.
- Money is stored in kobo in the new `listings` table; the finance tables from `main` were left as written.
