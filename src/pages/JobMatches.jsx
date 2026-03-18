import React, { useState, useEffect } from 'react';
import { jobApi, applicationApi, notificationApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { calculateMatchScore } from '../utils/matchingEngine';
import { Briefcase, Target, BookOpen, ChevronRight, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

export const JobMatches = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await jobApi.getAll();
                setJobs(res.data);
            } catch (err) {
                console.error("Error fetching jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const matches = (profile && jobs && jobs.length > 0)
        ? jobs.map(job => ({
            ...job,
            match: calculateMatchScore(profile, job)
        })).sort((a, b) => b.match.score - a.match.score)
        : [];

    const handleApply = async (job) => {
        try {
            const existingRes = await applicationApi.getByUser(user.id);
            const isDuplicate = existingRes.data.some(app => app.jobId._id === job.id);
            if (isDuplicate) {
                alert('You have already applied to this job!');
                return;
            }
            
            await applicationApi.apply({
                jobId: job.id,
                applierId: user.id,
                status: 'Applied'
            });
            
            await notificationApi.create({
                userId: user.id,
                title: 'Application Submitted',
                message: `You applied to ${job.title} at ${job.company}`,
                type: 'success'
            });
            
            alert(`Applied to ${job.title}!`);
        } catch (err) {
            console.error("Application error:", err);
            alert("Failed to submit application");
        }
    };

    if (profileLoading || loading) return <div>Analyzing matches...</div>;

    return (
        <div className="matches-container animate-fade-in">
            <div className="page-header">
                <h1>Your AI Job Matches</h1>
                <p>Based on your current skills and experience profile</p>
            </div>

            {matches.length === 0 && (
                <div className="empty-state glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                    <Briefcase size={48} color="var(--text-muted)" />
                    <h3 style={{ marginTop: '1rem' }}>Complete your profile to see matches</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Add skills and experience to get AI-powered job recommendations.</p>
                </div>
            )}

            <div className="matches-grid">
                {matches.map((job, idx) => (
                    <div key={job.id || idx} className="job-card glass">
                        <div className="job-main">
                            <div className="score-badge" style={{
                                background: job.match.score > 80 ? 'var(--success)' : job.match.score > 60 ? 'var(--warning)' : 'var(--danger)'
                            }}>
                                {job.match.score}% <span>Match</span>
                            </div>
                            <div className="job-info">
                                <h3>{job.title}</h3>
                                <p className="company">{job.company} • {job.location}</p>
                                {job.salary && <p className="salary">{job.salary}</p>}
                                <div className="tags">
                                    {job.skills.map(s => (
                                        <span key={s} className={`tag ${job.match.matched.includes(s.toLowerCase()) ? 'matched' : ''}`}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="match-analysis">
                            <div className="analysis-item">
                                <Target size={16} />
                                <span><strong>Confidence:</strong> {job.match.confidence}</span>
                            </div>
                            <div className="analysis-item">
                                <Zap size={16} />
                                <span>{job.match.reason}</span>
                            </div>

                            {job.match.missing.length > 0 && (
                                <div className="gap-analysis">
                                    <h4><AlertTriangle size={14} /> Critical Skill Gaps</h4>
                                    <div className="missing-tags">
                                        {job.match.missing.map(s => <span key={s} className="gap-tag">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="action-plan">
                            <h4>Recommended Action Plan</h4>
                            <div className="plan-item">
                                <BookOpen size={16} />
                                <span>Take "Advanced {job.match.missing[0] || 'Web'} Patterns" course</span>
                            </div>
                            <div className="job-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="apply-btn" onClick={() => handleApply(job)}>Apply Now <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .matches-container { display: flex; flex-direction: column; gap: 2rem; }
        .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .page-header p { color: var(--text-muted); }
        .matches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .job-card { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; }
        .job-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .job-main { display: flex; gap: 1.5rem; align-items: flex-start; }
        .score-badge { width: 64px; height: 64px; border-radius: var(--radius-md); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; flex-shrink: 0; }
        .score-badge span { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; margin-top: -4px; }
        .job-info h3 { font-size: 1.25rem; font-weight: 700; }
        .company { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.3rem; }
        .salary { color: var(--success); font-weight: 700; font-size: 0.85rem; margin-bottom: 0.5rem; }
        .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; background: var(--border); border-radius: var(--radius-sm); color: var(--text-muted); }
        .tag.matched { background: rgba(16, 185, 129, 0.1); color: var(--success); font-weight: 600; border: 1px solid var(--success); }
        .match-analysis { padding: 1rem; background: var(--bg-main); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.75rem; }
        .analysis-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-main); }
        .gap-analysis { margin-top: 0.5rem; }
        .gap-analysis h4 { font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem; color: var(--danger); margin-bottom: 0.5rem; }
        .gap-tag { font-size: 0.7rem; background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.1rem 0.4rem; border-radius: 4px; margin-right: 0.5rem; border: 1px solid var(--danger); }
        .action-plan { border-top: 1px solid var(--border); padding-top: 1rem; }
        .action-plan h4 { font-size: 0.9rem; margin-bottom: 0.75rem; }
        .plan-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
        .apply-btn { flex: 1; padding: 0.75rem; background: var(--primary); color: white; border-radius: var(--radius-md); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .apply-btn:hover { background: var(--primary-hover); }

        @media (max-width: 768px) {
          .matches-grid { grid-template-columns: 1fr; }
          .job-main { flex-direction: column; align-items: center; text-align: center; }
          .score-badge { width: 56px; height: 56px; font-size: 1rem; }
          .job-card { padding: 1.25rem; }
          .tags { justify-content: center; }
        }
      `}</style>
        </div>
    );
};
