// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import ReadBookPage from './pages/ReadBookPage';
import WriteBookPage from './pages/WriteBookPage';

function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-3">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<HomePage />} />
            <Route path="add-book" element={<AddBookPage />} />
            <Route path="edit-book/:id" element={<EditBookPage />} />
            <Route path="books/:id/read" element={<ReadBookPage />} />
            <Route path="books/:id/write" element={<WriteBookPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;