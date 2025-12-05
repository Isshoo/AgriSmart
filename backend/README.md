# Backend API - Sistem Pendataan Petani

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` ke `.env` dan isi dengan konfigurasi database Anda:
```bash
cp .env.example .env
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Jalankan migrasi database:
```bash
npm run prisma:migrate
```

5. (Opsional) Seed database:
```bash
npm run seed
```

6. Jalankan server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Jalankan server dalam mode development dengan watch
- `npm start` - Jalankan server dalam mode production
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Jalankan migrasi database
- `npm run prisma:studio` - Buka Prisma Studio
- `npm run seed` - Seed database dengan data awal

