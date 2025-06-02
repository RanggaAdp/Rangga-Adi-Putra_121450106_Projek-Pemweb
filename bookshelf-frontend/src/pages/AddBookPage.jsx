// src/pages/AddBookPage.jsx
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../store/slices/bookSlice';
import BookForm from '../components/BookForm';
import { Alert } from 'react-bootstrap';

function AddBookPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.books); // Ambil status dan error dari slice buku

  const handleSubmit = async (bookData) => {
    // unwrap() akan melempar error jika thunk di-reject, atau mengembalikan action.payload jika fulfilled
    try {
        await dispatch(addBook(bookData)).unwrap();
        navigate('/'); // Redirect ke home setelah berhasil
    } catch (rejectedValueOrSerializedError) {
        // Error sudah ditangani oleh slice dan disimpan di state.error
        // Tidak perlu console.log di sini kecuali untuk debugging spesifik
        console.error('Gagal menambah buku:', rejectedValueOrSerializedError);
    }
  };

  return (
    <div>
      <h2>Tambah Buku Baru</h2>
      {status === 'failed' && error && (
         <Alert variant="danger" className="mt-3">
            Error: {typeof error === 'string' ? error : (error.msg || JSON.stringify(error))}
         </Alert>
      )}
      <BookForm
        onSubmit={handleSubmit}
        isLoading={status === 'loading'}
        submitButtonText="Tambah Buku"
        // error dari state akan ditampilkan oleh BookForm jika prop error diteruskan
        // namun, di sini kita bisa menampilkan error global dari operasi add di atas form juga
      />
    </div>
  );
}

export default AddBookPage;