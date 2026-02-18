import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import './Auth.css';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.signIn({ email, password });
      if (response.jwt) {
        login(response.jwt, { id: 'user', email });
        navigate('/blog');
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-description-section">
          <div className="auth-description">
            <div className="auth-illustration">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f5f5f5" />
                    <stop offset="100%" stopColor="#e8e8e8" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="70" fill="url(#grad1)" />
                <path d="M 80 80 Q 100 60, 120 80 T 120 120 Q 100 140, 80 120 Z" fill="#333" opacity="0.1" />
                <path d="M 60 100 L 140 100 M 100 60 L 100 140" stroke="#333" strokeWidth="1" opacity="0.2" />
              </svg>
            </div>
            <h2>Welcome Back</h2>
            <p>Continue your blogging journey in a secure, distraction-free environment.</p>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Sign In</h1>
              <p>Access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
