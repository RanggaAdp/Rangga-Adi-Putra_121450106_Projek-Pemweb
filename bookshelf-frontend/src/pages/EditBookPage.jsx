// src/pages/EditBookPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
// Hapus fetchBooks dari impor karena tidak digunakan di komponen ini
import { updateBook } from '../store/slices/bookSlice';
import BookForm from '../components/BookForm';
import { Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function EditBookPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Anda tidak menggunakan 'items: books' secara langsung untuk mencari buku sebelum fetch
  // jadi kita bisa mengambil apa yang benar-benar dibutuhkan atau tetap seperti ini jika 'books'
  // mungkin digunakan di masa depan setelah beberapa refactoring.
  // Untuk saat ini, kita fokus pada error eslint.
  const { status: bookStatus, error: bookError, items: books } = useSelector((state) => state.books);
  const { token } = useSelector((state) => state.auth);

  const [currentBook, setCurrentBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [fetchError, setFetchError] = useState(null);


  useEffect(() => {
    // Coba cari buku dari state Redux dulu
    const bookFromState = books.find(b => b.id === parseInt(id));

    if (bookFromState) {
        setCurrentBook(bookFromState);
        setLoadingBook(false);
    } else if (token && id) { // Hanya fetch jika ada token dan id
        // Jika buku tidak ada di state (misalnya direct navigation ke halaman edit), fetch dari API
        const fetchBookById = async () => {
            setLoadingBook(true);
            setFetchError(null);
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const response = await axios.get(`http://localhost:3001/api/books/${id}`, config);
                setCurrentBook(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.msg || err.response?.data || 'Gagal memuat data buku.';
                setFetchError(errorMessage);
                console.error("Error fetching book for edit:", err);
            } finally {
                setLoadingBook(false);
            }
        };
        fetchBookById();
    } else if (!token) {
        navigate('/login'); // Jika tidak ada token, redirect ke login
    } else {
        // Kasus di mana id mungkin tidak ada, atau token ada tapi id tidak (seharusnya tidak terjadi jika rute di-setup dengan benar)
        setLoadingBook(false);
        setFetchError("Tidak dapat memuat buku: Informasi tidak lengkap.");
    }
  // Pastikan semua dependensi eksternal yang digunakan di dalam useEffect ada di dependency array.
  // 'books' juga dependency karena digunakan untuk bookFromState.
  }, [id, books, token, navigate, dispatch]); // dispatch ditambahkan jika Anda berencana menggunakannya di dalam useEffect


  const handleSubmit = async (bookData) => {
    try {
      await dispatch(updateBook({ id: parseInt(id), bookData })).unwrap();
      navigate('/');
    } catch (rejectedValueOrSerializedError) {
      // Error sudah ditangani oleh slice dan disimpan di bookError
      console.error('Gagal update buku:', rejectedValueOrSerializedError);
    }
  };

  if (loadingBook) {
    return (
      <div className="text-center">
        <Spinner animation="border" /> <p>Memuat data buku...</p>
      </div>
    );
  }

  if (fetchError) {
    return <Alert variant="danger">Error memuat buku: {typeof fetchError === 'string' ? fetchError : JSON.stringify(fetchError)}</Alert>;
  }

  if (!currentBook) {
    // Kondisi ini bisa tercapai jika fetch gagal dan fetchError tidak diset, atau jika logic awal tidak menemukan buku
    return <Alert variant="warning">Buku tidak ditemukan atau tidak dapat dimuat.</Alert>;
  }

  return (
    <div>
      <h2>Edit Buku</h2>
       {/* Menampilkan error dari operasi update (submit form) */}
       {bookStatus === 'failed' && bookError && (
         <Alert variant="danger" className="mt-3">
            Error saat menyimpan: {typeof bookError === 'string' ? bookError : (bookError.msg || JSON.stringify(bookError))}
         </Alert>
      )}
      <BookForm
        onSubmit={handleSubmit}
        initialData={currentBook}
        // isLoading untuk form submit, bukan untuk loading data awal buku
        isLoading={bookStatus === 'loading'}
        submitButtonText="Simpan Perubahan"
      />
    </div>
  );
}

export default EditBookPage;