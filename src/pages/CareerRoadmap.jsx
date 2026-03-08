import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { calculateMatchScore } from '../utils/matchingEngine';
import { Rocket, CheckCircle2, Bookmark } from 'lucide-react';

export const CareerRoadmap = () => {
    const { user } = useAuth();
    const [targetRole, setTargetRole] = useState('Senior Frontend Developer');

    // Real-time profile
    const profile = useLiveQuery(
        () => user ? db.profiles.where({ userId: user.id }).first() : null,
        [user?.id]
    );

    const courses = useLiveQuery(() => db.courses.toArray(), []);

    const generateRoadmap = () => {
        if (!profile) return null;
        const mockJob = { title: targetRole, skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Testing'] };
        const match = calculateMatchScore(profile, mockJob);

        // Find relevant courses from DB
        const relevantCourses = courses?.filter(c =>
            c.skills?.some(s => match.missing.map(m => m.toLowerCase()).includes(s.toLowerCase()))
        ).slice(0, 4) || [];

        const weeks = [
            { week: 1, focus: "Foundation & " + (match.missing[0] || "Architecture"), tasks: ["Review core concepts", relevantCourses[0] ? `Course: ${relevantCourses[0].title}` : "Complete assessment 1"] },
            { week: 2, focus: "Advanced " + (match.missing[1] || "Patterns"), tasks: ["Build small project", relevantCourses[1] ? `Course: ${relevantCourses[1].title}` : "Deep Dive course"] },
            { week: 3, focus: "Scaling & Performance", tasks: ["Optimization workshop", "Mock interview"] },
            { week: 4, focus: "Final Prep & Projects", tasks: ["Portfolio update", "Apply to matched jobs"] }
        ];
        return { role: targetRole, weeks, match };
    };

    const roadmap = generateRoadmap();

    if (profile === undefined) return <div>Generating your roadmap...</div>;
    if (!profile || !roadmap) return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Rocket size={48} color="var(--primary)" />
            <h2 style={{ marginTop: '1rem' }}>Complete your profile first</h2>
            <p style={{ color: 'var(--text-muted)' }}>Add skills and experience to generate your personalized career roadmap.</p>
        </div>
    );

    const roleOptions = [
        'Senior Frontend Developer',
        'Full Stack Engineer',
        'Data Scientist',
        'DevOps Engineer',
        'Cloud Architect',
        'Mobile Developer'
    ];

    return (
        <div className="roadmap-container animate-fade-in">
            <div className="roadmap-header glass">
                <div className="title-area">
                    <Rocket size={32} color="var(--primary)" />
                    <div>
                        <h1>Career Roadmap</h1>
                        <p>4-Week personalized plan to reach your goal</p>
                    </div>
                </div>
                <div className="roadmap-controls">
                    <select value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {roleOptions.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <div className="stat-card">
                        <span className="label">Match Score</span>
                        <span className="val">{roadmap.match.score}%</span>
                    </div>
                </div>
            </div>

            <div className="roadmap-timeline">
                {roadmap.weeks.map((week, idx) => (
                    <div key={idx} className="timeline-item">
                        <div className="week-marker">
                            <div className="line"></div>
                            <div className="circle">Week {week.week}</div>
                        </div>
                        <div className="week-card glass">
                            <div className="week-header">
                                <h3>{week.focus}</h3>
                                <span className="status">{idx === 0 ? 'In Progress' : 'Upcoming'}</span>
                            </div>
                            <ul className="task-list">
                                {week.tasks.map((task, tidx) => (
                                    <li key={tidx}>
                                        <CheckCircle2 size={16} />
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="week-footer">
                                <button className="resource-btn"><Bookmark size={14} /> View Resources</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .roadmap-container { display: flex; flex-direction: column; gap: 2rem; }
        .roadmap-header { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .title-area { display: flex; align-items: center; gap: 1.5rem; }
        .roadmap-controls { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .roadmap-timeline { display: flex; flex-direction: column; padding-left: 2rem; }
        .timeline-item { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; }
        .week-marker { display: flex; flex-direction: column; align-items: center; position: relative; }
        .week-marker .line { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--border); left: 50%; z-index: 1; }
        .week-marker .circle { width: 64px; height: 32px; background: var(--bg-dark); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; z-index: 2; position: sticky; top: 100px; }
        .week-card { margin-bottom: 2rem; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); }
        .week-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
        .week-header .status { font-size: 0.7rem; background: rgba(79, 70, 229, 0.1); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); font-weight: 700; text-transform: uppercase; }
        .task-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .task-list li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; color: var(--text-main); }
        .task-list li svg { color: var(--success); flex-shrink: 0; }
        .resource-btn { font-size: 0.8rem; color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }
        .stat-card { text-align: right; }
        .stat-card .label { display: block; font-size: 0.8rem; color: var(--text-muted); }
        .stat-card .val { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

        @media (max-width: 768px) {
          .roadmap-timeline { padding-left: 0; }
          .timeline-item { grid-template-columns: 1fr; gap: 0.5rem; }
          .week-marker { flex-direction: row; justify-content: flex-start; margin-bottom: 0; }
          .week-marker .line { display: none; }
          .week-marker .circle { position: static; }
          .roadmap-header { padding: 1.25rem; }
          .week-card { padding: 1rem; }
        }
      `}</style>
        </div>
    );
};
