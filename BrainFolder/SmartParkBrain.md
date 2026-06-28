# SmartPark Brain — Project Knowledge Base

## Project Overview

SmartPark is a full-stack parking management application.

- **Frontend:** React 18 + Vite, TailwindCSS, Radix UI (shadcn components)
- **Backend:** .NET 9 ASP.NET Core Minimal APIs
- **Database:** PostgreSQL via EF Core 9 + Npgsql
- **Auth:** JWT Bearer tokens, BCrypt password hashing
- **Real-time:** SignalR WebSockets
- **Maps (in-app):** Leaflet + react-leaflet + OpenStreetMap tiles
- **Maps (navigation):** Google Maps Directions URL (same-tab navigation)
- **Geocoding:** Nominatim (OpenStreetMap) — free, no API key
- **Architecture:** Domain → Application → Infrastructure → API (layered)

---

## User Roles

| Role | Login redirects to | Access |
|---|---|---|
| Admin | `/admin` | Full platform management |
| ParkingOwner | `/owner` | Manage their own locations, slots, pricing |
| Customer | `/` (Home) | Search, reserve, view bookings |

### Demo Accounts
All 12 test accounts (admin + owners + customers) use password **`a`** (minimum password length reduced to 1 for demo).

---

## Page Title Convention (updated 2026-06-28)

**Rule:** The TopBar (`AppLayout.jsx`) is the single source of the page title — no page component renders its own `<h2>` title. Every page only shows a subtitle/description line below the TopBar.

### ROUTE_TITLES map (`AppLayout.jsx`)

| Route | TopBar title |
|---|---|
| `/admin` | Dashboard |
| `/admin/users` | Manage Users |
| `/admin/owners` | Manage Owners |
| `/admin/analytics` | Analytics |
| `/owner` | Dashboard |
| `/owner/locations` | Locations |
| `/owner/slots` | Parking Slots |
| `/owner/reservations` | Reservations |
| `/owner/pricing` | Pricing Configuration |
| `/` | Find Parking |
| `/search` (no locationId) | Find a Location |
| `/search?locationId=X` | Select a Slot |
| `/reserve/:slotId` | Reserve a Slot |
| `/bookings` | My Bookings |
| `/profile` | My Profile |

Dynamic title logic lives in `getRouteTitle(pathname, search)` in `AppLayout.jsx` — checks `/reserve/` prefix and `locationId` query param for the two `/search` views.

---

## Customer Pages

### Home (`/`) — Discovery + Browse

- Shows **all parking locations** with a **Leaflet map** (ParkingMap component)
- Search filters client-side — also calls Nominatim to fly the map to the searched city
- Each location card (shadcn Card + Badge) shows: name, address, available slots (live via SignalR)
- Two actions per card:
  - **Navigate** → opens Google Maps in same tab (see Navigation section below)
  - **Reserve** → navigates to `/search?locationId=X`

### Find a Location (`/search`) — Location List

- TopBar title: **Find a Location**
- Lists all parking locations filtered by search query

### Select a Slot (`/search?locationId=X`) — Booking Workflow

- TopBar title: **Select a Slot**
- MiniMap (Leaflet) shows exact parking location using stored GPS coordinates from DB
- Live slot grid — green (available), red (occupied), blue (selected) — updates via SignalR in real time
- Time picker (15-minute intervals), duration calculation, pricing panel
- Peak hour pricing: SignalR `PeakHourChanged` event switches rate automatically when occupancy > 70%
- On confirmation: reservation created in PostgreSQL, QR code generated and displayed

### Reserve a Slot (`/reserve/:slotId`)

- TopBar title: **Reserve a Slot**
- Reservation confirmation form with Navigate button

### Booking History (`/bookings`)

- Lists all reservations with status (Confirmed / Cancelled / Pending)
- **QR toggle** — fetches and shows QR code on demand (Base64 PNG)
- **Navigate** — same Google Maps flow as Home
- **Cancel** — shadcn ConfirmDialog → cancels reservation, SignalR frees the slot

### My Profile (`/profile`)

- View and edit first name, last name, email, phone number
- TopBar title: **My Profile**

---

## Owner Pages

### Dashboard (`/owner`) — Overview

- TopBar title: **Dashboard**
- Page subtitle: **"Your Parking Overview"** (changed from "Manage your parking infrastructure" on 2026-06-28)
- Stats cards: Total Locations, Total Slots, Available Slots, Active Reservations, Today's Revenue, Monthly Revenue, Total Revenue
- Quick Actions: My Locations, My Slots, Reservations

### Locations (`/owner/locations`)
- Add, edit, delete parking locations
- Geocoding happens automatically via Nominatim on save

### Slots (`/owner/slots`)
- Add and monitor parking slots per location

### Reservations (`/owner/reservations`)
- View all customer reservations across owner's locations
- TopBar title: **Reservations**

### Pricing (`/owner/pricing`)
- Set base rate and peak hour pricing per location
- TopBar title: **Pricing Configuration**

---

## Google Maps Navigation

### Fixed Origin (as of 2026-06-27)
Navigation always starts from **BEO Software, Palrivattom** — hardcoded as `NAV_ORIGIN` constant in `geolocation.js`.

### How It Works
1. Customer clicks Navigate on any parking location card / map popup / booking history card
2. `window.location.href` navigates the **current tab** to Google Maps Directions URL
3. Browser Back button returns the customer to SmartPark
4. URL format:
   ```
   https://www.google.com/maps/dir/?api=1
     &origin=BEO+Software%2C+Palrivattom
     &destination=LAT,LNG          ← stored GPS coordinates (comma NOT encoded)
     &travelmode=driving
   ```

### Destination Coordinates Source
- Stored as `Latitude` / `Longitude` (nullable double) on the `ParkingLocation` entity
- Auto-geocoded via Nominatim when owner saves/updates a location (owner never sees or inputs coordinates)
- If coordinates are null (older locations), destination falls back to encoded address text

### Key Files
| What | Path |
|---|---|
| `NAV_ORIGIN` constant + `buildMapsUrl` | `frontend/smartpark-ui/src/lib/geolocation.js` |
| Navigate handler (Home) | `frontend/smartpark-ui/src/pages/Customer/Home.jsx` |
| Navigate handler (Booking History) | `frontend/smartpark-ui/src/pages/Customer/BookingHistory.jsx` |
| NavigateBtn (Reservation Page) | `frontend/smartpark-ui/src/pages/Customer/ReservationPage.jsx` |
| NavigateButton (Leaflet popup) | `frontend/smartpark-ui/src/components/Map/ParkingMap.jsx` |

---

## Auto-Geocoding (Owner saves location)

When a parking owner saves a new or updated location:
1. Frontend calls Nominatim:
   ```
   GET nominatim.openstreetmap.org/search?q=LocationName, Address, City, India&format=json&limit=1
   ```
2. Returns `{ lat, lng }` — included in the create/update request body
3. Backend saves `Latitude` and `Longitude` to the `ParkingLocations` table
4. Owner never sees coordinate fields — geocoding happens silently in the "Saving…" spinner

**EF Core Migration:** `AddLatLngToParkingLocation` (2026-06-26) — adds nullable `double precision` columns.

---

## Authentication Flow

- Token stored in `localStorage` as `smartpark_user` (JSON with id, token, role, expiresAt)
- Axios interceptor in `api.js` auto-attaches `Authorization: Bearer <token>` to every request
- Token expiry: 24 hours

### Forgot Password Flow (updated 2026-06-27)

**Current implementation — on-screen reset link (no email):**
- `POST /api/auth/forgot-password` — generates 32-byte CSPRNG token → SHA-256 hashed for DB storage
- Raw token returned directly in the API response as `{ resetUrl }` — displayed on screen, no email sent
- Token expires in 15 minutes, single-use (`UsedAt` stamped on use)
- `POST /api/auth/reset-password` — validates token, updates password (BCrypt), marks token used
- Minimum password length: **1 character** (reduced from 8 for demo)
- `ForgotPassword.jsx` displays the reset URL on screen after submission

> **Note:** SendGrid integration exists in the codebase (`SendGridEmailService.cs`) but is not used in the current reset flow. The `IPasswordResetService` returns `resetUrl` directly. This was changed to avoid email dependency during demo/testing.

---

## Key File Locations

### Backend
| What | Path |
|---|---|
| API endpoints entry | `src/SmartPark.API/Endpoints/AuthEndpoints.cs` |
| Auth service | `src/SmartPark.Application/Services/AuthService.cs` |
| Password reset service | `src/SmartPark.Infrastructure/Services/PasswordResetService.cs` |
| Parking location service | `src/SmartPark.Application/Services/ParkingLocationService.cs` |
| Reservation service | `src/SmartPark.Application/Services/ReservationService.cs` |
| ParkingLocation entity | `src/SmartPark.Domain/Entities/ParkingLocation.cs` |
| DTOs (location) | `src/SmartPark.Application/DTOs/ParkingLocation/` |
| DTOs (reservation) | `src/SmartPark.Application/DTOs/Reservation/ReservationDto.cs` |
| EF migration (lat/lng) | `src/SmartPark.Infrastructure/Migrations/20260626055601_AddLatLngToParkingLocation.cs` |
| DI registrations (Infrastructure) | `src/SmartPark.Infrastructure/DependencyInjection.cs` |
| DI registrations (Application) | `src/SmartPark.Application/DependencyInjection.cs` |
| DbContext | `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs` |
| App config | `src/SmartPark.API/appsettings.json` |

### Frontend
| What | Path |
|---|---|
| App layout + TopBar titles | `frontend/smartpark-ui/src/components/Layout/AppLayout.jsx` |
| Geolocation utils + NAV_ORIGIN | `frontend/smartpark-ui/src/lib/geolocation.js` |
| Home (customer) | `frontend/smartpark-ui/src/pages/Customer/Home.jsx` |
| Reservation page | `frontend/smartpark-ui/src/pages/Customer/ReservationPage.jsx` |
| Booking history | `frontend/smartpark-ui/src/pages/Customer/BookingHistory.jsx` |
| Profile page | `frontend/smartpark-ui/src/pages/Profile.jsx` |
| Owner dashboard | `frontend/smartpark-ui/src/pages/ParkingOwner/Dashboard.jsx` |
| Manage locations (owner) | `frontend/smartpark-ui/src/pages/ParkingOwner/ManageLocations.jsx` |
| Owner reservations | `frontend/smartpark-ui/src/pages/ParkingOwner/OwnerReservations.jsx` |
| Owner pricing config | `frontend/smartpark-ui/src/pages/ParkingOwner/OwnerPricingConfig.jsx` |
| Parking map (Leaflet) | `frontend/smartpark-ui/src/components/Map/ParkingMap.jsx` |
| MiniMap (Leaflet) | `frontend/smartpark-ui/src/components/Map/MiniMap.jsx` |
| Forgot password | `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx` |
| Reset password | `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx` |
| Auth context | `frontend/smartpark-ui/src/context/AuthContext.jsx` |
| API client + interceptor | `frontend/smartpark-ui/src/services/api.js` |
| App routes | `frontend/smartpark-ui/src/App.jsx` |

---

## Dev Commands

```bash
# Run API (from SmartPark root)
dotnet run --project src/SmartPark.API

# Run frontend
cd frontend/smartpark-ui && npm run dev

# EF Core migration
dotnet ef migrations add <Name> --project src/SmartPark.Infrastructure --startup-project src/SmartPark.API
dotnet ef database update --project src/SmartPark.Infrastructure --startup-project src/SmartPark.API

# Kill API process if port 5000 is locked during rebuild (PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -State Listen).OwningProcess -Force
```

---

## Architecture Decisions

- `PasswordResetService` lives in **Infrastructure** (not Application) — uses `SmartParkDbContext` directly to avoid adding a new repository layer for a single feature
- `IEmailService` and `IPasswordResetService` interfaces live in **Application** layer (abstraction boundary)
- `POST /api/auth/forgot-password` always returns 200 — prevents account enumeration
- Geocoding (Nominatim) is done on the **frontend** before saving — keeps backend simple, no external HTTP calls from API server
- GPS coordinates stored as nullable doubles — null means location was created before auto-geocoding was added; navigation falls back to text address
- `NAV_ORIGIN` is a single constant in `geolocation.js` — change one line to switch the navigation starting point
- `buildMapsUrl` always produces a `/dir/` (directions) URL — never a `/search/` URL, even without an origin parameter
- Same-tab navigation (`window.location.href`) chosen over `window.open` — avoids popup blockers, browser Back button returns to app
