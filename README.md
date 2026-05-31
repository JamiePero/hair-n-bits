# Hair 'N' Bits 💫

> *Your beauty, beautifully stocked.*

Full-stack luxury e-commerce app for wigs, hair mesh, beads, dresses, shoes & jewelry.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js + Express (Railway) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Email + Google) |
| Storage | Firebase Storage |
| Payments | Paystack (GHS) |

---

## Quick Start

### 1. Firebase Setup
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore**, **Authentication** (Email/Password + Google), and **Storage**
3. Copy your config keys

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# Fill in .env with your Firebase keys
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Fill in PAYSTACK_SECRET_KEY and FIREBASE_SERVICE_ACCOUNT
npm install
npm run dev
```

### 4. Seed Firestore
```bash
# Place your Firebase service account JSON as hair-n-bits/serviceAccount.json
node seed.js
```

### 5. Deploy Backend to Railway
```bash
# Push backend/ folder to a GitHub repo
# Connect to Railway → set env vars → deploy
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RAILWAY_BACKEND_URL=https://your-app.railway.app
VITE_ADMIN_EMAIL=admin@hairnbits.com
```

### Backend (Railway env vars)
```
PAYSTACK_SECRET_KEY=sk_live_...
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FRONTEND_URL=https://your-frontend.vercel.app
PORT=3000
```

---

## Pages

| Route | Page |
|-------|------|
| `/` | Homepage (Hero, Categories, Featured Products) |
| `/shop` | Product listing with filters & sorting |
| `/product/:id` | Product detail + related products |
| `/checkout` | Order form + Paystack payment |
| `/order-success/:orderId` | Confirmation + order summary |
| `/admin` | Protected admin panel |
| `*` | 404 Not Found |

---

## Admin Panel (`/admin`)
- Login with the email set in `VITE_ADMIN_EMAIL`
- **Dashboard** — total orders, revenue, pending orders
- **Products** — add, edit, delete products; upload images to Firebase Storage
- **Orders** — view all orders, update status (pending → paid → shipped → delivered)

---

## Design System

| Token | Value |
|-------|-------|
| `--color-black` | `#000000` |
| `--color-red-dark` | `#490101` |
| `--color-red-mid` | `#7D0909` |
| `--color-red-primary` | `#B40808` |
| `--color-red-bright` | `#E62525` |
| `--color-grey` | `#595757` |
| `--color-gold-deep` | `#C89116` |
| `--color-gold-light` | `#F4CD59` |

Fonts: **Playfair Display** (headings) + **DM Sans** (body)
