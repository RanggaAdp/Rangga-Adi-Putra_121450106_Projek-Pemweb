// bookshelf-backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Koneksi database
require('dotenv').config(); // Untuk JWT_SECRET

// POST /api/auth/register - Registrasi pengguna baru
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username dan password harus diisi' });
    }

    // Periksa apakah username sudah ada
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'Username sudah digunakan' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt); // Simpan hash ini

    // Simpan pengguna baru ke database (pastikan tabel users punya kolom 'password_hash')
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username',
      [username, passwordHash]
    );

    // Anda bisa memilih untuk langsung login atau hanya memberi pesan sukses registrasi
    res.status(201).json({
      msg: 'Registrasi berhasil. Silakan login.',
      user: { // Kirim kembali data user yang baru dibuat (tanpa password_hash)
        user_id: newUser.rows[0].user_id,
        username: newUser.rows[0].username,
      }
    });

  } catch (err) {
    console.error('Register Error:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server error saat registrasi', detail: err.message });
  }
});

// POST /api/auth/login - Login pengguna
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username dan password harus diisi' });
    }

    // Cari pengguna berdasarkan username
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Kredensial tidak valid (username salah)' });
    }

    const user = userResult.rows[0]; // user dari database

    // Verifikasi password (bandingkan password dari input dengan hash di database)
    // Pastikan user.password_hash adalah kolom yang berisi hash dari bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Kredensial tidak valid (password salah)' });
    }

    // Buat payload untuk JWT
    // PENTING: Sertakan ID pengguna di sini dengan nama properti yang akan Anda gunakan di req.user.id
    const payload = {
      id: user.user_id, // 'id' akan menjadi properti di req.user
      username: user.username
      // Anda juga bisa menambahkan properti lain jika dibutuhkan, misal role
    };

    // Buat dan kirim token JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token berlaku selama 1 jam (atau sesuaikan)
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err);
          // Jangan throw err di sini karena akan menghentikan proses jika tidak ditangani di luar callback
          return res.status(500).json({ msg: 'Server error saat membuat token', detail: err.message });
        }
        res.json({
          token,
          user: { // Kirim juga info user (tanpa password_hash) untuk kemudahan di frontend
            id: user.user_id,
            username: user.username
          }
        });
      }
    );

  } catch (err) {
    console.error('Login Error:', err.message);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ msg: 'Server error saat login', detail: err.message });
  }
});

module.exports = router;