import React, { useState } from 'react';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, MapPin, DollarSign, Plus, Sparkles, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PostJob = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState({
        title: '',
        company: user?.company || '',
        description: '',
        location: '',
        salary: '',
        skills: [],
        hrId: user?.id
    });
    const [skillInput, setSkillInput] = useState('');

    const handlePost = async (e) => {
        e.preventDefault();
        if (!job.title || !job.skills.length) return alert('Please fill title and skills');

        await db.jobs.add(job);
        alert('Job posted successfully!');
        navigate('/hr-dashboard');
    };

    const extractSkills = () => {
        // Mock extraction logic
        const commonSkills = ['React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Testing', 'CSS'];
        const found = commonSkills.filter(s => job.description.toLowerCase().includes(s.toLowerCase()));
        setJob({ ...job, skills: [...new Set([...job.skills, ...found])] });
    };

    return (
        <div className="post-job-container animate-fade-in">
            <div className="section-header">
                <h1>Post a New Opportunity</h1>
                <p>Define requirements and attract the best candidates</p>
            </div>

            <div className="form-layout glass">
                <form onSubmit={handlePost}>
                    <div className="grid-form">
                        <div className="form-group full-width">
                            <label>Job Title</label>
                            <input type="text" placeholder="e.g. Senior Frontend Engineer" value={job.title} onChange={e => setJob({ ...job, title: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label><MapPin size={16} /> Location</label>
                            <input type="text" placeholder="e.g. Remote / New York" value={job.location} onChange={e => setJob({ ...job, location: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label><DollarSign size={16} /> Salary Range</label>
                            <input type="text" placeholder="e.g. $120k - $150k" value={job.salary} onChange={e => setJob({ ...job, salary: e.target.value })} />
                        </div>

                        <div className="form-group full-width">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <label>Job Description</label>
                                <button type="button" className="ai-btn" onClick={extractSkills}>
                                    <Sparkles size={14} /> Auto-extract Skills
                                </button>
                            </div>
                            <textarea rows="6" placeholder="Paste full JD here..." value={job.description} onChange={e => setJob({ ...job, description: e.target.value })}></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label>Mandatory Skills</label>
                            <div className="skill-input-bar">
                                <input type="text" placeholder="Add skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), setJob({ ...job, skills: [...job.skills, skillInput] }), setSkillInput(''))} />
                                <button type="button" className="add-btn" onClick={() => { setJob({ ...job, skills: [...job.skills, skillInput] }); setSkillInput(''); }}>Add</button>
                            </div>
                            <div className="skills-row">
                                {job.skills.map((s, idx) => (
                                    <span key={idx} className="skill-chip">
                                        {s} <Trash2 size={12} onClick={() => setJob({ ...job, skills: job.skills.filter((_, i) => i !== idx) })} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="post-btn"><Save size={18} /> Publish Job Post</button>
                    </div>
                </form>
            </div>

            <style>{`
        .post-job-container { max-width: 800px; margin: 0 auto; }
        .form-layout { padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .ai-btn { font-size: 0.8rem; color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--primary); }
        .ai-btn:hover { background: var(--primary); color: white; }
        .skill-input-bar { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .skill-input-bar input { flex: 1; }
        .skills-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .skill-chip { background: var(--bg-main); padding: 0.4rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
        .form-actions { margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem; display: flex; justify-content: flex-end; }
        .post-btn { background: var(--primary); color: white; padding: 1rem 2rem; border-radius: var(--radius-md); font-weight: 700; display: flex; align-items: center; gap: 0.75rem; }

        @media (max-width: 768px) {
          .post-job-container { padding: 0; }
          .form-layout { padding: 1.25rem; }
          .grid-form { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }
      `}</style>
        </div>
    );
};
