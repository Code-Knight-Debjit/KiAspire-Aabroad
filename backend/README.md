# KiAspire Aabroad Backend

Laravel backend boilerplate for API development.

## Included

- Laravel-style bootstrap and entry points
- API health and ping endpoints
- User model, factory, and seeder
- Basic PHPUnit feature test

## Setup

1. Run `composer install`
2. Copy `.env.example` to `.env` if needed
3. Generate an application key with `php artisan key:generate`
4. Run migrations with `php artisan migrate`
5. Start the server with `php artisan serve`

## API

- `GET /api/v1/health`
- `GET /api/v1/ping`