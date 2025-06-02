// bookshelf-backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Pastikan variabel lingkungan JWT_SECRET terbaca

function authenticateToken(req, res, next) {
  // Mengambil token dari header Authorization
  // Formatnya: "Bearer TOKEN_VALUE"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil bagian TOKEN_VALUE

  if (token == null) {
    // Jika tidak ada token, kirim status 401 Unauthorized
    return res.status(401).json({ msg: 'Akses ditolak: Token tidak ditemukan' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      // Jika token tidak valid atau kedaluwarsa, kirim status 403 Forbidden
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ msg: 'Akses ditolak: Token kedaluwarsa' });
      }
      return res.status(403).json({ msg: 'Akses ditolak: Token tidak valid' });
    }

    // Jika token valid, simpan seluruh payload yang di-decode ke req.user
    // Asumsi payload saat pembuatan token adalah objek yang berisi id dan username,
    // contoh: { id: user.user_id, username: user.username }
    req.user = decodedPayload;
    next(); // Lanjutkan ke handler rute berikutnya
  });
}

module.exports = { authenticateToken };