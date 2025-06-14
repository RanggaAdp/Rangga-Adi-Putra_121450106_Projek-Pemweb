# Bookshelf Manager

Selamat datang di Bookshelf Manager! Aplikasi web full-stack yang dirancang untuk membantu pengguna mengelola koleksi buku pribadi mereka secara efisien. Pengguna dapat mendaftar, login, lalu menambah, melihat, mengedit, menghapus informasi buku, serta menulis dan membaca konten untuk setiap buku.

## 📖 Latar Belakang & Tujuan

Proyek ini dibuat sebagai solusi digital untuk manajemen koleksi buku, menggantikan metode manual. Tujuannya adalah menyediakan platform yang intuitif dan fungsional bagi pengguna untuk:
* Membuat katalog buku pribadi secara online.
* Melakukan operasi pengelolaan buku (CRUD).
* Menulis dan membaca konten atau catatan terkait buku.
* Mengamankan data koleksi melalui sistem autentikasi.

## ✨ Fitur Utama

* **Autentikasi Pengguna:** Sistem registrasi dan login aman menggunakan JWT.
* **Manajemen Buku (CRUD):**
    * Tambah buku baru (judul, penulis, ISBN, tahun terbit, genre).
    * Lihat daftar buku milik pengguna.
    * Edit detail informasi buku.
    * Hapus buku dari koleksi.
* **Manajemen Konten Buku:**
    * Fitur untuk menulis/mengedit isi atau konten teks untuk setiap buku.
    * Halaman khusus untuk membaca konten buku yang telah disimpan.
* **Perlindungan Rute:** Akses ke fitur manajemen buku dan konten diproteksi dan hanya bisa diakses oleh pengguna yang sudah login.
* **Desain Responsif:** Antarmuka pengguna yang dapat beradaptasi dengan berbagai ukuran layar.

## 🛠️ Teknologi yang Digunakan

* **Backend:**
    * **Runtime:** Node.js
    * **Framework:** Express.js
    * **Database:** PostgreSQL (Relational Database)
    * **Autentikasi:** JSON Web Tokens (JWT)
    * **Lainnya:** `pg` (driver PostgreSQL untuk Node.js), `bcryptjs` (hashing password), `cors`, `dotenv`.
* **Frontend:**
    * **Library:** React JS (dengan Functional Components & Hooks)
    * **Build Tool & Dev Server:** Vite
    * **Routing:** React Router DOM
    * **State Management:** Redux Toolkit
    * **HTTP Client:** Axios
    * **UI/Styling:** Bootstrap (dan CSS kustom jika ada).
* **Alat Bantu Database (Setup):** DBeaver atau alat manajemen PostgreSQL lainnya.

## 📁 Struktur Proyek
bookshelf-manager/
├── bookshelf-backend/        # Proyek Backend
└── bookshelf-frontend/       # Proyek Frontend

## 🚀 Cara Menjalankan Proyek

### Prasyarat
* [Node.js](https://nodejs.org/) (versi LTS terbaru direkomendasikan, misal v18.x, v20.x atau lebih baru)
* [npm](https://www.npmjs.com/) (biasanya sudah terinstal bersama Node.js) atau [Yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/download/) server sedang berjalan.

### 1. Backend Setup (`bookshelf-backend`)

   a.  **Navigasi ke direktori backend:**
       ```bash
       cd bookshelf-backend
       ```

   b.  **Install dependencies:**
       ```bash
       npm install
       ```

   c.  **Setup Database PostgreSQL:**
       * Pastikan server PostgreSQL Anda berjalan.
       * Buat user database, misalnya `bookshelf_user` dengan password `user123`.
       * Buat database baru, misalnya `bookshelf_db`, dan pastikan `bookshelf_user` memiliki hak akses penuh ke database ini.
       * Buat tabel `users` dan `books` di dalam `bookshelf_db`. Gunakan skema berikut:

           ```sql
           -- Tabel users
           CREATE TABLE users (
               user_id SERIAL PRIMARY KEY,
               username VARCHAR(255) UNIQUE NOT NULL,
               password_hash VARCHAR(255) NOT NULL,
               created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
           );

           -- Tabel books
           CREATE TABLE books (
               id SERIAL PRIMARY KEY,
               title VARCHAR(255) NOT NULL,
               author VARCHAR(255) NOT NULL,
               isbn VARCHAR(20) UNIQUE,
               published_year INTEGER,
               genre VARCHAR(100),
               user_id INTEGER NOT NULL,
               content TEXT, -- Untuk isi buku
               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
               CONSTRAINT fk_user_book
                   FOREIGN KEY(user_id)
                   REFERENCES users(user_id)
                   ON DELETE CASCADE
           );
           ```

   d.  **Konfigurasi Environment Variables:**
       * Buat file `.env` di root direktori `bookshelf-backend/`.
       * Isi dengan konfigurasi berikut, sesuaikan dengan pengaturan PostgreSQL Anda:
           ```env
           DB_HOST=localhost
           DB_PORT=5432
           DB_USER=bookshelf_user
           DB_PASSWORD=user123
           DB_DATABASE=bookshelf_db
           JWT_SECRET=your_very_strong_and_secret_jwt_key # Ganti dengan kunci rahasia Anda
           PORT=3001 # Port untuk server backend
           ```

   e.  **Jalankan Server Backend:**
       ```bash
       npm start
       ```
       Atau jika Anda punya skrip dev (misalnya dengan `nodemon`):
       ```bash
       npm run dev
       ```
       Server backend akan berjalan di `http://localhost:3001` (atau port yang Anda tentukan).

### 2. Frontend Setup (`bookshelf-frontend`)

   a.  **Buka terminal baru, navigasi ke direktori frontend:**
       ```bash
       cd bookshelf-frontend
       ```

   b.  **Install dependencies:**
       ```bash
       npm install
       ```

   c.  **(Opsional) Konfigurasi URL API Backend:**
       Secara default, frontend mungkin mengarah ke `http://localhost:3001/api`. Jika backend Anda berjalan di port atau URL yang berbeda, Anda mungkin perlu menyesuaikan ini di file slice Redux (misalnya, `src/store/slices/bookSlice.js` dan `authSlice.js`) atau menggunakan environment variable frontend (misalnya, `VITE_API_BASE_URL` di file `.env` pada root `bookshelf-frontend/`).

   d.  **Jalankan Server Development Frontend:**
       ```bash
       npm run dev
       ```
       Server frontend (Vite) akan berjalan di `http://localhost:5173` (atau port lain yang ditampilkan).

### 3. Mengakses Aplikasi
   Setelah kedua server (backend dan frontend) berjalan:
   * Buka browser Anda dan akses `http://localhost:5173`.

## 🗺️ Struktur Halaman Aplikasi
* `/login`: Halaman Login Pengguna.
* `/register`: Halaman Registrasi Pengguna Baru.
* `/`: Halaman Utama (Beranda), menampilkan daftar buku pengguna yang login.
* `/add-book`: Halaman formulir untuk menambah buku baru.
* `/edit-book/:id`: Halaman formulir untuk mengedit informasi buku.
* `/books/:id/read`: Halaman untuk membaca konten buku.
* `/books/:id/write`: Halaman untuk menulis/mengedit konten buku.

## 💡 Potensi Pengembangan Lanjut
* Fitur pencarian dan filter buku yang lebih canggih.
* Penambahan status baca buku (sudah dibaca, sedang dibaca, ingin dibaca).
* Fitur ulasan dan rating buku.
* Kategorisasi buku yang lebih detail.
* Upload sampul buku.

---
