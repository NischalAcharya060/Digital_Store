# Digital Store

Production-oriented digital ecommerce platform for gift cards, gaming credits, and subscriptions.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Firebase Auth + Firestore
- TypeScript + Zod validation

## Implemented Core Features

- Authentication
	- Email/password and Google login via Firebase Auth
	- HttpOnly server session cookie creation and logout endpoints
	- User profile bootstrap with role support (`user`/`admin`)
- Product System
	- Public product listing and detail views
	- Category-aware product cards
	- Real-time stock display from inventory documents
- Cart and Checkout
	- Client cart state with persistent storage
	- Quantity management and summary pricing
	- Checkout order creation with payload validation
- Payments
	- eSewa verification route
	- Khalti verification route
	- Provider response handling and order status transition logic
- Order and Delivery
	- User order history and order detail views
	- Secure instant delivery code retrieval after successful payment
	- Idempotent payment finalization path for repeated verify calls
- Inventory Management
	- Admin inventory upload endpoint with deduplication
	- Atomic inventory allocation in transaction during payment finalization
	- Used codes marked and linked to order (`usedByOrderId`)
	- Out-of-stock prevention at checkout and verify stages
- Admin Panel
	- Product create/manage screen
	- Inventory upload screen
	- Order status management screen
	- Route-level and API-level RBAC checks

## Project Structure

```
src/
	app/
		(shop)/
		(auth)/
		(admin)/
		api/
	components/
		admin/
		auth/
		cart/
		layout/
		products/
		ui/
	hooks/
	lib/
		auth/
		constants/
		firebase/
		utils/
		validation/
	services/
	types/
```

## Firestore Collections

- `users`
- `products`
- `categories`
- `orders`
- `orderItems`
- `inventory`
- `transactions`

The schema follows the project documentation and is enforced through typed services.

## Important Security Behavior

- Server-side RBAC is enforced in both page layouts and API routes.
- Session cookie is HttpOnly and generated through Firebase Admin.
- Inventory allocation and delivery assignment happen only after successful payment verification.
- Digital codes are never returned before `paid` status.

## Environment Setup

Copy `.env.example` to `.env.local` and fill all required values.

For signup protection, configure Google reCAPTCHA v2 (challenge) keys:

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

## Firestore Security and Indexes

- Security rules: `firestore.rules`
- Composite indexes: `firestore.indexes.json`

Deploy with Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Development

```bash
npm install
npm run dev
```

Lint:

```bash
npm run lint
```

## API Surface (Implemented)

- `POST /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/products`
- `GET /api/products/:productId`
- `POST /api/checkout/create-order`
- `GET /api/orders`
- `GET /api/orders/:orderId`
- `GET /api/orders/:orderId/delivery`
- `POST /api/payments/esewa/verify`
- `POST /api/payments/khalti/verify`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:orderId/status`
- `POST /api/admin/inventory/upload`

## Deployment Notes

- Deploy Next.js to Vercel.
- Configure Firebase service account values in deployment environment.
- Ensure payment provider credentials and verify URLs are set per environment (sandbox/production).
