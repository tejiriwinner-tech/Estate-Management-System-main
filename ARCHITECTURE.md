# Architecture

One repository, two applications.

```
backend/   Laravel 12 REST API (Sanctum auth, Spatie roles, MySQL)
frontend/  Next.js 16 app (React 19, Tailwind 4)
```

## Module map

| Module | Frontend | Backend | Branch |
|---|---|---|---|
| Core platform | `src/components/auth`, `src/services/authApi.ts`, `src/lib`, `src/types` | `app/Http/Controllers/Api/V1/Auth`, `app/Models/User.php`, `app/Observers`, `config/estate.php`, `database/seeders/RolesSeeder.php`, `bootstrap/app.php`, `routes/api.php` | `feature/core-platform` |
| Admin dashboard | `src/app/(admin)/admin`, `src/components/admin`, `src/lib/admin`, `src/types/admin` | `app/Http/Controllers/Api/V1/Admin`, `app/Models/{Reminder,EstateUpdate,StaffActivity}.php`, `routes/api/admin.php` | `feature/admin-dashboard` |
| Security dashboard | `src/app/(security)/security`, `src/components/security`, `src/lib/security` | (none yet) | `feature/security-dashboard` |
| Finance and payments | `src/app/(finance)/{finance,payments,outstanding,analytics,services,management,staffs}`, `src/components/{finance,payments,…}`, `src/data` | `app/Http/Controllers/Api/*` (finance), `routes/api/finance.php`, finance migration | `feature/finance-dashboard` |
| Store module | `src/app/(store)/store-app`, `src/app/api/store` | `StoreDashboardController`, `Merchant`, `Transaction`, `routes/api/store.php` | `feature/store-module` |
| Agent dashboard and listings | `src/app/(finance)/{agents,agent-portal}`, `src/app/(public)`, `src/app/(admin)/admin/listings`, `src/components/{agents,agent-portal}`, `src/services/listingsApi.ts` | `Api/V1/{Agent,Public}`, `Admin/ListingApprovalController`, `Listing` model, `routes/api/agents.php` | `feature/agent-dashboard` |
| Resident dashboard | not built yet | not built yet | `feature/resident-dashboard` |

## Rules that keep modules independent

- **Route groups.** Each module has its own Next.js route group and root layout, so a module's CSS and shell cannot leak.
- **Module route files.** `routes/api.php` only wires auth and `require`s each module's file in `routes/api/`.
- **Shared code is centralised.** Authentication, the `users` table and roles, the API client, config and seeders are owned by core. Modules call them; they do not copy them.
- **Namespaced folders.** `components/<module>`, `lib/<module>`, `types/<module>`. Do not import from another module's folder; move shared pieces to core first.
- **Roles.** `super_admin, admin, manager, security, resident, staff, agent, maintenance, store_owner`. API groups are guarded by Spatie `role:` middleware when `ESTATE_ENFORCE_AUTH=true`.

## Modularisation plan (not yet applied)

The merged code is already separated by route group and folder. Remaining steps, each done as its own PR and tested before the next:
1. Extract a shared `AppShell` / header / sidebar into core (KAN-16) and migrate modules to it one at a time.
2. Move the duplicated `cn()` utility and shared UI atoms into `src/components/ui` and `src/lib`.
3. Replace sample data with API calls module by module.
4. Move the finance pages that are really admin pages (`/staffs`, `/management`) under the owning module.
