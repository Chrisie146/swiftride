# SwiftRide — Claude Code Build Specification

## What We're Building
SwiftRide is a ride-hailing app for a small South African town (Queenstown, Eastern Cape).
Think Uber but simpler. Three types of users: passengers, drivers, and an admin (the owner).
Passengers book rides, drivers accept them, the owner manages everything and earns commission.

---

## Tech Stack — Do Not Deviate From This

| Layer | Technology |
|-------|-----------|
| Backend API | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Phone number + OTP (JWT tokens, no passwords) |
| SMS / OTP | BulkSMS API |
| Payments | PayFast (SA-based — supports SnapScan, card, instant EFT) |
| Admin dashboard | React + Vite (plain React, no Next.js) |
| Mobile apps | React Native with Expo |
| Notifications | BulkSMS in Phase 1; Firebase push in Phase 2 |
| Hosting | Railway.app |

---

## Monorepo Structure — Build Exactly This

```
swiftride/
├── CLAUDE.md                        ← this file
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.js                 ← Express entry point
│       ├── middleware/
│       │   └── auth.js              ← JWT requireAuth + requireRole
│       ├── utils/
│       │   ├── prisma.js            ← PrismaClient singleton
│       │   └── fare.js              ← Haversine distance + fare calc
│       ├── routes/
│       │   ├── auth.js
│       │   ├── rides.js
│       │   ├── drivers.js
│       │   └── admin.js
│       └── controllers/
│           ├── authController.js
│           ├── ridesController.js
│           ├── driversController.js
│           └── adminController.js
├── admin/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                  ← sidebar nav, page routing
│       ├── api.js                   ← axios instance with base URL + auth header
│       └── pages/
│           ├── Login.jsx            ← admin login with phone OTP
│           ├── PendingDrivers.jsx   ← approve / reject driver applications
│           ├── AllRides.jsx         ← table of all rides with filters
│           ├── Revenue.jsx          ← commission summary cards
│           └── Settlements.jsx      ← weekly cash commission per driver
├── passenger-app/
│   ├── package.json
│   ├── app.json                     ← Expo config (name: SwiftRide, slug: swiftride)
│   └── src/
│       ├── App.jsx                  ← Expo Router entry
│       ├── api.js                   ← axios instance
│       ├── context/
│       │   └── AuthContext.jsx      ← phone, token, user stored in SecureStore
│       └── screens/
│           ├── PhoneScreen.jsx      ← enter phone number
│           ├── OtpScreen.jsx        ← enter 6-digit OTP
│           ├── HomeScreen.jsx       ← enter pickup + dropoff, fare estimate, book
│           ├── TrackingScreen.jsx   ← live ride status + driver info
│           └── HistoryScreen.jsx    ← past rides list
└── driver-app/
    ├── package.json
    ├── app.json                     ← Expo config (name: SwiftRide Driver)
    └── src/
        ├── App.jsx
        ├── api.js
        ├── context/
        │   └── AuthContext.jsx
        └── screens/
            ├── PhoneScreen.jsx
            ├── OtpScreen.jsx
            ├── RegisterScreen.jsx   ← driver onboarding form
            ├── HomeScreen.jsx       ← online/offline toggle + incoming requests
            ├── RideScreen.jsx       ← active ride: arrived / complete buttons
            └── EarningsScreen.jsx   ← today / week earnings + cash owed
```

---

## Database Schema (Prisma)

Use this schema exactly. Do not rename models or fields.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  name      String
  role      Role     @default(PASSENGER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ridesAsPassenger Ride[]         @relation("Passenger")
  ridesAsDriver    Ride[]         @relation("Driver")
  driverProfile    DriverProfile?
  otpCodes         OtpCode[]
}

model OtpCode {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model DriverProfile {
  id                 String        @id @default(cuid())
  userId             String        @unique
  user               User          @relation(fields: [userId], references: [id])
  licenceNumber      String
  vehicleMake        String
  vehicleModel       String
  vehicleColor       String
  plateNumber        String        @unique
  status             DriverStatus  @default(PENDING)
  isOnline           Boolean       @default(false)
  currentLat         Float?
  currentLng         Float?
  rating             Float         @default(5.0)
  totalRides         Int           @default(0)
  subscriptionActive Boolean       @default(false)
  subscriptionExpiry DateTime?
  bankAccount        DriverBankAccount?
  commissionLedger   CommissionLedger[]
  createdAt          DateTime      @default(now())
}

model DriverBankAccount {
  id            String        @id @default(cuid())
  driverId      String        @unique
  driver        DriverProfile @relation(fields: [driverId], references: [id])
  bankName      String
  accountNumber String
  accountHolder String
  branchCode    String
  payfastId     String?
}

model Ride {
  id             String        @id @default(cuid())
  passengerId    String
  passenger      User          @relation("Passenger", fields: [passengerId], references: [id])
  driverId       String?
  driver         User?         @relation("Driver", fields: [driverId], references: [id])
  pickupAddress  String
  dropoffAddress String
  pickupLat      Float
  pickupLng      Float
  dropoffLat     Float
  dropoffLng     Float
  distanceKm     Float?
  fareAmount     Float?
  commissionAmt  Float?
  driverEarning  Float?
  status         RideStatus    @default(REQUESTED)
  paymentMethod  PaymentMethod
  paymentStatus  PaymentStatus @default(PENDING)
  requestedAt    DateTime      @default(now())
  acceptedAt     DateTime?
  arrivedAt      DateTime?
  completedAt    DateTime?
  cancelledAt    DateTime?
  passengerRating Int?
  driverRating    Int?
  commissionEntry CommissionLedger?
}

model CommissionLedger {
  id          String        @id @default(cuid())
  driverId    String
  driver      DriverProfile @relation(fields: [driverId], references: [id])
  rideId      String        @unique
  ride        Ride          @relation(fields: [rideId], references: [id])
  rideAmount  Float
  commission  Float
  driverOwes  Float
  method      PaymentMethod
  settled     Boolean       @default(false)
  settledAt   DateTime?
  createdAt   DateTime      @default(now())
}

enum Role          { PASSENGER DRIVER ADMIN }
enum DriverStatus  { PENDING APPROVED SUSPENDED }
enum RideStatus    { REQUESTED ACCEPTED ENROUTE ARRIVED COMPLETED CANCELLED }
enum PaymentMethod { CASH CARD SNAPSCAN }
enum PaymentStatus { PENDING PAID }
```

---

## Business Rules — Encode These Exactly

### Fare Calculation
- Base fare: R15.00
- Per km rate: R4.50
- Use Haversine formula for straight-line distance from GPS coordinates
- Commission rate: 15% of fare amount
- Driver earning = fare - commission
- All amounts rounded to 2 decimal places

### Payment Logic
- **CASH rides**: driver collects full cash from passenger. `driverOwes = commissionAmt`. Commission is NOT auto-settled — driver must pay weekly via EFT/SnapScan. `settled = false`.
- **CARD / SNAPSCAN rides**: PayFast collects from passenger and splits automatically. `driverOwes = 0`. `settled = true` immediately on ride complete.

### Driver Eligibility
- Driver must have status = `APPROVED` (set by admin) before they can go online or accept rides
- Driver with status = `PENDING` or `SUSPENDED` gets a clear error if they try to go online

### OTP Auth
- OTP is 6 digits, expires in 10 minutes
- In development (`NODE_ENV !== 'production'`): log OTP to console instead of sending SMS
- In production: send via BulkSMS API
- Normalise SA phone numbers: `0821234567` → `+27821234567`

### Commission Settlement
- Admins can mark a driver's outstanding cash commission as settled via `POST /admin/commission/:driverId/settle`
- This sets `settled = true` and `settledAt = now()` on all unsettled CASH ledger entries for that driver
- If a driver's unsettled cash commission exceeds R500, flag them in the admin dashboard (add `cashWarning: true` field to revenue endpoint response)

---

## API Endpoints — Build All of These

### Auth
```
POST /auth/request-otp    body: { phone, name? }
POST /auth/verify-otp     body: { userId, code }
```

### Rides
```
POST /rides/estimate      body: { pickupLat, pickupLng, dropoffLat, dropoffLng }
POST /rides/request       body: { pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, paymentMethod }
GET  /rides/history       returns last 20 completed rides for the authenticated user
GET  /rides/:id           returns ride with passenger + driver info included
POST /rides/:id/cancel
POST /rides/:id/accept    driver only
POST /rides/:id/arrived   driver only
POST /rides/:id/complete  driver only — triggers commission ledger entry
```

### Drivers
```
POST /drivers/register    body: { licenceNumber, vehicleMake, vehicleModel, vehicleColor, plateNumber }
POST /drivers/status      body: { online: bool, lat: float, lng: float }
GET  /drivers/requests    returns all REQUESTED rides (Phase 2: filter by proximity)
GET  /drivers/earnings    returns { todayEarnings, weekEarnings, todayRides, cashOwed, rating, totalRides }
```

### Admin (all require ADMIN role)
```
GET  /admin/drivers/pending
POST /admin/drivers/:id/approve
POST /admin/drivers/:id/reject         body: { reason }
GET  /admin/rides                      query: { status?, limit? }
GET  /admin/revenue                    returns { todayCommission, weekCommission, cashPending, totalCompletedRides }
POST /admin/commission/:driverId/settle
```

---

## Environment Variables

Create `backend/.env.example` with all of these — the app must read them via `process.env`:

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=30d
BULKSMS_USERNAME=
BULKSMS_PASSWORD=
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_SANDBOX=true
PORT=3000
NODE_ENV=development
COMMISSION_RATE=0.15
BASE_FARE=15
PER_KM_RATE=4.50
OTP_EXPIRY_MINUTES=10
```

---

## Admin Dashboard Pages

### Login.jsx
- Enter phone number → request OTP → enter OTP → verify
- On success store JWT in localStorage as `adminToken`
- Redirect to dashboard

### PendingDrivers.jsx
- Fetch `GET /admin/drivers/pending`
- Show each driver: name, phone, vehicle details, licence number
- Approve button (green) and Reject button (red)
- On reject, prompt for reason text before calling API
- Remove card from list on approve or reject (optimistic update)

### AllRides.jsx
- Fetch `GET /admin/rides`
- Table columns: Passenger, Driver, Pickup → Dropoff, Fare, Payment, Status, Time
- Status shown as coloured badge (REQUESTED=amber, ACCEPTED=blue, COMPLETED=green, CANCELLED=red)
- Filter dropdown by status

### Revenue.jsx
- Fetch `GET /admin/revenue`
- Show 3 stat cards: Today's Commission, This Week's Commission, Cash Pending Collection
- If cashPending > 0, show it in red

### Settlements.jsx
- For each driver with unsettled cash commission:
  - Show driver name, phone, number of unsettled rides, total cash owed
  - "Mark Settled" button → calls `POST /admin/commission/:driverId/settle`
  - Refresh list after settlement

---

## Passenger App Screens

### PhoneScreen.jsx
- Text input for SA phone number (placeholder: 082 123 4567)
- "Send OTP" button → calls `POST /auth/request-otp`
- Navigate to OtpScreen with userId

### OtpScreen.jsx
- 6 individual digit inputs (auto-advance on each digit)
- Resend OTP link (after 30s countdown)
- On verify → store token + user in AuthContext + SecureStore
- Navigate to HomeScreen

### HomeScreen.jsx
- Two text inputs: Pickup address, Drop-off address
- Payment method selector: Cash | Card | SnapScan (tappable pills)
- "Estimate Fare" button → shows fare breakdown card (distance, base, per km, total)
- "Request Ride" button → creates ride → navigates to TrackingScreen

### TrackingScreen.jsx
- Shows current ride status with descriptive text per status
- When status = ACCEPTED or later: show driver name, vehicle, plate, rating
- 4-step progress bar: Requested → Confirmed → En Route → Arrived
- Cancel button (only shown when status = REQUESTED or ACCEPTED)
- Poll `GET /rides/:id` every 5 seconds to update status

### HistoryScreen.jsx
- FlatList of completed rides
- Each card: date, pickup → dropoff, fare amount, payment method, driver name

---

## Driver App Screens

### RegisterScreen.jsx
- Form: Licence Number, Vehicle Make, Vehicle Model, Vehicle Color, Plate Number
- Submit → `POST /drivers/register`
- Show "Application submitted — you'll be notified once approved" message
- Pending approval screen shown until status = APPROVED

### HomeScreen.jsx (driver)
- Large toggle: Go Online / Go Offline → calls `POST /drivers/status`
- When online: show list of incoming ride requests (poll `GET /drivers/requests` every 5s)
- Each request card: passenger name, pickup address, dropoff address, fare, distance, payment method
- Accept button → `POST /rides/:id/accept` → navigate to RideScreen
- Decline button → removes card from list locally

### RideScreen.jsx
- Shows active ride details: passenger name, pickup + dropoff addresses, fare
- "I've Arrived" button → `POST /rides/:id/arrived`
- "Complete Ride" button (shown after arrived) → `POST /rides/:id/complete`
- On complete: show earnings summary for this ride

### EarningsScreen.jsx
- Today's earnings and ride count
- This week's earnings
- Cash owed to SwiftRide (from cash rides)
- Star rating
- Note: "Cash commission must be settled weekly via EFT or SnapScan to [admin SnapScan/EFT details]"

---

## Coding Conventions

- Use CommonJS (`require` / `module.exports`) throughout the backend
- Use ES modules (`import` / `export`) in admin and mobile apps
- All async functions use `async/await` with `try/catch`
- All errors return `{ error: string }` JSON with appropriate HTTP status
- No TypeScript — plain JavaScript throughout
- No test files needed for MVP
- Format currency as `R X.XX` (South African Rand)
- Date/time display: use `toLocaleString('en-ZA')` format

---

## Build Order — Follow This Sequence

Work through the project in this exact order. Complete each phase fully before moving on.

### Phase 1: Backend Foundation
1. Create `backend/` with `package.json`, install dependencies
2. Write `prisma/schema.prisma` (exact schema above)
3. Create `.env.example`
4. Write `src/utils/prisma.js` and `src/utils/fare.js`
5. Write `src/middleware/auth.js`
6. Write auth routes + controller (OTP flow)
7. Write rides routes + controller (all 8 endpoints)
8. Write drivers routes + controller (all 4 endpoints)
9. Write admin routes + controller (all 6 endpoints)
10. Write `src/index.js` entry point
11. Run `prisma migrate dev --name init` to create tables

### Phase 2: Admin Dashboard
12. Create `admin/` with Vite + React
13. Build Login page (OTP flow)
14. Build PendingDrivers page
15. Build AllRides page
16. Build Revenue page
17. Build Settlements page
18. Wire up sidebar navigation in App.jsx

### Phase 3: Passenger App
19. Create `passenger-app/` with Expo
20. Set up AuthContext with SecureStore
21. Build PhoneScreen + OtpScreen
22. Build HomeScreen (book ride flow)
23. Build TrackingScreen with 5s polling
24. Build HistoryScreen

### Phase 4: Driver App
25. Create `driver-app/` with Expo
26. Set up AuthContext
27. Build PhoneScreen + OtpScreen + RegisterScreen
28. Build HomeScreen (online toggle + requests)
29. Build RideScreen (arrived + complete flow)
30. Build EarningsScreen

---

## Dependencies

### backend/package.json
```json
{
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "axios": "^1.6.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.3",
    "prisma": "^5.10.0"
  }
}
```

### admin/package.json
```json
{
  "dependencies": {
    "axios": "^1.6.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  }
}
```

### passenger-app/package.json and driver-app/package.json
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "axios": "^1.6.7",
    "react": "18.3.2",
    "react-native": "0.76.5"
  }
}
```

---

## What NOT to Build in This Phase

- No real-time GPS tracking (use polling for now)
- No in-app PayFast payment screen (placeholder only — full integration in Phase 2)
- No push notifications (SMS only for now)
- No ratings UI (store the fields in DB but no UI yet)
- No driver document uploads
- No surge pricing

Add `// TODO Phase 2: [description]` comments where these will go.

---

## When You're Done

Run through this checklist:

- [ ] `cd backend && npm install && npx prisma migrate dev` runs without errors
- [ ] `GET /health` returns `{ status: 'ok' }`
- [ ] `POST /auth/request-otp` with `{ phone: "0821234567", name: "Test User" }` logs OTP to console in dev
- [ ] `POST /auth/verify-otp` returns a JWT token
- [ ] `POST /rides/estimate` with valid coordinates returns fare breakdown
- [ ] `cd admin && npm install && npm run dev` opens the dashboard in browser
- [ ] Expo apps start with `npx expo start` in each app directory