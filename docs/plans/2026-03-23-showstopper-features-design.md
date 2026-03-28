# Showstopper Features Design
**Date:** 2026-03-23
**Status:** Approved
**Timeline:** 3-4 weeks

## Overview

Transform the Tori & Connor wedding website from a static site into a full interactive guest experience with admin analytics, guest engagement features, and visual polish.

## Feature 1: Live Countdown Timer

**Location:** Landing page, below the hero photo
**Tech:** React + CSS flip-clock animation

- Client-side component using `useEffect` + `setInterval`, updates every second
- Flip-clock style: each digit card animates when the number changes
- Shows days, hours, minutes, seconds until May 22, 2027
- Styled in Cormorant Garamond font with amber/yellow landing page colors
- Responsive — stacks on mobile

**New files:**
- `src/components/CountdownTimer.js`

**Dependencies:** None (pure React + CSS)

## Feature 2: Song Request Voting System

**Pages:** `/playlist` (new)
**Tech:** React + new API routes
**Database:** New `song_requests` table

### Database Schema
```sql
CREATE TABLE song_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  song_title VARCHAR(200) NOT NULL,
  artist VARCHAR(200),
  votes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
);

CREATE TABLE song_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  song_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES song_requests(id),
  FOREIGN KEY (group_id) REFERENCES `groups`(group_id),
  UNIQUE KEY unique_vote (song_id, group_id)
);
```

### RSVP Flow Changes
- Split existing song text field into two inputs: song title + artist name
- On RSVP submit, songs get saved to `song_requests` table
- Allow multiple song submissions per group

### Playlist Page (`/playlist`)
- Guests enter access code to view/vote
- Each group gets 5 votes maximum
- Songs displayed as cards sorted by vote count
- Top 10 highlighted with special styling
- Heart button to vote/unvote

### Admin View
- Full ranked playlist visible in admin dashboard
- Export as CSV for DJ

**New files:**
- `src/app/playlist/page.js`
- `src/app/api/songs/route.js`
- `src/app/api/songs/vote/route.js`

## Feature 3: Photo Gallery

**Pages:** `/photos` (new)
**Tech:** React + file upload API
**Storage:** Local (`/public/gallery/`)
**Database:** New `photos` table

### Database Schema
```sql
CREATE TABLE photos (
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

### Guest Upload Flow
- Access code required to upload
- File upload form with optional caption
- Photos saved to `/public/gallery/` with unique filename
- Photos go into "pending" (approved = false) state
- Max file size: 10MB. Accepted formats: jpg, png, webp

### Admin Moderation
- Admin dashboard shows pending photos
- Approve/reject with one click
- Only approved photos appear in public gallery

### Gallery Display
- Masonry grid layout
- Click to enlarge (lightbox)
- Filter by category: engagement / wedding / guest uploads
- Hover effects on thumbnails

**New files:**
- `src/app/photos/page.js`
- `src/app/api/photos/route.js`
- `src/app/api/photos/upload/route.js`
- `src/components/PhotoGallery.js`
- `src/components/Lightbox.js`

## Feature 4: Interactive Map

**Location:** Things To Do page (`/things-to-do`)
**Tech:** Google Maps iframe embed (no API key needed)

- Venue pin at Yellowbrick on 39 (3931 State Route 39 NW Dover, OH 44622)
- Nearby hotel pins
- Directions link
- Embedded alongside local attraction recommendations

**New files:**
- Update `src/app/things-to-do/page.js` (existing placeholder)

## Feature 5: Admin Dashboard

**Pages:** `/admin/*` (6 sub-pages)
**Tech:** NextAuth.js + Chart.js
**Auth:** Credentials provider with JWT sessions (3-hour expiry)

### Authentication
- Login page at `/admin/login`
- NextAuth.js credentials provider
- Username/password stored in environment variables
- Middleware protects all `/admin/*` routes

### Dashboard Pages

#### 5a. Overview (`/admin`)
- Total invited count
- Total responded count
- Attending vs. declined counts
- Plus-ones count
- Pie chart: response status breakdown
- Bar chart: attending vs. declined by family

#### 5b. Guest List (`/admin/guests`)
- Searchable, sortable table of all families
- Status badge per family: responded (green) / pending (amber)
- Click to expand: see individual members + their RSVP status
- Filter by status

#### 5c. Dietary Report (`/admin/dietary`)
- Aggregated dietary restrictions with counts
- Visual breakdown (bar chart)
- Export as CSV for caterer

#### 5d. Song Requests (`/admin/songs`)
- Ranked list of all song requests with vote counts
- Export as CSV for DJ

#### 5e. Photo Moderation (`/admin/photos`)
- Grid of pending photos
- Approve/reject buttons
- Preview caption and uploader info

#### 5f. Export Center (`/admin/export`)
- One-click CSV downloads:
  - Full guest list
  - Dietary restrictions report
  - Song playlist (ranked)
  - RSVP summary with all details

### Visual Style
- Clean white background
- Wedding colors as accents (amber headings, sky-blue buttons)
- Chart.js for all data visualizations

**New files:**
- `src/app/admin/login/page.js`
- `src/app/admin/page.js` (rewrite)
- `src/app/admin/guests/page.js`
- `src/app/admin/dietary/page.js`
- `src/app/admin/songs/page.js`
- `src/app/admin/photos/page.js`
- `src/app/admin/export/page.js`
- `src/app/admin/layout.js` (admin nav sidebar)
- `src/app/api/admin/stats/route.js`
- `src/app/api/admin/guests/route.js`
- `src/app/api/admin/export/route.js`
- `src/app/api/auth/[...nextauth]/route.js`
- `src/middleware.js`

**New dependencies:** `next-auth`, `chart.js`, `react-chartjs-2`

## Feature 6: Visual Polish

### Page Transitions
- Install Framer Motion
- Create layout wrapper component with `<motion.div>`
- Fade-in + slide-up on page mount (300ms duration)
- Applied site-wide via layout component

### Parallax Hero
- Hero image on landing page scrolls at 50% speed
- CSS `background-attachment: fixed` or lightweight scroll listener
- Ensure it doesn't conflict with falling tulips animation

### Micro-interactions (Tailwind CSS)
- Buttons: `hover:scale-105` with `transition-transform`
- Cards: `hover:shadow-xl hover:-translate-y-1`
- Nav links: underline slides in from left via `after:` pseudo-element
- Form inputs: border color transition on focus
- RSVP checkboxes: subtle bounce on check

**New files:**
- `src/components/PageTransition.js`

**New dependencies:** `framer-motion`

## New Dependencies Summary

| Package | Purpose | Size |
|---------|---------|------|
| `framer-motion` | Page transitions | ~15KB gzip |
| `chart.js` | Admin dashboard charts | ~20KB gzip |
| `react-chartjs-2` | React wrapper for Chart.js | ~5KB gzip |
| `next-auth` | Admin authentication | ~15KB gzip |

## New Database Tables Summary

| Table | Purpose |
|-------|---------|
| `song_requests` | Song submissions from RSVP |
| `song_votes` | Tracks which groups voted for which songs |
| `photos` | Photo gallery metadata and moderation status |

## Implementation Order

1. **Sprint 1 (Week 1):** Countdown timer + micro-interactions + page transitions
2. **Sprint 2 (Week 2):** Admin authentication + admin dashboard (overview, guest list, export)
3. **Sprint 3 (Week 3):** Song voting system + admin songs page + photo gallery + admin photos page
4. **Sprint 4 (Week 4):** Dietary report + Things To Do with map + parallax hero + polish/testing

## Navigation Updates

Add new pages to the site navigation:
- Home | Menu | Registry | Playlist | Photos | Things To Do | RSVP
- Admin nav is separate (sidebar layout, not visible to guests)
