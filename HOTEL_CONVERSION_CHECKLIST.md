# Hotel Conversion Checklist

This document expands on the earlier migration notes and adds extra items you’ll likely need when turning the **Evergreen Estates Care Management System** into a full‑featured hotel‑booking web site.

---

## 1️⃣ Data Model Additions

- **Rooms collection** (`rooms`)
  - Fields: `roomId`, `type` (single, double, suite), `pricePerNight`, `maxOccupancy`, `amenities` (array), `photos` (array of URLs), `status` (`available`/`maintenance`).
- **Bookings collection** (`bookings`)
  - Fields: `bookingId`, `guestId`, `roomId`, `checkIn`, `checkOut`, `totalPrice`, `paymentStatus`, `createdAt`, `updatedAt`.
- **Payments collection** (`payments`)
  - Fields: `paymentId`, `bookingId`, `amount`, `currency`, `provider` (Stripe/PayPal), `status`, `transactionId`.
- **Reviews collection** (`reviews`)
  - Fields: `reviewId`, `guestId`, `roomId`, `rating` (1‑5), `comment`, `createdAt`.
- **Discounts / Coupons** (`coupons`)
  - Fields: `code`, `percentOff`, `validFrom`, `validTo`, `maxUses`.
- **Tax & Currency settings** (`settings`
  - Store tax rate, supported currencies, locale.

## 2️⃣ API Endpoint Extensions

| New / Updated Endpoint | Purpose |
|------------------------|---------|
| `GET /api/rooms` | List rooms with optional filters (`type`, `priceRange`, `availability`). |
| `GET /api/rooms/:id` | Get detailed room info (photos, amenities). |
| `GET /api/rooms/available?checkIn=...&checkOut=...` | Return rooms free for the given dates (used by the booking wizard). |
| `POST /api/bookings` | Create a new reservation (validates availability, calculates price, creates pending payment). |
| `GET /api/bookings/:id` | Guest view of their booking details. |
| `PUT /api/bookings/:id/cancel` | Cancel a reservation (apply cancellation policy). |
| `POST /api/payments` | Process payment via Stripe/PayPal. |
| `GET /api/reviews/:roomId` | List public reviews for a room. |
| `POST /api/reviews` | Guest submits a review after stay. |
| `GET /api/reports/occupancy` | Admin summary of occupancy rates (DevOps/Analytics). |
| `GET /api/reports/revenue` | Admin revenue report. |

## 3️⃣ Front‑End UI / UX Additions

- **Room catalogue page** (`pages/rooms/list.html`)
  - Grid or carousel of rooms, price per night, “View Details” button.
- **Room detail page** (`pages/rooms/detail.html`)
  - Photo lightbox, amenity icons, “Book Now” call‑to‑action.
- **Booking wizard** (3‑step flow)
  1. Choose dates (date‑picker component).
  2. Select room (show availability in real time).
  3. Guest info + payment.
- **Checkout page** with price breakdown, taxes, optional add‑ons (breakfast, airport shuttle).
- **Confirmation page** with printable receipt and QR code for mobile check‑in.
- **Guest profile/dashboard** – list upcoming/past stays, ability to edit personal info, view invoices, write reviews.
- **Admin dashboard** – occupancy heat‑map, revenue chart, quick edit rooms, manage bookings, view cancellations.
- **Multi‑language switcher** (e.g., English / Spanish) using simple JSON localisation files.
- **Accessibility enhancements** – ARIA labels, focus traps on modals, keyboard‑navigable carousel.
- **SEO & Social** – Open Graph tags on room pages, JSON‑LD schema for “Hotel” and “LodgingReservation”.
- **Cookie‑consent banner** (GDPR) with opt‑out for analytics.
- **Search bar** for rooms (by location, price, amenities).
- **Reviews carousel** on room detail pages.
- **Loyalty / Rewards** placeholder (points accumulate per night).

## 4️⃣ Third‑Party Integrations

- **Payment gateway** – Stripe (or PayPal) SDK for credit‑card processing.
- **Email service** – SendGrid / Mailgun for booking confirmations, cancellation notices, and newsletters.
- **SMS gateway** (optional) – Twilio for check‑in reminders.
- **Analytics** – Google Analytics (or Plausible) + custom event tracking (`booking_success`, `cancellation`).
- **Image CDN** – Cloudinary or Imgix for responsive room photos.
- **Calendar sync** – iCal / Google Calendar export for guests.

## 5️⃣ Security & Compliance Enhancements

- **PCI‑DSS compliance** – Ensure no raw card data hits your server (use Stripe Elements). 
- **GDPR / CCPA** – Data‑deletion endpoint (`DELETE /api/guests/:id`) and privacy policy page.
- **Content‑Security‑Policy** header + strict `X‑Frame‑Options`.
- **Rate limiting** on booking and payment endpoints (already planned).
- **ReCAPTCHA** on public forms (login, booking) to deter bots.
- **TLS/HTTPS** – enforce secure connections in production.

## 6️⃣ DevOps / Deployment

- **Docker Compose** with services:
  - `app` (Node server)
  - `db` (PostgreSQL)
  - `redis` (caching for availability queries)
- **CI pipeline** – lint → unit tests → e2e tests → build Docker image → push to registry.
- **Staging environment** – automatic preview deploy on PRs.
- **Performance monitoring** – NewRelic or Grafana dashboards for response times, booking latency.
- **Error tracking** – Sentry (already in roadmap).

## 7️⃣ Testing Additions

- **Unit tests** for new services (room availability, price calculator).
- **Integration tests** for booking flow (mock Stripe).
- **End‑to‑end tests** with Cypress:
  - Browse rooms → select dates → complete booking → receive email mock.
- **Accessibility audit** with axe‑core.
- **Load testing** (k6) for peak booking periods.

---

### Quick Copy‑Paste Checklist (add to `PROJECT_TODO.md`)

```markdown
- [ ] Implement `rooms`, `bookings`, `payments`, `reviews`, `coupons` collections
- [ ] Add validation for new schemas in `backend/validation.js`
- [ ] Create API routes for rooms, availability, bookings, payments, reviews
- [ ] Build room catalogue UI and detail pages
- [ ] Design booking wizard (date‑picker → room selection → payment)
- [ ] Integrate Stripe (or PayPal) for payments
- [ ] Add email templates + SendGrid integration
- [ ] Implement guest dashboard and admin dashboard
- [ ] Add multilingual JSON files and language switcher
- [ ] Add SEO meta tags, Open Graph, JSON‑LD schema
- [ ] Set up cookie‑consent banner for GDPR
- [ ] Add ARIA labels, keyboard navigation, focus management
- [ ] Write unit & integration tests for new endpoints
- [ ] Write Cypress e2e tests for booking flow
- [ ] Configure Docker Compose (app + PostgreSQL + Redis)
- [ ] Extend CI pipeline with lint, tests, Docker build
- [ ] Set up performance monitoring (NewRelic/Grafana)
- [ ] Add rate limiting & reCAPTCHA on public forms
- [ ] Write privacy policy & data‑deletion endpoint
- [ ] Create reviews system and display carousel
- [ ] Add optional loyalty points feature scaffold
- [ ] Update README with hotel‑specific usage instructions
```

Save this file as **`HOTEL_CONVERSION_CHECKLIST.md`** in the project root for quick reference.
