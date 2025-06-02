// src/store/slices/bookSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/books'; // Sesuaikan jika URL API Anda berbeda

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal mengambil daftar buku');
    }
  }
);

export const addBook = createAsyncThunk(
  'books/addBook',
  async (bookData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.post(API_URL, bookData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal menambah buku');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, bookData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_URL}/${id}`, bookData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal update buku');
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (bookId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${bookId}`, config);
      return bookId;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal menghapus buku');
    }
  }
);

export const fetchBookContent = createAsyncThunk(
  'books/fetchBookContent',
  async (bookId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/${bookId}/content`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal mengambil konten buku');
    }
  }
);

export const saveBookContent = createAsyncThunk(
  'books/saveBookContent',
  async ({ bookId, content }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_URL}/${bookId}/content`, { content }, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : 'Gagal menyimpan konten buku');
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed' (untuk daftar buku)
    error: null,
    currentBookDetail: null,     // Untuk detail buku tunggal (termasuk konten)
    currentBookStatus: 'idle', // Status untuk operasi buku tunggal
    currentBookError: null,
  },
  reducers: {
    clearCurrentBookDetail: (state) => {
      state.currentBookDetail = null;
      state.currentBookStatus = 'idle';
      state.currentBookError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books (List)
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : action.payload?.msg || action.error.message;
      })
      // Add Book
      .addCase(addBook.pending, (state) => {
        // Opsional: set status loading spesifik jika perlu
        state.currentBookStatus = 'loading';
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.currentBookStatus = 'succeeded'; // Atau status global 'succeeded'
        state.error = null; // Atau currentBookError
      })
      .addCase(addBook.rejected, (state, action) => {
        state.currentBookStatus = 'failed';
        state.currentBookError = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Gagal menambah buku';
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.currentBookStatus = 'loading';
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.items.findIndex(book => book.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentBookStatus = 'succeeded';
        if (state.currentBookDetail && state.currentBookDetail.id === action.payload.id) {
            state.currentBookDetail = {...state.currentBookDetail, ...action.payload};
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.currentBookStatus = 'failed';
        state.currentBookError = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Gagal update buku';
      })
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        // Bisa gunakan state.status atau state.currentBookStatus
        state.status = 'loading';
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter(book => book.id !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Gagal menghapus buku';
      })
      // Fetch Book Content
      .addCase(fetchBookContent.pending, (state) => {
        state.currentBookStatus = 'loading';
        state.currentBookError = null;
      })
      .addCase(fetchBookContent.fulfilled, (state, action) => {
        state.currentBookStatus = 'succeeded';
        state.currentBookDetail = action.payload;
      })
      .addCase(fetchBookContent.rejected, (state, action) => {
        state.currentBookStatus = 'failed';
        state.currentBookError = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Gagal mengambil konten buku';
      })
      // Save Book Content
      .addCase(saveBookContent.pending, (state) => {
        state.currentBookStatus = 'loading';
        state.currentBookError = null;
      })
      .addCase(saveBookContent.fulfilled, (state, action) => {
        state.currentBookStatus = 'succeeded';
        if (state.currentBookDetail && state.currentBookDetail.id === action.payload.book.id) {
          state.currentBookDetail.content = action.payload.book.content;
        }
        // Jika perlu, update juga di list items (tapi biasanya tidak menyimpan konten di list utama)
        const index = state.items.findIndex(book => book.id === action.payload.book.id);
        if (index !== -1 && state.items[index]) {
             // Hanya update konten jika diperlukan, atau biarkan saja jika list items tidak perlu detail konten
        }
      })
      .addCase(saveBookContent.rejected, (state, action) => {
        state.currentBookStatus = 'failed';
        state.currentBookError = typeof action.payload === 'string' ? action.payload : action.payload?.msg || 'Gagal menyimpan konten buku';
      });
  },
});

export const { clearCurrentBookDetail } = bookSlice.actions;
export default bookSlice.reducer;