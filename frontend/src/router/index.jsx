import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import DataPetani from '../pages/DataPetani';
import DataKelompokTani from '../pages/DataKelompokTani';
import DataKomoditas from '../pages/DataKomoditas';
import Laporan from '../pages/Laporan';
import Profil from '../pages/Profil';
import Layout from '../layouts/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'petani',
        element: <DataPetani />
      },
      {
        path: 'kelompok-tani',
        element: <DataKelompokTani />
      },
      {
        path: 'komoditas',
        element: <DataKomoditas />
      },
      {
        path: 'laporan',
        element: <Laporan />
      },
      {
        path: 'profil',
        element: <Profil />
      }
    ]
  }
]);

export default router;

