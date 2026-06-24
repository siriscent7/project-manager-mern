import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { validatePassword, getPasswordStrength } from '../../utils/passwordValidator';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    
    if (pwd) {
      const errors = validatePassword(pwd);
      setPasswordErrors(errors);
      setPasswordStrength(getPasswordStrength(pwd));
    } else {
      setPasswordErrors([]);
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if password meets requirements
    if (passwordErrors.length > 0) {
      setError('Password does not meet security requirements');
      setLoading(false);
      return;
    }

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Sign Up</h2>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              marginBottom: '1rem',
              outline: 'none',
              fontSize: '1rem'
            }}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              marginBottom: '1rem',
              outline: 'none',
              fontSize: '1rem'
            }}
            required
          />
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                marginBottom: '0.5rem',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />

            {/* Password Strength Bar */}
            {passwordStrength && (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                  <span>Password Strength:</span>
                  <span style={{ fontWeight: 'bold', color: passwordStrength.color }}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.25rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${passwordStrength.percentage}%`,
                    height: '100%',
                    backgroundColor: passwordStrength.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem'
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  Password Requirements:
                </p>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  <li style={{
                    color: !passwordErrors.includes('At least 8 characters') ? '#22c55e' : '#ef4444',
                    marginBottom: '0.25rem'
                  }}>
                    {!passwordErrors.includes('At least 8 characters') ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li style={{
                    color: !passwordErrors.includes('At least 1 uppercase letter (A-Z)') ? '#22c55e' : '#ef4444',
                    marginBottom: '0.25rem'
                  }}>
                    {!passwordErrors.includes('At least 1 uppercase letter (A-Z)') ? '✓' : '✗'} Uppercase letter (A-Z)
                  </li>
                  <li style={{
                    color: !passwordErrors.includes('At least 1 lowercase letter (a-z)') ? '#22c55e' : '#ef4444',
                    marginBottom: '0.25rem'
                  }}>
                    {!passwordErrors.includes('At least 1 lowercase letter (a-z)') ? '✓' : '✗'} Lowercase letter (a-z)
                  </li>
                  <li style={{
                    color: !passwordErrors.includes('At least 1 number (0-9)') ? '#22c55e' : '#ef4444',
                    marginBottom: '0.25rem'
                  }}>
                    {!passwordErrors.includes('At least 1 number (0-9)') ? '✓' : '✗'} Number (0-9)
                  </li>
                  <li style={{
                    color: !passwordErrors.includes('At least 1 special character (!@#$%^&*)') ? '#22c55e' : '#ef4444'
                  }}>
                    {!passwordErrors.includes('At least 1 special character (!@#$%^&*)') ? '✓' : '✗'} Special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordErrors.length > 0}
            style={{
              width: '100%',
              backgroundColor: passwordErrors.length > 0 ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: passwordErrors.length > 0 ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '1rem'
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;