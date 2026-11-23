# Estate Management System (Army Estate Phase One)

One repo, two apps:

| Folder | Stack | Run |
|---|---|---|
| `backend/`  | Laravel 12, Sanctum, Spatie permissions, MySQL | `composer install && cp .env.example .env && php artisan key:generate && php artisan migrate --seed && php artisan serve` |
| `frontend/` | Next.js 16, React 19, Tailwind 4 | `npm install && cp .env.local.example .env.local && npm run dev` |

**Status: assembled, not yet built or run.** The workspace that merged this had no access to npm or Packagist, so
`npm run build` and `composer install` have never been run on it. PHP files pass `php -l`; every `@/…` and relative
import in the front end was checked to resolve to a real file. Expect a first round of build fixes (see MERGE_NOTES.md).

## Where each module lives

| Module | Front-end URL | Front-end code | API |
|---|---|---|---|
| Public landing page (approved listings) | `/`, `/listings/:id` | `app/(public)` | `/api/v1/public/listings` |
| Sign in / set password | `/login`, `/set-password` | `app/(finance)/login`, `app/(public)/set-password` | `/api/v1/auth/*` |
| Finance, payments, management, agents directory, agent portal | `/finance`, `/payments`, `/management`, `/agents`, `/agent-portal` … | `app/(finance)` | `routes/api/finance.php` |
| Admin app | `/admin/*` | `app/(admin)/admin` | `routes/api/admin.php` |
| Listing approval queue (admin) | `/admin/listings` | `app/(admin)/admin/listings` | `/api/v1/admin/listings` |
| Security app | `/security/*` | `app/(security)/security` | none yet |
| Store module | `/store-app/*` | `app/(store)/store-app` | `routes/api/store.php` |

Each module keeps its own root layout through a Next.js route group, so its CSS and shell do not leak into the others.

## Roles

`super_admin, admin, manager, security, resident, staff, agent, maintenance, store_owner`.
The admin app writes `users.role`; an observer mirrors it into Spatie roles. Admin creates every account except residents
(residents come from the Google Form import). Set `ESTATE_ENFORCE_AUTH=true` to require login and role on the finance,
admin and store API groups (off by default because the existing screens do not send the token yet).

## Agent listings flow

Agent submits a listing (`/agent-portal`) → status `pending` → admin approves in `/admin/listings` → it appears on `/`.
Editing a listing sends it back to `pending`. Marking rented or sold does not.
