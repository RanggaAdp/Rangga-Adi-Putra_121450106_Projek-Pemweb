// src/pages/WriteBookPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookContent, saveBookContent, clearCurrentBookDetail } from '../store/slices/bookSlice';
import { Form, Button, Spinner, Alert, Card } from 'react-bootstrap';

function WriteBookPage() {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBookDetail, currentBookStatus, currentBookError } = useSelector((state) => state.books);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [content, setContent] = useState('');
  const [localLoading, setLocalLoading] = useState(true); // Untuk loading awal fetch content
  const [saveError, setSaveError] = useState(null); // Error lokal untuk proses save

  useEffect(() => {
    if (bookId && isAuthenticated) {
      setLocalLoading(true);
      dispatch(fetchBookContent(bookId)).finally(() => setLocalLoading(false));
    }
    return () => {
      dispatch(clearCurrentBookDetail());
    };
  }, [bookId, dispatch, isAuthenticated]);

  useEffect(() => {
    if (currentBookStatus === 'succeeded' && currentBookDetail) {
      setContent(currentBookDetail.content || '');
    }
  }, [currentBookStatus, currentBookDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null); // Reset save error
    if (!isAuthenticated) {
      navigate('/login'); // Seharusnya sudah ditangani PrivateRoute
      return;
    }
    try {
      await dispatch(saveBookContent({ bookId, content })).unwrap();
      // Setelah berhasil menyimpan, arahkan ke halaman baca buku
      navigate(`/books/${bookId}/read`);
    } catch (rejectedValueOrSerializedError) {
      setSaveError(rejectedValueOrSerializedError?.msg || rejectedValueOrSerializedError || 'Gagal menyimpan konten.');
      console.error('Gagal menyimpan konten:', rejectedValueOrSerializedError);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Loading untuk fetch data awal
  if (localLoading || (currentBookStatus === 'loading' && !currentBookDetail)) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Memuat editor...</span>
        </Spinner>
      </div>
    );
  }

  // Error saat fetch data awal
  if (currentBookStatus === 'failed' && !currentBookDetail) {
     return (
      <Alert variant="danger" className="mt-3">
        Error: {currentBookError?.msg || currentBookError || 'Gagal memuat data buku untuk diedit.'}
        <hr />
        <Link to="/" className="btn btn-secondary">Kembali ke Home</Link>
      </Alert>
    );
  }
  
  // Jika buku tidak ditemukan setelah fetch (meskipun status bukan 'failed')
  if (!localLoading && !currentBookDetail && currentBookStatus !== 'loading') {
    return (
        <Alert variant="warning" className="mt-3">
            Buku tidak ditemukan atau Anda tidak memiliki akses.
            <hr />
            <Link to="/" className="btn btn-secondary">Kembali ke Home</Link>
        </Alert>
    );
  }


  return (
    <div className="mt-4">
      <Card>
        <Card.Header as="h3">
          Tulis/Edit Konten untuk: {currentBookDetail?.title || 'Memuat judul...'}
        </Card.Header>
        <Card.Body>
          {currentBookError && currentBookStatus === 'failed' && (
            <Alert variant="danger">
              Error saat memuat data sebelumnya: {currentBookError?.msg || currentBookError}
            </Alert>
          )}
          {saveError && (
            <Alert variant="danger">
              Error saat menyimpan: {saveError}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="bookContent">
              <Form.Label>Isi Buku</Form.Label>
              <Form.Control
                as="textarea"
                rows={15} // Sesuaikan jumlah baris sesuai kebutuhan
                placeholder="Mulai menulis isi buku di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={currentBookStatus === 'loading'} // Disable saat proses save/load
              />
            </Form.Group>
            <div className="text-end">
              <Link to={currentBookDetail ? `/books/${currentBookDetail.id}/read` : "/"} className="btn btn-outline-secondary me-2">
                Batal
              </Link>
              <Button variant="primary" type="submit" disabled={currentBookStatus === 'loading'}>
                {currentBookStatus === 'loading' ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Konten'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default WriteBookPage;