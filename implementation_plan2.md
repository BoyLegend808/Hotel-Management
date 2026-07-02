# Total UI/UX Redesign: Lumina Hospitality (Larita Template Inspired)

This plan outlines the complete UI/UX makeover of the Lumina Hospitality platform, heavily inspired by the provided Wix "Larita" luxury hotel template. The goal is to achieve a premium, modern, and highly responsive user experience across all 21 pages.

## Goal Description

Transform the current inconsistent and partially styled application into a cohesive, high-end luxury hotel platform. Key requirements:
- **Design Language**: Dark/moody luxury headers, clean white content areas, elegant serif typography, gold/amber accents.
- **Strict Separation of Concerns**: Absolutely NO inline CSS (`style="..."`) and NO inline JavaScript (`onclick="..."`). All logic and styles must be externalized.
- **Responsiveness**: Flawless experience on mobile, tablet, and desktop.
- **Functional Components**: Working desktop and mobile navigation bars, toggles, sliders, and functional forms.
- **Link Integrity**: 100% working redirections and internal links.
- **Cruft Removal**: Deletion of all unused and dead files.

## User Review Required

> [!CAUTION]
> **File Deletions**
> Phase 1 involves deleting files that are no longer used (remnants from the old Care Management system and unused test files). I will delete files like `.env.config.js` (unused duplicate), `css/main.css`, and various unused JS files. Please confirm you are comfortable with this cleanup.

> [!IMPORTANT]
> **Tailwind CSS Compilation**
> The project currently relies on uncompiled Tailwind classes. I will configure and run the Tailwind build process (`npm run build:tailwind`) to generate a single `tailwind-output.css` and remove the need for manual utility CSS files.

## Open Questions

> [!IMPORTANT]
> **Third-Party Libraries**
> To match the Wix template's premium feel (e.g., date pickers, image carousels/sliders), should I implement these using lightweight external libraries (like Swiper.js for carousels and Flatpickr for dates), or build them entirely from scratch using Vanilla JS? (External libraries are recommended for better UX and reliability).

## Proposed Changes

### Phase 1: Project Cleanup & Build Setup
Before adding new features, we must clean the foundation.
- **Clean up dead code**: Remove unused CSS, JS, and HTML files left over from previous iterations.
- **Tailwind Setup**: Run `npm run build:tailwind` and ensure the output is linked correctly in every HTML file.
- **Brand Colors**: Update `tailwind.config.js` to match the Wix template's palette (Luxury Gold, Deep Charcoal, Crisp White).

### Phase 2: Global UI Architecture (Shared Elements)
We will create a unified system so we don't repeat code across 21 pages.

#### [NEW] `js/global-nav.js` & `css/global-nav.css`
- A single, fully responsive navigation bar.
- **Desktop**: Transparent on top, shrinks and gets a solid background on scroll.
- **Mobile**: Hamburger menu with a smooth slide-out drawer.
- **No inline JS**: All event listeners attached via JS.

#### [NEW] `css/global-footer.css`
- A premium, multi-column dark footer matching the Wix template design.

#### [MODIFY] `css/lumina-design-system.css`
- Import Google Fonts: **Playfair Display** (headings) and **Inter** (body).
- Define base typography rules and global CSS variables for colors and spacing.

### Phase 3: Page-by-Page Redesign

#### 1. Home Page (`pages/hotel/home-lumina/`)
- **Hero Section**: Full-screen image with dark overlay, centered serif typography, and a "Scroll Down" indicator.
- **Booking Bar**: Sticky horizontal search bar with functional date pickers and guest selectors.
- **Features Grid**: 4-column layout for "Located in the heart", "Luxurious", "Friendly Staff", "Best Prices".
- **Room Teaser**: Asymmetric layout showcasing "Standard Room" with price, amenities, and "Book Now" CTA.
- **Amenities**: Clean icon grid for Wifi, Parking, Restaurant, Spa, Gym, Pool.
- **Video Section**: Full-width parallax image/video banner.

#### 2. Rooms & Suites (`pages/hotel/rooms-lumina/`)
- Rebuild the grid layout to match the luxury aesthetic.
- Functional sidebar filters (price slider, amenity checkboxes).
- Room cards with high-quality images, clear pricing, and hover effects.

#### 3. Room Details (`pages/hotel/room-detail-lumina/`)
- Masonry gallery layout for room images.
- Sticky "Book this room" widget on the right side for desktop.
- Comprehensive amenity list with icons.

#### 4. Booking Flow (`pages/hotel/booking-your-stay/`)
- Clean, multi-step wizard (Select Dates -> Select Room -> Payment).
- Polished form inputs with focus states and validation feedback.

#### 5. Dashboards (`admin-dashboard-lumina` & `guest-dashboard-lumina`)
- Responsive sidebar navigation for desktop, bottom bar for mobile.
- Clean data tables and stat cards with subtle shadows and rounded corners.

### Phase 4: JavaScript Refactoring & Link Validation
- **Remove Inline Handlers**: Scan all HTML files for `onclick`, `onchange`, etc., and move them to dedicated JS files using `addEventListener`.
- **Link Audit**: Programmatically or manually test every `<a>` tag and `window.location.href` redirect to ensure no 404 errors.
- **UI Interactivity**: Add smooth scrolling, scroll-reveal animations (using Intersection Observer), and working UI toggles (accordions for FAQs).

## Verification Plan

### Automated Tests
- Verify Tailwind builds successfully without errors.
- Run `node server.js` and verify the server starts and serves all routes correctly.

### Manual Verification
1. **Visual QA**: Compare the Home Page against the Wix template reference image.
2. **Responsiveness Check**: Resize browser from 320px to 1920px. Ensure the mobile menu toggles correctly on all pages.
3. **Navigation Check**: Click every header link, footer link, and CTA button to ensure correct routing.
4. **Code Quality Check**: Search codebase for `style=` and `onclick=` to verify they have been completely eliminated.
5. **Console Check**: Open DevTools on every page to ensure no JavaScript errors are thrown.
