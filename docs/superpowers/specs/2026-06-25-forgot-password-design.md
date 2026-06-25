# Forgot Password — Design Spec

**Date:** 2026-06-25
**Feature:** Forgot Password / Password Reset via SendGrid email
**Status:** Approved

---

## Overview

Add a self-service forgot password flow to SmartPark. Users who cannot remember their password can request a reset link via email. The link contains a short-lived token; clicking it opens a page where they set a new password.

---

## End-to-End Flow

1. User visits `/login`, clicks "Forgot password?" link below the password field.
2. User lands on `/forgot-password`, enters their email address.
3. Frontend calls `POST /api/auth/forgot-password` with `{ email }`.
4. Backend:
   - Looks up user by email.
   - If found: generates a 32-byte cryptographically random token (raw).
   - Hashes the raw token with SHA-256; stores the hash in `PasswordResetTokens`.
   - Builds reset URL: `{App:FrontendBaseUrl}/reset-password?token={rawToken}`.
   - Sends email via SendGrid from `noreply@smartpark.com`.
   - **Always returns HTTP 200** regardless of whether the email is registered (prevents account enumeration).
5. User receives the email, clicks the reset link.
6. User lands on `/reset-password?token=xxx`, enters new password and confirmation.
7. Frontend calls `POST /api/auth/reset-password` with `{ token, newPassword }`.
8. Backend:
   - SHA-256 hashes the incoming token.
   - Looks up a matching row: `HashedToken` matches AND `ExpiresAt > now` AND `UsedAt IS NULL`.
   - If valid: BCrypt-hashes the new password, updates the user record, sets `UsedAt = now` on the token row.
   - Returns HTTP 200 on success, HTTP 400 with error message on invalid/expired token.
9. Frontend shows a success message and auto-redirects to `/login` after 3 seconds.

---

## Database

### New Table: `PasswordResetTokens`

| Column | Type | Notes |
|---|---|---|
| `Id` | UUID, PK | `gen_random_uuid()` |
| `UserId` | UUID, FK → Users(Id) | `ON DELETE CASCADE` |
| `HashedToken` | VARCHAR(64) | SHA-256 hex of raw token; indexed |
| `ExpiresAt` | TIMESTAMP | `CreatedAt + 15 minutes` |
| `UsedAt` | TIMESTAMP? | NULL = unused; set on successful reset |
| `CreatedAt` | TIMESTAMP | `DEFAULT now()` |

Index on `HashedToken` for fast lookup at reset time.

The raw token is never persisted — it lives only in the email link.

---

## Backend

### New Domain Entity

`SmartPark.Domain/Entities/PasswordResetToken.cs`
- Properties: `Id`, `UserId`, `HashedToken`, `ExpiresAt`, `UsedAt`, `CreatedAt`
- Navigation: `User`

### New Service

`SmartPark.Application/Services/PasswordResetService.cs` implementing `IPasswordResetService`:

```csharp
Task SendResetEmailAsync(string email);
Task<bool> ResetPasswordAsync(string token, string newPassword);
```

**`SendResetEmailAsync`:**
- Resolve user by email; if not found, return silently (no exception, no leak).
- Generate `RandomNumberGenerator.GetBytes(32)` → hex string (raw token).
- SHA-256 hash the raw token → store as `HashedToken`.
- Persist new `PasswordResetToken` row with `ExpiresAt = UtcNow + 15 min`.
- Call `IEmailService.SendPasswordResetEmailAsync(user.Email, resetUrl)`.

**`ResetPasswordAsync`:**
- SHA-256 hash the incoming token.
- Query `PasswordResetTokens` where `HashedToken` matches, `ExpiresAt > UtcNow`, `UsedAt IS NULL`.
- If no match: return `false`.
- BCrypt-hash `newPassword`; update `User.PasswordHash`.
- Set `token.UsedAt = UtcNow`; save changes.
- Return `true`.

### New Email Service

`SmartPark.Infrastructure/Services/SendGridEmailService.cs` implementing `IEmailService`:

```csharp
Task SendPasswordResetEmailAsync(string toEmail, string resetUrl);
```

- Uses `SendGrid` NuGet package (`Twilio.SendGrid` or `SendGrid`).
- Reads `SendGrid:ApiKey`, `SendGrid:SenderEmail`, `SendGrid:SenderName` from config.
- Sends a plain-text + basic HTML email containing the reset URL.
- Email subject: "Reset your SmartPark password"

### New API Endpoints

Added to `SmartPark.API/Endpoints/AuthEndpoints.cs`:

**`POST /api/auth/forgot-password`**
- Request body: `{ email: string }`
- Always responds `200 OK` with `{ message: "If that email is registered, a reset link has been sent." }`

**`POST /api/auth/reset-password`**
- Request body: `{ token: string, newPassword: string }`
- Success: `200 OK` with `{ message: "Password reset successfully." }`
- Failure: `400 Bad Request` with `{ error: "Reset link is invalid or has expired." }`

Both endpoints are public (no `[Authorize]`).

### New Configuration (`appsettings.json`)

```json
"SendGrid": {
  "ApiKey": "",
  "SenderEmail": "noreply@smartpark.com",
  "SenderName": "SmartPark"
},
"App": {
  "FrontendBaseUrl": "http://localhost:5173"
}
```

`ApiKey` is left blank in source; set via environment variable or user secrets in development and environment config in production.

### NuGet Package

Add `SendGrid` to `SmartPark.Infrastructure.csproj`.

### EF Core Migration

New migration: `AddPasswordResetTokens`
- Adds `PasswordResetTokens` table with index on `HashedToken`.
- Registers `DbSet<PasswordResetToken>` in `SmartParkDbContext`.

### DI Registration

In `Program.cs`:
- Register `IEmailService` → `SendGridEmailService` (singleton or scoped).
- Register `IPasswordResetService` → `PasswordResetService` (scoped).

---

## Frontend

### New Pages

**`src/pages/Auth/ForgotPassword.jsx`** (route: `/forgot-password`)

- Single email input field.
- Submit button with loading spinner while request is in flight.
- Three UI states:
  - **Idle**: form visible.
  - **Loading**: button disabled, spinner shown.
  - **Success**: form replaced with message — "Check your inbox. If that email is registered, a reset link is on its way." — plus a "Back to login" link.
- "Back to login" link always visible.
- No error state that reveals whether the email exists.

**`src/pages/Auth/ResetPassword.jsx`** (route: `/reset-password`)

- Reads `?token` from `useSearchParams()`.
- If no token in URL: shows "Invalid reset link" with a link to `/forgot-password`.
- Two password inputs: "New password" and "Confirm new password".
- Client-side validation: minimum 8 characters; passwords must match.
- Three UI states:
  - **Idle**: form visible.
  - **Loading**: button disabled, spinner shown.
  - **Success**: "Your password has been reset." message + auto-redirect to `/login` after 3 seconds.
  - **Error**: "This reset link is invalid or has expired." with a link to `/forgot-password`.

### Route Updates (`App.jsx`)

Add two public routes (no auth guard):
```jsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

### Login Page Update (`Login.jsx`)

Add "Forgot password?" link below the password input field, linking to `/forgot-password`. Style consistent with existing UI (small, muted text link).

### Auth Service Update (`src/services/authService.js`)

```js
forgotPassword(email)      // POST /api/auth/forgot-password
resetPassword(token, newPassword)  // POST /api/auth/reset-password
```

---

## Security Notes

- Raw token is never stored — only its SHA-256 hash is persisted.
- `POST /api/auth/forgot-password` always returns 200 to prevent account enumeration.
- Tokens expire after 15 minutes.
- Tokens are single-use: `UsedAt` is set on first successful reset.
- `ON DELETE CASCADE` on `UserId` ensures orphaned tokens are cleaned up if a user is deleted.
- `newPassword` is validated server-side (minimum length) before hashing.

---

## Out of Scope

- Email template styling beyond basic HTML (no inline CSS branding).
- Token cleanup job (expired/used tokens accumulate; a future background job can purge them).
- Rate limiting on `/api/auth/forgot-password` (future hardening).
- Multi-language email content.
