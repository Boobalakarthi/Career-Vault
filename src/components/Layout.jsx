import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, User, Briefcase, Settings, Bell, HelpCircle, Target, ClipboardList, ListChecks, MessageSquare, Menu, X } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    APPLIER: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'My Profile', icon: User },
      { to: '/jobs', label: 'Job Matches', icon: Briefcase },
      { to: '/roadmap', label: 'Career Mode', icon: Target },
      { to: '/my-applications', label: 'My Apps', icon: ListChecks },
      { to: '/interview-prep', label: 'Interview AI', icon: MessageSquare },
      { to: '/assessments', label: 'Assessments', icon: ClipboardList },
      { to: '/tickets', label: 'Support', icon: HelpCircle },
    ],
    HR: [
      { to: '/hr-dashboard', label: 'Recruitment', icon: LayoutDashboard },
      { to: '/post-job', label: 'Post Job', icon: Briefcase },
      { to: '/assessments', label: 'Assessments', icon: ClipboardList },
      { to: '/tickets', label: 'Support', icon: HelpCircle },
    ],
    ADMIN: [
      { to: '/admin-dashboard', label: 'Admin Panel', icon: Settings },
      { to: '/all-users', label: 'User Control', icon: User },
      { to: '/assessments', label: 'Assessments', icon: ClipboardList },
      { to: '/tickets', label: 'Support', icon: HelpCircle },
    ],
  };

  return (
    <div className="layout">
      <nav className="navbar glass">
        <div className="nav-brand">
          <Link to="/" className="hover-lift">CareerVault<span className="text-accent">.</span></Link>
        </div>

        {/* Desktop nav links */}
        <div className="nav-links desktop-only">
          {user && navLinks[user.role]?.map((link) => (
            <Link key={link.to} to={link.to} className={`nav-item ${location.pathname === link.to ? 'active' : ''}`}>
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <NotificationCenter />
              <div className="user-profile-menu">
                <span className="user-badge">{user.role}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                </button>
              </div>
              {/* Mobile hamburger */}
              <button className="hamburger mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            <Link to="/login" className="login-nav-btn">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && user && (
        <div className="mobile-nav glass animate-fade-in">
          {navLinks[user.role]?.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-item ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      <main className="content animate-fade-in">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="footer glass">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand"> CareerVault<span>.</span> </div>
            <p>© 2026 Your Digital Career Evidence Vault. All assets secured.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm);
        }
        .nav-brand {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          flex-shrink: 0;
        }
        .nav-brand a {
          text-decoration: none;
          color: var(--text-main);
        }
        .nav-brand span {
          color: var(--primary);
        }
        .nav-links {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-links::-webkit-scrollbar { display: none; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          transition: var(--transition);
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .nav-item:hover, .nav-item.active {
          color: var(--primary);
          background: rgba(79, 70, 229, 0.08);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border);
        }
        .user-badge {
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-dark);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }
        .logout-btn {
          color: var(--danger);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
        }
        .logout-btn:hover {
          background: hsl(0, 85%, 95%);
        }
        .content {
          flex: 1;
          padding-bottom: 3rem;
        }
        .icon-btn {
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: var(--radius-full);
        }
        .icon-btn:hover {
          background: var(--border);
          color: var(--text-main);
        }
        .login-nav-btn {
          background: var(--bg-dark);
          color: white;
          padding: 0.6rem 1.5rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .login-nav-btn:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        /* Hamburger */
        .hamburger {
          color: var(--text-main);
          padding: 0.5rem;
        }

        /* Mobile nav overlay */
        .mobile-nav {
          position: sticky;
          top: 72px;
          z-index: 99;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          margin: 0 1rem 1rem;
          border-radius: var(--radius-lg);
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .mobile-nav-item:hover, .mobile-nav-item.active {
          background: rgba(79, 70, 229, 0.08);
          color: var(--primary);
        }

        /* Footer */
        .footer {
          margin-top: auto;
          padding: 2rem 0;
          border-top: 1px solid var(--border);
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-brand {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
        }
        .footer-brand span { color: var(--primary); }
        .footer p { font-size: 0.85rem; color: var(--text-muted); }

        /* Visibility helpers */
        .mobile-only { display: none; }
        .desktop-only { display: flex; }

        @media (max-width: 1024px) {
          .nav-item span { display: none; }
          .nav-item { padding: 0.5rem; }
        }

        @media (max-width: 768px) {
          .navbar { padding: 0.75rem 1rem; }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          .user-profile-menu { padding-left: 0.5rem; }
        }
      `}</style>
    </div>
  );
};
