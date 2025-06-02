// app.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Impor koneksi database
const authRoutes = require('./routes/auth'); // Impor rute autentikasi
// Nanti kita akan tambahkan rute untuk buku dan autentikasi
// const bookRoutes = require('./routes/books');
// const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001; // Port untuk backend server
const bookRoutes = require('./routes/books'); // Impor rute buku

// Middleware
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
app.use(express.json()); // Mem-parse body request sebagai JSON
app.use('/api/books', bookRoutes); // Gunakan rute buku dengan prefix /api/books
app.use('/api/auth', authRoutes); // Gunakan rute autentikasi

// Contoh Rute Sederhana (akan dipindah ke file terpisah)
app.get('/', (req, res) => {
  res.send('Selamat Datang di Bookshelf API!');
});

// Gunakan Rute (setelah dibuat)
// app.use('/api/books', bookRoutes);
// app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});
