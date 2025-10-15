# Mouzaia Clinic Pharmacy App

A modern, fully isolated frontend application for managing pharmacy inventory and distributing medicines to staff members.

## Features

- 🔐 **Keycloak Authentication** - Secure authentication via Keycloak SSO
- 💊 **Medicine Inventory Management** - Add, view, and soft-delete medicines
- 📦 **Stock Management** - Track medicine stock levels in real-time
- 👥 **Staff Distribution** - Distribute medicines to authorized staff members
- 🔍 **QR Code Scanning** - Scan staff ID cards to identify recipients
- ✅ **Role-Based Access** - Enforces Keycloak roles for all operations
- 📊 **Modern UI** - Built with Mantine UI for a beautiful user experience
- 🛡️ **Type-Safe** - Full TypeScript with Zod validation

## Architecture

This is a **frontend-only** application that communicates with the Mouzaia Clinic Hub backend through the KraKend API Gateway. It has **zero backend logic** - all business logic is handled by the microservices.

### Integration Points

- **Keycloak**: Authentication and authorization
- **KraKend API Gateway**: Routes all API requests to appropriate microservices
- **Identity Service**: User lookup by national ID
- **Pharmacy Service**: Medicine CRUD and distribution operations

## Prerequisites

- Node.js 18+ and npm
- Access to the Mouzaia Clinic Hub infrastructure:
  - Keycloak server
  - KraKend API Gateway
  - Backend services (identity-service, pharmacy-service)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_KEYCLOAK_URL=http://hubkeycloak.mouzaiaclinic.local
VITE_KEYCLOAK_REALM=clinic-mouzaia-hub
VITE_KEYCLOAK_CLIENT_ID=pharmacy
VITE_API_BASE_URL=http://hubapi.mouzaiaclinic.local:8080
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Docker Deployment

### Build Docker Image

```bash
docker build -t mouzaia-pharmacy-app .
```

### Run Container

```bash
docker run -p 8080:80 mouzaia-pharmacy-app
```

### Docker Compose (Standalone)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  pharmacy-app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## Usage

### Login

1. Navigate to the app URL
2. You'll be redirected to Keycloak login
3. Login with pharmacist credentials

### Managing Medicines

1. **Add Medicine**: Click "Add Medicine" button
2. **View Inventory**: All medicines are displayed in the table
3. **Delete Medicine**: Click the trash icon (soft delete)

### Distributing Medicines

1. Click "Distribute to Staff" button
2. **Step 1**: Select medicines and quantities
3. **Step 2**: Scan staff ID card (or enter national ID manually)
4. **Step 3**: Confirm and distribute

### Testing

Use these test national IDs:
- `P-0001`: Pharmacist (has all permissions)
- `S1-0001`: Staff 1 (allowed to take medicines)
- `S2-0002`: Staff 2 (NOT allowed to take medicines - will fail)

## Project Structure

```
mouzaia-clinic-pharmacy-app/
├── src/
│   ├── components/         # React components
│   │   ├── MedicinesList.tsx
│   │   ├── AddMedicineModal.tsx
│   │   ├── DistributeMedicinesModal.tsx
│   │   └── QrScannerModal.tsx
│   ├── config/
│   │   └── keycloak.ts    # Keycloak configuration
│   ├── services/
│   │   └── api.ts         # API service layer
│   ├── types/
│   │   └── index.ts       # TypeScript types and Zod schemas
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── vite-env.d.ts      # Vite env types
├── public/
├── Dockerfile             # Production Dockerfile
├── nginx.conf             # Nginx configuration
├── postcss.config.cjs     # PostCSS config for Mantine
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Mantine UI 7** - Component library
- **Keycloak JS** - Authentication client
- **Zod** - Runtime validation
- **Nginx** - Production web server

## Security

- All API requests require valid Keycloak JWT tokens
- Tokens are automatically refreshed before expiration
- Role-based access control enforced at API gateway level
- No sensitive data stored in frontend
- HTTPS recommended for production

## Isolation & Portability

This app is **100% isolated** and can be moved to its own repository:

```bash
# Copy the entire directory
cp -r mouzaia-clinic-pharmacy-app /path/to/new/repo
cd /path/to/new/repo

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin <your-repo-url>
git push -u origin main
```

No dependencies on parent project files - everything needed is self-contained.

## Troubleshooting

### Authentication Issues
- Verify Keycloak URL is accessible
- Check that the `pharmacy` client exists in Keycloak
- Ensure redirect URIs are configured in Keycloak

### API Errors
- Check that KraKend gateway is running
- Verify API_BASE_URL in `.env`
- Check browser console for CORS issues

### Build Failures
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

Part of the Mouzaia Clinic Hub project.
