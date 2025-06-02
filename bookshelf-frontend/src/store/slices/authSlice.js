// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:3001/api/auth';
// Ambil token dari local storage jika ada (untuk persistensi login sederhana)
const userToken = localStorage.getItem('userToken')
  ? localStorage.getItem('userToken')
  : null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(
        `${AUTH_API_URL}/login`,
        { username, password },
        config
      );
      localStorage.setItem('userToken', response.data.token); // Simpan token
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data.msg || error.response.data : 'Login Gagal');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await axios.post(
        `${AUTH_API_URL}/register`,
        { username, password },
        config
      );
      // Otomatis login setelah register atau arahkan ke halaman login
      // Di sini kita hanya mengembalikan data registrasi
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data.msg || error.response.data : 'Registrasi Gagal');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: userToken,
    isAuthenticated: !!userToken, // true jika token ada
    user: null, // Bisa diisi info user dari token jika di-decode
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    registerStatus: 'idle',
    registerError: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userToken'); // Hapus token dari local storage
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Anda bisa decode token di sini untuk mendapatkan info user jika perlu
        // state.user = jwt_decode(action.payload.token);
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = 'loading';
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => { // action tidak digunakan di sini karena hanya mengindikasikan sukses
        state.registerStatus = 'succeeded';
        state.registerError = null;
        // Mungkin Anda ingin mereset form atau menampilkan pesan sukses
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.registerError = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;