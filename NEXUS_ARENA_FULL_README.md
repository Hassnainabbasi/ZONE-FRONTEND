# Nexus Arena — Full Project README

> Comprehensive implementation notes for the Nexus Arena gaming arena web application.
>
> This README documents the architecture, modules, API integrations, admin flows, booking logic, membership system, tournaments, pricing packages, live systems monitoring, revenue analytics, and notification polling added during development.

---

## 1. Project Overview

Nexus Arena is a full-stack gaming arena management platform with:

- Public gaming website
- Customer authentication
- Online booking
- Dynamic gaming systems and stations
- Dynamic games library
- Gaming packages / night packages
- Membership tiers and loyalty points
- Tournament registration and management
- Cafe order management
- Admin console
- Live systems monitor
- Revenue analytics
- Admin notifications without WebSockets

The main design goal is to keep all important operational data dynamic and admin-controlled instead of hard-coded inside frontend files.

---

# 2. Tech Stack

## Frontend

- React
- TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- `motion/react`
- `sonner`
- `lucide-react`

## Backend

- Node.js
- Express
- ES Modules
- MongoDB
- Mongoose
- JWT authentication
- Cookie-based authentication
- `bcryptjs`
- `jsonwebtoken`
- `cookie-parser`
- `cors`

---

# 3. Development URLs

## Frontend

Typical development URL:

```txt
http://localhost:8080
```

or:

```txt
http://localhost:8081
```

## Backend

```txt
https://zone-backend.vercel.app
```

All frontend API services should use:

```ts
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://zone-backend.vercel.app/api";
```

Do not leave old services pointing to `http://localhost:3000/api` unless the backend is intentionally moved there.

---

# 4. Environment Configuration

Example backend `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nexus-arena
JWT_SECRET=your-long-secret
FRONTEND_URL=http://localhost:8080
```

If frontend is running on `8081`, update `FRONTEND_URL` accordingly.

Example frontend `.env`:

```env
VITE_API_URL=https://zone-backend.vercel.app/api
```

---

# 5. Backend Server Setup

Recommended middleware:

```js
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:8080",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
```

Recommended route mounts:

```js
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/cafe", cafeRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/systems", systemRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);
```

---

# 6. Frontend Route / Provider Architecture

## Global authentication

`AuthProvider` should stay global.

```tsx
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Booking context

Use this as the source of truth:

```txt
src/components/gaming/booking-context.tsx
```

Correct import inside gaming components:

```ts
import { useBooking } from "./booking-context";
```

Avoid using the old duplicate:

```txt
src/context/booking-context.tsx
```

---

# 7. Authentication System

## User model

Expected fields:

```txt
name
email
phone
passwordHash
role
memberId
active
lastLoginAt
```

Roles:

```txt
Customer
Admin
```

## JWT

Cookie:

```txt
nexus_token
```

Typical duration:

```txt
7 days
```

Middleware:

```txt
optionalAuth
requireAuth
requireAdmin
```

`optionalAuth` is important for public booking calculations so logged-in customers can receive membership discounts while guests can still calculate prices.

---

# 8. Customer / Member Auto-Linking

On signup/login/me:

1. Use `User.memberId` if already linked.
2. Search Member by `userId`.
3. Search by normalized phone.
4. Search by email.
5. Create Member if still missing.
6. Link `User.memberId`.

This prevents old accounts from showing `Member profile not found`.

---

# 9. Membership System

## Membership flow

```txt
Customer selects tier
        ↓
Membership Request = Pending
        ↓
Admin sees request
        ↓
Admin may contact customer on WhatsApp
        ↓
Payment marked Paid
        ↓
Admin Approves
        ↓
Membership becomes Active
```

Admin may also deny requests.

After expiry:

```txt
Active → Expired → customer may renew / request again
```

---

# 10. Membership Tier Fields

Each tier supports:

```txt
name
price
durationMonths
minHours
pointsPerHour
gamingDiscountPercent
cafeDiscountPercent
maxMembers
active
sortOrder
```

Example defaults:

### Silver

```txt
Price: 0
Duration: 1 month
Required hours: 0
Points/hour: 10
Gaming discount: 5%
Cafe discount: 5%
Capacity: 500
```

### Gold

```txt
Price: 2500
Duration: 1 month
Required hours: 100
Points/hour: 15
Gaming discount: 10%
Cafe discount: 10%
Capacity: 250
```

### VIP

```txt
Price: 5000
Duration: 1 month
Required hours: 300
Points/hour: 20
Gaming discount: 15%
Cafe discount: 15%
Capacity: 100
```

Important existing filename:

```txt
models/MemberShipTier.js
```

Keep import casing exactly consistent.

---

# 11. Membership Requests

`MembershipRequest` stores a tier snapshot:

```txt
userId
memberId
tierId
tierName
tierPrice
status
paymentStatus
paymentMethod
paymentNote
paidAt
adminNote
reviewedBy
requestedAt
approvedAt
deniedAt
```

Statuses:

```txt
Pending
Approved
Denied
Cancelled
```

Payment status:

```txt
Pending
Paid
```

Free tiers may be marked Paid automatically but still require admin approval.

---

# 12. Membership Expiration

Active memberships should be expired when:

```txt
membershipStatus = Active
membershipExpiresAt <= now
```

Recommended expiry check:

```txt
once after DB connection
and once every hour
```

Also perform lazy expiry when member profile is fetched.

---

# 13. Loyalty Points

Points are awarded only after the booking is completed.

Formula:

```txt
points earned = booking duration × membership tier pointsPerHour
```

Example:

```txt
3-hour booking × 15 points/hour = 45 points
```

Station count does not multiply points.

Duplicate rewards should be prevented via `creditedBookings`.

## Manual point adjustment

Admin can add or deduct any whole number starting from `1`.

Recommended backend validation:

```js
Number.isSafeInteger(amount)
```

with `amount !== 0` and no negative final balance.

Keep API compatibility:

```ts
adjustPoints(id, {
  points,
  note,
})
```

---

# 14. Booking System

Booking supports:

```txt
Online booking
Walk-in booking
Dynamic systems
Dynamic stations
Game selection
Dynamic duration
Packages
Membership discount
Points redemption
Partial payment
Payment history
Refunds
Cancellation
Completion
```

---

# 15. Booking Pricing Order

Final order:

```txt
Base price / package price
        ↓
Package or duration discount
        ↓
Membership gaming discount
        ↓
Loyalty points
        ↓
Final amount
```

Example:

```txt
Night package        Rs 2,000
Gold discount 10%      -200
Points used             -300
----------------------------
Final                 Rs 1,500
```

---

# 16. Package Booking

Admin controls package types:

```txt
Hourly
Day
Night
Custom
```

Example:

```txt
PC Night Package
Rs 1,499
22:00 → 06:00
8 Hours
```

Frontend sends only:

```txt
pricingPlanId
```

Backend reloads the real `PricingPlan` from MongoDB and decides:

```txt
price
duration
start time
end time
discount
system compatibility
```

This prevents frontend manipulation.

---

# 17. PricingPlan Model

Recommended fields:

```txt
name
slug
systemType
packageType
price
unit
durationHours
startTime
endTime
discountPercent
perks
description
highlight
active
sortOrder
```

---

# 18. Pricing Admin

Admin can manage:

```txt
Package name
Gaming system
Package type
Price
Unit
Duration
Start time
End time
Discount
Description
Perks
Popular badge
Active/inactive
Sort order
```

Public `Pricing.tsx` reads packages from API.

Selecting a package stores the selected plan in booking context and scrolls to booking.

---

# 19. Gaming Systems — Final Source of Truth

Old sources that should no longer be authoritative:

```txt
BookingConfig.systems
admin-data.ts stations
data.ts rigs / zones
```

Final master source:

```txt
GamingSystem MongoDB collection
```

Flow:

```txt
Admin Gaming Systems
        ↓
GamingSystem MongoDB
        ↓
Booking
Public Systems
Live Monitor
Pricing compatibility
```

---

# 20. GamingSystem Model

Fields:

```txt
name
label
slug
totalStations
pricePerHour
tag
specs
maintenanceStations
active
publicVisible
sortOrder
```

Example:

```json
{
  "name": "PC",
  "label": "PC Arena",
  "totalStations": 30,
  "pricePerHour": 500,
  "tag": "RTX Elite",
  "specs": [
    "RTX 5070",
    "Ryzen 7",
    "32GB RAM",
    "240Hz Monitor"
  ],
  "maintenanceStations": [10, 14],
  "active": true,
  "publicVisible": true
}
```

---

# 21. Admin Gaming Systems

Admin can:

```txt
Create system
Edit public label
Change total stations
Change hourly rate
Edit hardware tag
Edit specs
Activate/deactivate
Show/hide publicly
Delete system
Toggle maintenance per station
```

Example:

```txt
System Code: PC
Public Label: PC Arena
Stations: 30
Rate: Rs 500/hr
```

Once created, it should automatically become available to booking.

---

# 22. Booking Compatibility With GamingSystem

Existing booking frontend can continue consuming:

```txt
config.systems
```

but backend should populate that property from the `GamingSystem` collection.

This preserves the frontend shape while making `GamingSystem` the real source of truth.

---

# 23. Dynamic Station Generation

A system with:

```txt
name = PC
totalStations = 30
```

automatically becomes:

```txt
PC-01
PC-02
PC-03
...
PC-30
```

No need to create 30 station documents manually.

---

# 24. Maintenance Stations

`GamingSystem` stores:

```txt
maintenanceStations
```

Example:

```json
[4, 8, 11]
```

Those stations are unavailable for booking and appear as `Maintenance` in Live Monitor.

Maintenance overrides booking state.

---

# 25. Live Systems Monitor

Possible states:

```txt
Available
Reserved
In Use
Maintenance
```

## In Use

A station becomes `In Use` when:

```txt
bookingStatus = Confirmed
AND current time >= booking start
AND current time < booking end
```

The monitor can display:

```txt
Customer name
Game
Booking ID
Phone
Minutes left
```

## Reserved

Current rule:

```txt
future booking within 60 minutes → Reserved
```

Future booking farther away can still display:

```txt
Available Now
Next Booking: date/time
```

## Pending session

If its time has started but status is still `Pending`, it stays `Reserved`, not `In Use`.

---

# 26. Overnight / Night Package Handling

Use real start datetime + duration.

Example:

```txt
Start 22:00
Duration 8 hours
```

means:

```txt
22:00 → next day 06:00
```

At 01:00 AM the station should still show `In Use`.

---

# 27. Games System

Game fields:

```txt
title
slug
category
genre
platform
rate
poster
players
active
featured
description
sortOrder
```

Platforms currently support:

```txt
PC
PS5
Both
```

Frontend game service should use:

```txt
https://zone-backend.vercel.app/api
```

and:

```ts
credentials: "include"
```

Correct public call:

```ts
gameApi.publicList({
  platform: systemType,
});
```

If a game uses `platform = Both`, backend filtering should include it for both PC and PS5.

---

# 28. Tournament System

Tournament fields:

```txt
name
slug
game
description
tournamentDate
startTime
teamSize
maxTeams
entryFee
prizePool
format
finalsFormat
registrationStatus
status
active
leaderboard
```

Statuses:

```txt
Upcoming
Live
Completed
Cancelled
```

Registration state:

```txt
Open
Closed
```

---

# 29. Tournament Registration

Fields:

```txt
tournamentId
teamName
captainName
captainGameId
phone
email
players
status
paymentStatus
paymentMethod
paymentNote
adminNote
paidAt
approvedAt
deniedAt
```

Registration statuses:

```txt
Pending
Approved
Denied
Cancelled
```

Payment statuses:

```txt
Pending
Paid
Waived
```

---

# 30. Tournament Admin

Admin can:

```txt
Create tournament
Edit tournament
Set date/time
Set team size
Set max teams
Set entry fee
Set prize pool
Open/close registration
Change tournament status
View registrations
WhatsApp teams
Mark payment paid
Approve team
Deny team
```

---

# 31. Tournament Bracket

`TournamentMatch` supports:

```txt
tournamentId
round
roundOrder
matchNumber
teamA
teamB
teamAScore
teamBScore
winner
status
scheduledDate
scheduledTime
nextMatchId
nextSlot
adminNote
```

Match statuses:

```txt
Scheduled
Live
Completed
Cancelled
```

Admin can generate bracket, save scores, winners and match status.

---

# 32. Tournament Leaderboard

Rows:

```txt
rank
team
game
streak
points
```

Admin edits leaderboard and public tournament page reads the same data.

---

# 33. Cafe

Cafe remains its own module.

Revenue and notifications are connected without replacing the working cafe implementation.

Common supported cafe fields for analytics/notifications:

```txt
totalAmount
grandTotal
total
paidAmount
paymentStatus
status
orderStatus
paidAt
createdAt
updatedAt
```

If the actual cafe schema differs, map it explicitly later.

---

# 34. Revenue Analytics

Revenue sources:

```txt
Gaming received payments
Cafe sales
Membership payments
Tournament entry fees
```

Refunds reduce revenue.

Packages are not a separate source because package payments already exist inside Booking payments.

---

# 35. Actual Received Revenue Rule

Revenue should count money actually received.

Example:

```txt
Booking total: Rs 2,000
Received: Rs 500
Due: Rs 1,500
```

Revenue counted:

```txt
Rs 500
```

not Rs 2,000.

---

# 36. Booking Payment History

Use `paymentHistory`.

Payment entry:

```txt
type = Payment
```

Refund entry:

```txt
type = Refund
```

Revenue calculation:

```txt
Payment → positive
Refund → negative
```

Legacy bookings with `paidAmount > 0` and no history may use `paidAmount` as fallback.

---

# 37. Revenue Dashboard

Admin revenue page displays:

```txt
Today Revenue
Yesterday Revenue
Today % change
This Month
All Time
Transaction Count
Gaming Revenue
Cafe Revenue
Membership Revenue
Tournament Revenue
Last 7 Days
Revenue Split
Last 12 Months
```

Recommended auto-refresh:

```txt
60 seconds
```

Timezone for day/month grouping:

```txt
Asia/Karachi
```

---

# 38. Admin Notifications — No Socket.IO

Requirement:

```txt
No WebSocket
No Socket.IO
```

Solution:

```txt
HTTP polling every 10 seconds
```

---

# 39. Notification Sources

## Booking

```txt
New booking request
Booking updated
Booking confirmed
Booking cancelled
Booking completed
Booking payment received
```

## Cafe

```txt
New cafe order
Cafe status change
Cafe payment/completion change
```

## Membership

```txt
New membership request
Membership payment received
Membership approved
Membership denied
```

## Tournament

```txt
New tournament registration
Tournament payment received
Team approved
Registration denied
```

---

# 40. Notification Architecture

```txt
Booking / Cafe / Membership / Tournament collections
                  ↓
      admin notification endpoint
                  ↓
       AdminShell polls every 10 sec
                  ↓
               Bell badge
                  ↓
        Notification popover list
```

No individual socket connection is required.

---

# 41. Notification Read State

Frontend stores the last read time in `localStorage`.

Key:

```txt
nexus_admin_notifications_read_at
```

When the bell opens:

```txt
unread = 0
```

New records after the last poll increment the badge.

Clicking notification routes to:

```txt
Booking    → /admin/booking
Cafe       → /admin/cafe
Membership → /admin/members
Tournament → /admin/tournament
```

---

# 42. AdminShell Notification Migration

Remove static notification import:

```ts
import { notifications } from "./admin-data";
```

Use:

```ts
import { AdminNotifications } from "./AdminNotifications";
```

Then render:

```tsx
<AdminNotifications />
```

---

# 43. Admin Navigation

Current intended areas:

```txt
Live Systems
Bookings
Revenue
Games
Pricing & Packages
Tournaments
Memberships
Cafe Orders
Settings
```

Avoid duplicate nav entries such as `Games & Pricing` plus separate `Games` and `Pricing & Packages` unless intentionally desired.

---

# 44. Admin Account / Logout

AdminShell uses real authenticated admin data:

```txt
name
email
initials
```

Logout flow:

```txt
logout API
→ /admin/login
```

Do not hard-code admin name/profile.

---

# 45. Admin Booking Page

Admin booking page supports:

```txt
Search
System filter
Payment filter
Booking type filter
Booking status filter
Pagination
Manual booking
Confirm booking
Receive payment
Cancel
Refund
WhatsApp
Print
Calendar view
```

Manual booking should load dynamic systems from `bookingApi.getConfig()`, which now receives systems injected from `GamingSystem`.

---

# 46. Public Booking

Public booking supports:

```txt
Customer details
Date
Start time
Duration
Dynamic gaming system
Dynamic games
Dynamic stations
Payment method
Package selection
Membership discount
Points redemption
Final price
```

---

# 47. Booking Context

Main context:

```txt
src/components/gaming/booking-context.tsx
```

Responsibilities:

```txt
booking config
selected system
selected game
date
time
duration
stations
package
availability
pricing
points
customer data
payment
```

---

# 48. Package Selection State

When user clicks a pricing card:

```txt
Book PC Night Package
```

store:

```txt
selectedPricingPlan
```

Optionally persist in session storage:

```txt
selectedPricingPlan
```

Booking receives:

```txt
system
start time
duration
pricingPlanId
```

---

# 49. Pricing Security

Never trust frontend values for:

```txt
package price
membership discount
points value
system rate
duration discount
```

Backend must reload:

```txt
GamingSystem
PricingPlan
MembershipTier
Member
```

before calculating final amount.

---

# 50. Booking Availability

Availability validates:

```txt
system
station number
booking date
start time
duration
booking status
maintenance
```

Blocking booking statuses:

```txt
Pending
Confirmed
```

Do not allow overlapping station reservations.

---

# 51. Maintenance + Booking

If:

```txt
maintenanceStations = [10]
```

then `PC-10` must be unavailable in booking.

Direct API attempts to book it should also fail.

---

# 52. Booking Payment Status

Payment statuses:

```txt
Unpaid
Partial
Paid
Refunded
```

Booking statuses:

```txt
Pending
Confirmed
Cancelled
Completed
Refunded
```

---

# 53. Completing a Booking

Recommended operational flow:

```txt
Pending
→ Confirmed
→ session played
→ Completed
```

Only completion awards loyalty points.

This avoids rewarding no-shows or cancelled bookings.

---

# 54. Refund / Cancellation

Cancellation or full refund should restore redeemed loyalty points when appropriate through `restoreBookingPoints()`.

---

# 55. API Service Authentication

Admin frontend services should use:

```ts
credentials: "include"
```

Without this, the JWT cookie may not be sent.

---

# 56. API URL Consistency

All services should eventually use:

```ts
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://zone-backend.vercel.app/api";
```

Check:

```txt
authApi.ts
bookingApi.ts
cafeApi.ts
gameApi.ts
membershipApi.ts
pricingApi.ts
tournamentApi.ts
systemApi.ts
revenueApi.ts
notificationApi.ts
```

---

# 57. Frontend Service Structure

```txt
src/services/
  authApi.ts
  bookingApi.ts
  cafeApi.ts
  gameApi.ts
  membershipApi.ts
  pricingApi.ts
  tournamentApi.ts
  systemApi.ts
  revenueApi.ts
  notificationApi.ts
```

---

# 58. Main Backend Models

Expected relevant models:

```txt
User.js
Member.js
MemberShipTier.js
MembershipRequest.js
Booking.js
BookingConfig.js
Game.js
PricingPlan.js
GamingSystem.js
Tournament.js
TournamentRegistration.js
TournamentMatch.js
```

plus existing cafe models.

---

# 59. Main Backend Controllers

```txt
auth.controller.js
booking.controller.js
game.controller.js
pricing.controller.js
system.controller.js
memberShip.controller.js
membershipRequest.controller.js
tournament.controller.js
tournamentBracket.controller.js
revenue.controller.js
adminNotification.controller.js
```

plus cafe/admin controllers.

---

# 60. Main Backend Routes

```txt
auth.routes.js
admin.routes.js
booking.routes.js
game.routes.js
cafe.routes.js
memberShip.routes.js
pricing.routes.js
system.routes.js
tournament.routes.js
revenue.routes.js
adminNotification.routes.js
```

---

# 61. Public Website Modules

```txt
Hero.tsx
Systems.tsx
GameLibrary.tsx
Pricing.tsx
Membership.tsx
Tournaments.tsx
Booking.tsx
MobileBookingBar.tsx
Navbar.tsx
Footer.tsx
Reveal.tsx
booking-context.tsx
```

---

# 62. Admin Pages

```txt
/admin
/admin/booking
/admin/revenue
/admin/games
/admin/pricing
/admin/tournament
/admin/members
/admin/cafe
/admin/setting
```

---

# 63. Static Data Removal

As modules become dynamic, remove operational data from:

```txt
components/admin/admin-data.ts
components/gaming/data.ts
```

Modules that should not depend on static operational data:

```txt
systems
stations
pricing
tournaments
revenue
notifications
```

Static demo/design data may remain only where intentionally needed.

---

# 64. Live Monitor Example

Admin creates:

```txt
PC Arena
30 stations
```

Booking:

```txt
PC-07
26 Sep
11:00
2 hours
Confirmed
```

At 10:30:

```txt
PC-07
Reserved
Starts 11:00
```

At 11:15:

```txt
PC-07
In Use
105m left
Customer
Game
Booking ID
```

At 13:00:

```txt
PC-07
Available
```

---

# 65. Timezone

Operational business timezone:

```txt
Asia/Karachi
UTC+05:00
```

Use `Asia/Karachi` for daily/monthly revenue grouping.

---

# 66. Revenue + Refund Example

Booking:

```txt
Total = Rs 4,000
Received = Rs 2,000
```

Revenue:

```txt
+ Rs 2,000
```

Admin later receives another:

```txt
Rs 2,000
```

Revenue becomes:

```txt
Rs 4,000
```

Full refund:

```txt
- Rs 4,000
```

Net:

```txt
Rs 0
```

---

# 67. Membership Revenue

Count membership revenue when:

```txt
paymentStatus = Paid
```

Use the membership request snapshot:

```txt
tierPrice
```

so later tier price changes do not rewrite historical revenue.

---

# 68. Tournament Revenue

Count when:

```txt
registration.paymentStatus = Paid
```

Current amount can come from tournament entry fee.

Future improvement: snapshot tournament `entryFee` on registration submission for stronger historical accuracy.

---

# 69. Notification Polling Performance

Recommended:

```txt
10-second polling interval
```

Do not show toast on every polling failure.

Polling errors should usually only log to console to avoid spamming the admin during a temporary outage.

---

# 70. Notifications vs Historical Activity

First admin load:

- Load recent activity.
- Do not mark all historical items unread.
- Save current server time as read point.

Later:

- Poll from previous server timestamp.
- Only newly updated items increment unread badge.

---

# 71. Historical Snapshot Philosophy

Snapshot values that must not change retroactively.

Examples:

```txt
Booking.package
Booking final price
Booking discount details
Booking loyalty details
MembershipRequest.tierPrice
```

Recommended future snapshot:

```txt
TournamentRegistration.entryFee
```

---

# 72. Recommended Testing Checklist

## Authentication

- [ ] Customer signup
- [ ] Customer login
- [ ] Admin login
- [ ] Admin logout
- [ ] `/me`
- [ ] Member auto-created/linked

## Gaming Systems

- [ ] Admin creates PC
- [ ] Admin creates PS5
- [ ] New system appears in booking
- [ ] Correct station count
- [ ] Correct hourly rate
- [ ] Public Systems updates
- [ ] Active off hides from booking
- [ ] Maintenance station unavailable

## Games

- [ ] Admin creates game
- [ ] Public game appears
- [ ] PC filter
- [ ] PS5 filter
- [ ] Both platform logic
- [ ] Game rate override if configured

## Booking

- [ ] Normal booking
- [ ] Station conflict
- [ ] Multiple stations
- [ ] Pending
- [ ] Confirm
- [ ] Reserved monitor state
- [ ] In Use monitor state
- [ ] Completion
- [ ] Partial payment
- [ ] Cancellation
- [ ] Refund

## Packages

- [ ] Hourly package
- [ ] Day package
- [ ] Night package
- [ ] Select package from pricing card
- [ ] Start time locked
- [ ] Duration locked
- [ ] Backend validates package price
- [ ] Overnight conflict checking

## Membership

- [ ] Tier create/edit
- [ ] Customer request
- [ ] Pending request
- [ ] Mark paid
- [ ] Approve
- [ ] Deny
- [ ] Expiry
- [ ] Re-request
- [ ] Gaming discount
- [ ] Cafe discount
- [ ] Points on completed booking
- [ ] Add arbitrary points
- [ ] Deduct arbitrary points
- [ ] Redeem points

## Tournament

- [ ] Create tournament
- [ ] Public tournament appears
- [ ] Team registration
- [ ] Payment marked
- [ ] Approve team
- [ ] Generate bracket
- [ ] Save score
- [ ] Save leaderboard
- [ ] Public leaderboard updates

## Revenue

- [ ] Booking received payment counted
- [ ] Partial payment accurate
- [ ] Refund subtracts revenue
- [ ] Membership payment counted
- [ ] Tournament payment counted
- [ ] Cafe revenue counted
- [ ] Daily chart
- [ ] Monthly trend
- [ ] Revenue split

## Notifications

- [ ] New booking notification
- [ ] Booking change notification
- [ ] Cafe notification
- [ ] Membership notification
- [ ] Tournament notification
- [ ] Badge increments
- [ ] Bell clears unread
- [ ] Notification opens correct admin page
- [ ] No Socket.IO

---

# 73. Known Important Checks

## Duplicate booking contexts

Keep:

```txt
src/components/gaming/booking-context.tsx
```

Correct gaming imports that still reference:

```txt
@/context/booking-context
../../context/booking-context
```

## API ports

Search for:

```txt
localhost:3000/api
```

and replace where needed with:

```txt
localhost:5000/api
```

## Membership API signatures

Keep compatible signatures:

```ts
markRequestPaid(id, payload)
approveRequest(id, adminNote)
denyRequest(id, adminNote)
adjustPoints(id, { points, note })
getMembers(params)
```

## Exact membership tier filename

```txt
MemberShipTier.js
```

## Dynamic systems

Final system master source:

```txt
GamingSystem MongoDB
```

Do not move back to `BookingConfig.systems` as authoritative system data.

---

# 74. Recommended Next Improvements

1. Map the exact cafe model fields into revenue and notifications.
2. Store notification read state in DB if multiple admins/devices need synced read/unread state.
3. Add admin audit logs for financial actions.
4. Snapshot tournament entry fee on registration.
5. Make pricing admin system dropdown load directly from `systemApi.adminList()` instead of hard-coded system values.
6. Add system image/icon/cover.
7. Add custom per-station names if needed.
8. Add maintenance reason/history.
9. Add No-Show booking status.
10. Add CSV/PDF revenue export.
11. Add date-range revenue filters.
12. Add revenue transaction ledger.
13. Add notification filters.
14. Add cafe-specific revenue mapping after confirming exact cafe schema.

---

# 75. Project Philosophy

Final architecture should follow:

```txt
Admin controls data
Frontend displays data
Backend validates data
MongoDB stores truth
```

For important price logic:

```txt
Never trust frontend calculations
```

For operational state:

```txt
Do not duplicate system/station definitions
```

For notifications:

```txt
Simple HTTP polling
No Socket.IO required
```

For finance:

```txt
Use actual money received
Not just booking totals
```

For loyalty:

```txt
Award after completed play
Not after booking creation
```

---

# 76. Final Architecture Summary

```txt
                         ┌────────────────────────┐
                         │      ADMIN PANEL       │
                         └───────────┬────────────┘
                                     │
          ┌──────────────────────────┼─────────────────────────┐
          │                          │                         │
          ▼                          ▼                         ▼
   GamingSystem                 PricingPlan               Games
          │                          │                         │
          └──────────────┬───────────┴──────────────┬─────────┘
                         │                          │
                         ▼                          ▼
                    Booking Engine            Public Website
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
       Membership     Payments    Live Monitor
            │            │            │
            ▼            ▼            ▼
          Points      Revenue      Availability

Membership Requests ────────────────┐
Tournament Registrations ───────────┤
Cafe Orders ────────────────────────┤
Bookings / Changes ─────────────────┤
                                    ▼
                         Admin Notifications
                         HTTP Polling / 10 sec
```

---

# 77. Run Project

Backend:

```bash
npm install
npm run dev
```

Frontend:

```bash
npm install
npm run dev
```

Verify backend:

```txt
https://zone-backend.vercel.app
```

Verify frontend:

```txt
http://localhost:8080
```

Admin:

```txt
http://localhost:8080/admin
```

---

# 78. Final Note

Nexus Arena has moved from a mostly static demo-style project toward a dynamic gaming arena operations platform.

Major architecture areas covered:

- dynamic authentication
- customer/member linking
- bookings and availability
- partial payments and refunds
- dynamic admin-created gaming systems
- dynamic games
- live station monitor
- day/night/custom pricing packages
- memberships and expiry
- loyalty points
- tournaments
- tournament brackets
- tournament leaderboard
- cafe integration points
- revenue analytics
- admin notification polling

For future development, preserve the single-source-of-truth architecture described here and avoid moving operational data back into static arrays in `data.ts` or `admin-data.ts`.
