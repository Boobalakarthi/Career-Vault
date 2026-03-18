import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'HR') navigate('/hr-dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin-dashboard');
      else navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass animate-fade-in">
        <div className="login-header">
          <div className="logo-icon"><Shield size={32} /></div>
          <h1>Welcome Back</h1>
          <p>Login to your Career Vault account</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input
              type="email"
              placeholder="e.g. applier@user.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Sign In <LogIn size={18} />
          </button>
        </form>

        <div className="login-signup-link">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>

        <div className="login-footer">
          <p>Default credentials (demo):</p>
          <ul>
            <li>Applier: applier@user.com / user</li>
            <li>HR: hr@google.com / hr</li>
            <li>Admin: admin@careervault.com / admin</li>
          </ul>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-main);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .login-header h1 {
          font-size: 1.75rem;
          color: var(--text-main);
        }
        .login-header p {
          color: var(--text-muted);
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-family: inherit;
          transition: var(--transition);
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        .login-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .error-msg {
          background: hsl(0, 85%, 95%);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: center;
          border: 1px solid var(--danger);
        }
        .login-signup-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .login-signup-link a {
          color: var(--primary);
          font-weight: 700;
        }
        .login-footer {
          margin-top: 1.5rem;
        }
        .login-footer ul {
          list-style: none;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};
