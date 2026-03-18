import React, { useState } from 'react';
import { jobApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import { 
    Briefcase, MapPin, DollarSign, Plus, Sparkles, 
    Trash2, Save, FileText, Globe, Layers, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PostJob = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [job, setJob] = useState({
        title: '',
        company: user?.company || 'Your Company',
        description: '',
        location: '',
        salary: '',
        skills: [],
        type: 'Full-time'
    });
    const [skillInput, setSkillInput] = useState('');

    const handlePost = async (e) => {
        e.preventDefault();
        if (!job.title || !job.skills.length) return alert('Please fill title and skills');

        try {
            setLoading(true);
            await jobApi.create({
                ...job,
                hrId: user._id || user.id
            });
            navigate('/hr-dashboard');
        } catch (err) {
            console.error("Post job error:", err);
            alert("Failed to post job");
        } finally {
            setLoading(false);
        }
    };

    const extractSkills = () => {
        const commonSkills = ['React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Testing', 'CSS', 'JavaScript', 'TypeScript', 'Figma', 'MongoDB'];
        const found = commonSkills.filter(s => job.description.toLowerCase().includes(s.toLowerCase()));
        setJob({ ...job, skills: [...new Set([...job.skills, ...found])] });
    };

    return (
        <div className="post-job-page animate-fade-in">
            <div className="post-job-header">
                <div className="header-badge">Recruitment Terminal 2.0</div>
                <h1>Deploy New Opportunity</h1>
                <p>Configure the parameters to attract elite talent from the global pool.</p>
            </div>

            <div className="post-job-grid">
                <div className="post-form-section glass">
                    <form onSubmit={handlePost}>
                        <div className="form-section-title">
                            <Layers size={18} />
                            <span>Core Details</span>
                        </div>
                        
                        <div className="input-group">
                            <label>Job Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Lead Software Architect" 
                                value={job.title} 
                                onChange={e => setJob({ ...job, title: e.target.value })} 
                                required
                            />
                        </div>

                        <div className="dual-inputs">
                            <div className="input-group">
                                <label><MapPin size={14} /> Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Remote / HQ" 
                                    value={job.location} 
                                    onChange={e => setJob({ ...job, location: e.target.value })} 
                                />
                            </div>
                            <div className="input-group">
                                <label><DollarSign size={14} /> Compensation</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. $140k - $180k" 
                                    value={job.salary} 
                                    onChange={e => setJob({ ...job, salary: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="label-with-action">
                                <label><FileText size={14} /> Description</label>
                                <button type="button" className="ai-assist-btn" onClick={extractSkills}>
                                    <Sparkles size={14} /> AI Skill Sync
                                </button>
                            </div>
                            <textarea 
                                rows="8" 
                                placeholder="Detail the role, responsibilities, and impact..." 
                                value={job.description} 
                                onChange={e => setJob({ ...job, description: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="form-section-title">
                            <CheckCircle size={18} />
                            <span>Target Capabilities</span>
                        </div>

                        <div className="skill-section">
                            <div className="skill-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="Add required expertise..." 
                                    value={skillInput} 
                                    onChange={e => setSkillInput(e.target.value)} 
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (skillInput.trim()) {
                                                setJob({ ...job, skills: [...new Set([...job.skills, skillInput.trim()])] });
                                                setSkillInput('');
                                            }
                                        }
                                    }}
                                />
                                <button 
                                    type="button" 
                                    className="add-skill-btn"
                                    onClick={() => {
                                        if (skillInput.trim()) {
                                            setJob({ ...job, skills: [...new Set([...job.skills, skillInput.trim()])] });
                                            setSkillInput('');
                                        }
                                    }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            <div className="skill-chips-cloud">
                                {job.skills.map((s, idx) => (
                                    <div key={idx} className="modern-chip">
                                        <span>{s}</span>
                                        <button type="button" onClick={() => setJob({ ...job, skills: job.skills.filter((_, i) => i !== idx) })}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {job.skills.length === 0 && <p className="empty-hint">No skills defined yet.</p>}
                            </div>
                        </div>

                        <div className="form-footer-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/hr-dashboard')}>Discard</button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Deploy Job Listing'}
                                <Save size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="post-preview-sidebar desktop-only">
                    <div className="preview-card glass">
                        <div className="preview-header">
                            <div className="company-logo-placeholder">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h4>{job.company}</h4>
                                <p><Globe size={12} /> Live Preview</p>
                            </div>
                        </div>
                        <div className="preview-content">
                            <h3>{job.title || 'Job Title Title'}</h3>
                            <div className="preview-meta">
                                <span><MapPin size={12} /> {job.location || 'Location TBD'}</span>
                                <span><DollarSign size={12} /> {job.salary || 'Competitive'}</span>
                            </div>
                            <div className="preview-desc">
                                {job.description ? job.description.substring(0, 150) + '...' : 'Your description will appear here as a snippet...'}
                            </div>
                            <div className="preview-skills">
                                {job.skills.slice(0, 3).map((s, i) => (
                                    <span key={i} className="mini-chip">{s}</span>
                                ))}
                                {job.skills.length > 3 && <span className="more-count">+{job.skills.length - 3} more</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .post-job-page { max-width: 1200px; margin: 0 auto; padding-bottom: 5rem; }
                .post-job-header { text-align: center; margin-bottom: 3.5rem; }
                .header-badge { display: inline-block; padding: 0.4rem 1rem; background: var(--primary); color: white; border-radius: 2rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); }
                .post-job-header h1 { font-size: 2.5rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.5rem; }
                .post-job-header p { color: var(--text-muted); font-size: 1.1rem; }

                .post-job-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; align-items: start; }
                .post-form-section { padding: 3rem; border-radius: var(--radius-xl); border: 1px solid var(--border); box-shadow: var(--shadow-xl); }
                
                .form-section-title { display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 2rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--border); }
                .form-section-title:not(:first-child) { margin-top: 3rem; }

                .input-group { margin-bottom: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .input-group label { font-size: 0.9rem; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; }
                .dual-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                
                .label-with-action { display: flex; justify-content: space-between; align-items: center; }
                .ai-assist-btn { font-size: 0.75rem; font-weight: 700; color: var(--primary); background: rgba(79, 70, 229, 0.08); padding: 0.4rem 0.8rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; }
                .ai-assist-btn:hover { background: var(--primary); color: white; transform: translateY(-1px); }

                input, textarea { width: 100%; padding: 1rem 1.25rem; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-main); font-family: inherit; transition: all 0.2s; font-size: 0.95rem; }
                input:focus, textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); background: white; }

                .skill-input-wrapper { display: flex; gap: 0.75rem; }
                .add-skill-btn { background: var(--bg-dark); color: white; width: 50px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .add-skill-btn:hover { transform: scale(1.05); background: black; }

                .skill-chips-cloud { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; min-height: 40px; }
                .modern-chip { background: white; border: 1px solid var(--border); padding: 0.5rem 0.75rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; font-weight: 600; box-shadow: var(--shadow-sm); animation: slideIn 0.3s ease-out; }
                .modern-chip button { color: var(--text-muted); padding: 2px; }
                .modern-chip button:hover { color: var(--danger); }
                .empty-hint { font-size: 0.85rem; color: var(--text-muted); font-style: italic; }

                .form-footer-actions { margin-top: 3.5rem; display: flex; justify-content: flex-end; gap: 1.5rem; }
                .btn-cancel { padding: 1rem 2rem; color: var(--text-muted); font-weight: 700; transition: all 0.2s; }
                .btn-cancel:hover { color: var(--text-main); }
                .btn-submit { background: var(--primary); color: white; padding: 1rem 2.5rem; border-radius: var(--radius-lg); font-weight: 800; display: flex; align-items: center; gap: 0.75rem; border: none; cursor: pointer; transition: all 0.3s; }
                .btn-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                .post-preview-sidebar { position: sticky; top: 120px; }
                .preview-card { padding: 2rem; border-radius: var(--radius-xl); border: 1px dotted var(--primary); background: linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(79, 70, 229, 0.05)); }
                .preview-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .company-logo-placeholder { width: 48px; height: 48px; background: var(--bg-dark); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .preview-header h4 { font-size: 1.1rem; font-weight: 800; }
                .preview-header p { font-size: 0.75rem; color: var(--primary); font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }
                
                .preview-content h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; }
                .preview-meta { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
                .preview-meta span { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
                .preview-desc { font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1.5rem; }
                .preview-skills { display: flex; gap: 0.5rem; align-items: center; }
                .mini-chip { font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.6rem; background: var(--bg-dark); color: white; border-radius: 4px; }
                .more-count { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

                @media (max-width: 992px) {
                    .post-job-grid { grid-template-columns: 1fr; }
                    .desktop-only { display: none; }
                }

                @media (max-width: 600px) {
                    .post-form-section { padding: 1.5rem; }
                    .dual-inputs { grid-template-columns: 1fr; }
                    .post-job-header h1 { font-size: 2rem; }
                    .form-footer-actions { flex-direction: column-reverse; }
                    .btn-submit { width: 100%; justify-content: center; }
                    .btn-cancel { width: 100%; text-align: center; }
                }
            `}</style>
        </div>
    );
};

const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
