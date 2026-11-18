# Seed data

Seed records live in JSON files in this directory and are loaded by
`app/database/seed.py`.

## Current datasets

| File | Seeder | Purpose |
| --- | --- | --- |
| `users.json` | `seed_users` | Demo accounts for every platform role |
| `businesses.json` | `seed_businesses` | Approved businesses owned by seeded merchants |
| `products.json` | `seed_products` | Available products for seeded businesses |

Run all seeders in dependency order:

```bash
cd backend
uv run python -m app.database.seed
```

Dependency order is `users → businesses → products`. Business records resolve
their owner by `owner_email`; product records resolve their business by
`business_slug`.

Each business must include a `country_code`, `country_name` and `city` so it
appears in the relevant delivery area. Ratings, delivery fees and delivery
times are also part of the business seed.

## Adding a future dataset

When a new module lands (addresses, orders, deliveries, reviews, and so on):

1. Add a JSON file here, for example `orders.json`.
2. Add a validated loader and an idempotent seeder in
   `app/database/seed.py`.
3. Register the seeder in `seed_all()` so one command seeds every dataset in
   a predictable order.

Recommended order: users → businesses → catalog/inventory →
customers/addresses → orders → deliveries → reviews.

## Rules

- Seed files are committed to the repository; local databases are not.
- Seeders must be idempotent. Check a natural key (email, slug, or a composite
  such as business + product name) before inserting.
- Keep demo records small and focused on workflows the platform supports.
- Passwords in `users.json` are local demo credentials only. They are hashed
  with Argon2id before being stored, and must never be real user passwords.
- Prices are integer minor units, for example `1250` means €12.50.
- Do not include real personal data, secrets, payment information or API keys.
- Use stable slugs for businesses because public URLs depend on them.
