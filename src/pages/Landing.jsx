import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, seedDatabase } from '../db/db';
import {
  Rocket, Briefcase, Users, BookOpen,
  ChevronRight, ArrowRight, Zap, Target,
  ShieldCheck, Globe
} from 'lucide-react';

export const Landing = () => {
  const [stats, setStats] = useState({
    jobs: 0,
    users: 0,
    courses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      await seedDatabase();
      const jobCount = await db.jobs.count();
      const userCount = await db.users.count();
      const courseCount = await db.courses.count();
      setStats({
        jobs: jobCount,
        users: userCount,
        courses: courseCount
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge animate-slide-up">
            <Zap size={14} className="icon-pulse" />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 className="animate-fade-in">
            Secure Your <br />
            <span>Career</span> & <span>Future</span>.
          </h1>
          <p className="animate-fade-in delay-1">
            The ultimate vault for your professional assets.
            Secure your career with AI intelligence,
            ATS-optimized roadmaps, and a digital evidence locker.
          </p>
          <div className="hero-actions animate-fade-in delay-2">
            <Link to="/login" className="btn-primary">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-visual animate-float">
          <div className="glass-card main">
            <div className="card-header">
              <div className="dots"><span></span><span></span><span></span></div>
              <span className="tag">Vault Security Score</span>
            </div>
            <div className="card-content">
              <div className="match-score">98%</div>
              <div className="match-label">Role Alignment Score</div>
              <div className="mini-bars">
                <div className="bar"><div className="fill" style={{ width: '90%' }}></div></div>
                <div className="bar"><div className="fill" style={{ width: '75%' }}></div></div>
              </div>
            </div>
          </div>
          <div className="glass-card float-1">
            <Users size={20} />
            <strong>{stats.users}+</strong>
            <span>Active Talent</span>
          </div>
          <div className="glass-card float-2">
            <Briefcase size={20} />
            <strong>{stats.jobs}+</strong>
            <span>Live Jobs</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="live-stats glass">
        <div className="stat-item">
          <Globe size={24} />
          <div className="stat-info">
            <strong>{stats.jobs}</strong>
            <span>Open Vaults</span>
          </div>
        </div>
        <div className="stat-item">
          <BookOpen size={24} />
          <div className="stat-info">
            <strong>{stats.courses}</strong>
            <span>Vault Training</span>
          </div>
        </div>
        <div className="stat-item">
          <ShieldCheck size={24} />
          <div className="stat-info">
            <strong>High</strong>
            <span>Asset Security</span>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="features" className="roles-overview">
        <div className="section-header">
          <h2>Unified Ecosystem</h2>
          <p>One platform, three powerful experiences tailored for success.</p>
        </div>
        <div className="roles-grid">
          <div className="role-card glass">
            <div className="role-icon blue"><Target size={32} /></div>
            <h3>For Appliers</h3>
            <ul>
              <li><ChevronRight size={14} /> ATS Resume Generation</li>
              <li><ChevronRight size={14} /> Digital Asset Vault</li>
              <li><ChevronRight size={14} /> Career Security Score</li>
            </ul>
          </div>
          <div className="role-card glass">
            <div className="role-icon green"><Users size={32} /></div>
            <h3>For HR</h3>
            <ul>
              <li><ChevronRight size={14} /> Smart Job Posting</li>
              <li><ChevronRight size={14} /> AI Candidate Ranking</li>
              <li><ChevronRight size={14} /> Pipeline Management</li>
            </ul>
          </div>
          <div className="role-card glass">
            <div className="role-icon purple"><ShieldCheck size={32} /></div>
            <h3>For Admins</h3>
            <ul>
              <li><ChevronRight size={14} /> Global Visibility</li>
              <li><ChevronRight size={14} /> User Entitlements</li>
              <li><ChevronRight size={14} /> Platform Analytics</li>
            </ul>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          background: var(--bg-main);
          padding-top: 4rem;
        }
        
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(79, 70, 229, 0.1);
          color: var(--primary);
          border-radius: 2rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .hero h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .hero h1 span {
          background: linear-gradient(to right, var(--primary), #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          font-size: 1.25rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
        }

        .btn-primary {
          background: var(--bg-dark);
          color: white;
          padding: 1rem 2rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: var(--transition);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);
        }

        .btn-secondary {
          padding: 1rem 2rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-main);
          font-weight: 600;
          border: 1px solid var(--border);
        }

        .hero-visual {
          position: relative;
          height: 500px;
        }

        .glass-card {
          position: absolute;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
        }

        .glass-card.main {
          width: 380px;
          height: 280px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 1.5rem;
          z-index: 5;
        }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .dots { display: flex; gap: 4px; }
        .dots span { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; }
        .tag { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
        
        .match-score { font-size: 3.5rem; font-weight: 800; color: var(--primary); text-align: center; }
        .match-label { text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
        .mini-bars { display: flex; flex-direction: column; gap: 0.5rem; }
        .bar { height: 6px; border-radius: 3px; background: #f1f5f9; position: relative; overflow: hidden; }
        .bar .fill { height: 100%; background: var(--primary); position: absolute; left: 0; top: 0; }

        .glass-card.float-1 {
          top: 10%;
          right: 5%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
        }

        .glass-card.float-2 {
          bottom: 10%;
          left: 5%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: var(--primary);
        }

        .live-stats {
          max-width: 1000px;
          margin: -4rem auto 6rem;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 2.5rem;
          border-radius: var(--radius-xl);
          background: var(--bg-card);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          position: relative;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 0 2rem;
        }

        .stat-item:not(:last-child) {
          border-right: 1px solid var(--border);
        }

        .stat-info strong { font-size: 2rem; display: block; line-height: 1; margin-bottom: 0.25rem; }
        .stat-info span { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }

        .roles-overview {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-header h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .section-header p { color: var(--text-muted); font-size: 1.1rem; }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .role-card {
          padding: 3rem 2rem;
          border-radius: var(--radius-xl);
          text-align: center;
          transition: var(--transition);
        }

        .role-card:hover { transform: translateY(-10px); }
        .role-icon { width: 80px; height: 80px; border-radius: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
        .role-icon.blue { background: rgba(79, 70, 229, 0.1); color: var(--primary); }
        .role-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .role-card h3 { font-size: 1.5rem; margin-bottom: 1.5rem; }
        .role-card ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .role-card li { display: flex; align-items: center; gap: 0.5rem; justify-content: center; font-size: 0.95rem; color: var(--text-muted); }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; text-align: center; }
          .hero-actions { justify-content: center; }
          .hero-visual { display: none; }
          .live-stats { grid-template-columns: 1fr; gap: 2rem; margin-top: 2rem; }
          .stat-item:not(:last-child) { border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 2rem; }
          .roles-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
