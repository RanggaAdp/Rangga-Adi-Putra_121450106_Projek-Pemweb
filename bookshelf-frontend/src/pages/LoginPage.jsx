// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice';
import { Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';
import './LoginPage.css'; // <-- Impor file CSS Anda

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    // Bungkus dengan div yang memiliki kelas login-page-wrapper
    <div className="login-page-wrapper">
      <Row className="justify-content-md-center w-100"> {/* Row dibuat full width dalam flex container */}
        <Col md={8} lg={6} xl={4}>
          <Card> {/* Card akan di-styling oleh CSS di atas */}
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              {status === 'failed' && error && (
                <Alert variant="danger" className="mb-3">
                  {typeof error === 'string' ? error : error.msg || 'Login gagal.'}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={status === 'loading'}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={status === 'loading'}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                Belum punya akun? <Link to="/register">Daftar di sini</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LoginPage;