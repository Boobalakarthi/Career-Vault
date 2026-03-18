import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { calculateMatchScore } from '../utils/matchingEngine';
import { Rocket, CheckCircle2, Bookmark, ArrowRight } from 'lucide-react';

export const CareerRoadmap = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const [targetRole, setTargetRole] = useState('Senior Frontend Developer');

    const courses = []; // Placeholder for courses until Course API is ready

    const generateRoadmap = () => {
        if (!profile) return null;
        
        // Dynamic Job Profile based on target
        const jobProfiles = {
            'Senior Frontend Developer': { skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Testing', 'Redux'] },
            'Full Stack Engineer': { skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Next.js'] },
            'Data Scientist': { skills: ['Python', 'SQL', 'Machine Learning', 'Stats', 'Pandas', 'Spark'] },
            'DevOps Engineer': { skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Linux'] }
        };

        const currentProfile = jobProfiles[targetRole] || jobProfiles['Senior Frontend Developer'];
        const match = calculateMatchScore(profile, currentProfile);

        // Find relevant courses from DB
        const relevantCourses = courses?.filter(c =>
            c.skills?.some(s => match.missing.map(m => m.toLowerCase()).includes(s.toLowerCase()))
        ) || [];

        const weeks = [
            { 
                week: 1, 
                focus: "Closing " + (match.missing[0] || "Foundational") + " Gaps", 
                tasks: [
                    "Master core concepts of " + (match.missing[0] || "Architecture"),
                    relevantCourses[0] ? `Finish Course: ${relevantCourses[0].title}` : "Practical Lab: Implementation",
                    "Take Level 1 Skills Assessment"
                ] 
            },
            { 
                week: 2, 
                focus: (match.missing[1] || "Advanced") + " Mastery", 
                tasks: [
                    "Build a complex feature using " + (match.missing[1] || "Design Patterns"),
                    relevantCourses[1] ? `Start Course: ${relevantCourses[1].title}` : "System Design Workshop",
                    "Peer Review / Code Audit Session"
                ] 
            },
            { 
                week: 3, 
                focus: "Performance & Scaling", 
                tasks: [
                    "Optimization techniques for " + targetRole, 
                    "Implement monitoring and logging",
                    "Technical Mock Interview"
                ] 
            },
            { 
                week: 4, 
                focus: "Career Leap & Portfolio", 
                tasks: [
                    "Finalize capstone project highlighting " + (match.missing[0] || "Skills"),
                    "Resume sync with CareerVault AI",
                    "Apply to 5 High-Match jobs"
                ] 
            }
        ];
        return { role: targetRole, weeks, match };
    };

    const roadmap = generateRoadmap();

    if (profileLoading) return (
        <div className="loading-state">
            <span className="loader"></span>
            <p>Analyzing profile and market trends...</p>
        </div>
    );
    
    if (!profile || !roadmap) return (
        <div className="empty-roadmap glass">
            <Rocket size={64} className="icon-bounce" />
            <h2>Unlock Your Roadmap</h2>
            <p>Please complete your personal profile to let AI calculate your career trajectory.</p>
            <button className="save-btn" onClick={() => window.location.href='/profile'}>Go to Profile</button>
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
            <div className="roadmap-header glass premium-gradient">
                <div className="title-area">
                    <div className="icon-wrapper">
                        <Rocket size={32} color="white" />
                    </div>
                    <div>
                        <h1>Precision Roadmap</h1>
                        <p>Real-time career leveling for <strong>{user.name}</strong></p>
                    </div>
                </div>
                <div className="roadmap-controls">
                    <div className="role-selector">
                        <label>Target Ambition</label>
                        <select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                            {roleOptions.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="match-score-card">
                        <div className="score-circle">
                            <span className="score-num">{roadmap.match.score}%</span>
                            <span className="score-label">MATCH</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="roadmap-timeline">
                {roadmap.weeks.map((week, idx) => (
                    <div key={idx} className="timeline-item">
                        <div className="week-marker">
                            <div className="vertical-line"></div>
                            <div className={`step-node ${idx === 0 ? 'active' : ''}`}>{week.week}</div>
                        </div>
                        <div className={`week-card glass ${idx === 0 ? 'active-week' : ''}`}>
                            <div className="week-header-pro">
                                <div className="week-info">
                                    <span className="week-tag">PHASE 0{week.week}</span>
                                    <h3>{week.focus}</h3>
                                </div>
                                <span className={`status-tag ${idx === 0 ? 'active' : ''}`}>
                                    {idx === 0 ? 'CURRENT STEP' : 'LOCKED'}
                                </span>
                            </div>
                            <ul className="roadmap-tasks">
                                {week.tasks.map((task, tidx) => (
                                    <li key={tidx} className="task-item">
                                        <div className="task-check">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="week-footer-pro">
                                <button className="resource-link"><Bookmark size={16} /> Explore Resources</button>
                                {idx === 0 && <button className="complete-btn">Mark as Done <ArrowRight size={16} /></button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .roadmap-container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem; }
                .premium-gradient { background: linear-gradient(135deg, var(--primary) 0%, #312e81 100%) !important; color: white !important; }
                .roadmap-header { padding: 2.5rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                .icon-wrapper { background: rgba(255, 255, 255, 0.2); padding: 1rem; border-radius: var(--radius-md); backdrop-filter: blur(5px); }
                .roadmap-header p { opacity: 0.8; color: white; }
                
                .roadmap-controls { display: flex; align-items: center; gap: 2rem; }
                .role-selector label { display: block; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; opacity: 0.7; margin-bottom: 0.5rem; }
                .role-selector select { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; }
                
                .match-score-card { background: white; color: var(--primary); padding: 0.5rem 1.5rem; border-radius: var(--radius-lg); }
                .score-circle { display: flex; flex-direction: column; align-items: center; }
                .score-num { font-size: 1.75rem; font-weight: 900; line-height: 1; }
                .score-label { font-size: 0.65rem; font-weight: 800; opacity: 0.6; }

                .roadmap-timeline { display: flex; flex-direction: column; padding-left: 2rem; position: relative; }
                .timeline-item { display: grid; grid-template-columns: 80px 1fr; gap: 2rem; }
                
                .week-marker { display: flex; flex-direction: column; align-items: center; position: relative; }
                .vertical-line { position: absolute; top: 0; bottom: 0; width: 4px; background: var(--border); border-radius: 2px; }
                .step-node { width: 40px; height: 40px; background: white; border: 4px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--text-muted); z-index: 10; font-size: 0.9rem; transition: all 0.3s; }
                .step-node.active { background: var(--primary); border-color: #818cf8; color: white; transform: scale(1.1); box-shadow: 0 0 15px rgba(79, 70, 229, 0.3); }

                .week-card { margin-bottom: 2.5rem; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); transition: all 0.3s; }
                .week-card.active-week { border-color: var(--primary); border-left: 8px solid var(--primary); transform: translateX(5px); }
                
                .week-tag { font-size: 0.7rem; font-weight: 800; color: var(--primary); letter-spacing: 0.05em; }
                .week-info h3 { margin: 0.25rem 0 1.5rem 0; font-size: 1.25rem; }
                .status-tag { font-size: 0.65rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 99px; background: var(--bg-main); color: var(--text-muted); }
                .status-tag.active { background: var(--success); color: white; }

                .roadmap-tasks { list-style: none; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                .task-item { display: flex; align-items: center; gap: 1rem; font-size: 1rem; color: var(--text-main); font-weight: 500; }
                .task-check { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--success); opacity: 0.6; }
                
                .week-footer-pro { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1.5rem; }
                .resource-link { color: var(--primary); font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
                .complete-btn { background: var(--primary); color: white; padding: 0.6rem 1.2rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }

                .empty-roadmap { text-align: center; padding: 5rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
                .icon-bounce { animation: bounce 2s infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

                @media (max-width: 768px) {
                    .roadmap-header { flex-direction: column; align-items: flex-start; }
                    .roadmap-controls { width: 100%; margin-top: 1.5rem; }
                    .roadmap-timeline { padding-left: 0; }
                    .timeline-item { grid-template-columns: 1fr; }
                    .week-marker { display: none; }
                    .week-card { border-left-width: 5px; }
                }
            `}</style>
        </div>
    );
};
