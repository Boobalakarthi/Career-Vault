import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { calculateMatchScore } from '../utils/matchingEngine';
import {
    LayoutDashboard, Briefcase, ListChecks,
    Target, Zap, Clock, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApplierDashboard = () => {
    const { profile, loading, error } = useProfile();

    // Real-time data
    const jobs = useLiveQuery(() => db.jobs.toArray(), []);
    const applications = useLiveQuery(
        () => profile ? db.applications.where({ applierId: profile.userId }).toArray() : [],
        [profile?.userId]
    );
    const notifications = useLiveQuery(
        () => profile ? db.notifications.where({ userId: profile.userId }).reverse().limit(3).toArray() : [],
        [profile?.userId]
    );

    if (loading) return (
        <div className="dashboard-loading">
            <div className="pulse-loader"></div>
            <p>Scanning Digital Vault...</p>
        </div>
    );

    if (error) return (
        <div className="dashboard-error">
            <AlertCircle size={48} color="var(--danger)" />
            <h2>System Sync Failed</h2>
            <p>{error}</p>
        </div>
    );

    const calculateSecurityScore = () => {
        if (!profile) return 0;
        let filled = 0;
        if (profile.personal?.name && profile.personal?.phone) filled++;
        if (profile.education?.length > 0) filled++;
        if (profile.experience?.length > 0) filled++;
        if (profile.skills?.length > 2) filled++;
        if (profile.projects?.length > 0) filled++;
        if (profile.certifications?.length > 0) filled++;
        return Math.round((filled / 6) * 100);
    };

    const securityScore = calculateSecurityScore();
    const rankedMatches = (profile && jobs)
        ? jobs.map(j => ({ ...j, match: calculateMatchScore(profile, j) }))
            .sort((a, b) => b.match.score - a.match.score)
            .slice(0, 3)
        : [];

    const activeApps = applications?.filter(a => a.status !== 'Closed').length || 0;

    return (
        <div className="applier-dashboard animate-fade-in">
            <header className="dash-header">
                <div>
                    <h1>Career Intelligence Terminal</h1>
                    <p>Welcome, <span className="text-accent">{profile?.personal?.name || 'Candidate'}</span></p>
                </div>
                <div className="last-sync">
                    <Clock size={12} />
                    <span>Real-time Sync Active</span>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass highlight-primary">
                    <div className="stat-main">
                        <Target size={32} />
                        <div className="stat-val">{securityScore}%</div>
                    </div>
                    <div className="stat-label">Vault Security Score</div>
                    <div className="stat-progress">
                        <div className="bar"><div className="fill" style={{ width: `${securityScore}%` }}></div></div>
                    </div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-main">
                        <Briefcase size={32} />
                        <div className="stat-val">{rankedMatches.filter(m => m.match.score > 70).length}</div>
                    </div>
                    <div className="stat-label">High Confidence Matches</div>
                    <Link to="/jobs" className="stat-link">View Matches <ChevronRight size={14} /></Link>
                </div>

                <div className="stat-card glass">
                    <div className="stat-main">
                        <ListChecks size={32} />
                        <div className="stat-val">{activeApps}</div>
                    </div>
                    <div className="stat-label">Active Applications</div>
                    <Link to="/my-applications" className="stat-link">Pipeline Analytics <ChevronRight size={14} /></Link>
                </div>
            </div>

            <div className="dash-sections">
                <section className="top-matches glass">
                    <div className="section-head">
                        <h3><Zap size={18} /> Intelligent Proposals</h3>
                        <Link to="/jobs" className="view-all">See All</Link>
                    </div>
                    <div className="match-list">
                        {rankedMatches.map((m, idx) => (
                            <div key={idx} className="mini-match-card">
                                <div className="match-score" style={{ color: m.match.score > 80 ? 'var(--success)' : 'var(--primary)' }}>
                                    {m.match.score}%
                                </div>
                                <div className="match-info">
                                    <strong>{m.title}</strong>
                                    <span>{m.company}</span>
                                </div>
                                <ChevronRight size={16} className="arrow" />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="recent-notifs glass">
                    <div className="section-head">
                        <h3><TrendingUp size={18} /> Vault Activity</h3>
                    </div>
                    <div className="notif-list">
                        {notifications?.map((n, idx) => (
                            <div key={idx} className="notif-item">
                                <div className={`notif-dot ${n.type}`}></div>
                                <div className="notif-text">
                                    <strong>{n.title}</strong>
                                    <p>{n.message}</p>
                                </div>
                            </div>
                        ))}
                        {(!notifications || notifications.length === 0) && (
                            <p className="empty-msg">No recent activity detected.</p>
                        )}
                    </div>
                </section>
            </div>

            <style>{`
                .applier-dashboard { display: flex; flex-direction: column; gap: 2rem; }
                .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .dash-header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
                .last-sync { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--success); font-weight: 700; text-transform: uppercase; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .stat-card { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); position: relative; overflow: hidden; }
                .stat-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .stat-val { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; }
                .stat-link { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 0.25rem; }
                .stat-progress { height: 4px; background: var(--bg-main); border-radius: 2px; }
                .stat-progress .fill { height: 100%; background: var(--primary); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
                .highlight-primary { border-color: var(--primary); background: linear-gradient(to bottom right, var(--bg-card), rgba(79, 70, 229, 0.05)); }

                .dash-sections { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
                .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-head h3 { display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; }
                .view-all { font-size: 0.8rem; color: var(--primary); font-weight: 700; }
                
                .top-matches, .recent-notifs { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
                
                .mini-match-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-main); border-radius: var(--radius-md); margin-bottom: 0.75rem; border: 1px solid transparent; transition: var(--transition); cursor: pointer; }
                .mini-match-card:hover { border-color: var(--primary); transform: translateX(5px); }
                .match-score { font-weight: 800; font-size: 1.1rem; width: 50px; }
                .match-info { flex: 1; display: flex; flex-direction: column; }
                .match-info strong { font-size: 0.95rem; }
                .match-info span { font-size: 0.75rem; color: var(--text-muted); }
                .arrow { color: var(--text-muted); opacity: 0.5; }

                .notif-item { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
                .notif-item:last-child { border: none; margin: 0; padding: 0; }
                .notif-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
                .notif-dot.success { background: var(--success); }
                .notif-dot.info { background: var(--primary); }
                .notif-text strong { display: block; font-size: 0.85rem; margin-bottom: 0.2rem; }
                .notif-text p { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }
                .empty-msg { font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 2rem 0; }

                .dashboard-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1.5rem; }
                .pulse-loader { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); animation: pulse 1.5s infinite ease-in-out; }
                @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(0.8); opacity: 0.5; } }

                @media (max-width: 900px) {
                    .dash-sections { grid-template-columns: 1fr; }
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};
