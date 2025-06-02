// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBooks, deleteBook } from '../store/slices/bookSlice'; // Pastikan deleteBook diimpor
import { Link } from 'react-router-dom';
import { Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';

function HomePage() {
  const dispatch = useDispatch();
  const { items: books, status, error } = useSelector((state) => state.books);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.isAuthenticated && (status === 'idle' || status === 'failed')) { // Fetch jika idle atau jika fetch sebelumnya gagal
      dispatch(fetchBooks());
    }
  }, [status, dispatch, auth.isAuthenticated]);

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      dispatch(deleteBook(id));
    }
  };

  if (!auth.isAuthenticated && auth.status !== 'loading') { // Hindari redirect/pesan saat auth masih loading
    return <p className="text-center mt-5">Silakan login untuk melihat daftar buku.</p>;
  }
  
  if (auth.status === 'loading' || status === 'loading') {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (status === 'failed' && auth.isAuthenticated) { // Hanya tampilkan error fetch buku jika sudah login
    return <Alert variant="danger" className="mt-3">Error: {error?.msg || error || 'Gagal memuat buku.'}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center my-3">
        <h1>Daftar Buku</h1>
        <Link to="/add-book" className="btn btn-primary">Tambah Buku Baru</Link>
      </div>
      {auth.isAuthenticated && books.length === 0 && status === 'succeeded' && (
        <p>Belum ada buku. Silakan tambahkan buku baru.</p>
      )}
      {auth.isAuthenticated && books.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {books.map((book) => (
            <Col key={book.id}>
              <Card>
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{book.author}</Card.Subtitle>
                  <Card.Text>
                    ISBN: {book.isbn || '-'} <br />
                    Tahun: {book.published_year || '-'} <br />
                    Genre: {book.genre || '-'}
                  </Card.Text>
                  <div className="d-flex justify-content-start flex-wrap gap-2">
                    <Link to={`/edit-book/${book.id}`} className="btn btn-sm btn-outline-info">
                      Edit Info
                    </Link>
                    <Link to={`/books/${book.id}/read`} className="btn btn-sm btn-outline-success">
                      Baca Buku
                    </Link>
                    <Link to={`/books/${book.id}/write`} className="btn btn-sm btn-outline-primary">
                      Tulis Konten
                    </Link>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(book.id)}>
                      Hapus
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default HomePage;