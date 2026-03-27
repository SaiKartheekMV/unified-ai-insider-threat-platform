# Unified AI-Driven Insider Threat Detection & Zero-Trust Access Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)

![Demo Animation](https://via.placeholder.com/800x400/000000/FFFFFF?text=Demo+Animation+Coming+Soon)

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Current Status](#current-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Overview

This is a comprehensive AI-driven platform for detecting insider threats in enterprise systems. It uses behavioral analysis and machine learning to identify suspicious activities while enforcing Zero-Trust security principles. The system combines anomaly detection with robust access control to provide proactive security monitoring and an enterprise-grade UI.

## Problem Statement

Traditional security systems struggle to detect malicious activities from legitimate users who already have authorized access. Insider threats are among the most costly and difficult security risks to identify, often causing significant damage before detection. Current solutions lack the intelligence needed to distinguish between normal and suspicious user behavior patterns.

## Solution

An intelligent security platform that continuously monitors user behavior, detects anomalies using machine learning models, enforces zero-trust access decisions based on real-time risk assessment, provides alerts and analytics dashboards, and integrates with existing enterprise infrastructure.

## Current Status

- Fully working Next.js frontend with enterprise-grade UI
- Express + PostgreSQL backend with JWT auth and RBAC
- Live telemetry feed and alerting pipeline
- CorpVault HR module with role-based controls and risk triggers
- Intruder imagery capture and incident response drawer
- Audit trail panel (admin-only)

## Features

### Security Operations Dashboard
- Live endpoint telemetry feed
- Active anomalies and locked account counters
- Intruder imagery grid with side-drawer incident response
- Incident Response drawer with:
  - Severity and baseline badge
  - Device fingerprint (user-agent + IP)
  - Quarantine and unlock actions
  - Risk timeline (recent actions for the selected user)

### CorpVault HR Module
- Admin vs Employee access rules
- Add, edit, delete employee controls restricted by role
- Role-based UI (disabled actions for EMPLOYEE)
- Audit Trail tab (admin-only)
- Employee detail drawer
- High-risk trigger actions for employees:
  - Admin logs access attempt
  - Bulk payroll download
  - Data exfiltration simulation
  - Repeated failed privilege escalation attempts

### Platform & Security
- Role-Based Access Control (RBAC) with granular permission management
- Behavioral anomaly detection using ML-powered threat identification
- Real-time security event streaming for continuous monitoring and logging
- Risk scoring engine with dynamic assessment for users and actions
- API-first design with RESTful APIs for easy integration
- Swagger documentation for interactive API exploration
- Zero-trust architecture following the "never trust, always verify" principle

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript + Tailwind CSS
- Framer Motion animations

### Backend
- Runtime: Node.js 18.x
- Framework: Express.js 5.x with TypeScript
- Database: PostgreSQL 13+ with pg driver
- Cache: Redis 7.x for session management
- Authentication: JWT with bcrypt hashing
- Documentation: Swagger/OpenAPI

### AI Engine
- Runtime: Python 3.8+
- Framework: FastAPI (ASGI)
- ML Library: Scikit-learn with Isolation Forest
- Data Processing: Pandas
- Database: PostgreSQL via psycopg2
- Serialization: Joblib for model persistence
- Note: Present as a placeholder service for future integration

### DevOps & Tools
- Containerization: Docker
- CI/CD: GitHub Actions (planned)
- Version Control: Git
- Package Management: npm (Node.js), pip (Python)

## Architecture
```
Frontend (Next.js)  <---->  Backend (Express API)  <---->  PostgreSQL
       |                         |                      |
       |                         |                      +-- Users / Alerts / Logs / Employees
       |                         |
       |                         +-- Zero-trust ingestion + anomaly pipeline hooks
       |
       +-- CorpVault HR + Security Dashboard UI
```

## Installation

### Prerequisites

You'll need Node.js 18.x or higher, Python 3.8+ with pip, PostgreSQL 13+, Redis 7.x, and optionally Docker for containerized deployment.

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### AI Engine Setup (Optional)
```bash
cd ai-engine
pip install -r requirements.txt
```

### Database Setup
```sql
-- Run the schema from docs/db-schema.sql
psql -U postgres -d your_database < docs/db-schema.sql
```

### Environment Configuration

Create `.env` files in both `backend/` and `ai-engine/` directories.

**backend/.env**:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/insider_threat_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

**ai-engine/.env**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Usage

### Starting the Services

**Backend**:
```bash
cd backend
npm run dev  # Development
npm run build && npm start  # Production
```

**Frontend**:
```bash
cd frontend
npm run dev  # Development
npm run build && npm start  # Production
```

**AI Engine** (optional):
```bash
cd ai-engine
uvicorn app.main:app --reload  # Development
uvicorn app.main:app  # Production
```

### Core UI Areas
- Security Dashboard: `/dashboard`
- CorpVault HR: `/corpvault`
- Admin Alerts: `/dashboard/alerts`

## API Documentation

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

### Admin & Monitoring
- `GET /api/users`
- `GET /api/admin`
- `GET /api/admin/alerts`
- `GET /api/admin/logs`
- `GET /api/admin/timeline`
- `POST /api/admin/lock/:id`
- `POST /api/admin/unlock/:id`

### Platform Ingestion
- `POST /api/platform/ingest`
- `POST /api/platform/capture`

### CorpVault HR
- `GET /api/ems/employees`
- `POST /api/ems/employees`
- `DELETE /api/ems/employees/:id`

### Swagger Documentation

Access API docs at: `http://localhost:5000/api/docs`

## Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

Fork the repository, create a feature branch (`git checkout -b feature/amazing-feature`), commit your changes (`git commit -m 'Add amazing feature'`), push to the branch (`git push origin feature/amazing-feature`), and open a Pull Request.

### Development Guidelines

Follow TypeScript best practices, write comprehensive tests, update documentation for API changes, and use conventional commit messages.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with Trust for Enterprise Security**
