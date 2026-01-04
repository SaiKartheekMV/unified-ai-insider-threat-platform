# Unified AI-Driven Insider Threat Detection & Zero-Trust Access Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

![Demo Animation](https://via.placeholder.com/800x400/000000/FFFFFF?text=Demo+Animation+Coming+Soon)

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
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

This is a comprehensive AI-driven platform for detecting insider threats in enterprise systems. It uses behavioral analysis and machine learning to identify suspicious activities while enforcing Zero-Trust security principles. The system combines anomaly detection with robust access control to provide proactive security monitoring.

## Problem Statement

Traditional security systems struggle to detect malicious activities from legitimate users who already have authorized access. Insider threats are among the most costly and difficult security risks to identify, often causing significant damage before detection. Current solutions lack the intelligence needed to distinguish between normal and suspicious user behavior patterns.

## Solution

An intelligent security platform that continuously monitors user behavior, detects anomalies using machine learning models, enforces zero-trust access decisions based on real-time risk assessment, provides alerts and analytics dashboards, and integrates with existing enterprise infrastructure.

## Features

- Role-Based Access Control (RBAC) with granular permission management
- Behavioral anomaly detection using ML-powered threat identification with Isolation Forest algorithm
- Real-time security event streaming for continuous monitoring and logging
- Risk scoring engine with dynamic assessment for users and actions
- Admin dashboard with comprehensive analytics and alert management
- API-first design with RESTful APIs for easy integration
- Swagger documentation for interactive API exploration
- Zero-trust architecture following the "never trust, always verify" principle

## Tech Stack

### Backend
- Runtime: Node.js 18.x
- Framework: Express.js 5.x with TypeScript
- Database: PostgreSQL 13+ with pg driver
- Cache: Redis 7.x for session management
- Authentication: JWT with bcrypt hashing
- Validation: Zod schema validation
- Documentation: Swagger/OpenAPI

### AI Engine
- Runtime: Python 3.8+
- Framework: FastAPI (ASGI)
- ML Library: Scikit-learn with Isolation Forest
- Data Processing: Pandas
- Database: PostgreSQL via psycopg2
- Serialization: Joblib for model persistence

### DevOps & Tools
- Containerization: Docker
- CI/CD: GitHub Actions (planned)
- Version Control: Git
- Package Management: npm (Node.js), pip (Python)

## Architecture
```
┌─────────────────┐       ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │       │    Backend      │    │    AI Engine    │
│   (Planned)     │◄──►   │    (Express)    │◄──►│  FastAPI/Python │
│   Next.js       │       │    Typescript   │    │                 │
└─────────────────┘       └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   ML Models     │
│   Database      │    │   Cache/Session │    │   (Isolation    │
└─────────────────┘    └─────────────────┘    │    Forest)      │
                                              └─────────────────┘
```

### Component Overview

Backend Service handles authentication, authorization, user management, and activity logging. AI Engine processes behavioral data, trains anomaly detection models, and provides risk scores. Database Layer stores user profiles, activity logs, and system configuration. Cache Layer manages sessions and frequently accessed data.

## Installation

### Prerequisites

You'll need Node.js 18.x or higher, Python 3.8+ with pip, PostgreSQL 13+, Redis 7.x, and optionally Docker for containerized deployment.

### Backend Setup
```bash
cd backend
npm install
npm run build
```

### AI Engine Setup
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
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
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

**AI Engine**:
```bash
cd ai-engine
uvicorn app.main:app --reload  # Development
uvicorn app.main:app  # Production
```

### API Endpoints

- Authentication: `POST /api/auth/login`, `POST /api/auth/register`
- Users: `GET /api/users`, `POST /api/users`
- Activity Logs: `GET /api/logs/activity`
- Anomaly Detection: `POST /api/ai/detect`

### Swagger Documentation

Access API docs at: `http://localhost:3000/api/docs`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

### User Management
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)

### Activity Monitoring
- `GET /api/logs/activity` - Fetch activity logs
- `POST /api/logs/activity` - Log user activity

### AI Services
- `POST /api/ai/detect` - Detect anomalies in user behavior

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
