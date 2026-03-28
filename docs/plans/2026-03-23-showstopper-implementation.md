# Showstopper Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the wedding website into an interactive guest experience with countdown timer, song voting, photo gallery, admin dashboard with analytics, and visual polish.

**Architecture:** Next.js App Router with MySQL backend. New features add API routes under `/api/`, new pages under `/app/`, and shared components under `/components/`. Admin routes are protected by NextAuth.js middleware. Chart.js powers dashboard visualizations. Framer Motion handles page transitions.

**Tech Stack:** Next.js 16.1.6, React 19, MySQL (mysql2), NextAuth.js, Chart.js + react-chartjs-2, Framer Motion, Tailwind CSS

---

## Sprint 1: Visual Polish & Countdown (Week 1)

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install all new packages**

Run:
```bash
npm install framer-motion chart.js react-chartjs-2 next-auth
```

**Step 2: Verify install succeeded**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add framer-motion, chart.js, react-chartjs-2, next-auth dependencies"
```

---

### Task 2: Countdown Timer Component

**Files:**
- Create: `src/components/CountdownTimer.js`
- Modify: `src/app/page.js` (add component below hero image)

**Step 1: Create the CountdownTimer component**

Create `src/components/CountdownTimer.js`:

```javascript
"use client";

import { useState, useEffect } from "react";

const WEDDING_DATE = new Date("2027-05-22T16:00:00-04:00"); // 4 PM EDT

function getTimeLeft() {
  const now = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipCard({ value, label }) {
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setPrev(value);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, prev]);

  const display = String(value).padStart(2, "0");
  const prevDisplay = String(prev).padStart(2, "0");

  return (
    <div className="flex flex-col items-center mx-2 md:mx-4">
      <div className="relative w-16 h-20 md:w-24 md:h-28 perspective-500">
        {/* Static bottom half */}
        <div className="absolute inset-0 bg-sky-900 rounded-lg flex items-center justify-center overflow-hidden border border-sky-700">
          <span className="font-[family-name:var(--font-cormorant)] text-3xl md:text-5xl font-light text-amber-200">
            {display}
          </span>
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-sky-700/50"></div>
        </div>

        {/* Flip animation overlay */}
        {flipping && (
          <div
            className="absolute inset-0 bg-sky-800 rounded-lg flex items-center justify-center overflow-hidden border border-sky-700 animate-flip origin-bottom"
            style={{
              animation: "flipDown 0.3s ease-in forwards",
            }}
          >
            <span className="font-[family-name:var(--font-cormorant)] text-3xl md:text-5xl font-light text-amber-200">
              {prevDisplay}
            </span>
          </div>
        )}
      </div>
      <span className="font-[family-name:var(--font-cormorant)] text-xs md:text-sm tracking-[0.2em] uppercase text-sky-800 mt-3">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <>
      <style jsx global>{`
        @keyframes flipDown {
          0% { transform: rotateX(0deg); opacity: 1; }
          100% { transform: rotateX(-90deg); opacity: 0; }
        }
      `}</style>
      <div className="flex justify-center items-center py-8">
        <FlipCard value={timeLeft.days} label="Days" />
        <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-4xl text-sky-800 self-start mt-4 md:mt-6">:</span>
        <FlipCard value={timeLeft.hours} label="Hours" />
        <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-4xl text-sky-800 self-start mt-4 md:mt-6">:</span>
        <FlipCard value={timeLeft.minutes} label="Minutes" />
        <span className="font-[family-name:var(--font-cormorant)] text-2xl md:text-4xl text-sky-800 self-start mt-4 md:mt-6">:</span>
        <FlipCard value={timeLeft.seconds} label="Seconds" />
      </div>
    </>
  );
}
```

**Step 2: Add CountdownTimer to landing page below hero image**

In `src/app/page.js`, add import at top:
```javascript
import CountdownTimer from "@/components/CountdownTimer";
```

Then insert `<CountdownTimer />` after the hero image `</div>` (after line 22) and before the Venue section.

**Step 3: Verify in browser**

Run: `npm run dev`
Navigate to http://localhost:3000 — confirm countdown displays below photo with flip animation on each second tick.

**Step 4: Commit**

```bash
git add src/components/CountdownTimer.js src/app/page.js
git commit -m "Add flip-clock countdown timer to landing page"
```

---

### Task 3: Page Transition Wrapper

**Files:**
- Create: `src/components/PageTransition.js`
- Modify: `src/app/layout.js` (wrap children)

**Step 1: Create PageTransition component**

Create `src/components/PageTransition.js`:

```javascript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Step 2: Wrap children in layout.js**

In `src/app/layout.js`, add import:
```javascript
import PageTransition from "@/components/PageTransition";
```

Wrap `{children}` with `<PageTransition>{children}</PageTransition>`.

**Step 3: Verify page transitions**

Navigate between Home, Menu, Registry, RSVP — each page should fade in with a subtle slide-up.

**Step 4: Commit**

```bash
git add src/components/PageTransition.js src/app/layout.js
git commit -m "Add page transitions with Framer Motion"
```

---

### Task 4: Micro-interactions (Site-Wide)

**Files:**
- Modify: `src/app/page.js` (RSVP button hover)
- Modify: `src/app/rsvp/page.js` (button/input hover effects)
- Modify: `src/app/menu/page.js` (card hover)
- Modify: `src/app/registry/page.js` (card hover)
- Modify: `src/components/Navigation.js` (nav link underline animation)

**Step 1: Add hover scale to landing page RSVP button**

In `src/app/page.js`, update the RSVP Link className to add:
```
hover:scale-105 transition-all duration-200
```

**Step 2: Add hover effects to registry cards**

In `src/app/registry/page.js`, add to card divs:
```
hover:shadow-xl hover:-translate-y-1 transition-all duration-200
```

**Step 3: Add hover effects to menu sections**

In `src/app/menu/page.js`, add to the beverage info cards:
```
hover:shadow-lg transition-shadow duration-200
```

**Step 4: Add nav link underline slide animation**

In `src/components/Navigation.js`, replace the simple border-b with a pseudo-element approach. For the active link, add:
```
relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-sky-900
```

For inactive links on hover:
```
relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-sky-900 hover:after:w-full after:transition-all after:duration-300
```

**Step 5: Add focus ring transitions to RSVP inputs**

In `src/app/rsvp/page.js`, add to all `<input>` elements:
```
transition-all duration-200
```

Add to all `<button>` elements:
```
hover:scale-[1.02] transition-all duration-200
```

**Step 6: Verify all interactions in browser**

Test each page: hover buttons, cards, nav links. Confirm smooth transitions.

**Step 7: Commit**

```bash
git add src/app/page.js src/app/rsvp/page.js src/app/menu/page.js src/app/registry/page.js src/components/Navigation.js
git commit -m "Add micro-interactions and hover effects site-wide"
```

---

### Task 5: Parallax Hero Image

**Files:**
- Modify: `src/app/page.js` (hero section)

**Step 1: Convert hero to parallax**

Replace the current hero `<Image>` section in `src/app/page.js` with a div that uses `background-attachment: fixed`:

```javascript
{/* Hero Image - Parallax */}
<div
  className="relative w-full max-w-5xl h-[600px] md:h-[950px] overflow-hidden mb-12 bg-fixed bg-cover bg-[center_10%]"
  style={{
    backgroundImage: "url(/hero-photo.jpg)",
    filter: "grayscale(100%)",
    backgroundAttachment: "fixed",
  }}
/>
```

Remove the `<Image>` import if no longer used elsewhere on the page.

**Step 2: Test parallax scroll effect**

Scroll the landing page. The hero image should move slower than the content, creating depth.

**Step 3: Test that tulips still work correctly**

Scroll up and down — tulips should still fall and reset properly when navigating away and back.

**Step 4: Commit**

```bash
git add src/app/page.js
git commit -m "Add parallax scroll effect to hero image"
```

---

## Sprint 2: Admin Dashboard (Week 2)

### Task 6: Database Tables for New Features

**Files:**
- Create: `src/scripts/create-tables.sql`

**Step 1: Write SQL migration script**

Create `src/scripts/create-tables.sql`:

```sql
-- Song requests table
CREATE TABLE IF NOT EXISTS song_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  song_title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
);

-- Song votes tracking (prevents double-voting)
CREATE TABLE IF NOT EXISTS song_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  song_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES song_requests(id),
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id),
  UNIQUE KEY unique_vote (song_id, group_id)
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  uploaded_by_group_id INT,
  caption VARCHAR(500),
  category ENUM('engagement', 'wedding', 'guest') DEFAULT 'guest',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_group_id) REFERENCES `groups`(group_id)
);
```

**Step 2: Run migration on DigitalOcean droplet**

SSH into the droplet and execute:
```bash
ssh root@45.55.191.37
mysql -u projectuser -p WeddingDB < create-tables.sql
```

Or run via the app's MySQL connection:
```bash
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');
(async () => {
  const conn = await mysql.createConnection({
    host: '45.55.191.37',
    port: 3306,
    user: 'projectuser',
    password: process.env.DB_PASSWORD,
    database: 'WeddingDB',
    multipleStatements: true,
  });
  const sql = fs.readFileSync('src/scripts/create-tables.sql', 'utf8');
  await conn.query(sql);
  console.log('Tables created successfully');
  await conn.end();
})();
"
```

**Step 3: Verify tables exist**

```bash
ssh root@45.55.191.37
mysql -u projectuser -p WeddingDB -e "SHOW TABLES;"
```

Expected: `groups`, `users`, `rsvps`, `song_requests`, `song_votes`, `photos`

**Step 4: Commit**

```bash
git add src/scripts/create-tables.sql
git commit -m "Add SQL migration for song_requests, song_votes, and photos tables"
```

---

### Task 7: NextAuth.js Authentication Setup

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.js`
- Create: `src/middleware.js`
- Modify: `.env.local` (add NEXTAUTH_SECRET, NEXTAUTH_URL)

**Step 1: Generate auth secret**

Run:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET=<generated_value>
NEXTAUTH_URL=http://localhost:3000
```

**Step 2: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.js`:

```javascript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin", email: "admin@wedding.local" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 3 * 60 * 60, // 3 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
```

**Step 3: Create middleware to protect admin routes**

Create `src/middleware.js`:

```javascript
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // Only protect /admin routes (except /admin/login)
  if (req.nextUrl.pathname.startsWith("/admin") && !req.nextUrl.pathname.startsWith("/admin/login")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Step 4: Verify — visiting /admin redirects to /admin/login**

Run: `npm run dev`
Navigate to http://localhost:3000/admin
Expected: Redirects to /admin/login (404 for now, that's fine)

**Step 5: Commit**

```bash
git add src/app/api/auth/ src/middleware.js
git commit -m "Set up NextAuth.js with credentials provider and admin route protection"
```

---

### Task 8: Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.js`

**Step 1: Create admin login page**

Create `src/app/admin/login/page.js`:

```javascript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/admin");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-sky-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-sky-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] text-sky-700">
            Tori & Connor's Wedding
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-sky-800 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border-2 border-sky-300 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sky-800 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-2 border-sky-300 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-3 text-lg font-bold text-white hover:bg-sky-900 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

**Step 2: Verify login flow**

1. Navigate to http://localhost:3000/admin/login
2. Enter wrong credentials — see error message
3. Enter correct credentials (from .env.local ADMIN_USERNAME/ADMIN_PASSWORD) — redirects to /admin

**Step 3: Commit**

```bash
git add src/app/admin/login/page.js
git commit -m "Create admin login page with NextAuth credentials flow"
```

---

### Task 9: Admin Layout with Sidebar Navigation

**Files:**
- Create: `src/app/admin/layout.js`

**Step 1: Create admin layout with sidebar**

Create `src/app/admin/layout.js`:

```javascript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/guests", label: "Guest List", icon: "👥" },
  { href: "/admin/dietary", label: "Dietary Report", icon: "🍽" },
  { href: "/admin/songs", label: "Song Requests", icon: "🎵" },
  { href: "/admin/photos", label: "Photos", icon: "📸" },
  { href: "/admin/export", label: "Export Data", icon: "📥" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-900 text-white flex flex-col">
        <div className="p-6 border-b border-sky-700">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-light tracking-wide">
            Wedding Admin
          </h2>
          <p className="text-sky-300 text-xs mt-1">Tori & Connor</p>
        </div>

        <nav className="flex-1 py-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-sky-800 text-white border-r-2 border-amber-400"
                  : "text-sky-200 hover:bg-sky-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-700">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left text-sm text-sky-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="block mt-2 text-sm text-sky-400 hover:text-white transition-colors"
          >
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 2: Verify sidebar renders on /admin but NOT on /admin/login**

**Step 3: Commit**

```bash
git add src/app/admin/layout.js
git commit -m "Create admin layout with sidebar navigation"
```

---

### Task 10: Admin Stats API Route

**Files:**
- Create: `src/app/api/admin/stats/route.js`

**Step 1: Create the stats API**

Create `src/app/api/admin/stats/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    // Total invited (all users)
    const [[{ total_invited }]] = await conn.execute(
      `SELECT COUNT(*) AS total_invited FROM users`
    );

    // Total who have an RSVP row
    const [[{ total_responded }]] = await conn.execute(
      `SELECT COUNT(DISTINCT u.user_id) AS total_responded
       FROM users u JOIN rsvps r ON r.user_id = u.user_id`
    );

    // Attending
    const [[{ total_attending }]] = await conn.execute(
      `SELECT COUNT(*) AS total_attending FROM rsvps WHERE attending = 1`
    );

    // Declined
    const [[{ total_declined }]] = await conn.execute(
      `SELECT COUNT(*) AS total_declined FROM rsvps WHERE attending = 0`
    );

    // Plus-ones
    const [[{ total_plus_ones }]] = await conn.execute(
      `SELECT COUNT(*) AS total_plus_ones FROM rsvps WHERE plus_one = 1`
    );

    // Total families
    const [[{ total_families }]] = await conn.execute(
      `SELECT COUNT(*) AS total_families FROM \`groups\``
    );

    // Families responded
    const [[{ families_responded }]] = await conn.execute(
      `SELECT COUNT(DISTINCT g.group_id) AS families_responded
       FROM \`groups\` g
       JOIN users u ON u.group_id = g.group_id
       JOIN rsvps r ON r.user_id = u.user_id`
    );

    // Dietary restrictions breakdown
    const [dietaryRows] = await conn.execute(
      `SELECT diet_restrictions, COUNT(*) AS count
       FROM rsvps
       WHERE diet_restrictions IS NOT NULL AND diet_restrictions != ''
       GROUP BY diet_restrictions
       ORDER BY count DESC`
    );

    // Response status by family
    const [familyStatus] = await conn.execute(
      `SELECT g.family_name, g.group_id,
              COUNT(DISTINCT u.user_id) AS member_count,
              COUNT(DISTINCT r.user_id) AS responded_count,
              SUM(CASE WHEN r.attending = 1 THEN 1 ELSE 0 END) AS attending_count
       FROM \`groups\` g
       JOIN users u ON u.group_id = g.group_id
       LEFT JOIN rsvps r ON r.user_id = u.user_id
       GROUP BY g.group_id, g.family_name
       ORDER BY g.family_name`
    );

    return NextResponse.json({
      ok: true,
      stats: {
        total_invited,
        total_responded,
        total_attending,
        total_declined,
        total_plus_ones,
        total_families,
        families_responded,
        not_responded: total_invited - total_responded,
      },
      dietary: dietaryRows,
      families: familyStatus,
    });
  } finally {
    conn.release();
  }
}
```

**Step 2: Test the API**

Run: `curl http://localhost:3000/api/admin/stats | python3 -m json.tool`
Expected: JSON with stats object containing counts

**Step 3: Commit**

```bash
git add src/app/api/admin/stats/route.js
git commit -m "Create admin stats API with RSVP analytics"
```

---

### Task 11: Admin Overview Dashboard Page

**Files:**
- Rewrite: `src/app/admin/page.js`

**Step 1: Build the overview dashboard with Chart.js**

Rewrite `src/app/admin/page.js`:

```javascript
"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (!data) return <p className="text-red-500">Failed to load data</p>;

  const { stats, families } = data;

  const responseChart = {
    labels: ["Attending", "Declined", "No Response"],
    datasets: [{
      data: [stats.total_attending, stats.total_declined, stats.not_responded],
      backgroundColor: ["#0c4a6e", "#f59e0b", "#cbd5e1"],
      borderWidth: 0,
    }],
  };

  const familyChart = {
    labels: families.map((f) => f.family_name),
    datasets: [
      {
        label: "Attending",
        data: families.map((f) => f.attending_count),
        backgroundColor: "#0c4a6e",
      },
      {
        label: "Not Attending / No Response",
        data: families.map((f) => f.member_count - f.attending_count),
        backgroundColor: "#e2e8f0",
      },
    ],
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-8">
        Dashboard Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Invited", value: stats.total_invited, color: "sky" },
          { label: "Responded", value: stats.total_responded, color: "emerald" },
          { label: "Attending", value: stats.total_attending, color: "amber" },
          { label: "Plus-Ones", value: stats.total_plus_ones, color: "violet" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-sky-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">Response Status</h2>
          <div className="max-w-xs mx-auto">
            <Pie data={responseChart} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">By Family</h2>
          <Bar
            data={familyChart}
            options={{
              responsive: true,
              scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify dashboard renders**

Log in at /admin/login, navigate to /admin. Should see stat cards + pie chart + bar chart.

**Step 3: Commit**

```bash
git add src/app/admin/page.js
git commit -m "Build admin overview dashboard with Chart.js analytics"
```

---

### Task 12: Admin Guest List Page

**Files:**
- Create: `src/app/admin/guests/page.js`
- Create: `src/app/api/admin/guests/route.js`

**Step 1: Create guest list API**

Create `src/app/api/admin/guests/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT g.group_id, g.family_name, g.access_code,
              u.user_id, u.first_name, u.last_name, u.plus_one_allowed,
              r.attending, r.plus_one, r.plus_one_name,
              r.diet_restrictions, r.dress_code, r.song_recommendations
       FROM \`groups\` g
       JOIN users u ON u.group_id = g.group_id
       LEFT JOIN rsvps r ON r.user_id = u.user_id
       ORDER BY g.family_name, u.last_name, u.first_name`
    );

    // Group by family
    const families = {};
    for (const row of rows) {
      if (!families[row.group_id]) {
        families[row.group_id] = {
          group_id: row.group_id,
          family_name: row.family_name,
          access_code: row.access_code,
          members: [],
        };
      }
      families[row.group_id].members.push({
        user_id: row.user_id,
        name: `${row.first_name} ${row.last_name}`,
        plus_one_allowed: !!row.plus_one_allowed,
        attending: row.attending === null ? null : Number(row.attending),
        plus_one: row.plus_one ? 1 : 0,
        plus_one_name: row.plus_one_name,
        diet_restrictions: row.diet_restrictions,
        song_recommendations: row.song_recommendations,
      });
    }

    return NextResponse.json({ ok: true, families: Object.values(families) });
  } finally {
    conn.release();
  }
}
```

**Step 2: Create guest list page**

Create `src/app/admin/guests/page.js`:

```javascript
"use client";

import { useEffect, useState } from "react";

export default function AdminGuestList() {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, responded, pending
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/guests")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setFamilies(json.families);
        setLoading(false);
      });
  }, []);

  function toggleExpand(groupId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  const filtered = families.filter((f) => {
    const matchesSearch = f.family_name.toLowerCase().includes(search.toLowerCase()) ||
      f.members.some((m) => m.name.toLowerCase().includes(search.toLowerCase()));

    const hasResponded = f.members.some((m) => m.attending !== null);
    const matchesFilter =
      filter === "all" ||
      (filter === "responded" && hasResponded) ||
      (filter === "pending" && !hasResponded);

    return matchesSearch && matchesFilter;
  });

  if (loading) return <p className="text-gray-500">Loading guest list...</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-6">
        Guest List
      </h1>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search families or guests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border-2 border-gray-300 px-4 py-2 cursor-pointer"
        >
          <option value="all">All Families</option>
          <option value="responded">Responded</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {families.length} families
      </p>

      {/* Family Cards */}
      <div className="space-y-3">
        {filtered.map((family) => {
          const hasResponded = family.members.some((m) => m.attending !== null);
          const attendingCount = family.members.filter((m) => m.attending === 1).length;
          const isExpanded = expanded.has(family.group_id);

          return (
            <div key={family.group_id} className="bg-white rounded-xl shadow border border-gray-200">
              <button
                onClick={() => toggleExpand(family.group_id)}
                className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    hasResponded ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {hasResponded ? "Responded" : "Pending"}
                  </span>
                  <span className="font-semibold text-sky-900">{family.family_name}</span>
                  <span className="text-gray-400 text-sm">({family.members.length} members)</span>
                </div>
                <div className="flex items-center gap-4">
                  {hasResponded && (
                    <span className="text-sm text-gray-600">
                      {attendingCount} attending
                    </span>
                  )}
                  <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                  <p className="text-xs text-gray-400 mb-3">Access Code: {family.access_code}</p>
                  <div className="space-y-2">
                    {family.members.map((m) => (
                      <div key={m.user_id} className="flex items-center justify-between py-2 px-3 rounded bg-gray-50">
                        <span className="text-gray-800">{m.name}</span>
                        <div className="flex items-center gap-3 text-sm">
                          {m.attending === null ? (
                            <span className="text-gray-400">No response</span>
                          ) : m.attending === 1 ? (
                            <span className="text-emerald-600 font-medium">Attending</span>
                          ) : (
                            <span className="text-red-500">Declined</span>
                          )}
                          {m.diet_restrictions && (
                            <span className="text-amber-600" title={m.diet_restrictions}>🍽</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 3: Verify at /admin/guests**

**Step 4: Commit**

```bash
git add src/app/api/admin/guests/route.js src/app/admin/guests/page.js
git commit -m "Build admin guest list with search, filter, and expandable families"
```

---

### Task 13: Admin Dietary Report Page

**Files:**
- Create: `src/app/admin/dietary/page.js`

**Step 1: Create dietary report page**

Create `src/app/admin/dietary/page.js`:

```javascript
"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDietaryReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading dietary data...</p>;
  if (!data) return <p className="text-red-500">Failed to load data</p>;

  const { dietary } = data;

  const chartData = {
    labels: dietary.map((d) => d.diet_restrictions),
    datasets: [{
      label: "Guests",
      data: dietary.map((d) => d.count),
      backgroundColor: "#0c4a6e",
    }],
  };

  function downloadCSV() {
    const csv = "Dietary Restriction,Count\n" +
      dietary.map((d) => `"${d.diet_restrictions}",${d.count}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dietary-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900">
          Dietary Report
        </h1>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors cursor-pointer text-sm"
        >
          Export CSV
        </button>
      </div>

      {dietary.length === 0 ? (
        <p className="text-gray-500">No dietary restrictions reported yet.</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <Bar data={chartData} options={{ responsive: true, indexAxis: "y" }} />
          </div>

          <div className="bg-white rounded-xl shadow">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sky-900">Restriction</th>
                  <th className="text-right p-4 text-sky-900">Count</th>
                </tr>
              </thead>
              <tbody>
                {dietary.map((d, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">{d.diet_restrictions}</td>
                    <td className="p-4 text-right font-semibold">{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify at /admin/dietary**

**Step 3: Commit**

```bash
git add src/app/admin/dietary/page.js
git commit -m "Build admin dietary report page with chart and CSV export"
```

---

### Task 14: Admin Export Center

**Files:**
- Create: `src/app/admin/export/page.js`
- Create: `src/app/api/admin/export/route.js`

**Step 1: Create export API**

Create `src/app/api/admin/export/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const conn = await pool.getConnection();

  try {
    let csv = "";

    if (type === "guests") {
      const [rows] = await conn.execute(
        `SELECT g.family_name, u.first_name, u.last_name,
                r.attending, r.plus_one, r.plus_one_name,
                r.diet_restrictions, r.dress_code, r.song_recommendations
         FROM users u
         JOIN \`groups\` g ON g.group_id = u.group_id
         LEFT JOIN rsvps r ON r.user_id = u.user_id
         ORDER BY g.family_name, u.last_name`
      );
      csv = "Family,First Name,Last Name,Attending,Plus One,Plus One Name,Dietary,Dress Code,Songs\n";
      for (const r of rows) {
        csv += `"${r.family_name}","${r.first_name}","${r.last_name}",${r.attending ?? ""},${r.plus_one ?? ""},"${r.plus_one_name || ""}","${r.diet_restrictions || ""}","${r.dress_code || ""}","${r.song_recommendations || ""}"\n`;
      }
    } else if (type === "dietary") {
      const [rows] = await conn.execute(
        `SELECT u.first_name, u.last_name, g.family_name, r.diet_restrictions
         FROM rsvps r
         JOIN users u ON u.user_id = r.user_id
         JOIN \`groups\` g ON g.group_id = u.group_id
         WHERE r.diet_restrictions IS NOT NULL AND r.diet_restrictions != ''
         ORDER BY g.family_name`
      );
      csv = "Family,Name,Dietary Restrictions\n";
      for (const r of rows) {
        csv += `"${r.family_name}","${r.first_name} ${r.last_name}","${r.diet_restrictions}"\n`;
      }
    } else if (type === "songs") {
      const [rows] = await conn.execute(
        `SELECT sr.song_title, sr.artist, sr.votes, g.family_name
         FROM song_requests sr
         JOIN \`groups\` g ON g.group_id = sr.group_id
         ORDER BY sr.votes DESC`
      );
      csv = "Song Title,Artist,Votes,Requested By\n";
      for (const r of rows) {
        csv += `"${r.song_title}","${r.artist || ""}",${r.votes},"${r.family_name}"\n`;
      }
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-export.csv"`,
      },
    });
  } finally {
    conn.release();
  }
}
```

**Step 2: Create export center page**

Create `src/app/admin/export/page.js`:

```javascript
"use client";

export default function AdminExport() {
  const exports = [
    { type: "guests", label: "Full Guest List", description: "All families, members, RSVP status, and details", icon: "👥" },
    { type: "dietary", label: "Dietary Restrictions", description: "Guests with dietary needs for the caterer", icon: "🍽" },
    { type: "songs", label: "Song Playlist", description: "All song requests ranked by votes for the DJ", icon: "🎵" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-6">
        Export Data
      </h1>
      <p className="text-gray-600 mb-8">Download CSV files for your vendors.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {exports.map((exp) => (
          <div key={exp.type} className="bg-white rounded-xl shadow p-6 text-center">
            <span className="text-4xl block mb-4">{exp.icon}</span>
            <h2 className="text-lg font-semibold text-sky-900 mb-2">{exp.label}</h2>
            <p className="text-sm text-gray-500 mb-4">{exp.description}</p>
            <a
              href={`/api/admin/export?type=${exp.type}`}
              className="inline-block px-4 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors cursor-pointer text-sm"
              download
            >
              Download CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/api/admin/export/route.js src/app/admin/export/page.js
git commit -m "Build admin export center with CSV downloads for guests, dietary, and songs"
```

---

## Sprint 3: Song Voting & Photo Gallery (Week 3)

### Task 15: Song Request API

**Files:**
- Create: `src/app/api/songs/route.js`
- Create: `src/app/api/songs/vote/route.js`

**Step 1: Create songs API (GET all songs, POST new song)**

Create `src/app/api/songs/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/songs?code=ACCESSCODE — list all songs with vote status for this group
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim();

  if (!code) {
    return NextResponse.json({ ok: false, error: "Missing access code" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const group_id = groups[0].group_id;

    // Get all songs with this group's vote status
    const [songs] = await conn.execute(
      `SELECT sr.id, sr.song_title, sr.artist, sr.votes, sr.group_id AS requester_group_id,
              g.family_name AS requested_by,
              (SELECT COUNT(*) FROM song_votes sv WHERE sv.song_id = sr.id AND sv.group_id = ?) AS my_vote
       FROM song_requests sr
       JOIN \`groups\` g ON g.group_id = sr.group_id
       ORDER BY sr.votes DESC, sr.created_at ASC`,
      [group_id]
    );

    // Count this group's total votes
    const [[{ vote_count }]] = await conn.execute(
      `SELECT COUNT(*) AS vote_count FROM song_votes WHERE group_id = ?`,
      [group_id]
    );

    return NextResponse.json({
      ok: true,
      group_id,
      songs: songs.map((s) => ({
        id: s.id,
        song_title: s.song_title,
        artist: s.artist,
        votes: s.votes,
        requested_by: s.requested_by,
        voted_by_me: s.my_vote > 0,
      })),
      my_votes_used: vote_count,
      max_votes: 5,
    });
  } finally {
    conn.release();
  }
}

// POST /api/songs — submit a new song request
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.access_code || "").trim();
  const song_title = (body.song_title || "").trim();
  const artist = (body.artist || "").trim();

  if (!code || !song_title) {
    return NextResponse.json({ ok: false, error: "Missing access code or song title" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    await conn.execute(
      `INSERT INTO song_requests (group_id, song_title, artist) VALUES (?, ?, ?)`,
      [groups[0].group_id, song_title, artist || null]
    );

    return NextResponse.json({ ok: true });
  } finally {
    conn.release();
  }
}
```

**Step 2: Create vote API**

Create `src/app/api/songs/vote/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// POST /api/songs/vote — toggle vote on a song
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const code = (body.access_code || "").trim();
  const song_id = body.song_id;

  if (!code || !song_id) {
    return NextResponse.json({ ok: false, error: "Missing access code or song ID" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code]
    );

    if (!groups.length) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    const group_id = groups[0].group_id;

    // Check if already voted
    const [existing] = await conn.execute(
      `SELECT id FROM song_votes WHERE song_id = ? AND group_id = ?`,
      [song_id, group_id]
    );

    if (existing.length > 0) {
      // Unvote
      await conn.execute(`DELETE FROM song_votes WHERE song_id = ? AND group_id = ?`, [song_id, group_id]);
      await conn.execute(`UPDATE song_requests SET votes = votes - 1 WHERE id = ?`, [song_id]);
      await conn.commit();
      return NextResponse.json({ ok: true, action: "unvoted" });
    } else {
      // Check vote limit (5 per group)
      const [[{ vote_count }]] = await conn.execute(
        `SELECT COUNT(*) AS vote_count FROM song_votes WHERE group_id = ?`,
        [group_id]
      );

      if (vote_count >= 5) {
        await conn.rollback();
        return NextResponse.json({ ok: false, error: "You've used all 5 votes!" }, { status: 400 });
      }

      // Vote
      await conn.execute(`INSERT INTO song_votes (song_id, group_id) VALUES (?, ?)`, [song_id, group_id]);
      await conn.execute(`UPDATE song_requests SET votes = votes + 1 WHERE id = ?`, [song_id]);
      await conn.commit();
      return NextResponse.json({ ok: true, action: "voted" });
    }
  } catch (e) {
    await conn.rollback();
    return NextResponse.json({ ok: false, error: "An error occurred" }, { status: 500 });
  } finally {
    conn.release();
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/songs/route.js src/app/api/songs/vote/route.js
git commit -m "Create song request and voting API endpoints"
```

---

### Task 16: Playlist Page

**Files:**
- Create: `src/app/playlist/page.js`
- Modify: `src/components/Navigation.js` (add Playlist link)

**Step 1: Create the playlist page**

Create `src/app/playlist/page.js`:

```javascript
"use client";

import { useState } from "react";

export default function PlaylistPage() {
  const [code, setCode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [songs, setSongs] = useState([]);
  const [votesUsed, setVotesUsed] = useState(0);
  const [newSong, setNewSong] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [error, setError] = useState("");

  async function loadSongs(accessCode) {
    const res = await fetch(`/api/songs?code=${encodeURIComponent(accessCode || code)}`);
    const json = await res.json();
    if (json.ok) {
      setSongs(json.songs);
      setVotesUsed(json.my_votes_used);
      setAuthenticated(true);
    } else {
      setError(json.error || "Failed to load");
    }
  }

  async function submitSong() {
    if (!newSong.trim()) return;
    const res = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: code, song_title: newSong, artist: newArtist }),
    });
    const json = await res.json();
    if (json.ok) {
      setNewSong("");
      setNewArtist("");
      loadSongs();
    } else {
      setError(json.error);
    }
  }

  async function toggleVote(songId) {
    const res = await fetch("/api/songs/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: code, song_id: songId }),
    });
    const json = await res.json();
    if (json.ok) {
      loadSongs();
    } else {
      setError(json.error);
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-sky-900 mb-4">
            Playlist
          </h1>
          <p className="text-sky-700 mb-8">Enter your access code to vote on songs!</p>
          <input
            className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 text-lg mb-4 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access Code"
          />
          <button
            onClick={() => loadSongs()}
            className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-3 text-white font-bold hover:bg-sky-900 transition-all"
          >
            Enter
          </button>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-sky-900 mb-2 text-center">
          Wedding Playlist
        </h1>
        <p className="text-center text-sky-700 mb-8">
          Votes used: {votesUsed}/5
        </p>

        {/* Add Song Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="font-semibold text-sky-900 mb-4">Request a Song</h2>
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-lg border-2 border-sky-300 px-4 py-2 focus:border-sky-600"
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
              placeholder="Song title"
            />
            <input
              className="flex-1 rounded-lg border-2 border-sky-300 px-4 py-2 focus:border-sky-600"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              placeholder="Artist (optional)"
            />
            <button
              onClick={submitSong}
              className="px-6 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Song List */}
        <div className="space-y-3">
          {songs.map((song, i) => (
            <div
              key={song.id}
              className={`flex items-center justify-between p-4 rounded-xl bg-white shadow transition-all hover:shadow-lg ${
                i < 10 ? "border-l-4 border-amber-400" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${i < 10 ? "text-amber-600" : "text-gray-400"}`}>
                  #{i + 1}
                </span>
                <div>
                  <p className="font-semibold text-sky-900">{song.song_title}</p>
                  {song.artist && <p className="text-sm text-gray-500">{song.artist}</p>}
                  <p className="text-xs text-gray-400">by {song.requested_by}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-sky-900">{song.votes}</span>
                <button
                  onClick={() => toggleVote(song.id)}
                  className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${
                    song.voted_by_me ? "text-red-500" : "text-gray-300 hover:text-red-400"
                  }`}
                >
                  {song.voted_by_me ? "♥" : "♡"}
                </button>
              </div>
            </div>
          ))}

          {songs.length === 0 && (
            <p className="text-center text-gray-500 py-8">No songs yet. Be the first to request one!</p>
          )}
        </div>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </main>
  );
}
```

**Step 2: Add Playlist to navigation**

In `src/components/Navigation.js`, add to `navLinks` array:
```javascript
{ href: "/playlist", label: "Playlist" },
```

**Step 3: Verify the full flow**

1. Navigate to /playlist
2. Enter access code
3. Submit a song
4. Vote on songs
5. Confirm votes capped at 5

**Step 4: Commit**

```bash
git add src/app/playlist/page.js src/components/Navigation.js
git commit -m "Create playlist page with song requests and voting system"
```

---

### Task 17: Admin Songs Page

**Files:**
- Create: `src/app/admin/songs/page.js`

**Step 1: Create admin songs page**

Create `src/app/admin/songs/page.js`:

```javascript
"use client";

import { useEffect, useState } from "react";

export default function AdminSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reuse the public API without access code for admin
    // We'll create a simple admin songs endpoint
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(() => {
        // For now, fetch songs directly
        return fetch("/api/admin/songs");
      })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setSongs(json.songs);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-500">Loading songs...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900">
          Song Requests ({songs.length})
        </h1>
        <a
          href="/api/admin/export?type=songs"
          download
          className="px-4 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 transition-colors cursor-pointer text-sm"
        >
          Export for DJ
        </a>
      </div>

      <div className="space-y-2">
        {songs.map((song, i) => (
          <div key={song.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <span className={`text-lg font-bold ${i < 10 ? "text-amber-600" : "text-gray-400"}`}>
                #{i + 1}
              </span>
              <div>
                <p className="font-semibold text-sky-900">{song.song_title}</p>
                {song.artist && <p className="text-sm text-gray-500">{song.artist}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{song.requested_by}</span>
              <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-semibold">
                {song.votes} votes
              </span>
            </div>
          </div>
        ))}

        {songs.length === 0 && (
          <p className="text-gray-500">No song requests yet.</p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create admin songs API**

Create `src/app/api/admin/songs/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const conn = await pool.getConnection();
  try {
    const [songs] = await conn.execute(
      `SELECT sr.id, sr.song_title, sr.artist, sr.votes, g.family_name AS requested_by
       FROM song_requests sr
       JOIN \`groups\` g ON g.group_id = sr.group_id
       ORDER BY sr.votes DESC, sr.created_at ASC`
    );
    return NextResponse.json({ ok: true, songs });
  } finally {
    conn.release();
  }
}
```

**Step 3: Commit**

```bash
git add src/app/admin/songs/page.js src/app/api/admin/songs/route.js
git commit -m "Build admin songs page with ranked list and DJ export"
```

---

### Task 18: Photo Upload API

**Files:**
- Create: `src/app/api/photos/route.js`
- Create: `src/app/api/photos/upload/route.js`

**Step 1: Create photo listing API**

Create `src/app/api/photos/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const includeUnapproved = searchParams.get("admin") === "true";

  const conn = await pool.getConnection();
  try {
    let sql = `SELECT p.id, p.filename, p.caption, p.category, p.approved, p.created_at,
                      g.family_name AS uploaded_by
               FROM photos p
               LEFT JOIN \`groups\` g ON g.group_id = p.uploaded_by_group_id`;

    const conditions = [];
    const params = [];

    if (!includeUnapproved) {
      conditions.push("p.approved = TRUE");
    }
    if (category) {
      conditions.push("p.category = ?");
      params.push(category);
    }

    if (conditions.length) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY p.created_at DESC";

    const [photos] = await conn.execute(sql, params);
    return NextResponse.json({ ok: true, photos });
  } finally {
    conn.release();
  }
}
```

**Step 2: Create photo upload API**

Create `src/app/api/photos/upload/route.js`:

```javascript
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import pool from "@/lib/db";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const code = formData.get("access_code");
  const caption = formData.get("caption") || "";

  if (!file || !code) {
    return NextResponse.json({ ok: false, error: "Missing file or access code" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Only JPG, PNG, and WebP allowed" }, { status: 400 });
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "File must be under 10MB" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const [groups] = await conn.execute(
      `SELECT group_id FROM \`groups\` WHERE access_code = ? LIMIT 1`,
      [code.trim()]
    );

    if (!groups.length) {
      return NextResponse.json({ ok: false, error: "Invalid access code" }, { status: 404 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const galleryPath = join(process.cwd(), "public", "gallery");

    // Ensure gallery directory exists
    const { mkdir } = await import("fs/promises");
    await mkdir(galleryPath, { recursive: true });

    await writeFile(join(galleryPath, filename), buffer);

    // Save to database
    await conn.execute(
      `INSERT INTO photos (filename, uploaded_by_group_id, caption, category, approved)
       VALUES (?, ?, ?, 'guest', FALSE)`,
      [filename, groups[0].group_id, caption.trim() || null]
    );

    return NextResponse.json({ ok: true, filename });
  } finally {
    conn.release();
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/photos/route.js src/app/api/photos/upload/route.js
git commit -m "Create photo listing and upload APIs with file validation"
```

---

### Task 19: Photo Gallery Page

**Files:**
- Create: `src/app/photos/page.js`
- Modify: `src/components/Navigation.js` (add Photos link)

**Step 1: Create photo gallery page**

Create `src/app/photos/page.js`:

```javascript
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCode, setUploadCode] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [category]);

  async function loadPhotos() {
    const params = category ? `?category=${category}` : "";
    const res = await fetch(`/api/photos${params}`);
    const json = await res.json();
    if (json.ok) setPhotos(json.photos);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append("access_code", uploadCode);

    setUploading(true);
    const res = await fetch("/api/photos/upload", { method: "POST", body: formData });
    const json = await res.json();
    setUploading(false);

    if (json.ok) {
      alert("Photo uploaded! It will appear after approval.");
      form.reset();
      setShowUpload(false);
    } else {
      alert(json.error || "Upload failed");
    }
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-sky-900 mb-2 text-center">
          Photo Gallery
        </h1>
        <p className="text-center text-sky-700 mb-8">Memories from our celebration</p>

        {/* Filter & Upload */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {["", "engagement", "wedding", "guest"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  category === cat
                    ? "bg-sky-800 text-white"
                    : "bg-white text-sky-800 hover:bg-sky-100"
                }`}
              >
                {cat === "" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer transition-colors"
          >
            Upload Photo
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="font-semibold text-sky-900 mb-4">Upload a Photo</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                value={uploadCode}
                onChange={(e) => setUploadCode(e.target.value)}
                placeholder="Your access code"
                className="w-full rounded-lg border-2 border-sky-300 px-4 py-2"
                required
              />
              <input
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full"
                required
              />
              <input
                type="text"
                name="caption"
                placeholder="Caption (optional)"
                className="w-full rounded-lg border-2 border-sky-300 px-4 py-2"
              />
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900 cursor-pointer disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        )}

        {/* Photo Grid (Masonry) */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="mb-4 break-inside-avoid cursor-pointer group"
              onClick={() => setLightbox(photo)}
            >
              <div className="relative overflow-hidden rounded-lg shadow hover:shadow-xl transition-shadow">
                <img
                  src={`/gallery/${photo.filename}`}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.caption}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p className="text-center text-gray-500 py-12">No photos yet. Be the first to share!</p>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 cursor-pointer"
            onClick={() => setLightbox(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <img
                src={`/gallery/${lightbox.filename}`}
                alt={lightbox.caption || ""}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {lightbox.caption && (
                <p className="text-white text-center mt-4">{lightbox.caption}</p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center text-sky-900 font-bold shadow-lg cursor-pointer hover:bg-gray-100"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

**Step 2: Add Photos to navigation**

In `src/components/Navigation.js`, add to `navLinks` array:
```javascript
{ href: "/photos", label: "Photos" },
```

**Step 3: Commit**

```bash
git add src/app/photos/page.js src/components/Navigation.js
git commit -m "Create photo gallery with masonry grid, lightbox, and guest uploads"
```

---

### Task 20: Admin Photo Moderation Page

**Files:**
- Create: `src/app/admin/photos/page.js`
- Create: `src/app/api/admin/photos/route.js`

**Step 1: Create admin photos API**

Create `src/app/api/admin/photos/route.js`:

```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";

// PATCH /api/admin/photos — approve or reject
export async function PATCH(req) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { photo_id, action } = body; // action: "approve" | "reject"

  const conn = await pool.getConnection();
  try {
    if (action === "approve") {
      await conn.execute(`UPDATE photos SET approved = TRUE WHERE id = ?`, [photo_id]);
    } else if (action === "reject") {
      const [rows] = await conn.execute(`SELECT filename FROM photos WHERE id = ?`, [photo_id]);
      if (rows.length) {
        // Delete file
        try {
          await unlink(join(process.cwd(), "public", "gallery", rows[0].filename));
        } catch (e) {
          // File might not exist, that's ok
        }
      }
      await conn.execute(`DELETE FROM photos WHERE id = ?`, [photo_id]);
    }

    return NextResponse.json({ ok: true });
  } finally {
    conn.release();
  }
}
```

**Step 2: Create admin photos page**

Create `src/app/admin/photos/page.js`:

```javascript
"use client";

import { useEffect, useState } from "react";

export default function AdminPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPhotos() {
    const res = await fetch("/api/photos?admin=true");
    const json = await res.json();
    if (json.ok) setPhotos(json.photos);
    setLoading(false);
  }

  useEffect(() => { loadPhotos(); }, []);

  async function moderate(photoId, action) {
    await fetch("/api/admin/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_id: photoId, action }),
    });
    loadPhotos();
  }

  const pending = photos.filter((p) => !p.approved);
  const approved = photos.filter((p) => p.approved);

  if (loading) return <p className="text-gray-500">Loading photos...</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-6">
        Photo Moderation
      </h1>

      {/* Pending */}
      <h2 className="text-lg font-semibold text-amber-700 mb-4">
        Pending Approval ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="text-gray-500 mb-8">No photos pending.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {pending.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={`/gallery/${photo.filename}`}
                alt={photo.caption || ""}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                {photo.caption && <p className="text-sm text-gray-600 mb-2">{photo.caption}</p>}
                <p className="text-xs text-gray-400 mb-2">By: {photo.uploaded_by || "Unknown"}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => moderate(photo.id, "approve")}
                    className="flex-1 px-3 py-1 bg-emerald-600 text-white rounded text-sm cursor-pointer hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => moderate(photo.id, "reject")}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-sm cursor-pointer hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved */}
      <h2 className="text-lg font-semibold text-emerald-700 mb-4">
        Approved ({approved.length})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {approved.map((photo) => (
          <div key={photo.id} className="rounded-lg overflow-hidden shadow">
            <img
              src={`/gallery/${photo.filename}`}
              alt={photo.caption || ""}
              className="w-full h-48 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/api/admin/photos/route.js src/app/admin/photos/page.js
git commit -m "Build admin photo moderation with approve/reject functionality"
```

---

## Sprint 4: Things To Do, Map & Final Polish (Week 4)

### Task 21: Things To Do Page with Google Maps

**Files:**
- Rewrite: `src/app/things-to-do/page.js`
- Modify: `src/components/Navigation.js` (add Things To Do link)

**Step 1: Build Things To Do page with map embed**

Rewrite `src/app/things-to-do/page.js` with:
- Google Maps iframe embed centered on Dover, OH
- Sections for local attractions, restaurants, outdoor activities
- Venue pin highlighted
- Wedding color scheme

**Step 2: Add to navigation**

Add `{ href: "/things-to-do", label: "Things To Do" }` to `navLinks` in Navigation.js.

**Step 3: Commit**

```bash
git add src/app/things-to-do/page.js src/components/Navigation.js
git commit -m "Build Things To Do page with Google Maps and local attractions"
```

---

### Task 22: Update RSVP to Save Songs to song_requests Table

**Files:**
- Modify: `src/app/rsvp/page.js` (split song field into title + artist)
- Modify: `src/app/api/rsvp/route.js` (save to song_requests table)

**Step 1: Update RSVP frontend**

In `src/app/rsvp/page.js`, replace the single `songs` text field with two fields:
- `songTitle` (text input for song name)
- `songArtist` (text input for artist)

Update the submit payload to include `song_title` and `song_artist` fields.

**Step 2: Update RSVP API**

In `src/app/api/rsvp/route.js`, after the RSVP upsert loop, add:

```javascript
// Save song request to song_requests table
if (song_title) {
  await conn.execute(
    `INSERT INTO song_requests (group_id, song_title, artist) VALUES (?, ?, ?)`,
    [group_id, song_title, song_artist || null]
  );
}
```

Keep the existing `song_recommendations` column write for backwards compatibility.

**Step 3: Commit**

```bash
git add src/app/rsvp/page.js src/app/api/rsvp/route.js
git commit -m "Update RSVP to save song requests to dedicated table"
```

---

### Task 23: Final Polish & Testing

**Step 1: Test all guest flows**
- Enter access code, RSVP, view RSVP, modify RSVP
- Visit playlist page, submit song, vote
- Upload photo from gallery page
- Navigate all pages, verify transitions work

**Step 2: Test all admin flows**
- Login at /admin/login
- Check overview stats are correct
- Browse guest list, search, filter
- Check dietary report
- Approve/reject a photo
- Export all CSV types
- Sign out

**Step 3: Test edge cases**
- Invalid access code on all code-entry pages
- Submitting empty forms
- Uploading oversized file
- Voting when all 5 votes used
- Navigating directly to /admin (should redirect to login)

**Step 4: Run production build**

```bash
npm run build
```

Fix any build errors.

**Step 5: Final commit**

```bash
git add -A
git commit -m "Final polish and testing pass"
```

---

## File Inventory

### New Files (24)
- `src/components/CountdownTimer.js`
- `src/components/PageTransition.js`
- `src/scripts/create-tables.sql`
- `src/middleware.js`
- `src/app/api/auth/[...nextauth]/route.js`
- `src/app/api/admin/stats/route.js`
- `src/app/api/admin/guests/route.js`
- `src/app/api/admin/songs/route.js`
- `src/app/api/admin/photos/route.js`
- `src/app/api/admin/export/route.js`
- `src/app/api/songs/route.js`
- `src/app/api/songs/vote/route.js`
- `src/app/api/photos/route.js`
- `src/app/api/photos/upload/route.js`
- `src/app/admin/layout.js`
- `src/app/admin/login/page.js`
- `src/app/admin/guests/page.js`
- `src/app/admin/dietary/page.js`
- `src/app/admin/songs/page.js`
- `src/app/admin/photos/page.js`
- `src/app/admin/export/page.js`
- `src/app/playlist/page.js`
- `src/app/photos/page.js`
- `public/gallery/` (directory)

### Modified Files (6)
- `package.json` (new dependencies)
- `.env.local` (NEXTAUTH_SECRET, NEXTAUTH_URL)
- `src/app/page.js` (countdown + parallax)
- `src/app/layout.js` (page transitions)
- `src/app/rsvp/page.js` (song fields)
- `src/components/Navigation.js` (new links)
- `src/app/api/rsvp/route.js` (song_requests integration)

### Rewritten Files (2)
- `src/app/admin/page.js` (overview dashboard)
- `src/app/things-to-do/page.js` (full content + map)
