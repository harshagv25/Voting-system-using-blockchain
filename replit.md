# VoteChain India — Digital Voting System

## Overview

A government-grade digital voting system prototype with blockchain-backed vote records, face authentication, Aadhaar verification, and real-time results.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, Recharts)
- **Face Detection**: @vladmandic/face-api (TensorFlow.js based)
- **Blockchain**: SHA-256 hash chaining (simulated)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all backend routes)
│   └── voting-system/      # React frontend (dark glassmorphism UI)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
```

## Database Schema

- `voters` — Registered voters (voterId PK, email unique, aadhaarHash unique, faceDescriptor JSON)
- `candidates` — Election candidates (name, party, description, voteCount)
- `votes` — Blockchain blocks (blockIndex, voterId hash, candidateId, previousHash, hash, nonce)
- `election` — Election state (isActive, resultsHidden, startedAt, endedAt)
- `fraud_logs` — Fraud attempt log (attemptType, details, voterId, ipAddress)

## Key Features

- **Registration**: Name + Email + Password + 12-digit Aadhaar (validated) + Face capture
- **Aadhaar**: Stored as SHA-256 hash only, re-verified at login
- **Face Auth**: @vladmandic/face-api, 128-dim descriptor comparison, threshold 0.6
- **Blockchain**: SHA-256 hash chaining, proof-of-work (nonce, starts with "00"), immutable records
- **Admin Panel**: Login with `admin@vote.gov.in` / `Admin@123`
- **Results**: Bar + pie charts (Recharts), admin toggle to hide/show, auto-refresh
- **Languages**: English + Hindi toggle, stored in localStorage
- **Voice Guidance**: Web Speech API for key actions

## API Routes (all under /api)

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-aadhaar
- POST /api/auth/store-face
- GET /api/auth/me
- GET /api/auth/face-descriptor/:voterId
- GET /api/candidates
- POST /api/candidates (admin)
- PUT /api/candidates/:id (admin)
- DELETE /api/candidates/:id (admin)
- POST /api/voting/cast
- GET /api/voting/status/:voterId
- GET /api/results
- GET /api/blockchain
- GET /api/blockchain/validate
- GET /api/admin/election
- PUT /api/admin/election
- GET /api/admin/stats
- POST /api/admin/reset
- GET /api/admin/fraud-log
- POST /api/admin/fraud-log
- PUT /api/admin/toggle-results

## Seeded Candidates

1. Rajesh Kumar Singh — Bharatiya Vikas Party 🌾
2. Priya Sharma — National Progressive Alliance 🌿
3. Amit Desai — United Citizens Front ⚡
4. Kavita Nair — Peoples Democratic Party 🏥
