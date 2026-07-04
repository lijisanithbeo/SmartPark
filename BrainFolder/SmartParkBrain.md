# SmartPark Brain — Project Knowledge Base

## Project Overview

SmartPark is a full-stack parking management application.

- **Frontend:** React 18 + Vite, TailwindCSS, Radix UI (shadcn components)
- **Backend:** .NET 9 ASP.NET Core Minimal APIs
- **Database:** PostgreSQL via EF Core 9 + Npgsql
- **Auth:** JWT Bearer tokens, BCrypt password hashing
- **Real-time:** SignalR WebSockets
- **Maps (in-app):** Leaflet + react-leaflet + OpenStreetMap tiles
- **Maps (navigation):** Google Maps Directions URL — Home page opens new tab, other pages same tab
- **Geocoding:** Nominatim (OpenStreetMap) — free, no API key
- **Architecture:** Domain → Application → Infrastructure → API (layered)

---

## User Roles

| Role | Login redirects to | Access |
|---|---|---|
| Admin | `/admin` | Full platform management |
| ParkingOwner | `/owner` | Manage their own locations, slots, pricing |
| Customer | `/` (Home) | Search, reserve, view bookings |

### Demo Accounts (Seed Data)
| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartpark.com` | `Admin@123` |
| ParkingOwner | `owner@smartpark.com` | `Owner@123` |
| Customer | `customer@smartpark.com` | `Customer@123` |

Additional test accounts use password **`a`** (minimum password length reduced to 1 for demo).

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
| `/owner/gate` | Gate Scanner |
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
  - **Navigate** → opens Google Maps in a **new tab** using device GPS as origin (see Navigation section below)
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
- Reservation confirmation form with Navigate button — BEO Software as origin, text-based destination (null lat/lng) for accurate location name search
- **Vehicle Number is mandatory** (red `*`) — submit blocked with error if empty
- PricingCard shown whenever start date/time and end date/time are all selected (not just when duration > 0)
- End date auto-set to start date if not yet selected; end time auto-advances to start+1h if end ≤ start

### Booking History (`/bookings`)

- Lists all reservations with status (Confirmed / Cancelled / Pending)
- **QR toggle** — fetches and shows QR code on demand (Base64 PNG)
- **Navigate** — opens Google Maps (same tab), BEO Software as origin, text-based destination (null lat/lng) for accurate location name search
- **Cancel** — shadcn ConfirmDialog → cancels reservation, SignalR frees the slot

### My Profile (`/profile`)

- View and edit first name, last name, email, phone number
- TopBar title: **My Profile**

---

## Admin Pages

### Dashboard (`/admin`)
- TopBar title: **Dashboard**
- Page subtitle: **"Platform Overview"** (updated 2026-07-03 — was "Dashboard", caused repeated heading)
- Stats: total users, owners, locations, reservations, platform revenue

---

## Owner Pages

### Dashboard (`/owner`) — Overview

- TopBar title: **Dashboard**
- Page subtitle: **"Your Parking Overview"**
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

### Gate Scanner (`/owner/gate`)
- TopBar title: **Gate Scanner**
- Two tabs: **Entry** (green) and **Exit** (red)
- Operator enters QR code text or plain reservation ID → clicks **Look Up Booking**
- Entry tab: shows booking details + **Confirm Entry** button (if not yet checked in)
- Exit tab: shows live overstay preview (15 min grace, ₹20/15 min block), penalty checkbox, **Confirm Exit** button
- After action: result card with success message + **Scan Next Vehicle** reset button
- Restricted to ParkingOwner role

**Booking status states shown on Gate Scanner:**
| Status | Meaning |
|---|---|
| `Confirmed` | Booked, not yet checked in — Entry allowed |
| `Checked In` | Car is inside — Exit allowed |
| `Checked Out` | Car has already left — shows "This vehicle has already exited" message, no further action |
| `Cancelled` | Booking was cancelled — entry/exit blocked |

### Reservations (`/owner/reservations`) — Overstay columns (updated)
- Added 3 new columns to the reservations table:
  - **Overstay** — duration in minutes (e.g. `15 min`) or `—`
  - **Penalty** — penalty amount (e.g. `₹20`) or `—`
  - **Penalty Status** — `Collected` (blue badge) / `Unpaid` (red badge) or `—`
- Normal reservations show `—` in all three columns

---

## Peak Pricing & Demand Level

### PricingConfig Entity
Each location can have one `PricingConfig` with:
- `NormalRate` — base hourly rate (₹)
- `WeekdayPeakEnabled`, `WeekdayPeakStartHour`, `WeekdayPeakEndHour`, `WeekdayPeakRate`
- `WeekendPeakEnabled`, `WeekendPeakStartHour`, `WeekendPeakEndHour`, `WeekendPeakRate`

**Forum Mall (LocationID=12):** Normal ₹50, Weekday Peak 18:00–23:00 ₹75, Weekend Peak 10:00–22:00 ₹100

### Rate Determination (`PricingService.cs`)
- `DetermineRate(config, startTime)` — converts UTC startTime to local before comparing peak hours
- Peak applies if weekday/weekend flag matches the booking day and hour falls in range

### Demand Level (time-based)
- **High** — booking start time falls within peak hours
- **Medium** — booking start time is within 2 hours before peak start
- **Low** — all other times
- `EstimatePriceAsync` passes booking `startTime` to `CalcDemand` (not current time)
- `GetDemandAsync` passes `DateTime.Now` to `CalcDemand` (current occupancy-display demand)

---

## QR Gate Check-In / Check-Out System

### Flow
`Book → Pay → Get QR Code → ENTRY GATE (check-in scan) → EXIT GATE (check-out scan) → slot freed for next booking`

### QR Code Format
```
SMARTPARK|RES:{reservationId}|SLOT:{slotId}|{startTime:yyyyMMddHHmm}
```
Gate scanner also accepts plain integer reservation ID directly.

### Overstay Billing
- **Grace period:** 15 minutes after `EndTime`
- **Penalty:** ₹20 per 15-minute block after grace period
- **Collection:** At exit gate — attendant shows amount, customer pays cash/UPI, attendant checks "Penalty collected" checkbox before confirming exit

### Reservation Entity — Gate Fields (migration: `AddGateCheckInOut`)
| Column | Type | Description |
|---|---|---|
| `CheckInTime` | `timestamptz?` | Set when entry scan confirmed |
| `CheckOutTime` | `timestamptz?` | Set when exit scan confirmed |
| `OverstayMinutes` | `int` | Total overstay minutes (after grace) |
| `OverstayPenalty` | `decimal` | Total penalty amount in ₹ |
| `OverstayPaid` | `bool` | Whether penalty was collected at gate |

### Physical Occupancy Check
A slot is considered **physically occupied** (blocks new bookings) if:
- `CheckInTime != null` AND `CheckOutTime == null` AND `EndTime <= newBookingStart`
- Applied in both `IsSlotAvailableAsync` (reservation) and `GetAvailableSlotCountAsync` (display)

### Backend Files
| What | Path |
|---|---|
| Gate DTOs | `src/SmartPark.Application/DTOs/Gate/GateDto.cs` |
| IGateService interface | `src/SmartPark.Application/Interfaces/IGateService.cs` |
| GateService implementation | `src/SmartPark.Infrastructure/Services/GateService.cs` |
| Gate API endpoints | `src/SmartPark.API/Endpoints/GateEndpoints.cs` |
| Reservation entity (gate fields) | `src/SmartPark.Domain/Entities/Reservation.cs` |
| EF migration | `src/SmartPark.Infrastructure/Migrations/20260630101038_AddGateCheckInOut.cs` |

**Gate API endpoints** (`/gate`, policy: `AdminOrOwner`):
- `GET /gate/scan?qr=...` — look up booking by QR/ID
- `POST /gate/checkin` — `{ qrPayload }` — record entry
- `POST /gate/checkout` — `{ qrPayload, overstayPaid }` — record exit + calculate penalty

### Frontend Files
| What | Path |
|---|---|
| Gate API client | `frontend/smartpark-ui/src/services/gateService.js` |
| Gate Scanner page | `frontend/smartpark-ui/src/pages/ParkingOwner/GateScannerPage.jsx` |

---

## AI Chatbot (Owner context)

The chatbot (`ChatService.cs`) fetches live DB data and injects it as a system prompt context for Groq (llama-3.3-70b-versatile).

**ParkingOwner context includes:**
- Location occupancy, revenue, booking counts (today / this month / all time)
- Most booked slot
- **Overstay incidents:** total count, penalty collected (₹), penalty uncollected (₹), last 3 overstay cases (customer, slot, duration, penalty, Collected/Unpaid)

---

## Google Maps Navigation

### Home Page Navigate (updated 2026-07-02)
- **New tab** — Home page Navigate button uses `window.open(..., '_blank')` so SmartPark stays open
- **Fixed origin: BEO Software, Palrivattom** — `NAV_ORIGIN` used as starting point on Home page
- **Text-based destination** — lat/lng passed as `null` to `buildMapsUrl`; destination resolved by location name/address text — Google Maps finds well-known landmarks accurately by name (coordinates are NOT used for navigation to avoid pointing to wrong coordinate)

### Other Pages (BookingHistory, ReservationPage, ParkingMap)
- Also use `NAV_ORIGIN = 'BEO Software, Palrivattom'` as fixed origin
- Still use `window.location.href` (same tab)

### How It Works (Home page)
1. Customer clicks Navigate on a parking location card
2. `window.open(url, '_blank')` opens Google Maps in a **new tab**
3. SmartPark remains open in the original tab — no need for Back button
4. URL format:
   ```
   https://www.google.com/maps/dir/?api=1
     &origin=BEO+Software%2C+Palrivattom
     &destination=Oberon+Mall+Parking%2C+MG+Road%2C+Ernakulam%2C+Cochin%2C+India
     &travelmode=driving
   ```

### Destination Coordinates Source
- Stored as `Latitude` / `Longitude` (nullable double) on the `ParkingLocation` entity
- Auto-geocoded via Nominatim when owner saves/updates a location (owner never sees or inputs coordinates)
- **All 10 locations have correct coordinates set** (updated 2026-07-02) — used for in-app Leaflet map markers only; Navigate button always uses text-based name search for accuracy

### GPS Coordinates (set 2026-07-02)
| ID | Location | Latitude | Longitude |
|---|---|---|---|
| 1 | Express Avenue Mall, Chennai | 13.0619 | 80.2762 |
| 2 | Chennai International Airport | 12.9941 | 80.1709 |
| 3 | Lulu, Chennai | 13.0524 | 80.2120 |
| 5 | Phoenix MarketCity, Chennai | 12.9954 | 80.2140 |
| 6 | Lulu Mall Cochin (Edapally) | 10.0265 | 76.3090 |
| 7 | Cochin International Airport | 10.1520 | 76.3920 |
| 8 | Oberon Mall Parking, Cochin | 9.9707 | 76.2911 |
| 9 | Trivandrum Central Station | 8.4883 | 76.9525 |
| 10 | Central Square Mall, Cochin | 10.0034 | 76.2999 |
| 12 | Forum Mall, Cochin (Thevara) | 9.9373 | 76.2902 |

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

### Forgot Password Flow (updated 2026-07-02)

**Current implementation — direct redirect (no email, no intermediate screen):**
- `POST /api/auth/forgot-password` — generates 32-byte CSPRNG token → SHA-256 hashed for DB storage
- Raw token returned directly in the API response as `{ resetUrl }` — no email sent
- Token expires in 15 minutes, single-use (`UsedAt` stamped on use)
- `POST /api/auth/reset-password` — validates token, updates password (BCrypt), marks token used
- Minimum password length: **1 character** (reduced from 8 for demo)
- `ForgotPassword.jsx` — after submitting email, **redirects directly** to reset password page via `window.location.href = data.resetUrl` (no intermediate "Reset link ready" screen)
- Button label: **"Get Reset Link"**

> **Note:** SendGrid integration exists in the codebase (`SendGridEmailService.cs`) but is not used in the current reset flow. The `IPasswordResetService` returns `resetUrl` directly. This was changed to avoid email dependency during demo/testing.

---

## Key File Locations

### Backend
| What | Path |
|---|---|
| API endpoints entry | `src/SmartPark.API/Endpoints/AuthEndpoints.cs` |
| Gate endpoints | `src/SmartPark.API/Endpoints/GateEndpoints.cs` |
| Auth service | `src/SmartPark.Application/Services/AuthService.cs` |
| Password reset service | `src/SmartPark.Infrastructure/Services/PasswordResetService.cs` |
| Parking location service | `src/SmartPark.Application/Services/ParkingLocationService.cs` |
| Reservation service | `src/SmartPark.Application/Services/ReservationService.cs` |
| Pricing service (peak + demand) | `src/SmartPark.Infrastructure/Services/PricingService.cs` |
| Gate service | `src/SmartPark.Infrastructure/Services/GateService.cs` |
| Chat service (AI chatbot) | `src/SmartPark.Infrastructure/Services/ChatService.cs` |
| Owner service | `src/SmartPark.Application/Services/OwnerService.cs` |
| Reservation entity (gate fields) | `src/SmartPark.Domain/Entities/Reservation.cs` |
| ParkingLocation entity | `src/SmartPark.Domain/Entities/ParkingLocation.cs` |
| IGateService | `src/SmartPark.Application/Interfaces/IGateService.cs` |
| Gate DTOs | `src/SmartPark.Application/DTOs/Gate/GateDto.cs` |
| Owner reservation DTO | `src/SmartPark.Application/DTOs/Owner/OwnerReservationDto.cs` |
| DTOs (location) | `src/SmartPark.Application/DTOs/ParkingLocation/` |
| DTOs (reservation) | `src/SmartPark.Application/DTOs/Reservation/ReservationDto.cs` |
| EF migration (lat/lng) | `src/SmartPark.Infrastructure/Migrations/20260626055601_AddLatLngToParkingLocation.cs` |
| EF migration (gate fields) | `src/SmartPark.Infrastructure/Migrations/20260630101038_AddGateCheckInOut.cs` |
| DI registrations (Infrastructure) | `src/SmartPark.Infrastructure/DependencyInjection.cs` |
| DI registrations (Application) | `src/SmartPark.Application/DependencyInjection.cs` |
| DbContext | `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs` |
| App config | `src/SmartPark.API/appsettings.json` |
| App config (secrets, gitignored) | `src/SmartPark.API/appsettings.Development.json` |

### Frontend
| What | Path |
|---|---|
| App layout + TopBar titles | `frontend/smartpark-ui/src/components/Layout/AppLayout.jsx` |
| Sidebar nav items | `frontend/smartpark-ui/src/components/Layout/Sidebar.jsx` |
| App routes | `frontend/smartpark-ui/src/App.jsx` |
| Geolocation utils + NAV_ORIGIN | `frontend/smartpark-ui/src/lib/geolocation.js` |
| Home (customer) | `frontend/smartpark-ui/src/pages/Customer/Home.jsx` |
| Reservation page | `frontend/smartpark-ui/src/pages/Customer/ReservationPage.jsx` |
| Booking history | `frontend/smartpark-ui/src/pages/Customer/BookingHistory.jsx` |
| Profile page | `frontend/smartpark-ui/src/pages/Profile.jsx` |
| Owner dashboard | `frontend/smartpark-ui/src/pages/ParkingOwner/Dashboard.jsx` |
| Manage locations (owner) | `frontend/smartpark-ui/src/pages/ParkingOwner/ManageLocations.jsx` |
| Owner reservations (+ overstay cols) | `frontend/smartpark-ui/src/pages/ParkingOwner/OwnerReservations.jsx` |
| Owner pricing config | `frontend/smartpark-ui/src/pages/ParkingOwner/OwnerPricingConfig.jsx` |
| Gate Scanner page | `frontend/smartpark-ui/src/pages/ParkingOwner/GateScannerPage.jsx` |
| Parking map (Leaflet) | `frontend/smartpark-ui/src/components/Map/ParkingMap.jsx` |
| MiniMap (Leaflet) | `frontend/smartpark-ui/src/components/Map/MiniMap.jsx` |
| Forgot password | `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx` |
| Reset password | `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx` |
| Auth context | `frontend/smartpark-ui/src/context/AuthContext.jsx` |
| API client + interceptor | `frontend/smartpark-ui/src/services/api.js` |
| Gate API client | `frontend/smartpark-ui/src/services/gateService.js` |

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

# Kill Vite process if port 5173 is already in use (PowerShell)
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# One-click startup script (kills both ports, starts API + frontend in separate windows)
# Double-click: G:\ACloude\Project\SmartPark\StartSmartPark.bat
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
- Home page Navigate uses `window.open(..., '_blank')` — new tab keeps SmartPark open; other pages (BookingHistory, ReservationPage, ParkingMap) still use same-tab navigation
- All pages use `NAV_ORIGIN = 'BEO Software, Palrivattom'` as fixed starting point
- Home page Navigate passes `null` for lat/lng to `buildMapsUrl` — forces text-based name search which is more accurate than coordinates for well-known landmarks
- DB coordinates are used only for Leaflet in-app map markers, not for Google Maps navigation
- Map fly speed set to `duration: 1.0` (was 1.5) in `ParkingMap.jsx` — faster city search animation
- `StartSmartPark.bat` in project root — double-click to kill ports 5000/5173 and start both servers cleanly
- Vite `strictPort: true` in `vite.config.js` — always uses port 5173, never falls back to 5174+; if 5173 is occupied kill the old process first
