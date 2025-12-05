import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import petaniRoutes from './routes/petani.routes.js';
import kelompokTaniRoutes from './routes/kelompokTani.routes.js';
import komoditasRoutes from './routes/komoditas.routes.js';
import laporanRoutes from './routes/laporan.routes.js';
import kecamatanRoutes from './routes/kecamatan.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/petani', petaniRoutes);
app.use('/api/kelompok-tani', kelompokTaniRoutes);
app.use('/api/komoditas', komoditasRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/kecamatan', kecamatanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

