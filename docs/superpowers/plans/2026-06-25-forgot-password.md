# Forgot Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-service forgot password flow — email entry → SendGrid reset link → token-validated password change.

**Architecture:** A `PasswordResetToken` entity stores SHA-256-hashed tokens (raw token only in the email link). `PasswordResetService` lives in Infrastructure and hits `SmartParkDbContext` directly (no UoW extension needed). Two new public API endpoints and two new React pages complete the flow.

**Tech Stack:** .NET 9 / ASP.NET Core Minimal APIs, EF Core 9 + Npgsql, SendGrid NuGet, React 18 + React Router v6, Axios, TailwindCSS + Radix UI / shadcn.

## Global Constraints

- All .NET files target `net9.0` with `<Nullable>enable</Nullable>` and `<ImplicitUsings>enable</ImplicitUsings>`
- Follow existing naming: `IXxxService` interfaces in `SmartPark.Application/Interfaces/`, implementations in `SmartPark.Infrastructure/Services/`, EF configs in `SmartPark.Infrastructure/Data/Configurations/`
- `User.ID` is `int` — all FKs to Users use `int`, not Guid
- Token expiry: exactly 15 minutes (`DateTime.UtcNow.AddMinutes(15)`)
- `POST /api/auth/forgot-password` always returns HTTP 200 regardless of email existence (security: no account enumeration)
- Frontend components match existing Login.jsx style: same Card/Input/Button/Loader2 imports, same gradient background class
- No test project exists in this repo — each task ends with a build/smoke-test verification step instead

---

## File Map

**Create:**
- `src/SmartPark.Domain/Entities/PasswordResetToken.cs` — domain entity
- `src/SmartPark.Infrastructure/Data/Configurations/PasswordResetTokenConfiguration.cs` — EF fluent config
- `src/SmartPark.Application/Interfaces/IEmailService.cs` — email abstraction
- `src/SmartPark.Application/Interfaces/IPasswordResetService.cs` — reset abstraction
- `src/SmartPark.Application/DTOs/Auth/ForgotPasswordRequest.cs` — request record
- `src/SmartPark.Application/DTOs/Auth/ResetPasswordRequest.cs` — request record
- `src/SmartPark.Infrastructure/Options/SendGridOptions.cs` — typed config
- `src/SmartPark.Infrastructure/Options/AppOptions.cs` — typed config
- `src/SmartPark.Infrastructure/Services/SendGridEmailService.cs` — SendGrid implementation
- `src/SmartPark.Infrastructure/Services/PasswordResetService.cs` — reset logic
- `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx` — email entry page
- `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx` — new password page

**Modify:**
- `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs` — add `DbSet<PasswordResetToken>` + apply config
- `src/SmartPark.Infrastructure/DependencyInjection.cs` — register new services
- `src/SmartPark.Infrastructure/SmartPark.Infrastructure.csproj` — add SendGrid package
- `src/SmartPark.API/appsettings.json` — add SendGrid + App config sections
- `src/SmartPark.API/Endpoints/AuthEndpoints.cs` — add two public endpoints
- `frontend/smartpark-ui/src/services/authService.js` — add forgotPassword + resetPassword
- `frontend/smartpark-ui/src/App.jsx` — add two public routes
- `frontend/smartpark-ui/src/pages/Auth/Login.jsx` — add "Forgot password?" link

---

## Task 1: PasswordResetToken entity and database migration

**Files:**
- Create: `src/SmartPark.Domain/Entities/PasswordResetToken.cs`
- Create: `src/SmartPark.Infrastructure/Data/Configurations/PasswordResetTokenConfiguration.cs`
- Modify: `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs`

**Interfaces:**
- Produces: `PasswordResetToken` entity with `Id (int)`, `UserId (int)`, `HashedToken (string)`, `ExpiresAt (DateTime)`, `UsedAt (DateTime?)`, `CreatedAt (DateTime)`, `User` nav property — used by Task 3

- [ ] **Step 1: Create the domain entity**

  Create `src/SmartPark.Domain/Entities/PasswordResetToken.cs`:

  ```csharp
  namespace SmartPark.Domain.Entities;

  public class PasswordResetToken
  {
      public int Id { get; set; }
      public int UserId { get; set; }
      public string HashedToken { get; set; } = string.Empty;
      public DateTime ExpiresAt { get; set; }
      public DateTime? UsedAt { get; set; }
      public DateTime CreatedAt { get; set; }

      public User User { get; set; } = null!;
  }
  ```

- [ ] **Step 2: Create the EF Core configuration**

  Create `src/SmartPark.Infrastructure/Data/Configurations/PasswordResetTokenConfiguration.cs`:

  ```csharp
  using Microsoft.EntityFrameworkCore;
  using Microsoft.EntityFrameworkCore.Metadata.Builders;
  using SmartPark.Domain.Entities;

  namespace SmartPark.Infrastructure.Data.Configurations;

  public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
  {
      public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
      {
          builder.HasKey(t => t.Id);

          builder.Property(t => t.HashedToken)
              .HasMaxLength(64)
              .IsRequired();

          builder.HasIndex(t => t.HashedToken);

          builder.Property(t => t.ExpiresAt).IsRequired();

          builder.Property(t => t.CreatedAt)
              .HasDefaultValueSql("now()");

          builder.HasOne(t => t.User)
              .WithMany()
              .HasForeignKey(t => t.UserId)
              .OnDelete(DeleteBehavior.Cascade);
      }
  }
  ```

- [ ] **Step 3: Register the entity in DbContext**

  Open `src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs`. Add one `DbSet` property and one `ApplyConfiguration` call, matching the existing pattern:

  After the last existing `DbSet` line (currently `public DbSet<PricingConfig> PricingConfigs => Set<PricingConfig>();`), add:
  ```csharp
  public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
  ```

  After the last `modelBuilder.ApplyConfiguration(...)` call in `OnModelCreating`, add:
  ```csharp
  modelBuilder.ApplyConfiguration(new PasswordResetTokenConfiguration());
  ```

- [ ] **Step 4: Verify the project builds**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet build src/SmartPark.Infrastructure/SmartPark.Infrastructure.csproj
  ```
  Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 5: Generate and apply the EF Core migration**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet ef migrations add AddPasswordResetTokens --project src/SmartPark.Infrastructure --startup-project src/SmartPark.API
  dotnet ef database update --project src/SmartPark.Infrastructure --startup-project src/SmartPark.API
  ```
  Expected: migration file created under `src/SmartPark.Infrastructure/Migrations/`, then `Done.` from the update command.

  Verify the table exists:
  ```
  psql -U postgres -d SmartParkDb -c "\d password_reset_tokens"
  ```
  Expected: table with columns `id`, `user_id`, `hashed_token`, `expires_at`, `used_at`, `created_at` and an index on `hashed_token`.

- [ ] **Step 6: Commit**

  ```
  git add src/SmartPark.Domain/Entities/PasswordResetToken.cs
  git add src/SmartPark.Infrastructure/Data/Configurations/PasswordResetTokenConfiguration.cs
  git add src/SmartPark.Infrastructure/Data/SmartParkDbContext.cs
  git add src/SmartPark.Infrastructure/Migrations/
  git commit -m "feat: add PasswordResetToken entity and migration"
  ```

---

## Task 2: SendGrid email service

**Files:**
- Create: `src/SmartPark.Infrastructure/Options/SendGridOptions.cs`
- Create: `src/SmartPark.Infrastructure/Options/AppOptions.cs`
- Create: `src/SmartPark.Application/Interfaces/IEmailService.cs`
- Create: `src/SmartPark.Infrastructure/Services/SendGridEmailService.cs`
- Modify: `src/SmartPark.Infrastructure/SmartPark.Infrastructure.csproj`
- Modify: `src/SmartPark.API/appsettings.json`
- Modify: `src/SmartPark.Infrastructure/DependencyInjection.cs`

**Interfaces:**
- Produces: `IEmailService.SendPasswordResetEmailAsync(string toEmail, string resetUrl)` — consumed by Task 3's `PasswordResetService`

- [ ] **Step 1: Add the SendGrid NuGet package**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet add src/SmartPark.Infrastructure/SmartPark.Infrastructure.csproj package SendGrid
  ```
  Expected: `PackageReference` for `SendGrid` appears in the `.csproj` file.

- [ ] **Step 2: Create SendGridOptions**

  Create `src/SmartPark.Infrastructure/Options/SendGridOptions.cs`:

  ```csharp
  namespace SmartPark.Infrastructure.Options;

  public class SendGridOptions
  {
      public string ApiKey { get; set; } = string.Empty;
      public string SenderEmail { get; set; } = string.Empty;
      public string SenderName { get; set; } = string.Empty;
  }
  ```

- [ ] **Step 3: Create AppOptions**

  Create `src/SmartPark.Infrastructure/Options/AppOptions.cs`:

  ```csharp
  namespace SmartPark.Infrastructure.Options;

  public class AppOptions
  {
      public string FrontendBaseUrl { get; set; } = string.Empty;
  }
  ```

- [ ] **Step 4: Create IEmailService interface**

  Create `src/SmartPark.Application/Interfaces/IEmailService.cs`:

  ```csharp
  namespace SmartPark.Application.Interfaces;

  public interface IEmailService
  {
      Task SendPasswordResetEmailAsync(string toEmail, string resetUrl);
  }
  ```

- [ ] **Step 5: Create SendGridEmailService**

  Create `src/SmartPark.Infrastructure/Services/SendGridEmailService.cs`:

  ```csharp
  using Microsoft.Extensions.Options;
  using SendGrid;
  using SendGrid.Helpers.Mail;
  using SmartPark.Application.Interfaces;
  using SmartPark.Infrastructure.Options;

  namespace SmartPark.Infrastructure.Services;

  public class SendGridEmailService : IEmailService
  {
      private readonly SendGridOptions _options;

      public SendGridEmailService(IOptions<SendGridOptions> options)
      {
          _options = options.Value;
      }

      public async Task SendPasswordResetEmailAsync(string toEmail, string resetUrl)
      {
          var client = new SendGridClient(_options.ApiKey);
          var from = new EmailAddress(_options.SenderEmail, _options.SenderName);
          var to = new EmailAddress(toEmail);
          const string subject = "Reset your SmartPark password";

          var plainText =
              $"Reset your SmartPark password by visiting the link below.\n\n{resetUrl}\n\n" +
              "This link expires in 15 minutes. If you did not request this, you can safely ignore this email.";

          var html = $"""
              <p>You requested a password reset for your SmartPark account.</p>
              <p><a href="{resetUrl}">Reset your password</a></p>
              <p>This link expires in <strong>15 minutes</strong>.</p>
              <p>If you did not request this, you can safely ignore this email.</p>
              """;

          var msg = MailHelper.CreateSingleEmail(from, to, subject, plainText, html);
          await client.SendEmailAsync(msg);
      }
  }
  ```

- [ ] **Step 6: Add config sections to appsettings.json**

  Open `src/SmartPark.API/appsettings.json`. Add the two new top-level sections after the existing `"Jwt"` block:

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

  Leave `ApiKey` empty here — it must be set via an environment variable or .NET user secrets (see verification step below).

- [ ] **Step 7: Set your SendGrid API key via user secrets**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet user-secrets set "SendGrid:ApiKey" "YOUR_ACTUAL_SENDGRID_API_KEY" --project src/SmartPark.API
  ```
  Replace `YOUR_ACTUAL_SENDGRID_API_KEY` with the key from your SendGrid dashboard (Settings → API Keys → Create API Key → Restricted: Mail Send).

- [ ] **Step 8: Register services in DependencyInjection.cs**

  Open `src/SmartPark.Infrastructure/DependencyInjection.cs`. Add the following inside `AddInfrastructure`, after the existing `services.AddDbContext` block and before the final `return services`:

  ```csharp
  services.Configure<SendGridOptions>(config.GetSection("SendGrid"));
  services.Configure<AppOptions>(config.GetSection("App"));
  services.AddScoped<IEmailService, SendGridEmailService>();
  ```

  Also add the missing using at the top of the file:
  ```csharp
  using SmartPark.Infrastructure.Options;
  ```

- [ ] **Step 9: Verify the solution builds**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet build SmartPark.sln
  ```
  Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 10: Commit**

  ```
  git add src/SmartPark.Infrastructure/Options/
  git add src/SmartPark.Application/Interfaces/IEmailService.cs
  git add src/SmartPark.Infrastructure/Services/SendGridEmailService.cs
  git add src/SmartPark.Infrastructure/SmartPark.Infrastructure.csproj
  git add src/SmartPark.API/appsettings.json
  git add src/SmartPark.Infrastructure/DependencyInjection.cs
  git commit -m "feat: add SendGrid email service"
  ```

---

## Task 3: Password reset service and API endpoints

**Files:**
- Create: `src/SmartPark.Application/Interfaces/IPasswordResetService.cs`
- Create: `src/SmartPark.Application/DTOs/Auth/ForgotPasswordRequest.cs`
- Create: `src/SmartPark.Application/DTOs/Auth/ResetPasswordRequest.cs`
- Create: `src/SmartPark.Infrastructure/Services/PasswordResetService.cs`
- Modify: `src/SmartPark.Infrastructure/DependencyInjection.cs`
- Modify: `src/SmartPark.API/Endpoints/AuthEndpoints.cs`

**Interfaces:**
- Consumes: `IEmailService.SendPasswordResetEmailAsync` (Task 2), `PasswordResetToken` entity (Task 1), `SmartParkDbContext.PasswordResetTokens` (Task 1), `IPasswordHasher` (already registered)
- Produces: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` endpoints — consumed by Task 4

- [ ] **Step 1: Create IPasswordResetService**

  Create `src/SmartPark.Application/Interfaces/IPasswordResetService.cs`:

  ```csharp
  namespace SmartPark.Application.Interfaces;

  public interface IPasswordResetService
  {
      Task SendResetEmailAsync(string email);
      Task<bool> ResetPasswordAsync(string token, string newPassword);
  }
  ```

- [ ] **Step 2: Create ForgotPasswordRequest DTO**

  Create `src/SmartPark.Application/DTOs/Auth/ForgotPasswordRequest.cs`:

  ```csharp
  namespace SmartPark.Application.DTOs.Auth;

  public record ForgotPasswordRequest(string Email);
  ```

- [ ] **Step 3: Create ResetPasswordRequest DTO**

  Create `src/SmartPark.Application/DTOs/Auth/ResetPasswordRequest.cs`:

  ```csharp
  namespace SmartPark.Application.DTOs.Auth;

  public record ResetPasswordRequest(string Token, string NewPassword);
  ```

- [ ] **Step 4: Create PasswordResetService**

  Create `src/SmartPark.Infrastructure/Services/PasswordResetService.cs`:

  ```csharp
  using System.Security.Cryptography;
  using System.Text;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Options;
  using SmartPark.Application.Interfaces;
  using SmartPark.Domain.Entities;
  using SmartPark.Domain.Interfaces;
  using SmartPark.Infrastructure.Data;
  using SmartPark.Infrastructure.Options;

  namespace SmartPark.Infrastructure.Services;

  public class PasswordResetService : IPasswordResetService
  {
      private readonly SmartParkDbContext _context;
      private readonly IEmailService _emailService;
      private readonly IPasswordHasher _hasher;
      private readonly AppOptions _appOptions;

      public PasswordResetService(
          SmartParkDbContext context,
          IEmailService emailService,
          IPasswordHasher hasher,
          IOptions<AppOptions> appOptions)
      {
          _context = context;
          _emailService = emailService;
          _hasher = hasher;
          _appOptions = appOptions.Value;
      }

      public async Task SendResetEmailAsync(string email)
      {
          var user = await _context.Users
              .FirstOrDefaultAsync(u => u.Email == email.ToLower().Trim());

          if (user == null) return;

          var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
          var hashedToken = HashToken(rawToken);

          _context.PasswordResetTokens.Add(new PasswordResetToken
          {
              UserId = user.ID,
              HashedToken = hashedToken,
              ExpiresAt = DateTime.UtcNow.AddMinutes(15),
              CreatedAt = DateTime.UtcNow
          });

          await _context.SaveChangesAsync();

          var resetUrl = $"{_appOptions.FrontendBaseUrl}/reset-password?token={rawToken}";
          await _emailService.SendPasswordResetEmailAsync(user.Email, resetUrl);
      }

      public async Task<bool> ResetPasswordAsync(string token, string newPassword)
      {
          var hashedToken = HashToken(token);

          var resetToken = await _context.PasswordResetTokens
              .Include(t => t.User)
              .FirstOrDefaultAsync(t =>
                  t.HashedToken == hashedToken &&
                  t.ExpiresAt > DateTime.UtcNow &&
                  t.UsedAt == null);

          if (resetToken == null) return false;

          resetToken.User.Password = _hasher.Hash(newPassword);
          resetToken.UsedAt = DateTime.UtcNow;

          await _context.SaveChangesAsync();
          return true;
      }

      private static string HashToken(string token)
      {
          var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
          return Convert.ToHexString(bytes).ToLower();
      }
  }
  ```

- [ ] **Step 5: Register PasswordResetService in DependencyInjection.cs**

  Open `src/SmartPark.Infrastructure/DependencyInjection.cs`. Add this line alongside the other `AddScoped` calls (after the `IEmailService` line added in Task 2):

  ```csharp
  services.AddScoped<IPasswordResetService, PasswordResetService>();
  ```

- [ ] **Step 6: Add the two endpoints to AuthEndpoints.cs**

  Open `src/SmartPark.API/Endpoints/AuthEndpoints.cs`. Add two new `MapPost` calls inside `MapAuthEndpoints`, after the existing `/login` endpoint. Also add the missing using for the new DTOs and service interface:

  Add at the top of the file:
  ```csharp
  using SmartPark.Application.DTOs.Auth;
  ```
  (The `IPasswordResetService` using is not needed here — it's resolved via DI.)

  Add the following after the existing `group.MapPost("/login", ...)` block:

  ```csharp
  group.MapPost("/forgot-password", async (ForgotPasswordRequest request, IPasswordResetService passwordResetService) =>
  {
      await passwordResetService.SendResetEmailAsync(request.Email);
      return Results.Ok(new { message = "If that email is registered, a reset link has been sent." });
  });

  group.MapPost("/reset-password", async (ResetPasswordRequest request, IPasswordResetService passwordResetService) =>
  {
      var success = await passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword);
      return success
          ? Results.Ok(new { message = "Password reset successfully." })
          : Results.BadRequest(new { error = "Reset link is invalid or has expired." });
  });
  ```

  The full updated file should look like:

  ```csharp
  using SmartPark.Application.DTOs.Auth;
  using SmartPark.Application.Interfaces;

  namespace SmartPark.API.Endpoints;

  public static class AuthEndpoints
  {
      public static void MapAuthEndpoints(this WebApplication app)
      {
          var group = app.MapGroup("/api/auth").WithTags("Auth");

          group.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
          {
              var result = await authService.RegisterAsync(request);
              return Results.Ok(result);
          });

          group.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
          {
              var result = await authService.LoginAsync(request);
              return Results.Ok(result);
          });

          group.MapPost("/forgot-password", async (ForgotPasswordRequest request, IPasswordResetService passwordResetService) =>
          {
              await passwordResetService.SendResetEmailAsync(request.Email);
              return Results.Ok(new { message = "If that email is registered, a reset link has been sent." });
          });

          group.MapPost("/reset-password", async (ResetPasswordRequest request, IPasswordResetService passwordResetService) =>
          {
              var success = await passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword);
              return success
                  ? Results.Ok(new { message = "Password reset successfully." })
                  : Results.BadRequest(new { error = "Reset link is invalid or has expired." });
          });
      }
  }
  ```

- [ ] **Step 7: Verify the full solution builds**

  Run from `g:\ACloude\Project\SmartPark`:
  ```
  dotnet build SmartPark.sln
  ```
  Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 8: Smoke-test the endpoints**

  Start the API: `dotnet run --project src/SmartPark.API`

  Test forgot-password (always returns 200):
  ```
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test@example.com\"}"
  ```
  Expected response: `{"message":"If that email is registered, a reset link has been sent."}`

  Test reset-password with a bad token (returns 400):
  ```
  curl -X POST http://localhost:5000/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d "{\"token\": \"badtoken\", \"newPassword\": \"NewPass123\"}"
  ```
  Expected response: `{"error":"Reset link is invalid or has expired."}`

- [ ] **Step 9: Commit**

  ```
  git add src/SmartPark.Application/Interfaces/IPasswordResetService.cs
  git add src/SmartPark.Application/DTOs/Auth/ForgotPasswordRequest.cs
  git add src/SmartPark.Application/DTOs/Auth/ResetPasswordRequest.cs
  git add src/SmartPark.Infrastructure/Services/PasswordResetService.cs
  git add src/SmartPark.Infrastructure/DependencyInjection.cs
  git add src/SmartPark.API/Endpoints/AuthEndpoints.cs
  git commit -m "feat: add password reset service and API endpoints"
  ```

---

## Task 4: Frontend pages and routing

**Files:**
- Modify: `frontend/smartpark-ui/src/services/authService.js`
- Modify: `frontend/smartpark-ui/src/pages/Auth/Login.jsx`
- Modify: `frontend/smartpark-ui/src/App.jsx`
- Create: `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx`
- Create: `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx`

**Interfaces:**
- Consumes: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` (Task 3)

- [ ] **Step 1: Add forgotPassword and resetPassword to authService.js**

  Open `frontend/smartpark-ui/src/services/authService.js`. Replace the entire file content with:

  ```js
  import api from './api'

  const authService = {
    register:       (data)                  => api.post('/auth/register', data).then(r => r.data),
    login:          (data)                  => api.post('/auth/login', data).then(r => r.data),
    forgotPassword: (email)                 => api.post('/auth/forgot-password', { email }).then(r => r.data),
    resetPassword:  (token, newPassword)    => api.post('/auth/reset-password', { token, newPassword }).then(r => r.data),
  }

  export default authService
  ```

- [ ] **Step 2: Add "Forgot password?" link to Login.jsx**

  Open `frontend/smartpark-ui/src/pages/Auth/Login.jsx`. Add the link immediately after the closing `</div>` of the password `space-y-2` block, and before the `{error && ...}` block. The relevant section should become:

  ```jsx
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type="password"
      placeholder="Enter your password"
      value={form.password}
      onChange={e => setForm({ ...form, password: e.target.value })}
      required
      autoComplete="current-password"
    />
  </div>
  <div className="flex justify-end -mt-1">
    <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
      Forgot password?
    </Link>
  </div>

  {error && (
    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
      {error}
    </div>
  )}
  ```

  (`Link` is already imported in Login.jsx — no new import needed.)

- [ ] **Step 3: Create ForgotPassword.jsx**

  Create `frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx`:

  ```jsx
  import { useState } from 'react'
  import { Link } from 'react-router-dom'
  import authService from '@/services/authService'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
  import { Loader2 } from 'lucide-react'

  export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        await authService.forgotPassword(email)
      } catch {
        // intentionally swallow — we never reveal whether the email is registered
      } finally {
        setLoading(false)
        setSubmitted(true)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                P
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              {submitted
                ? 'Check your inbox'
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  If that email is registered, a reset link is on its way. Check your spam folder if you don't see it within a minute.
                </p>
                <Link to="/login" className="block text-sm font-medium text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  ```

- [ ] **Step 4: Create ResetPassword.jsx**

  Create `frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx`:

  ```jsx
  import { useState, useEffect } from 'react'
  import { useSearchParams, Link, useNavigate } from 'react-router-dom'
  import authService from '@/services/authService'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
  import { Loader2 } from 'lucide-react'

  export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('idle') // idle | success | error
    const [validationError, setValidationError] = useState('')

    useEffect(() => {
      if (status !== 'success') return
      const timer = setTimeout(() => navigate('/login'), 3000)
      return () => clearTimeout(timer)
    }, [status, navigate])

    if (!token) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6 space-y-4 text-center">
              <p className="text-sm text-destructive">Invalid reset link.</p>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Request a new one
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setValidationError('')

      if (form.newPassword.length < 8) {
        setValidationError('Password must be at least 8 characters.')
        return
      }
      if (form.newPassword !== form.confirmPassword) {
        setValidationError('Passwords do not match.')
        return
      }

      setLoading(true)
      try {
        await authService.resetPassword(token, form.newPassword)
        setStatus('success')
      } catch {
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                P
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {status === 'success' ? 'Password updated!' : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Your password has been reset. Redirecting to sign in…
                </p>
                <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                  Go to sign in
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">
                  This reset link is invalid or has expired.
                </p>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Request a new link
                </Link>
              </div>
            )}

            {status === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your new password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {validationError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {validationError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  ```

- [ ] **Step 5: Add the two new public routes in App.jsx**

  Open `frontend/smartpark-ui/src/App.jsx`. Add imports for the two new pages near the top alongside the existing Auth imports:

  ```jsx
  import ForgotPassword from '@/pages/Auth/ForgotPassword'
  import ResetPassword from '@/pages/Auth/ResetPassword'
  ```

  Then add the two public routes immediately after the existing `/register` route (they need no auth guard):

  ```jsx
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  ```

- [ ] **Step 6: Verify the frontend builds**

  Run from `frontend/smartpark-ui`:
  ```
  npm run build
  ```
  Expected: `✓ built in Xs` with no errors.

- [ ] **Step 7: End-to-end smoke test**

  Start both servers:
  - API: `dotnet run --project src/SmartPark.API` (from `g:\ACloude\Project\SmartPark`)
  - Frontend: `npm run dev` (from `frontend/smartpark-ui`)

  **Test 1 — "Forgot password?" link is visible:**
  Open `http://localhost:5173/login`. Confirm "Forgot password?" link appears below the password field.

  **Test 2 — ForgotPassword page submits and shows success message:**
  Click "Forgot password?" → enter any email → click "Send Reset Link" → confirm the success message appears ("If that email is registered…").

  **Test 3 — ResetPassword page with no token shows error:**
  Navigate to `http://localhost:5173/reset-password` (no `?token`). Confirm "Invalid reset link." message appears.

  **Test 4 — Full happy path (requires real SendGrid API key and a registered user email):**
  - Submit your registered user's email on `/forgot-password`
  - Open the email from `noreply@smartpark.com`
  - Click the reset link
  - Enter a new password (≥8 chars) and confirm it
  - Click "Reset Password"
  - Confirm success message and auto-redirect to `/login`
  - Log in with the new password — confirm it works

  **Test 5 — Expired/used token shows error:**
  Copy the token from a link you already used (or wait >15 min), paste it into the URL, submit a new password — confirm the error state ("This reset link is invalid or has expired.") with a link to request a new one.

- [ ] **Step 8: Commit**

  ```
  git add frontend/smartpark-ui/src/services/authService.js
  git add frontend/smartpark-ui/src/pages/Auth/Login.jsx
  git add frontend/smartpark-ui/src/pages/Auth/ForgotPassword.jsx
  git add frontend/smartpark-ui/src/pages/Auth/ResetPassword.jsx
  git add frontend/smartpark-ui/src/App.jsx
  git commit -m "feat: add forgot password and reset password frontend pages"
  ```
