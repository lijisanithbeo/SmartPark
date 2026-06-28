# SmartPark Brain — Project Knowledge Base

## Project Overview

SmartPark is a full-stack parking management application.

- **Frontend:** React 18 + Vite, TailwindCSS, Radix UI (shadcn components)
- **Backend:** .NET 9 ASP.NET Core Minimal APIs
- **Database:** PostgreSQL via EF Core 9 + Npgsql
- **Auth:** JWT Bearer tokens, BCrypt password hashing
- **Real-time:** SignalR WebSockets
- **Architecture:** Domain → Application → Infrastructure → API (layered)

---

## User Roles

| Role | Login redirects to | Access |
|---|---|---|
| Admin | `/admin` | Full platform management |
| ParkingOwner | `/owner` | Manage their own locations, slots, pricing |
| Customer | `/` (Home) | Search, reserve, view bookings |

---

## Customer Pages — Home vs Find Parking

These two pages look similar but serve different purposes.

### Home (`/`) — Discovery Experience

- Shows **all parking locations** with a **map view** (ParkingMap component)
- Search filters **client-side** — no API call, just filters already-loaded data
- Each location card has two actions:
  - **Navigate** → opens Google Maps dialog with GPS detection
  - **Reserve** → navigates to `/search?locationId=X` (jumps into Find Parking pre-filtered)
- Purpose: **"Where can I park? How do I get there?"**
- No real-time updates, no demand data, no slot detail

### Find Parking (`/search`) — Booking Workflow

- No map — list-focused
- Search hits the **API server-side** (`getLocationsByCity`)
- Shows **live demand badges** (🟢 Low / 🟡 Medium / 🔴 High) and peak pricing alerts
- Uses **SignalR** for real-time slot status updates (no refresh needed)
- Clicking a location → drills into **individual slot view** (slot number, floor, type, Available/Reserved/Maintenance)
- Purpose: **"Which exact slot do I book right now?"**

### The Flow

```
Home (browse map, find a location)
  → Find Parking (see live slots, check demand)
    → Reserve Page /reserve/:slotId (confirm and pay)
```

Home's Reserve button shortcuts directly into Find Parking pre-filtered to that location.

| Feature | Home | Find Parking |
|---|---|---|
| Map | ✅ | ❌ |
| Search type | Client-side filter | Server-side API |
| Demand badges | ❌ | ✅ |
| Real-time updates | ❌ | ✅ SignalR |
| Navigate to parking | ✅ Google Maps | ❌ |
| Slot-level detail | ❌ | ✅ |

---

## Authentication Flow

- Token stored in `localStorage` as `smartpark_user` (JSON with id, token, role, expiresAt etc.)
- Axios interceptor in `api.js` auto-attaches `Authorization: Bearer <token>` to every request
- Token expiry: 24 hours

### Forgot Password Flow (implemented 2026-06-25)

- `POST /api/auth/forgot-password` — always returns 200 (no account enumeration)
- Generates 32-byte CSPRNG token → SHA-256 hashed for DB storage, raw token in email link
- Email sent via SendGrid (free tier) from `noreply@smartpark.com`
- Token expires in 15 minutes, single-use (`UsedAt` stamped on use)
- `POST /api/auth/reset-password` — validates token, updates password (BCrypt), marks token used
- Frontend: `/forgot-password` and `/reset-password` pages (public routes, no auth guard)
- SendGrid API key set via .NET user secrets (`dotnet user-secrets set "SendGrid:ApiKey" "..."`)
- Sender email must be verified in SendGrid dashboard (Single Sender Verification)

---

## Key File Locations

### Backend
| What | Path |
|---|---|
| API endpoints entry | `src/SmartPark.API/Endpoints/AuthEndpoints.cs` |
| Auth service | `src/SmartPark.Application/Services/AuthService.cs` |
| Password reset service | `src/SmartPark.Infrastructure/Services/PasswordResetService.cs` |
| SendGrid email service | `src/SmartPark.Infrastructure/Services/SendGridEmailService.cs` |
| DI registrations (Infrastructure) | `src/SmartPark.Infrastructure/DependencyInjection.cs` |
| DI registrations (Application) | `src/SmartPark.Application/DependencyInjection.cs` |
| DbContext | `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs` |
| EF configs | `src/SmartPark.Infrastructure/Data/Configurations/` |
| App config | `src/SmartPark.API/appsettings.json` |

### Frontend
| What | Path |
|---|---|
| Home (customer) | `frontend/smartpark-ui/src/pages/Customer/Home.jsx` |
| Find Parking | `frontend/smartpark-ui/src/pages/Customer/SearchParking.jsx` |
| Reserve | `frontend/smartpark-ui/src/pages/Customer/ReservationPage.jsx` |
| Forgot Password | `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx` |
| Reset Password | `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx` |
| Auth context | `frontend/smartpark-ui/src/context/AuthContext.jsx` |
| API client + interceptor | `frontend/smartpark-ui/src/services/api.js` |
| Auth service | `frontend/smartpark-ui/src/services/authService.js` |
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

# Set SendGrid API key (dev)
dotnet user-secrets set "SendGrid:ApiKey" "SG.xxx" --project src/SmartPark.API
```

---

## Architecture Decisions

- `PasswordResetService` lives in **Infrastructure** (not Application) — it uses `SmartParkDbContext` directly to avoid adding a new repository layer for a single feature
- `IEmailService` and `IPasswordResetService` interfaces live in **Application** layer (abstraction boundary)
- `POST /api/auth/forgot-password` always returns 200 — intentional security design, prevents account enumeration
- Email is sent **before** the token is saved to DB — if email fails, no orphaned token row is created
- `ForgotPassword.jsx` swallows all API errors and always shows the success message — same security reason
