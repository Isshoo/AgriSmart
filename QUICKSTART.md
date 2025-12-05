# Quick Start Guide

## Langkah Cepat Setup

### 1. Setup Database PostgreSQL

Buat database baru:
```sql
CREATE DATABASE saya_petani;
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/saya_petani?schema=public"
JWT_SECRET="change-this-secret-key-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Generate Prisma dan migrasi:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Jalankan server:
```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Akses Aplikasi

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 5. Login

Gunakan salah satu akun default:
- Admin: `admin` / `admin123`
- Penyuluh: `penyuluh` / `penyuluh123`
- Kepala Bidang: `kepalabidang` / `kepalabidang123`
- Kepala Dinas: `kepaladinas` / `kepaladinas123`

## Troubleshooting

### Error: Cannot find module '@prisma/client'
```bash
cd backend
npm run prisma:generate
```

### Error: Database connection
- Pastikan PostgreSQL berjalan
- Periksa DATABASE_URL di file `.env`
- Pastikan database sudah dibuat

### Error: Port already in use
- Ubah PORT di file `.env` backend
- Atau hentikan proses yang menggunakan port tersebut

