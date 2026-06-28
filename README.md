# 🎂 Iku Sweet Cake

A production-ready ecommerce web application for ordering custom cakes online, built with Next.js 15, Supabase, and TypeScript.

---

## ✨ Features

### Customer-Facing
- 🏠 **Homepage** — Hero banners, featured products, categories, about preview, contact info
- 🎂 **Products** — Grid with search, category filtering, and pagination
- 🔍 **Product Detail** — Image gallery (up to 10), variant selection, cake message, add to cart
- 🛒 **Cart** — Add, remove, update quantity, persistent across sessions
- 💳 **Checkout** — Guest checkout, delivery info, payment method selection
- 📦 **Order Tracking** — Track any order with order number + phone
- 👤 **Auth** — Register, login (account optional for ordering)

### Admin Panel
- 📊 **Dashboard** — Order stats (total, pending, delivered, active products)
- 📋 **Orders** — List, search, filter by status, update status, cancel with reason
- 📦 **Products** — Full CRUD with image upload (up to 10), variants, categories
- 🏷️ **Categories** — Manage with images and sort order
- 🖼️ **Banners** — Homepage hero banner management
- ⚙️ **Settings** — Business info, about section, SEO, payment toggles, Telegram notifications

### Technical
- 📱 **Mobile-first** responsive design
- ⚡ **Server Components** by default, Client Components only where needed
- 🔒 **Row Level Security** on all Supabase tables
- 📬 **Telegram notifications** for new orders
- 🗺️ **Sitemap & robots.txt** for SEO

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Notifications | Telegram Bot API |
| Deployment | Vercel |
| Validation | Zod + React Hook Form |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://ikusweetcake.com
```

Find your keys at: **Supabase Dashboard → Project Settings → API**

> ⚠️ **Never commit `.env.local` to git.** The service role key has full database access.

### 3. Set Up Supabase Database

In your Supabase project, go to **SQL Editor** and run the migrations in order:

```sql
-- Run these files one by one in Supabase SQL Editor:
```

1. `supabase/migrations/001_schema.sql` — Creates all tables, indexes, triggers
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_storage.sql` — Storage buckets and policies

### 4. Create Admin User

After running migrations, create your admin account:

1. Go to your app's `/register` page and create an account
2. In Supabase Dashboard → Table Editor → `profiles` table
3. Find your user and change `role` from `customer` to `admin`

Or run this SQL (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages (home, products, cart, etc.)
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes (file upload)
│   ├── layout.tsx          # Root layout with fonts & providers
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Search engine directives
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Header, Footer, AdminSidebar
│   ├── products/           # Product card, gallery, add-to-cart
│   ├── cart/               # Cart item, cart summary
│   ├── checkout/           # Checkout form
│   ├── orders/             # Status badge, timeline
│   ├── admin/              # Admin-specific forms
│   └── shared/             # EmptyState, ErrorState, Pagination
├── actions/                # Next.js Server Actions
│   ├── auth.ts
│   ├── products.ts
│   ├── categories.ts
│   ├── orders.ts
│   ├── cart.ts
│   ├── banners.ts
│   └── settings.ts
├── contexts/
│   └── CartContext.tsx     # Client-side cart state
├── lib/
│   ├── supabase/           # Supabase clients (browser, server, admin)
│   ├── validations/        # Zod schemas
│   ├── telegram.ts         # Telegram notification service
│   └── utils.ts            # Shared utilities
└── types/
    └── index.ts            # All TypeScript types
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with role (customer/admin) |
| `categories` | Product categories |
| `products` | Cake products with status, availability |
| `product_images` | Up to 10 images per product |
| `product_variants` | Size/weight variants with prices |
| `carts` | Guest and user carts by session |
| `cart_items` | Items in each cart |
| `orders` | Orders with IKU-XXXX numbering |
| `order_items` | Snapshot of ordered items |
| `banners` | Homepage hero banners |
| `settings` | Key-value store for all site settings |

---

## 📬 Telegram Notifications Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the **Bot Token**
4. Start a conversation with your bot (or add it to a group)
5. Use [@userinfobot](https://t.me/userinfobot) to get your **Chat ID**
6. In Admin → Settings → Notifications, paste the token and chat ID

You'll receive notifications like:
```
🎂 New Order Received!

📋 Order: IKU-1001
👤 Customer: Meron Tadesse
📞 Phone: +251 912 345 678
📍 Address: Bole, Addis Ababa
💳 Payment: Telebirr

🛒 Items:
  • Chocolate Cake (2 KG) × 1 = ETB 850.00
    💌 Message: "Happy Birthday Meron!"

💰 Total: ETB 850.00
```

---

## 🌐 Deploying to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel deploy
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Project Settings
4. Deploy

### Environment Variables on Vercel

Add these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g. `https://ikusweetcake.com`) |

---

## 🔒 Security Notes

- **Service role key** is only used server-side in Server Actions and API routes
- **RLS policies** protect all database tables — users can only access their own data
- **Admin routes** are protected by both middleware and server-side role checks
- **Input validation** with Zod on all forms and server actions
- **File upload** only allowed to authenticated admin users via signed API route

---

## 📱 Order Number Format

Orders are numbered sequentially starting from **IKU-1001**:

```
IKU-1001, IKU-1002, IKU-1003, ...
```

This is handled by a PostgreSQL sequence that auto-increments with each new order.

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | Rosewood `#C47B6E` | Buttons, links, highlights |
| Background | Ivory `#FFF8F0` | Page background |
| Foreground | Chocolate `#4A2C2A` | Text |
| Accent | Caramel `#E8C99B` | Featured badges |
| Card | Blush `#FBF3EA` | Card backgrounds |

**Fonts:**
- Display: Cormorant Garamond (headings)
- Body: DM Sans (all other text)
- Mono: DM Mono (order numbers, prices)

---

## 📄 License

Private — All rights reserved. Iku Sweet Cake © 2025
