# Hotel Management MVP Design Specification

## 1. Brand & Visual Language
- **Palette:**
  - Teal Accent (Primary): `#2A7F9E`
  - Gold Accent (Secondary): `#D98C00`
  - Dark Background: `#1E1E1E`
  - Light Background: `#F5F5F5`
  - Success: `#22C55E` | Error: `#EF4444` | Warning: `#F59E0B` | Info: `#3B82F6`
- **Typography:**
  - Primary (Body): **Inter** (400 Regular, 500 Medium, 700 Bold)
  - Secondary (Headings): **Roboto Slab** (500 Medium, 700 Bold)
- **Style:** Modern glass-morphism. Cards use `backdrop-filter: blur(10px)` with a semi-transparent border and `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`.

## 2. Layout & Responsiveness
- **Grid:** 12-column desktop / 1-column mobile.
- **Breakpoints:** Mobile (≤600px), Tablet (601-1024px), Desktop (>1024px).
- **Interactions:** 44px min hit area for touch.

## 3. Core Page Wireframes
### 1. Home / Landing
- **Hero:** Full-width carousel with room images and price overlays in gold.
- **Search:** Sticky quick-search bar (Dates/Guests).
- **Amenities:** Grid of icon-based cards (Wi-Fi, Breakfast, Pets).

### 2. Room Catalogue (/rooms)
- **Filters:** Mobile-first slide-out sidebar.
- **Grid:** Responsive cards showing price/night and room type.
- **Sorting:** Top-right dropdown for price/rating.

### 3. Room Detail (/rooms/:id)
- **Gallery:** Lightbox-enabled hero section.
- **Sticky CTA:** "Book Now" floating button at the bottom of the viewport on mobile.

### 4. Booking Wizard (3-Step)
- **Step 1:** Full-screen calendar picker.
- **Step 2:** Horizontal scrolling list of room options.
- **Step 3:** Split layout with payment form on left and summary panel on right.

### 5. Guest Dashboard
- **Tabs:** "Upcoming", "Past", "Settings".
- **Actions:** Prominent "Leave Review" and "Manage Booking" buttons on stay cards.

### 6. Admin Dashboard
- **KPIs:** Top-level metric cards with sparkline charts.
- **Tables:** Sortable data grids for management.

## 4. Interaction Spec
- **Hover:** `transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);`
- **Active:** `transform: scale(0.95); transition: 0.1s;`
- **Transitions:** Page fade-in `opacity: 0` to `1` over 0.2s.

## 5. Accessibility & SEO
- **ARIA:** Roles for `nav`, `main`, `section`, `alert`.
- **SEO:** JSON-LD `Hotel` schema on Room Detail pages.
- **Contrast:** Verified 4.5:1 for all text combinations.
