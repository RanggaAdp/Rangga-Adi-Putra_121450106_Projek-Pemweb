// src/components/PrivateRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute() {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  // Jika status masih 'idle' atau 'loading', mungkin token sedang diverifikasi
  // atau initial state belum terupdate. Bisa tambahkan loading indicator.
  // Untuk kesederhanaan, kita hanya cek isAuthenticated.
  if (status === 'loading') {
    return <div>Loading authentication status...</div>; // Atau spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;