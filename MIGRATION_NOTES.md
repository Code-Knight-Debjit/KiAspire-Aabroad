# Node → Laravel migration notes

## Bugs found in the Node backend and how they were handled

| # | Bug | Fix in Laravel version |
|---|-----|-------------------------|
| 1 | `index.js` had unresolved Git merge-conflict markers (`<<<<<<<`/`=======`/`>>>>>>>`) — invalid JS, wouldn't run | N/A — `routes/api.php` is written clean, with all four route groups (user, admin, services, story) present |
| 2 | `package-lock.json` was entirely full of unresolved conflict markers | N/A — delete it and run a fresh `composer install` |
| 3 | `storyController.createStory` read `youtubeVideoId` from the request but `storyModel` required `youtubeUrl` — every story creation failed validation | `StoryController::store` and the `stories` migration both use one consistent field, `youtube_url` |
| 4 | `userModel.password` was missing `select: false`, so `GET /api/admin/profile` leaked the bcrypt hash | `User::$hidden` includes `password` and `remember_token`, so they're stripped from all JSON responses, including `$request->user()` |
| 5 | `generateToken(admin._id)` never passed the `role` param the function accepted (dead code, no functional bug since middleware re-checked the DB) | Not applicable — Sanctum tokens don't carry a role claim; authorization is always re-checked against the DB via `EnsureUserIsAdmin` |

## Design decisions / assumptions (flag if any of these are wrong)

- **Regular user "registration" has no password and no login** — in the Node code, `POST /api/user/register` never sets a password and there's no `/api/user/login` route. I read this as a lead-capture form for a study-abroad counselling service, not a real user account system, and preserved that: `password` is nullable, and there's still no user login endpoint. Only `role = admin` accounts authenticate.
- **Auth mechanism**: the Node app hand-rolled JWTs (`jsonwebtoken`). For Laravel I used **Sanctum** personal access tokens instead of a custom JWT — it's the standard idiomatic choice for a stateless API, avoids a third-party JWT dependency, and the resulting bearer-token workflow is functionally identical from a client's perspective (`Authorization: Bearer <token>`).
- **Indian phone validation**: `validator.js`'s `isMobilePhone(phone, 'en-IN')` was replaced with the regex `^(?:\+91|91|0)?[6-9]\d{9}$` — a close equivalent (10 digits starting 6–9, optional `+91`/`91`/`0` prefix).
- **Invalid-ID handling**: the Node admin controller distinguished a malformed Mongo ObjectId (400 "Invalid user ID") from a not-found user (404). Laravel's numeric IDs don't really have an equivalent "cast error" case, so both collapse to a plain 404 "User not found" — a minor, deliberate simplification.

## Endpoint mapping

| Node route | Laravel route |
|---|---|
| `POST /api/user/register` | `POST /api/user/register` |
| `POST /api/admin/login` | `POST /api/admin/login` |
| `GET /api/admin/profile` | `GET /api/admin/profile` (auth:sanctum + admin.only) |
| `GET /api/admin/users` | `GET /api/admin/users` |
| `GET /api/admin/users/:id` | `GET /api/admin/users/{id}` |
| `PATCH /api/admin/users/:id/status` | `PATCH /api/admin/users/{id}/status` |
| `DELETE /api/admin/users/:id` | `DELETE /api/admin/users/{id}` |
| `GET /api/services` | `GET /api/services` |
| `GET /api/services/admin/all` | `GET /api/services/admin/all` |
| `POST /api/services` | `POST /api/services` |
| `PATCH /api/services/:id` | `PATCH /api/services/{id}` |
| `DELETE /api/services/:id` | `DELETE /api/services/{id}` |
| `GET /api/story`, `GET /api/story/:id` | `GET /api/story`, `GET /api/story/{id}` |
| `POST /api/story`, `PATCH /api/story/:id`, `DELETE /api/story/:id` | same, admin-protected |

## What you already had that's unchanged

`artisan`, `public/index.php`, `resources/views/welcome.blade.php`, `routes/web.php`, `routes/console.php`, `config/app.php`, `bootstrap/providers.php`, `app/Providers/AppServiceProvider.php`, `app/Http/Controllers/Controller.php`, `app/Http/Controllers/Api/HealthController.php`, `tests/`, `phpunit.xml`, `.gitignore`, `README.md` — none of these needed changes and aren't included in this drop; keep your existing copies.

## Setup steps

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Sanctum needs its own migration published:
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

php artisan migrate
php artisan db:seed   # creates the default admin from ADMIN_* env vars
php artisan serve
```

Admin login then returns a bearer token:

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"change-me"}'
```

Use it as `Authorization: Bearer <token>` on the protected routes.
