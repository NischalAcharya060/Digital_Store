# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev     # Next.js dev server
npm run build   # production build
npm run lint    # ESLint (flat config in eslint.config.mjs)
```

No test runner is configured.

Deploying Firestore security rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Stack

Next.js 16 App Router, React 19, Tailwind v4, TypeScript, Zod. Firebase Auth + Firestore (client SDK `firebase`, Admin SDK `firebase-admin`). No ORM, no SQL, no Prisma — storage is Firestore collections. Path alias `@/*` maps to `src/*`.

## Architecture

### Route groups and RBAC

`src/app/` is split into three route groups plus `api/`:

- `(shop)/` — public + authed shop pages (`products`, `cart`, `checkout`, `orders`).
- `(auth)/` — login flow.
- `(admin)/admin/` — admin-only. The group's `layout.tsx` calls `requireAdminUser()` from `@/lib/auth/server` and redirects on `UNAUTHORIZED`/`FORBIDDEN`. All mutating `/api/admin/*` routes must also guard server-side — never rely on the layout alone.

RBAC helpers (`src/lib/auth/server.ts`): `requireAuthUser` (throws `UNAUTHORIZED`), `getCurrentUserProfile` (returns null on failure), `requireAdminUser` (throws `UNAUTHORIZED` or `FORBIDDEN`). These throw sentinel-string errors — catch and map to redirects or `fail()` responses accordingly.

### Session model

Auth is Firebase client-side, but the server trusts only an HttpOnly session cookie:

1. Client signs in via Firebase Auth (`src/components/auth/auth-provider.tsx`), obtains an ID token, and `POST`s it to `/api/auth/session`.
2. The route verifies the ID token with `firebaseAdminAuth.verifyIdToken`, calls `ensureUserProfile` (bootstraps the `users/{uid}` doc with role `user`), then issues a session cookie via `createSessionCookie` (5-day expiry).
3. Server code reads the cookie via `getSessionCookieValue` and verifies with `verifySessionCookie(cookie, true)`.

Cookie name is `SESSION_COOKIE_NAME` from `src/lib/constants/app.ts`. Don't read Firebase ID tokens server-side for auth — always go through the session cookie path.

### Firestore layer

All collection names live in `COLLECTIONS` (`src/lib/constants/app.ts`) — `users`, `products`, `categories`, `orders`, `orderItems`, `inventory`, `transactions`. Service modules in `src/services/` are the only callers of `firebaseAdminDb`; routes/components should call services, not Firestore directly.

Two Firebase entry points, never mix them:

- `src/lib/firebase/admin.ts` — `"server-only"`, exports `firebaseAdminAuth`, `firebaseAdminDb`. Uses `FIREBASE_*` env vars.
- `src/lib/firebase/client.ts` — browser only, lazy-initialized, uses `NEXT_PUBLIC_FIREBASE_*`.

### Order / payment / inventory flow

This is the most delicate part of the system — see `src/services/order.service.ts`:

1. `createPendingOrder` — validates products exist/active, checks each product has enough unused inventory (`isUsed == false`), computes total, writes `order` (status `pending`), `orderItems`, and a pending `transaction` in a single batch. No inventory is allocated yet.
2. Client redirects to eSewa or Khalti with the order id.
3. On return, `/api/payments/esewa/verify` or `/api/payments/khalti/verify` calls `finalizePaidOrder`, which runs a Firestore **transaction** that: re-checks stock, allocates N unused inventory docs (marks `isUsed: true`, `usedByOrderId`), writes `deliveredCodes` onto each `orderItem`, flips order → `paid`, transaction → `success`. If the order is already `paid`, it is idempotent and returns the existing codes.
4. Failure path: `markOrderFailed` flips order and transaction to `failed` without touching inventory.

Invariants to preserve when editing:
- Digital codes must never leave the server before the order is `paid` — delivery endpoint must re-check status.
- Inventory allocation must stay inside `runTransaction` — don't refactor to batch writes.
- `finalizePaidOrder` must remain idempotent for `paid` orders (verify endpoints can be hit twice).

### API conventions

All `/api/*` routes use the helpers in `src/lib/utils/api.ts`:

- `ok(data)` → `{ ok: true, data }`
- `fail(code, message, status)` → `{ ok: false, error: { code, message } }`
- `parseJson(request)` returns `null` on invalid JSON — treat that as a 422.

Validate every request body with a Zod schema from `src/lib/validation/schemas.ts`; add new schemas there rather than inline.

### Types

`src/types/domain.ts` holds the Firestore document shapes. `OrderStatus` is `"pending" | "paid" | "failed"`, `PaymentMethod` is `"esewa" | "khalti"`. `ProductWithStock` is a view type — stock is computed by counting unused inventory docs, it is not stored on the product.

## Environment

Copy `.env.example` to `.env.local`. Two prefixes matter:

- `FIREBASE_*` — Admin SDK service account (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` with `\n` escapes).
- `NEXT_PUBLIC_FIREBASE_*` — client web config.

eSewa/Khalti sandbox vs. production is controlled by provider credentials/verify URLs — check the payment verify routes before changing hosts.

## Memory note

`claude-mem` may surface observations about an earlier Prisma/NextAuth/Postgres scaffold for this project. Ignore those — the repository is Firebase/Firestore-based, as described above. Verify against the code before trusting memory.
