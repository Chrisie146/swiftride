# SwiftRide

A ride-hailing app for Queenstown, Eastern Cape — simplified Uber for small towns.

## Project Structure

```
swiftride/
├── backend/          Node.js + Express API
├── admin/            React + Vite admin dashboard
├── passenger-app/    React Native + Expo passenger app
└── driver-app/       React Native + Expo driver app
```

## Getting Started

### 1. Set up the database

Install PostgreSQL and create a database called `swiftride`.

### 2. Start the backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

The backend runs on http://localhost:3000

### 3. Start the admin dashboard

```bash
cd admin
npm install
npm run dev
```

The admin dashboard runs on http://localhost:5173

### 4. Start the mobile apps

```bash
# Passenger app
cd passenger-app
npx expo start

# Driver app
cd driver-app
npx expo start
```

## Default credentials (development)

- OTP in dev mode is logged to the console (not sent via SMS)
- To create an admin user, manually set `role = 'ADMIN'` in the database for a user

## Business Rules

- Base fare: R15.00
- Per km: R4.50 (Haversine distance)
- Commission: 15% of fare
- Cash rides: driver owes commission weekly
- Card/SnapScan rides: commission auto-settled immediately
