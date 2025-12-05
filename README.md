# Sistem Pendataan Petani dan Kelompok Tani Kota Manado

Aplikasi web untuk pendataan petani dan kelompok tani untuk Dinas Pertanian, Kelautan, dan Perikanan Kota Manado.

## Teknologi yang Digunakan

### Backend
- Node.js dengan Express.js
- Prisma ORM
- PostgreSQL
- JWT untuk autentikasi
- bcryptjs untuk hashing password

### Frontend
- React dengan Vite
- TailwindCSS untuk styling
- Axios untuk HTTP requests
- Zustand untuk state management
- React Router untuk routing
- Chart.js untuk visualisasi data
- jsPDF untuk ekspor PDF

## Struktur Proyek

```
saya-petani/
├── backend/          # Backend API
│   ├── controllers/  # Controller functions
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication & authorization
│   ├── utils/        # Utility functions
│   └── prisma/       # Prisma schema
└── frontend/         # Frontend React app
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── layouts/     # Layout components
    │   ├── services/    # API services
    │   ├── store/       # Zustand stores
    │   ├── router/      # React Router config
    │   └── utils/       # Utility functions
```

## Setup dan Instalasi

### Prerequisites
- Node.js (v18 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

### Backend Setup

1. Masuk ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` berdasarkan `.env.example`:
```bash
cp .env.example .env
```

4. Edit file `.env` dan isi dengan konfigurasi database Anda:
```
DATABASE_URL="postgresql://user:password@localhost:5432/saya_petani?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Jalankan migrasi database:
```bash
npm run prisma:migrate
```

7. (Opsional) Seed database dengan data awal:
```bash
npm run seed
```

8. Jalankan server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### Frontend Setup

1. Masuk ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Akun Default

Setelah menjalankan seed, akun berikut tersedia:

- **Admin**: username: `admin`, password: `admin123`
- **Penyuluh**: username: `penyuluh`, password: `penyuluh123`
- **Kepala Bidang**: username: `kepalabidang`, password: `kepalabidang123`
- **Kepala Dinas**: username: `kepaladinas`, password: `kepaladinas123`

## Fitur

### Autentikasi
- Login berbasis username dan password
- JWT token-based authentication
- Role-based access control (RBAC)

### Dashboard
- Ringkasan statistik (jumlah petani, kelompok tani, luas lahan, komoditas)
- Grafik pie chart distribusi komoditas
- Grafik bar chart kelompok tani per kecamatan

### Data Petani
- CRUD data petani
- Pencarian dan filter berdasarkan kecamatan/komoditas
- Form lengkap: nama, NIK, alamat, kontak, luas lahan, jenis tanaman, kelompok tani

### Data Kelompok Tani
- CRUD data kelompok tani
- Detail kelompok: daftar anggota, komoditas, lahan
- Pencarian dan filter

### Data Komoditas
- CRUD data komoditas
- Informasi: jenis, luas tanam, estimasi panen, pupuk, pestisida

### Laporan
- Laporan statistik petani, kelompok tani, dan komoditas
- Ekspor ke Excel (XLSX)
- Ekspor ke PDF

### Profil Pengguna
- Lihat informasi profil
- Ubah password

## Role dan Hak Akses

- **Penyuluh**: Dapat menginput data (petani, kelompok tani, komoditas)
- **Admin**: Dapat mengelola dan memverifikasi semua data
- **Kepala Bidang**: Dapat memantau dan mengakses laporan
- **Kepala Dinas**: Hanya dapat melihat laporan final

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/change-password` - Change password

### Petani
- `GET /api/petani` - Get all petani
- `GET /api/petani/:id` - Get petani by id
- `POST /api/petani` - Create petani (Penyuluh, Admin)
- `PUT /api/petani/:id` - Update petani (Penyuluh, Admin)
- `DELETE /api/petani/:id` - Delete petani (Admin)

### Kelompok Tani
- `GET /api/kelompok-tani` - Get all kelompok tani
- `GET /api/kelompok-tani/:id` - Get kelompok tani by id
- `POST /api/kelompok-tani` - Create kelompok tani (Penyuluh, Admin)
- `PUT /api/kelompok-tani/:id` - Update kelompok tani (Penyuluh, Admin)
- `DELETE /api/kelompok-tani/:id` - Delete kelompok tani (Admin)

### Komoditas
- `GET /api/komoditas` - Get all komoditas
- `GET /api/komoditas/:id` - Get komoditas by id
- `POST /api/komoditas` - Create komoditas (Penyuluh, Admin)
- `PUT /api/komoditas/:id` - Update komoditas (Penyuluh, Admin)
- `DELETE /api/komoditas/:id` - Delete komoditas (Admin)

### Laporan
- `GET /api/laporan/dashboard` - Get dashboard statistics
- `GET /api/laporan/petani` - Get laporan petani (Kepala Bidang, Kepala Dinas, Admin)
- `GET /api/laporan/kelompok-tani` - Get laporan kelompok tani (Kepala Bidang, Kepala Dinas, Admin)
- `GET /api/laporan/komoditas` - Get laporan komoditas (Kepala Bidang, Kepala Dinas, Admin)
- `GET /api/laporan/export/excel?type=petani|kelompok-tani|komoditas` - Export Excel
- `GET /api/laporan/export/pdf?type=petani|kelompok-tani|komoditas` - Export PDF

### Kecamatan
- `GET /api/kecamatan` - Get all kecamatan
- `POST /api/kecamatan` - Create kecamatan (Admin)

## Development

### Backend
```bash
cd backend
npm run dev        # Development mode dengan watch
npm start          # Production mode
npm run prisma:studio  # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev        # Development server
npm run build      # Build untuk production
npm run preview    # Preview production build
```

## Production Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Setup environment variables di production server

3. Jalankan migrasi database:
```bash
cd backend
npm run prisma:migrate
```

4. Start backend server:
```bash
cd backend
npm start
```

5. Serve frontend build dengan web server (nginx, Apache, dll)

## Lisensi

ISC

