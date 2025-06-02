// src/pages/ReadBookPage.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookContent, clearCurrentBookDetail } from '../store/slices/bookSlice';
import { Spinner, Alert, Button, Card } from 'react-bootstrap';

function ReadBookPage() {
  const { id: bookId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBookDetail, currentBookStatus, currentBookError } = useSelector((state) => state.books);
  const { isAuthenticated } = useSelector((state) => state.auth); // Untuk memastikan user masih login

  useEffect(() => {
    if (bookId && isAuthenticated) { // Hanya fetch jika ada bookId dan user terautentikasi
      dispatch(fetchBookContent(bookId));
    }

    // Cleanup function untuk membersihkan detail buku saat komponen unmount
    return () => {
      dispatch(clearCurrentBookDetail());
    };
  }, [bookId, dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    // Jika karena suatu hal user tidak terautentikasi lagi, arahkan ke login
    // Ini seharusnya sudah ditangani PrivateRoute, tapi sebagai fallback.
    navigate('/login');
    return null;
  }

  if (currentBookStatus === 'loading') {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Memuat konten buku...</span>
        </Spinner>
      </div>
    );
  }

  if (currentBookStatus === 'failed') {
    return (
      <Alert variant="danger" className="mt-3">
        Error: {currentBookError?.msg || currentBookError || 'Gagal memuat konten buku.'}
        <hr />
        <Link to="/" className="btn btn-secondary">Kembali ke Home</Link>
      </Alert>
    );
  }

  if (!currentBookDetail) {
    return (
      <div className="mt-3 text-center">
        <p>Konten buku tidak tersedia atau sedang dimuat.</p>
        <Link to="/" className="btn btn-secondary">Kembali ke Home</Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Card>
        <Card.Header as="h3">{currentBookDetail.title}</Card.Header>
        <Card.Body>
          <Card.Subtitle className="mb-3 text-muted">
            oleh: {currentBookDetail.author}
          </Card.Subtitle>
          <hr />
          {/* Tampilkan konten. Gunakan div dengan white-space untuk menjaga format paragraf sederhana. */}
          {currentBookDetail.content ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {currentBookDetail.content}
            </div>
          ) : (
            <p className="text-muted"><em>Buku ini belum memiliki konten.</em></p>
          )}
        </Card.Body>
        <Card.Footer className="text-end">
          <Link to={`/books/${bookId}/write`} className="btn btn-outline-primary me-2">
            Tulis/Edit Konten
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Kembali ke Daftar Buku
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
}

export default ReadBookPage;