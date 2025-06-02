// src/components/BookForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const DEFAULT_INITIAL_DATA = {
  title: '',
  author: '',
  isbn: '',
  published_year: '',
  genre: '',
};

function BookForm({
  onSubmit,
  initialData = DEFAULT_INITIAL_DATA,
  submitButtonText = 'Simpan',
  error,
  isLoading
}) {
  const [formData, setFormData] = useState(() => ({
    title: initialData.title || '',
    author: initialData.author || '',
    isbn: initialData.isbn || '',
    published_year: initialData.published_year || '',
    genre: initialData.genre || '',
  }));

  const {
    title: initialTitle,
    author: initialAuthor,
    isbn: initialIsbn,
    published_year: initialPublishedYear,
    genre: initialGenre
  } = initialData || DEFAULT_INITIAL_DATA;

  useEffect(() => {
    setFormData({
      title: initialTitle || '',
      author: initialAuthor || '',
      isbn: initialIsbn || '',
      published_year: initialPublishedYear || '',
      genre: initialGenre || '',
    });
  }, [initialTitle, initialAuthor, initialIsbn, initialPublishedYear, initialGenre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const year = formData.published_year;
    const bookData = {
      ...formData,
      published_year: year && !isNaN(parseInt(year, 10)) ? parseInt(year, 10) : null,
    };
    onSubmit(bookData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{typeof error === 'string' ? error : (error.msg || JSON.stringify(error))}</Alert>}
      <Form.Group className="mb-3" controlId="formBookTitle">
        <Form.Label>Judul Buku *</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBookAuthor">
        <Form.Label>Penulis *</Form.Label>
        <Form.Control
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBookIsbn">
        <Form.Label>ISBN</Form.Label>
        <Form.Control
          type="text"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBookPublishedYear">
        <Form.Label>Tahun Terbit</Form.Label>
        <Form.Control
          type="number"
          name="published_year"
          value={formData.published_year}
          onChange={handleChange}
          disabled={isLoading}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBookGenre">
        <Form.Label>Genre</Form.Label>
        <Form.Control
          type="text"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          disabled={isLoading}
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : submitButtonText}
      </Button>
    </Form>
  );
}

export default BookForm;