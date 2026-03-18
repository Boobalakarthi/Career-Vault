import React, { useState, useEffect } from 'react';
import { jobApi, profileApi, applicationApi, notificationApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import { calculateMatchScore } from '../utils/matchingEngine';
import { Users, Briefcase, ChevronRight, Star, ArrowUpRight, Filter, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HRDashboard = () => {
    const { user } = useAuth();
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const userId = user?._id || user?.id;
        if (!userId) return;
        try {
            setLoading(true);
            const [jobsRes, profilesRes, appsRes] = await Promise.all([
                jobApi.getAll(), // Ideally filtered by HR on server
                profileApi.getAllAppliers ? profileApi.getAllAppliers() : profileApi.get('all'), // Need a way to get all appliers
                applicationApi.getAll ? applicationApi.getAll() : applicationApi.getByUser(user.id) // Need HR view of apps
            ]);
            
            // For now, filter jobs locally if backend doesn't support hrId filter yet
            const myJobs = jobsRes.data.filter(j => {
                const jobHrId = String(j.hrId?._id || j.hrId || '');
                const jobPostedBy = String(j.postedBy || '');
                return jobHrId === String(userId) || jobPostedBy === String(userId);
            });
            setJobs(myJobs);
            
            // For candidates, we need a list of users with role APPLIER
            // Assuming profileApi.get('all') might return all or we need a new endpoint
            setCandidates(profilesRes.data || []);
            setApplications(appsRes.data || []);
            
            if (myJobs.length > 0 && !selectedJobId) {
                setSelectedJobId(myJobs[0].id);
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?._id, user?.id]);

    const selectedJob = jobs?.find(j => j.id === selectedJobId) || null;

    const rankedCandidates = (selectedJob && candidates && candidates.length > 0)
        ? candidates.map(c => ({
            ...c,
            match: calculateMatchScore(c, selectedJob),
            appStatus: applications?.find(a => a.jobId === selectedJob.id && a.applierId === c.userId)?.status || null
        })).sort((a, b) => b.match.score - a.match.score)
        : [];

    const getApplicantCount = (jobId) => {
        return applications?.filter(a => a.jobId === jobId).length || 0;
    };

    const deleteJob = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await jobApi.delete(jobId);
            loadData();
            if (selectedJobId === jobId) setSelectedJobId(null);
        } catch (err) {
            console.error("Delete job error:", err);
        }
    };

    if (loading) return (
        <div className="dashboard-loading">
            <div className="pulse-loader"></div>
            <p>Syncing Talent Pipeline...</p>
        </div>
    );

    return (
        <div className="hr-dashboard animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1>Recruitment Dashboard</h1>
                    <p>Manager: {user.name} @ {user.company}</p>
                </div>
                <Link to="/post-job" className="post-btn-link"><Plus size={18} /> Post New Job</Link>
            </div>

            <div className="hr-layout">
                <aside className="job-list glass">
                    <h3>Your Active Jobs ({jobs.length})</h3>
                    {jobs.map(j => (
                        <div key={j.id} className={`job-item ${selectedJob?.id === j.id ? 'active' : ''}`} onClick={() => setSelectedJobId(j.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="title">{j.title}</span>
                                <button onClick={(e) => { e.stopPropagation(); deleteJob(j.id); }} style={{ opacity: 0.6, color: selectedJob?.id === j.id ? 'white' : 'var(--danger)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <span className="applicants">{getApplicantCount(j.id)} Applicants</span>
                        </div>
                    ))}
                    {jobs.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No jobs posted yet.</p>
                    )}
                </aside>

                <section className="candidate-pool">
                    {selectedJob ? (
                        <>
                            <div className="pool-header">
                                <h2>Ranked Candidates for "{selectedJob.title}"</h2>
                            </div>

                            <div className="candidate-grid">
                                {rankedCandidates.map((can, idx) => (
                                    <div key={idx} className="candidate-card glass">
                                        <div className="candidate-main">
                                            <div className="score-ring" style={{ borderColor: can.match.score > 80 ? 'var(--success)' : 'var(--primary)' }}>
                                                {can.match.score}<sub>%</sub>
                                            </div>
                                            <div className="can-info">
                                                <h4>{can.name || 'Anonymous'}</h4>
                                                <p>{can.personal?.location || 'Location hidden'}</p>
                                            </div>
                                        </div>

                                        <div className="can-skills">
                                            {can.match.matched.slice(0, 3).map(s => <span key={s} className="match-tag">{s}</span>)}
                                            {can.match.missing.length > 0 && <span className="missing-count">+{can.match.missing.length} gaps</span>}
                                        </div>

                                        <div className="status-ops" style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>APPLICATION PIPELINE</label>
                                            <select
                                                className="status-select"
                                                style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                                                value={can.appStatus || 'Applied'}
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    try {
                                                        const app = applications.find(a => a.jobId === selectedJob.id && a.applierId === can.userId);
                                                        if (app) {
                                                            await applicationApi.updateStatus(app.id, val);
                                                        }
                                                        
                                                        await notificationApi.create({
                                                            userId: can.userId,
                                                            title: 'Application Updated',
                                                            message: `Your status for ${selectedJob.title} is now: ${val}`,
                                                            type: val === 'Offered' ? 'success' : 'info'
                                                        });
                                                        loadData();
                                                    } catch (err) {
                                                        console.error("Status update error:", err);
                                                    }
                                                }}
                                            >
                                                <option>Applied</option>
                                                <option>Interviewing</option>
                                                <option>Offered</option>
                                                <option>Closed</option>
                                            </select>
                                        </div>

                                        <div className="can-actions">
                                            <button className="view-can-btn">Shortlist</button>
                                            <button className="view-can-btn secondary">Profile <ArrowUpRight size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Briefcase size={48} />
                            <h3 style={{ marginTop: '1rem' }}>Select or post a job to view candidates</h3>
                        </div>
                    )}
                </section>
            </div>

            <style>{`
        .hr-dashboard { display: flex; flex-direction: column; gap: 2rem; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .post-btn-link { background: var(--bg-dark); color: white; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
        .hr-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; align-items: flex-start; }
        .job-list { padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .job-list h3 { font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem; padding-left: 0.5rem; }
        .job-item { padding: 1rem; border-radius: var(--radius-md); cursor: pointer; transition: var(--transition); margin-bottom: 0.5rem; }
        .job-item:hover { background: var(--bg-main); }
        .job-item.active { background: var(--primary); color: white; }
        .job-item .title { display: block; font-weight: 700; font-size: 0.95rem; }
        .job-item .applicants { font-size: 0.75rem; opacity: 0.8; }
        .pool-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
        .candidate-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .candidate-card { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.75rem; }
        .candidate-main { display: flex; align-items: center; gap: 1rem; }
        .score-ring { width: 50px; height: 50px; border-radius: 50%; border: 4px solid var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; }
        .score-ring sub { font-size: 0.6rem; font-weight: 400; margin-top: 4px; }
        .can-info h4 { font-size: 1.1rem; }
        .can-info p { font-size: 0.8rem; color: var(--text-muted); }
        .can-skills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .match-tag { font-size: 0.7rem; background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; }
        .missing-count { font-size: 0.7rem; color: var(--text-muted); }
        .can-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
        .view-can-btn { flex: 1; padding: 0.5rem; background: var(--primary); color: white; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; }
        .view-can-btn.secondary { background: var(--bg-main); color: var(--primary); border: 1px solid var(--primary); display: flex; align-items: center; justify-content: center; gap: 0.3rem; }

        @media (max-width: 768px) {
          .hr-layout { grid-template-columns: 1fr; }
          .job-list { display: flex; flex-direction: row; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; }
          .job-list::-webkit-scrollbar { display: none; }
          .job-list h3 { display: none; }
          .job-item { flex-shrink: 0; min-width: 160px; }
          .candidate-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};
