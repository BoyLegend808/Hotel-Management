# Lumina Hospitality — UI/UX Design Plan & Continuation Guide

## Current Status (as of last session)

The project has been converted from a care management system (Evergreen Estates)
to a hotel management system (Lumina Hospitality). All major bugs have been fixed.
A UI/UX pass was started but NOT completed. This file documents everything that
still needs to be done so work can be resumed.

---

## What Has Been Done

### Bug Fixes (Complete)
- All broken navigation links fixed (wrong paths like `/pages/hotel/rooms/` → `/pages/hotel/rooms-lumina/`)
- Mobile bottom nav items changed from non-clickable `<div>` to `<a>` links on all pages
- Login page now uses real API (`POST /api/login`) instead of hardcoded JS credential check
- Demo credentials fixed: `admin/demo1234`, `staffnurse/demo1234`, `henderson/demo1234`
- `.env.config` (no extension) was the real config file being loaded — fixed all redirects
- `routes.js` updated to use async `db-optimized.js` instead of sync `db.js`
- All `req.user` references in backend routes fixed to `req.session` (auth.js uses `req.session`)
- `page-router.js` protected route check fixed (was using `req.cookies` which didn't exist)
- `bookNow()` redirect fixed: `/pages/hotel/booking-your-stay/`
- `goBack()` fallback paths fixed across all pages
- Logout functions fixed across all JS files to use `/pages/hotel/login-lumina/`
- Admin dashboard KPI cards now load live from `/api/stats`
- Guest dashboard loads real bookings from `/api/bookings`
- Rooms page loads from `/api/rooms` with fallback to static data
- `page-init.js` rewritten — removed auto-injected green "Back" button (care management leftover)
- `ui-utils.css` back button style removed (was green care-management branding)
- `breadcrumb-link` color updated to hotel blue
- `validation.js` cleaned of care-management functions

### Files Deleted (Dead Code)
- `nul` (Windows artifact)
- `db-hotel.json` (unused second DB file)
- `backend/db.js` (sync DB replaced by db-optimized.js)
- `BACKEND_PERFORMANCE_OPTIMIZATION.md`
- `HOTEL_CONVERSION_CHECKLIST.md`
- `js/app.js`, `js/public.js`, `js/navbar.js` (care management JS)
- `js/css-loader.js`, `js/dynamic-loader.js`, `js/lazy-components.js` (care management)
- `js/service-worker-registration.js` (references nonexistent /sw.js)
- `js/tailwind-nav.js` (references nonexistent DOM IDs)
- `js/virtual-scroll.js` (unused)
- `css/main.css`, `css/public.css`, `css/navbar.css`, `css/critical.css` (green care management CSS)

### Database
- `db.json` completely replaced with hotel data: 5 rooms, empty bookings/payments, 2 sample reviews

### New Files Created
- `css/lumina-design-system.css` — updated with brand shorthand CSS variables (`--primary`, `--secondary`, `--background`, `--surface`, etc.)
- `css/hotel-utils.css` — **PARTIALLY COMPLETE** (see below) — utility CSS covering all Tailwind classes used in HTML

---

## The Core Remaining Problem — Tailwind CSS

### Why Pages Look Bad
The HTML pages use Tailwind utility classes extensively:
```
text-green-600, bg-blue-50, text-2xl, md:grid-cols-3, lg:col-span-7,
hover:bg-primary, mx-auto, max-w-7xl, h-[707px], overflow-x-hidden, etc.
```

**There is no Tailwind CSS build output.** The project has:
- `tailwind.config.js` — config exists
- `css/tailwind-input.css` — input file exists
- But NO `css/tailwind-output.css` — the output was never built

### Two Options to Fix This

**Option A (Recommended) — Build Tailwind:**
```bash
npm run build:tailwind
```
This runs: `tailwindcss -i ./css/tailwind-input.css -o ./css/tailwind-output.css --minify`
Then add to every HTML page `<head>`:
```html
<link href="/css/tailwind-output.css" rel="stylesheet"/>
```
Add BEFORE the page-specific CSS link.

**Option B — Complete the manual utility file:**
File: `css/hotel-utils.css` was started but only covers ~40% of needed utilities.
Still needs: responsive breakpoints (`md:`, `lg:`), all hover states, more color utilities,
arbitrary values like `h-[707px]`, gradient utilities, etc.
Then add to every HTML page `<head>`:
```html
<link href="/css/hotel-utils.css" rel="stylesheet"/>
```

**Option A is strongly recommended** — it's one command and gives you the complete output.

### Tailwind Config Issue
`tailwind.config.js` uses care management colors (dark green `#032521` as primary).
Update it to match the hotel brand:
```js
colors: {
  primary: { DEFAULT: '#006683' },
  secondary: { DEFAULT: '#4e6778' },
  // etc. — match the variables in css/lumina-design-system.css
}
```
Also check `css/tailwind-input.css` — it may import care management styles.

---

## UI/UX Design Work Still Needed (Per Page)

### All Pages — Global
- [ ] Add `<link href="/css/tailwind-output.css" rel="stylesheet"/>` to every HTML `<head>` (after building)
- [ ] OR add `<link href="/css/hotel-utils.css" rel="stylesheet"/>` if doing manual approach
- [ ] Fix page `<title>` — update copyright year from 2024 → 2026
- [ ] Header profile avatar: replace hardcoded Google image URL with user initial / dynamic avatar
- [ ] Add loading skeleton states for dynamically loaded content (rooms, bookings, stats)
- [ ] Add empty states with good copy for when there's no data
- [ ] Focus styles for accessibility (keyboard navigation)

### Home Page (`home-lumina.html` / `home-lumina.js`)
- [ ] Hero carousel height `h-[707px]` needs Tailwind or custom CSS — currently no height applied
- [ ] Search bar `sticky top-[72px]` needs Tailwind arbitrary value support
- [ ] `md:flex-1`, `md:w-48`, `md:flex-row` responsive variants not working
- [ ] `lg:grid-cols-12`, `lg:col-span-7`, `lg:col-span-5` not working
- [ ] `bg-secondary` on hero price badge — secondary color needs to be gold/amber visually
- [ ] Search "Check Availability" button should navigate to rooms page with query params (partially done)
- [ ] Footer `bg-surface-dim` needs the CSS variable to resolve
- [ ] `md:grid-cols-4` on footer not working
- [ ] Carousel dots/indicators would improve UX (currently just prev/next arrows)

### Rooms Page (`rooms-lumina.html` / `rooms-lumina.js`)
- [ ] Room grid `sm:grid-cols-2`, `lg:grid-cols-2`, `xl:grid-cols-3` — responsive variants not working
- [ ] Sidebar filter area `md:col-span-3`, `md:col-span-9` not working
- [ ] Sidebar drawer slide-in animation for mobile
- [ ] Filter functionality (price range, capacity, amenities) — UI exists but no filtering logic wired
- [ ] Sort dropdown — UI exists but no sorting logic wired
- [ ] Room cards should show a "Available" / "Booked" status badge

### Room Detail Page (`room-detail-lumina.html` / `room-detail-lumina.js`)
- [ ] Gallery grid `grid-cols-1 lg:grid-cols-3` — lg responsive not working
- [ ] `lg:col-span-2`, `lg:col-span-1` sidebar column not working
- [ ] Gallery images hardcoded — needs to use room data from API by ID
- [ ] Room data is hardcoded static object — should fetch from `/api/rooms/:id` using URL param
- [ ] `sm:grid-cols-3` on amenities not working
- [ ] "Check Availability" button scrolls to / opens the booking page with roomId pre-selected

### Booking Page (`booking-your-stay.html` / `booking-your-stay.js`)
- [ ] `md:grid-cols-2` in step 1 date inputs not working
- [ ] `lg:grid-cols-2` in step 3 payment form not working
- [ ] Step 2 room selection: room cards need selected state styling
- [ ] Payment form is cosmetic only — needs to call `/api/payments` to save the booking
- [ ] After successful booking, redirect to guest dashboard
- [ ] Booking should send `guestInfo` + `roomId` + dates to `/api/bookings` first, then payment

### Login Page (`login-lumina.html` / `login-lumina.js`)
- [ ] ✅ Login API is working correctly
- [ ] Login page looks fine but needs Tailwind for `min-h-screen flex items-center justify-center`
- [ ] "Forgot password?" and "Create one" links go nowhere — consider removing or adding toasts
- [ ] After login, store `sessionStart` timestamp in sessionStorage for timeout tracking

### Guest Dashboard (`guest-dashboard-lumina.html` / `guest-dashboard-lumina.js`)
- [ ] `md:grid-cols-2`, `lg:grid-cols-3` booking card grid not working
- [ ] Welcome message is hardcoded "Julian" — should read from `sessionStorage.getItem('user')`
- [ ] Settings form saves nothing — needs API endpoint or at least localStorage
- [ ] Tab switching works (JS is correct)
- [ ] Booking cancel button hits real API (✅ fixed)
- [ ] "View Details" shows a toast — should open a modal or detail view

### Admin Dashboard (`admin-dashboard-lumina.html` / `admin-dashboard-lumina.js`)
- [ ] `md:grid-cols-2`, `lg:grid-cols-4` KPI card grid not working
- [ ] `lg:col-span-2`, `lg:col-span-1` layout not working
- [ ] `md:grid-cols-4` room status grid not working
- [ ] KPI cards load from API ✅ but colors for green/blue/yellow/purple status cards need Tailwind
- [ ] Recent bookings list renders ✅
- [ ] "Add New Room" should open a modal/form, not just navigate to rooms list
- [ ] "Generate Report" and "Manage Staff" buttons do nothing — add toasts or link to future pages
- [ ] No mobile bottom nav was initially present — was added but needs Tailwind for layout

---

## Incomplete Elements from Previous Incomplete Component Additions
The user mentioned some components were partially added from a previous session.
Check `git log` or `git diff HEAD~5` for any partially integrated HTML/CSS/JS
blocks that may be referencing Tailwind classes or component IDs that don't exist.
Also check if `css/tailwind-input.css` imports anything unexpected.

---

## Backend — Still To Do
- [ ] Add `guest` as alias for `henderson` in demo users (login page shows "guest" but backend only has "henderson")
  → Actually fixed: login page now shows correct credentials
- [ ] `/api/bookings` POST — complete booking creation flow from booking page
- [ ] `/api/payments` POST — process payment and confirm booking
- [ ] Add `cookie-parser` middleware if ever switching to cookie-based auth
- [ ] Session persistence across page refreshes (currently lost on refresh since token is in sessionStorage)
  → Consider adding token to URL param or using a more persistent store

---

## File Reference Map

```
project root/
├── server.js                    ← Entry point, port 3000
├── .env.config                  ← ⚠️ THE real config (no extension) - loaded by require()
├── .env.config.js               ← Backup/duplicate config (not loaded)
├── db.json                      ← Flat JSON DB (5 rooms, empty bookings)
├── backend/
│   ├── auth.js                  ← Token auth, sessions Map, requireAuth/requireRole
│   ├── routes.js                ← API router (login/logout/stats + sub-routers)
│   ├── routes/
│   │   ├── rooms.js             ← GET/POST/PUT/DELETE /api/rooms
│   │   ├── bookings.js          ← GET/POST /api/bookings, PUT cancel
│   │   ├── payments.js          ← GET/POST /api/payments
│   │   └── reviews.js           ← GET/POST/PUT/DELETE /api/reviews
│   ├── db-optimized.js          ← Async DB with 5s cache, QueryBuilder
│   ├── page-router.js           ← HTML page routing, protected route check
│   ├── middleware.js            ← Rate limiting, security headers, logging
│   ├── cache.js                 ← In-memory API cache
│   ├── validation.js            ← Input validation helpers
│   ├── logger.js                ← Logger + PerformanceMonitor
│   └── memory-prevention.js     ← Memory leak tracking
├── css/
│   ├── lumina-design-system.css ← CSS variables + base component styles
│   ├── ui-utils.css             ← Toast, breadcrumb styles
│   ├── hotel-utils.css          ← ⚠️ INCOMPLETE utility classes (started, ~40% done)
│   ├── tailwind-input.css       ← Tailwind input (check for care-mgmt imports)
│   └── fonts.css                ← @font-face definitions
├── js/
│   ├── ui-utils.js              ← UI.showToast(), UI.goBack() etc.
│   ├── page-init.js             ← Initializes showToast/goBack globals, session timeout
│   ├── performance-utils.js     ← debounce, throttle, lazyLoadImages
│   ├── scroll-optimization.js   ← Scroll progress, back-to-top helpers
│   └── memory-leak-prevention.js← Client-side memory leak tracking
└── pages/hotel/
    ├── home-lumina/             ← Public homepage with hero carousel + search
    ├── rooms-lumina/            ← Room catalogue with filters
    ├── room-detail-lumina/      ← Single room view with gallery
    ├── booking-your-stay/       ← 3-step booking wizard
    ├── login-lumina/            ← Login (calls /api/login)
    ├── guest-dashboard-lumina/  ← Guest bookings + settings (requires auth)
    └── admin-dashboard-lumina/  ← Admin KPIs + recent bookings (requires admin auth)
```

---

## Quick Start for Next AI Session

1. Read this file first
2. Run `npm install` if node_modules is missing
3. Run `node server.js` to start on http://localhost:3000
4. Test login: `admin / demo1234` → admin dashboard, `henderson / demo1234` → guest dashboard
5. The #1 priority is fixing the Tailwind CSS issue (run `npm run build:tailwind`)
6. Then add the tailwind-output.css link to all HTML pages
7. Then work through the per-page UI/UX checklist above

## Commands
```bash
npm start                    # Start server (port 3000)
npm run build:tailwind       # Build Tailwind CSS output
npm run build:tailwind:dev   # Watch mode for Tailwind
```
