# Handoff — Tori & Connor Wedding Website

**Date:** 2026-04-01
**Status:** Admin branch has all features built and tested. Mobile responsiveness and PayPal integration are the next tasks.

---

## What We Were Doing

Building a full-stack wedding website for Tori Campbell & Connor Quinn (May 22, 2027 at Yellowbrick on 39, Dover, OH). The user requested mobile responsiveness improvements — the navbar and pages don't format well on mobile devices. This was the last request before context filled up.

---

## Current State

- ✅ Landing page with falling tulips, countdown timer, hero image (B&W, cropped)
- ✅ RSVP system with access codes, per-user plus-ones, dietary/dress/song fields
- ✅ Menu page populated with Theo's Catering data (Platinum Package)
- ✅ Registry page with Amazon (`33DL72QMR1KES`) and Walmart links + House Fund
- ✅ Things To Do page (3 sections: Outdoor, Restaurants, Shopping — no Historical Sites)
- ✅ Admin dashboard: RSVP countdown, non-responder list, activity feed (30s polling), stat cards, pie/bar charts
- ✅ Budget tracker page: CRUD expenses, category chart, editable budget from settings table
- ✅ Auth: NextAuth.js with credentials (`toriconnor` / `SpecialDay2027!`), middleware protects `/admin/*` AND `/api/admin/*`
- ✅ Settings table replaces env vars for client-editable config (rsvp_deadline, wedding_budget)
- ✅ 55 passing Jest tests across 6 test suites
- ✅ Deployed on Vercel (auto-deploys from main), MySQL on DigitalOcean droplet (45.55.191.37)
- ✅ Hidden admin link: clicking "Tori Campbell & Connor Quinn" in nav goes to `/admin/login`
- ⏳ **Mobile responsiveness** — navbar overflows on small screens, pages need responsive fixes
- ⏳ **PayPal Donate Button** for House Fund — client needs to create button at paypal.com/donate/buttons, then embed on registry page (PayPal.me link: `paypal.me/ToriCampbell02`)
- ⏳ Uncommitted changes: updated restaurants in Things To Do + updated Amazon registry link
- ❌ Playlist and Photos pages exist but not tested this session
- ❌ Page transitions (Framer Motion) — installed but may need mobile optimization

---

## Files Modified This Session (Uncommitted)

| File | Change |
|------|--------|
| `src/app/things-to-do/page.js` | Updated restaurants: kept Uncle Primo's, added Park Street Pizza, Hoodletown Brewing, Magoo's, J-N-G Grill |
| `src/app/registry/page.js` | Updated Amazon registry link to `33DL72QMR1KES` |

## Files Modified This Session (Committed on admin branch)

| File | Change |
|------|--------|
| `src/middleware.js` | Added `/api/admin/:path*` to matcher, returns 401 for unauthenticated API requests |
| `src/app/api/admin/settings/route.js` | NEW: GET/PUT settings from DB (whitelist: rsvp_deadline, wedding_budget) |
| `src/app/api/admin/activity/route.js` | NEW: GET recent 15 RSVP events with family context |
| `src/app/api/admin/budget/route.js` | NEW: GET/POST expenses |
| `src/app/api/admin/budget/[id]/route.js` | NEW: PUT/DELETE expenses by ID |
| `src/app/admin/page.js` | Rewritten: countdown, progress bar, non-responders, activity feed, charts |
| `src/app/admin/budget/page.js` | NEW: Full budget tracker with CRUD, charts, editable budget |
| `src/app/admin/layout.js` | Added Budget link to sidebar |
| `src/app/menu/page.js` | Populated with Theo's Catering menu + timeline cards |
| `src/components/Navigation.js` | Hidden admin link in couple names, reordered nav links |
| `src/scripts/create-tables.sql` | Added settings + expenses table definitions |
| `__tests__/` (6 files) | 55 tests: settings, activity, budget, stats APIs + middleware + static pages |

---

## Key Decisions Made

- **Hybrid admin architecture**: Countdown + activity feed on dashboard overview, budget tracker as separate page
- **Settings table over env vars**: Client can edit budget/deadline from admin UI without redeployment
- **Per-user plus-ones**: Each eligible member gets their own plus-one checkbox (Keegan's implementation, merged from remote)
- **Hidden admin link**: Couple's names in nav header link to `/admin/login` — no visible "Admin" text
- **Vercel + DigitalOcean hybrid**: App on Vercel (free), MySQL on droplet (1GB RAM, $6/mo)
- **Never add Claude as co-author** on any commits

---

## Open Questions / Blockers

- **Mobile responsiveness**: Navbar links overflow on mobile — needs hamburger menu or horizontal scroll. All pages need responsive review.
- **PayPal Donate Button**: Waiting on client (Tori) to create donate button at paypal.com/donate/buttons. Placeholder PayPal.me link: `paypal.me/ToriCampbell02`
- **Vercel env vars**: ADMIN credentials on Vercel are `toriconnor` / `SpecialDay2027!`, NEXTAUTH_SECRET is `DKRpu5Z9JOrL2UFdeYIHEp5Ijl0HogGVKVIIH20xYQs=`
- **Test user in DB**: Nicholas Widmer, access code `TESTDEV1`, user_id 195, group_id 66, plus_one_allowed=1

---

## How to Resume

```bash
cd /Users/nickwidmer/Desktop/KSU25-26/Capstone/Project/Capstone
git status                    # Should be on 'admin' branch with 2 uncommitted files
cat .env.local                # Verify DB credentials
npm run dev                   # Start dev server on localhost:3000
npm test                      # Run 55 tests (should all pass)
```

1. First commit the uncommitted changes (restaurants + registry link update)
2. Then tackle **mobile responsiveness** — primary focus on `src/components/Navigation.js` (hamburger menu for mobile) and all page files for responsive layout
3. After that, integrate PayPal Donate Button when client provides the button ID

---

## Context for Next Claude

This is a **capstone project** for KSU (Kent State University) building a wedding website for Tori Campbell & Connor Quinn. Tech stack: **Next.js 16.1.6, React 19, MySQL on DigitalOcean, Tailwind CSS 4, NextAuth.js, Chart.js, Framer Motion**. The site uses the **Cormorant Garamond** font (`--font-cormorant` CSS variable) and a **sky blue** (`bg-sky-200`) + **amber** (`bg-amber-200` for landing page only) color scheme. The database is at `45.55.191.37` with user `projectuser`. The GitHub repo is `n-widmer/Capstone`. There are multiple branches: `main`, `admin` (current, most up-to-date), `LandingPage`, `Menu`, `Registry`, `ThingsToDo`, `FeatureUpgrades`, `keegan`. The user is Nick Widmer, a student. **Critical rule: NEVER add Claude as co-author on any git commit.** The catering is by Theo's Catering (doc at `~/Desktop/KSU25-26/Capstone/TorieInformation/TORI CAMPBELL REC YELLOWBRICK 2026.doc`).
