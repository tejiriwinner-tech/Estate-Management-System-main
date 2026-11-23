# Branching strategy

```
main ─────────────●──────────────●────────  approved, stable, deployable. Owner merges only.
                   \            /
develop ────●───●───●───●───●───●────────  integration. Feature PRs land here first.
             \   \       /
feature/…     ●───●──●──●                  one long-lived branch per module
```

## Branches

| Branch | Purpose | Who can push | How it changes |
|---|---|---|---|
| `main` | Approved production code | Nobody directly | Pull request from `develop`, approved and merged by the owner |
| `develop` | Integration and testing | Nobody directly (recommended) | Pull requests from `feature/*`, reviewed by the owner or module lead |
| `feature/<module>` | One module each (see MODULE_OWNERS.md) | The assigned contributor | Commits by the module owner |
| `fix/<module>-<short-desc>` | Bug fix on a module | Author | Short-lived, from the feature branch or `develop` |
| `hotfix/<short-desc>` | Urgent production fix | Owner | From `main`, PR into `main`, then back-merged into `develop` |

## Module branches

`feature/core-platform`, `feature/admin-dashboard`, `feature/security-dashboard`, `feature/finance-dashboard`,
`feature/store-module`, `feature/agent-dashboard`, `feature/resident-dashboard`.

## Rules

1. Nobody commits to `main`. Not contributors, not automation, not the owner by habit: use a PR.
2. Contributors work only on their assigned `feature/*` branch (or a `fix/*` branch off it).
3. Open a PR from `feature/*` into `develop`. Only the owner opens and approves `develop` → `main`.
4. Never force-push a shared branch. Resolve divergence by merging `develop` into your branch.
5. Do not delete branches without the owner's permission.
6. Commit messages: `type(scope): summary`, e.g. `feat(store): add product listing filter`, with the Jira key in the body (`KAN-55`).
7. No secrets, `.env` files, database dumps or production data in commits.
8. Keep PRs small and limited to your module. Changes to shared code (`core-platform`) need the owner's review.
