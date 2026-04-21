# 🏗️ System Architecture

## 🧩 Tech Stack
- Frontend: Next.js
- Backend: Next.js API Routes
- Auth: Firebase Auth
- Database: Firestore
- Hosting: Vercel + Firebase

## 📂 Structure

/app
/components
/lib (firebase, utils)
/services (business logic)
/hooks
/types

## 🔄 Flow

User → Frontend → API Route → Firebase → Response

## 🔐 Security
- Firebase rules
- Auth-based access
- Admin role protection

## ⚡ Data Flow Example

1. User clicks "Buy"
2. API creates order
3. Payment initiated
4. Payment verified
5. Inventory updated
6. Code delivered