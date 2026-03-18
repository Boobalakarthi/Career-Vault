import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { jobApi, applicationApi, notificationApi } from '../db/api';
import { calculateMatchScore } from '../utils/matchingEngine';
import {
    LayoutDashboard, Briefcase, ListChecks,
    Target, Zap, Clock, ChevronRight, TrendingUp, AlertCircle, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApplierDashboard = () => {
    const { profile, loading: profileLoading, error } = useProfile();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [assessmentResults, setAssessmentResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashData = async () => {
            const userId = profile?._id || profile?.id;
            if (!userId) return;
            try {
                setLoading(true);
                const [jobsRes, appsRes, notifsRes] = await Promise.all([
                    jobApi.getAll(),
                    applicationApi.getByUser(userId),
                    notificationApi.getByUser(userId)
                ]);
                setJobs(jobsRes.data);
                setApplications(appsRes.data);
                setNotifications(notifsRes.data);
                // Note: Assessment results could be fetched here too if endpoint exists
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashData();
    }, [profile?._id, profile?.id]);

    if (profileLoading || loading) return (
        <div className="dashboard-loading">
            <div className="pulse-loader"></div>
            <p>Scanning Digital Vault...</p>
        </div>
    );

    const calculateSecurityScore = () => {
        if (!profile) return 0;
        let filled = 0;
        let total = 6;
        if (profile.name && profile.personal?.phone) filled++;
        if (profile.education?.length > 0) filled++;
        if (profile.experience?.length > 0) filled++;
        if (profile.skills?.length > 0) filled++;
        if (profile.certifications?.length > 0) filled++;
        if (profile.resumeUrl) filled++;
        return Math.round((filled / total) * 100);
    };

    const avgAssessmentScore = assessmentResults?.length 
        ? Math.round(assessmentResults.reduce((acc, curr) => acc + curr.score, 0) / assessmentResults.length)
        : 0;

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
                    <p>Welcome, <span className="text-accent">{profile?.name || 'Candidate'}</span></p>
                </div>
                <div className="last-sync">
                    <Zap size={14} fill="currentColor" />
                    <span>AI Engine Online</span>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass highlight-primary">
                    <div className="stat-main">
                        <Target size={32} />
                        <div className="stat-val">{securityScore}%</div>
                    </div>
                    <div className="stat-label">Profile Readiness</div>
                    <div className="stat-progress">
                        <div className="bar"><div className="fill" style={{ width: `${securityScore}%` }}></div></div>
                    </div>
                </div>

                <div className="stat-card glass">
                    <div className="stat-main">
                        <TrendingUp size={32} />
                        <div className="stat-val">{avgAssessmentScore}%</div>
                    </div>
                    <div className="stat-label">Avg. Skill Proficiency</div>
                    <Link to="/assessments" className="stat-link">View Reports <ChevronRight size={14} /></Link>
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
                <div className="main-feed">
                    <section className="top-matches glass">
                        <div className="section-head">
                            <h3><Zap size={18} /> High-Confidence Matches</h3>
                            <Link to="/jobs" className="view-all">All Jobs</Link>
                        </div>
                        <div className="match-list">
                            {rankedMatches.length > 0 ? rankedMatches.map((m, idx) => (
                                <div key={idx} className="mini-match-card">
                                    <div className="match-score-p" style={{ 
                                        background: m.match.score > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                                        color: m.match.score > 80 ? 'var(--success)' : 'var(--primary)'
                                    }}>
                                        {m.match.score}%
                                    </div>
                                    <div className="match-info">
                                        <strong>{m.title}</strong>
                                        <span>{m.company} • {m.location}</span>
                                    </div>
                                    <ChevronRight size={16} className="arrow" />
                                </div>
                            )) : (
                                <p className="empty-msg">No job matches found yet.</p>
                            )}
                        </div>
                    </section>

                    <section className="roadmap-preview glass premium-shadow">
                        <div className="section-head">
                            <h3><Rocket size={18} /> Next Career Milestone</h3>
                        </div>
                        <div className="milestone-content">
                            <div className="milestone-text">
                                <span className="m-tag">PHASE 01</span>
                                <h4>Closing Architecture Gaps</h4>
                                <p>Master core concepts of System Design & Optimization</p>
                            </div>
                            <Link to="/roadmap" className="continue-btn">Continue Roadmap <ChevronRight size={16} /></Link>
                        </div>
                    </section>
                </div>

                <aside className="side-feed">
                    <section className="recent-notifs glass">
                        <div className="section-head">
                            <h3><Clock size={18} /> Vault Activity</h3>
                        </div>
                        <div className="notif-list">
                            {notifications?.map((n, idx) => (
                                <div key={idx} className="notif-item">
                                    <div className={`notif-dot ${n.type || 'info'}`}></div>
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

                    <div className="promo-banner glass">
                        <strong>Ready for an interview?</strong>
                        <p>Our AI coach is ready to simulate your next technical round.</p>
                        <Link to="/interview-prep" className="promo-btn">Start Practice</Link>
                    </div>
                </aside>
            </div>

            <style>{`
                .applier-dashboard { display: flex; flex-direction: column; gap: 2rem; }
                .dash-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .dash-header h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
                .last-sync { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--success); font-weight: 700; text-transform: uppercase; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .stat-card { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); position: relative; overflow: hidden; background: var(--bg-card); transition: all 0.3s; }
                .stat-card:hover { transform: translateY(-5px); border-color: var(--primary); }
                .stat-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; color: var(--primary); }
                .stat-val { font-size: 2.25rem; font-weight: 900; color: var(--text-main); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; }
                .stat-link { font-size: 0.75rem; font-weight: 700; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 0.25rem; }
                
                .stat-progress { height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; }
                .stat-progress .fill { height: 100%; background: var(--primary); transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
                .highlight-primary { border-color: var(--primary); background: linear-gradient(to bottom right, var(--bg-card), rgba(79, 70, 229, 0.05)); }

                .dash-sections { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
                .main-feed { display: flex; flex-direction: column; gap: 2rem; }
                .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .section-head h3 { display: flex; align-items: center; gap: 0.6rem; font-size: 1.1rem; font-weight: 700; }
                .view-all { font-size: 0.8rem; color: var(--primary); font-weight: 700; }
                
                .top-matches, .recent-notifs, .roadmap-preview { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
                
                .mini-match-card { display: flex; align-items: center; gap: 1.25rem; padding: 1rem; background: var(--bg-main); border-radius: var(--radius-md); margin-bottom: 0.75rem; border: 1px solid transparent; transition: var(--transition); cursor: pointer; }
                .mini-match-card:hover { border-color: var(--primary); transform: translateX(5px); background: var(--bg-card); }
                .match-score-p { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 900; font-size: 0.9rem; flex-shrink: 0; }
                .match-info { flex: 1; display: flex; flex-direction: column; }
                .match-info strong { font-size: 1rem; }
                .match-info span { font-size: 0.8rem; color: var(--text-muted); }
                
                .roadmap-preview { background: var(--bg-dark); color: white; border: none; }
                .roadmap-preview h3 { color: white; opacity: 0.9; }
                .milestone-content { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; gap: 1.5rem; }
                .m-tag { color: var(--primary); font-weight: 800; font-size: 0.7rem; letter-spacing: 0.1em; }
                .milestone-text h4 { font-size: 1.25rem; margin: 0.25rem 0; }
                .milestone-text p { opacity: 0.7; font-size: 0.9rem; }
                .continue-btn { background: var(--primary); color: white; padding: 0.75rem 1.25rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

                .side-feed { display: flex; flex-direction: column; gap: 2rem; }
                .notif-item { display: flex; gap: 1rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); margin-bottom: 1.25rem; }
                .notif-item:last-child { border: none; margin: 0; padding: 0; }
                .notif-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
                .notif-dot.success { background: var(--success); box-shadow: 0 0 10px var(--success); }
                .notif-dot.info { background: var(--primary); box-shadow: 0 0 10px var(--primary); }
                .notif-text strong { display: block; font-size: 0.9rem; margin-bottom: 0.25rem; }
                .notif-text p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }
                
                .promo-banner { padding: 1.5rem; background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%); border: 1px dashed var(--primary); border-radius: var(--radius-lg); text-align: center; }
                .promo-banner strong { display: block; margin-bottom: 0.5rem; font-size: 1rem; }
                .promo-banner p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
                .promo-btn { color: var(--primary); font-weight: 800; font-size: 0.9rem; border-bottom: 2px solid var(--primary); padding-bottom: 2px; }

                @media (max-width: 1000px) {
                    .dash-sections { grid-template-columns: 1fr; }
                    .side-feed { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                }
                @media (max-width: 768px) {
                    .side-feed { grid-template-columns: 1fr; }
                    .milestone-content { flex-direction: column; align-items: flex-start; }
                    .continue-btn { width: 100%; }
                }
            `}</style>
        </div>
    );
};
