// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import bookReducer from './slices/bookSlice';
import authReducer from './slices/authSlice'; // Dibuat nanti

export const store = configureStore({
  reducer: {
    books: bookReducer,
    auth: authReducer,
    // tambahkan reducer lain jika ada
  },
});