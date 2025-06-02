// bookshelf-backend/routes/books.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/books - Mendapatkan semua buku milik user yang login
router.get('/', authenticateToken, async (req, res) => {
  try {
    // req.user sekarang { id: ..., username: ..., iat: ..., exp: ... }
    if (!req.user || req.user.id === undefined) { // PERBAIKAN: Cek req.user.id langsung
      console.error('GET /api/books - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN: Akses langsung req.user.id
    const userBooks = await pool.query(
      'SELECT * FROM books WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    res.json(userBooks.rows);
  } catch (err) {
    console.error('Error fetching books:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// POST /api/books - Menambahkan buku baru
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, author, isbn, published_year, genre } = req.body;

    console.log('POST /api/books - req.user received:', JSON.stringify(req.user, null, 2));
    const userId = req.user.id; // PERBAIKAN: Akses langsung req.user.id
    console.log('POST /api/books - User ID extracted for new book:', userId);

    if (!title || !author) {
      return res.status(400).json({ msg: 'Judul dan Penulis harus diisi' });
    }

    if (userId === undefined || userId === null) {
        console.error('CRITICAL ERROR in POST /api/books: userId is undefined or null before INSERT query.');
        console.error('req.user was:', req.user);
        return res.status(500).json({ msg: 'Server error: User ID tidak dapat diidentifikasi untuk menyimpan buku.' });
    }

    const newBook = await pool.query(
      'INSERT INTO books (title, author, isbn, published_year, genre, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, author, isbn, published_year, genre, userId]
    );
    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    // ... (error handling sama seperti sebelumnya)
    console.error('Error adding book:', err.message);
    console.error('Stack Trace for Add Book Error:', err.stack);
    if (err.code === '23505') {
        return res.status(400).json({ msg: 'ISBN sudah ada.', detail: err.detail });
    }
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// GET /api/books/:id - Mendapatkan buku berdasarkan ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID buku dari URL
    if (!req.user || req.user.id === undefined) { // PERBAIKAN
      console.error('GET /api/books/:id - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN
    const book = await pool.query(
      'SELECT * FROM books WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    // ... (sisanya sama)
    if (book.rows.length === 0) {
      return res.status(404).json({ msg: 'Buku tidak ditemukan atau Anda tidak memiliki izin akses' });
    }
    res.json(book.rows[0]);
  } catch (err) {
    console.error('Error fetching book by id:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// PUT /api/books/:id - Memperbarui info buku
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID buku dari URL
    const { title, author, isbn, published_year, genre } = req.body;
    if (!req.user || req.user.id === undefined) { // PERBAIKAN
      console.error('PUT /api/books/:id - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN
    // ... (sisanya sama)
    if (!title || !author) {
      return res.status(400).json({ msg: 'Judul dan Penulis harus diisi' });
    }
    const updateBook = await pool.query(
      'UPDATE books SET title = $1, author = $2, isbn = $3, published_year = $4, genre = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, author, isbn, published_year, genre, id, userId]
    );
    if (updateBook.rows.length === 0) {
      return res.status(404).json({ msg: 'Buku tidak ditemukan atau Anda tidak memiliki izin untuk memperbarui' });
    }
    res.json(updateBook.rows[0]);
  } catch (err) {
    console.error('Error updating book:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// DELETE /api/books/:id - Menghapus buku
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID buku dari URL
    if (!req.user || req.user.id === undefined) { // PERBAIKAN
      console.error('DELETE /api/books/:id - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN
    // ... (sisanya sama)
    const deleteBook = await pool.query(
      'DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (deleteBook.rows.length === 0) {
      return res.status(404).json({ msg: 'Buku tidak ditemukan atau Anda tidak memiliki izin untuk menghapus' });
    }
    res.json({ msg: 'Buku berhasil dihapus', book: deleteBook.rows[0] });
  } catch (err) {
    console.error('Error deleting book:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// GET /api/books/:id/content - Mendapatkan konten buku
router.get('/:id/content', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID buku dari URL
    if (!req.user || req.user.id === undefined) { // PERBAIKAN
      console.error('GET /api/books/:id/content - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN
    // ... (sisanya sama)
    const bookContentResult = await pool.query(
      'SELECT id, title, author, content, user_id FROM books WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (bookContentResult.rows.length === 0) {
      // ...
      return res.status(404).json({ msg: 'Buku tidak ditemukan atau Anda tidak memiliki izin' });
    }
    res.json(bookContentResult.rows[0]);
  } catch (err) {
    console.error('Error fetching book content:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

// PUT /api/books/:id/content - Menyimpan konten buku
router.put('/:id/content', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // ID buku dari URL
    const { content } = req.body;
    if (!req.user || req.user.id === undefined) { // PERBAIKAN
      console.error('PUT /api/books/:id/content - User ID not found in req.user:', req.user);
      return res.status(401).json({ msg: 'Akses tidak diizinkan atau token tidak valid.' });
    }
    const userId = req.user.id; // PERBAIKAN
    // ... (sisanya sama)
    const bookCheck = await pool.query(
      'SELECT user_id FROM books WHERE id = $1',
      [id]
    );
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Buku tidak ditemukan' });
    }
    if (bookCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ msg: 'Anda tidak memiliki izin untuk mengubah konten buku ini' });
    }
    const updatedBook = await pool.query(
      'UPDATE books SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING id, title, content',
      [content, id, userId]
    );
    res.json({ msg: 'Konten buku berhasil diperbarui', book: updatedBook.rows[0] });
  } catch (err) {
    console.error('Error updating book content:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server Error', detail: err.message });
  }
});

module.exports = router;