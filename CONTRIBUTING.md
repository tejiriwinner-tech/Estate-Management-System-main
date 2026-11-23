# Contributing

Read BRANCHING_STRATEGY.md and MODULE_OWNERS.md first. You work on **one module branch** and submit pull requests. You cannot merge into `main`.

## 1. Clone

```bash
git clone https://github.com/Lincoln-ResearchAndDevelopment/Estate-Management-System.git
cd Estate-Management-System
```

## 2. Switch to your assigned branch

```bash
git fetch origin
git switch feature/<your-module>          # e.g. feature/store-module
```

## 3. Keep it up to date (do this every day, before you start)

```bash
git fetch origin
git merge origin/develop                   # bring in teammates' approved work
```

## 4. Run the project

```bash
# backend
cd backend && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate --seed && php artisan serve
# frontend (new terminal)
cd frontend && npm install && cp .env.local.example .env.local && npm run dev
```

Never commit `.env` or `.env.local`.

## 5. Commit

```bash
git status
git add <files you changed>                # not `git add .` blindly
git commit -m "feat(store): add product listing filter" -m "KAN-55"
```

## 6. Test before you push

Frontend: `npm run lint && npm run build`. Backend: `php artisan test`. Click through your screens. Fix failures before opening a PR.

## 7. Push

```bash
git push origin feature/<your-module>
```

## 8. Open a pull request

Base: `develop`. Compare: your feature branch. Fill in the template. Link the Jira task. Wait for review; do not merge it yourself.

## 9. Resolve conflicts safely

```bash
git fetch origin
git merge origin/develop                   # conflicts appear here, on your branch only
# open each conflicted file, keep both sides' intent, remove the <<<<<<< markers
git add <resolved files>
git commit
npm run build                              # re-test
git push origin feature/<your-module>
```

Do not use `git push --force`, `git reset --hard origin/...` on a branch with unpushed work, or `git rebase` on a shared branch. If unsure, stop and ask the owner. To back out a merge in progress: `git merge --abort`.

## Where to put code

Stay inside your module's folders (see ARCHITECTURE.md). Shared code (auth, layout, API client, migrations for shared tables) belongs to `feature/core-platform`: ask before changing it.
