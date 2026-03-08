import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Clock, ChevronRight, MapPin } from 'lucide-react';

export const MyApplications = () => {
    const { user } = useAuth();

    // Real-time applications
    const applications = useLiveQuery(
        () => user ? db.applications.where({ applierId: user.id }).toArray() : [],
        [user?.id]
    );
    const jobs = useLiveQuery(() => db.jobs.toArray(), []);

    const enrichedApps = (applications && jobs)
        ? applications.map(app => ({
            ...app,
            job: jobs.find(j => j.id === app.jobId)
        }))
        : [];

    const columns = [
        { id: 'Applied', color: 'var(--primary)' },
        { id: 'Interviewing', color: 'var(--warning)' },
        { id: 'Offered', color: 'var(--success)' },
        { id: 'Closed', color: 'var(--text-muted)' }
    ];

    if (!applications || !jobs) return <div>Loading applications...</div>;

    return (
        <div className="apps-container animate-fade-in">
            <div className="section-header">
                <h1>Application Pipeline</h1>
                <p>Track your real-time status across active opportunities</p>
            </div>

            <div className="kanban-board">
                {columns.map(col => (
                    <div key={col.id} className="kanban-column">
                        <h3 className="column-title" style={{ color: col.color }}>
                            {col.id} <span className="count">{enrichedApps.filter(a => a.status === col.id).length}</span>
                        </h3>
                        <div className="column-content">
                            {enrichedApps.filter(a => a.status === col.id).map(app => (
                                <div key={app.id} className="app-card glass">
                                    <div className="app-header">
                                        <h4>{app.job?.title || 'Unknown Job'}</h4>
                                        <span className="company">{app.job?.company}</span>
                                    </div>
                                    <div className="app-meta">
                                        <span className="loc"><MapPin size={12} /> {app.job?.location}</span>
                                        <span className="updated"><Clock size={12} /> {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}</span>
                                    </div>
                                    <button className="view-btn">View Details <ChevronRight size={14} /></button>
                                </div>
                            ))}
                            {enrichedApps.filter(a => a.status === col.id).length === 0 && (
                                <div className="empty-slot">Empty</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .apps-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-top: 1rem; }
        .kanban-column { display: flex; flex-direction: column; gap: 1rem; }
        .column-title { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid currentColor; padding-bottom: 0.5rem; }
        .column-title .count { background: var(--bg-main); font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--border); color: var(--text-main); }
        .column-content { display: flex; flex-direction: column; gap: 1rem; min-height: 200px; }
        .app-card { padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.75rem; transition: transform 0.2s; }
        .app-card:hover { transform: translateY(-3px); border-color: var(--primary); }
        .app-header h4 { font-size: 1rem; margin-bottom: 0.2rem; }
        .app-header .company { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
        .app-meta { display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.75rem; color: var(--text-muted); }
        .app-meta span { display: flex; align-items: center; gap: 0.4rem; }
        .view-btn { width: 100%; margin-top: 0.5rem; font-size: 0.75rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--border); }
        .empty-slot { border: 2px dashed var(--border); height: 100px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem; opacity: 0.5; }

        @media (max-width: 1024px) {
          .kanban-board { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .kanban-board { grid-template-columns: 1fr; }
          .column-content { min-height: auto; }
        }
      `}</style>
        </div>
    );
};
