import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      if (res.status === 200 || res.status === 201) {
        setMessage('Registration successful! Please check your email for a welcome message.');
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data || 'Registration failed. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form" style={styles.container}>
      <h2 style={styles.title}>Create Your Account</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            style={styles.input}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={styles.button}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      {message && (
        <div style={styles.message}>
          <p style={styles.successMessage}>{message}</p>
          <p style={styles.emailNote}>Please check your email for a welcome message.</p>
        </div>
      )}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  successMessage: {
    color: '#28a745',
    marginBottom: '0.5rem',
  },
  emailNote: {
    color: '#666',
    fontSize: '0.9rem',
  },
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: '1rem',
  },
};

export default Register; 