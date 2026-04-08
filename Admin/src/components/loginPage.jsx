import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../App';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`https://api.interviewwace.com/api/users/admin`, {
        email,
        password
      });
         console.log('Login response:', response.data);
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminEmail', email);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = email && password;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>WACE</h1>
          <p style={styles.tagline}>Admin Panel</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={isValid ? styles.button : styles.buttonDisabled}
            disabled={!isValid || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={styles.footer}>Enter your admin credentials to access</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    padding: '20px'
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(239, 191, 4, 0.2)',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #333'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#EFBF04',
    marginBottom: '4px',
    letterSpacing: '4px'
  },
  tagline: {
    fontSize: '14px',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  error: {
    background: 'rgba(239, 191, 4, 0.1)',
    color: '#EFBF04',
    padding: '14px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid rgba(239, 191, 4, 0.3)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#EFBF04'
  },
  input: {
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #333',
    fontSize: '16px',
    background: '#0a0a0a',
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  button: {
    padding: '16px',
    background: '#EFBF04',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  buttonDisabled: {
    padding: '16px',
    background: '#333333',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#666666'
  }
};

export default LoginPage;