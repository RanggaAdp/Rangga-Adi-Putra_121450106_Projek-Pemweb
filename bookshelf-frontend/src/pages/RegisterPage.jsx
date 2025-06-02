// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../store/slices/authSlice'; // Pastikan path ini benar
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatchError, setPasswordsMatchError] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Menggunakan registerStatus dan registerError dari authSlice
  const { isAuthenticated, registerStatus, registerError } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect jika sudah login (misalnya setelah auto-login post register)
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordsMatchError(true);
      return;
    }
    setPasswordsMatchError(false);
    try {
        await dispatch(registerUser({ username, password })).unwrap();
        // Tampilkan pesan sukses atau redirect ke login
        alert('Registrasi berhasil! Silakan login.'); // Contoh notifikasi sederhana
        navigate('/login');
    } catch (error) {
        // Error sudah dihandle oleh slice dan disimpan di registerError
        console.error('Registrasi gagal:', error);
    }
  };

  return (
    <Row className="justify-content-md-center mt-5">
      <Col md={6} lg={4}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            {registerError && <Alert variant="danger">{registerError}</Alert>}
            {passwordsMatchError && <Alert variant="danger">Password tidak cocok!</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="registerUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Pilih username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={registerStatus === 'loading'}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={registerStatus === 'loading'}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Konfirmasi Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Konfirmasi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={registerStatus === 'loading'}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" disabled={registerStatus === 'loading'}>
                {registerStatus === 'loading' ? 'Mendaftar...' : 'Register'}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default RegisterPage;