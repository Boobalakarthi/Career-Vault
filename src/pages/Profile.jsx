import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import {
    User, Mail, Phone, MapPin, Globe, Linkedin, Github,
    Book, Briefcase, Code, Award, CheckCircle, Plus, Trash2, Save, FileText, AlertCircle, Calendar, GraduationCap
} from 'lucide-react';
import { ResumeUpload } from '../components/ResumeUpload';
import { ATSResumeGenerator } from '../components/ATSResumeGenerator';
import { AIRecommendations } from '../components/AIRecommendations';

export const Profile = () => {
    const { user } = useAuth();
    const { profile, loading, error, saveProfile } = useProfile();
    const [activeTab, setActiveTab] = useState('personal');

    if (loading) return (
        <div className="profile-loading">
            <div className="pulse-loader"></div>
            <p>Syncing Profile Vault...</p>
        </div>
    );

    if (error) return (
        <div className="profile-error">
            <AlertCircle size={48} color="var(--danger)" />
            <h2>Sync Failed</h2>
            <p>{error}</p>
        </div>
    );

    if (!profile && !loading) {
        const { logout } = useAuth();
        return (
            <div className="profile-error glass animate-fade-in" style={{ padding: '4rem', textAlign: 'center' }}>
                <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                <h2>Vault Synchronize Failed</h2>
                <p className="text-muted">We couldn't retrieve your profile data. This might happen if your session has expired or your account was reset.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="save-btn" style={{ margin: 0 }} onClick={() => window.location.reload()}>Retry Synchronization</button>
                    <button className="save-btn" style={{ margin: 0, background: 'var(--danger)' }} onClick={() => { logout(); window.location.href = '/login'; }}>Sign Out & Reset Session</button>
                </div>
            </div>
        );
    }
    if (!profile) return null;

    const calculateCompletionScore = () => {
        let filled = 0;
        let total = 6;
        if (profile.name) filled++;
        if (profile.personal?.phone) filled++;
        if (profile.education && profile.education.length > 0) filled++;
        if (profile.experience && profile.experience.length > 0) filled++;
        if (profile.skills && profile.skills.length > 2) filled++;
        if (profile.certifications && profile.certifications.length > 0) filled++;
        return Math.round((filled / total) * 100);
    };

    const completionScore = calculateCompletionScore();

    return (
        <div className="profile-container animate-fade-in">
            <div className="profile-header glass">
                <div className="profile-info">
                    <div className="avatar-placeholder">
                        {profile.name ? profile.name[0] : 'U'}
                    </div>
                    <div>
                        <h1>{profile.name || 'Set your name'}</h1>
                        <p className="text-muted">{profile.email || user?.email}</p>
                    </div>
                </div>
                <div className="completeness-panel">
                    <div className="completeness-bar">
                        <div className="fill" style={{ width: `${completionScore}%` }}></div>
                    </div>
                    <span className="completeness-text">{completionScore}% Profile Completion</span>
                </div>
            </div>

            <div className="profile-content">
                <aside className="profile-sidebar glass">
                    <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                        <User size={18} /> Personal
                    </button>
                    <button className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
                        <Book size={18} /> Education
                    </button>
                    <button className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`} onClick={() => setActiveTab('experience')}>
                        <Briefcase size={18} /> Experience
                    </button>
                    <button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
                        <Code size={18} /> Skills
                    </button>
                    <button className={`tab-btn ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>
                        <Award size={18} /> Certifications
                    </button>
                    <button className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>
                        <FileText size={18} /> Resume
                    </button>
                </aside>

                <section className="profile-main glass">
                    {activeTab === 'personal' && (
                        <>
                            <ResumeUpload profile={profile} onParsed={saveProfile} />
                            <PersonalSection profile={profile} onSave={saveProfile} />
                        </>
                    )}
                    {activeTab === 'education' && <EducationSection profile={profile} onSave={saveProfile} />}
                    {activeTab === 'experience' && <ExperienceSection profile={profile} onSave={saveProfile} />}
                    {activeTab === 'skills' && <SkillsOverhaulSection profile={profile} onSave={saveProfile} />}
                    {activeTab === 'certs' && <CertificationsSection profile={profile} onSave={saveProfile} />}
                    {activeTab === 'resume' && (
                        <div className="resume-tab-content">
                            <div className="section-header">
                                <h2>Resume Generation</h2>
                                <p>Generate your ATS-friendly resume based on your profile data.</p>
                            </div>
                            <ATSResumeGenerator profile={profile} />
                            <AIRecommendations profile={profile} />
                        </div>
                    )}
                </section>
            </div>

            <style>{`
                .profile-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .profile-header { padding: 2rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); }
                .profile-info { display: flex; align-items: center; gap: 1.5rem; }
                .avatar-placeholder { width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; }
                .completeness-panel { width: 240px; }
                .completeness-bar { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem; }
                .fill { height: 100%; background: var(--success); transition: width 0.5s; }
                .completeness-text { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
                
                .profile-content { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; }
                .profile-sidebar { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border); height: fit-content; }
                .tab-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); color: var(--text-muted); font-weight: 600; transition: var(--transition); }
                .tab-btn:hover { background: var(--bg-main); color: var(--text-main); }
                .tab-btn.active { background: var(--primary); color: white; }
                
                .profile-main { padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
                .section-header { margin-bottom: 2rem; }
                .section-header h2 { margin-bottom: 0.5rem; }
                .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .full-width { grid-column: span 2; }
                .form-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-main); font-family: inherit; }
                
                .entry-card { padding: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-md); position: relative; margin-bottom: 1.5rem; background: rgba(255,255,255,0.3); }
                .entry-card:hover { border-color: var(--primary); }
                .delete-btn { position: absolute; top: 1rem; right: 1rem; color: var(--danger); background: none; }
                .add-btn { width: 100%; padding: 1rem; border: 2px dashed var(--border); border-radius: var(--radius-md); color: var(--primary); font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
                .add-btn:hover { border-color: var(--primary); background: rgba(79, 70, 229, 0.05); }
                .save-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-top: 2rem; }
                
                .skills-categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .skill-type-section { background: var(--bg-main); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); }
                .skill-tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
                .skill-tag { background: white; border: 1px solid var(--border); padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
                .skill-tag .remove { cursor: pointer; color: var(--danger); font-size: 1rem; }
                
                .profile-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 1rem; }
                .pulse-loader { width: 40px; height: 40px; background: var(--primary); border-radius: 50%; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.5; } }

                @media (max-width: 768px) {
                    .profile-content { grid-template-columns: 1fr; }
                    .profile-header { flex-direction: column; text-align: center; }
                    .profile-info { flex-direction: column; }
                    .completeness-panel { width: 100%; margin-top: 1rem; }
                    .grid-form { grid-template-columns: 1fr; }
                    .full-width { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
};

const PersonalSection = ({ profile, onSave }) => {
    const [data, setData] = useState({ 
        name: profile.name, 
        email: profile.email, 
        ...profile.personal 
    });
    useEffect(() => { 
        setData({ 
            name: profile.name, 
            email: profile.email, 
            ...profile.personal 
        }); 
    }, [profile]);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="section-header">
                <h2>Personal Details</h2>
            </div>
            <div className="grid-form">
                <div className="form-group">
                    <label><User size={16} /> Full Name</label>
                    <input type="text" value={data.name || ''} onChange={e => setData({...data, name: e.target.value})} />
                </div>
                <div className="form-group">
                    <label><Mail size={16} /> Email Address</label>
                    <input type="email" value={data.email || ''} onChange={e => setData({...data, email: e.target.value})} />
                </div>
                <div className="form-group">
                    <label><Phone size={16} /> Phone Number</label>
                    <input type="text" value={data.phone || ''} onChange={e => setData({...data, phone: e.target.value})} />
                </div>
                <div className="form-group">
                    <label><MapPin size={16} /> Address / Location</label>
                    <input type="text" value={data.address || ''} onChange={e => setData({...data, address: e.target.value})} />
                </div>
                <div className="form-group">
                    <label><Linkedin size={16} /> LinkedIn URL</label>
                    <input type="text" value={data.linkedin || ''} onChange={e => setData({...data, linkedin: e.target.value})} />
                </div>
                <div className="form-group">
                    <label><Globe size={16} /> Portfolio Website</label>
                    <input type="text" value={data.portfolio || ''} onChange={e => setData({...data, portfolio: e.target.value})} />
                </div>
                <div className="form-group full-width">
                    <label>Professional Bio</label>
                    <textarea rows="4" value={data.bio || ''} onChange={e => setData({...data, bio: e.target.value})} placeholder="Briefly describe your career goals and expertise..."></textarea>
                </div>
            </div>
            <button className="save-btn" onClick={() => {
                const { name, email, ...personal } = data;
                onSave({ ...profile, name, personal });
            }}><Save size={18} /> Save Changes</button>
        </div>
    );
};

const EducationSection = ({ profile, onSave }) => {
    const [entries, setEntries] = useState(profile.education || []);
    useEffect(() => { setEntries(profile.education || []); }, [profile.education]);

    const addEntry = () => {
        setEntries([...entries, { degree: 'Undergraduate', school: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' }]);
    };

    const removeEntry = (idx) => {
        const newEntries = entries.filter((_, i) => i !== idx);
        setEntries(newEntries);
        onSave({...profile, education: newEntries});
    };

    const updateEntry = (idx, field, val) => {
        const newEntries = [...entries];
        newEntries[idx][field] = val;
        setEntries(newEntries);
    };

    return (
        <div>
            <div className="section-header">
                <h2>Education</h2>
                <p>Add your academic qualifications starting from schooling.</p>
            </div>
            {entries.map((edu, idx) => (
                <div key={idx} className="entry-card animate-fade-in">
                    <button className="delete-btn" onClick={() => removeEntry(idx)}><Trash2 size={18} /></button>
                    <div className="grid-form">
                        <div className="form-group">
                            <label><GraduationCap size={16} /> Qualification</label>
                            <select value={edu.degree} onChange={e => updateEntry(idx, 'degree', e.target.value)}>
                                <option>10th Standard</option>
                                <option>12th Standard</option>
                                <option>Diploma</option>
                                <option>Undergraduate</option>
                                <option>Postgraduate</option>
                                <option>PhD</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Institution Name</label>
                            <input type="text" value={edu.school} onChange={e => updateEntry(idx, 'school', e.target.value)} placeholder="e.g. Stanford University" />
                        </div>
                        <div className="form-group">
                            <label>Field of Study</label>
                            <input type="text" value={edu.fieldOfStudy} onChange={e => updateEntry(idx, 'fieldOfStudy', e.target.value)} placeholder="e.g. Computer Science" />
                        </div>
                        <div className="form-group">
                            <label>Percentage / CGPA</label>
                            <input type="text" value={edu.grade} onChange={e => updateEntry(idx, 'grade', e.target.value)} placeholder="e.g. 9.5 CGPA or 85%" />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={16} /> Start Year</label>
                            <input type="text" value={edu.startYear} onChange={e => updateEntry(idx, 'startYear', e.target.value)} placeholder="e.g. 2018" />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={16} /> End Year</label>
                            <input type="text" value={edu.endYear} onChange={e => updateEntry(idx, 'endYear', e.target.value)} placeholder="e.g. 2022" />
                        </div>
                    </div>
                </div>
            ))}
            <button className="add-btn" onClick={addEntry}><Plus size={18} /> Add Qualification</button>
            <button className="save-btn" onClick={() => onSave({...profile, education: entries})}><Save size={18} /> Save Education</button>
        </div>
    );
};

const ExperienceSection = ({ profile, onSave }) => {
    const [entries, setEntries] = useState(profile.experience || []);
    useEffect(() => { setEntries(profile.experience || []); }, [profile.experience]);

    const addEntry = () => {
        setEntries([...entries, { company: '', position: '', startDate: '', endDate: '', description: '' }]);
    };

    const removeEntry = (idx) => {
        const newEntries = entries.filter((_, i) => i !== idx);
        setEntries(newEntries);
        onSave({...profile, experience: newEntries});
    };

    const updateEntry = (idx, field, val) => {
        const newEntries = [...entries];
        newEntries[idx][field] = val;
        setEntries(newEntries);
    };

    return (
        <div>
            <div className="section-header">
                <h2>Work Experience</h2>
                <p>Detail your career journey and achievements.</p>
            </div>
            {entries.map((exp, idx) => (
                <div key={idx} className="entry-card animate-fade-in">
                    <button className="delete-btn" onClick={() => removeEntry(idx)}><Trash2 size={18} /></button>
                    <div className="grid-form">
                        <div className="form-group">
                            <label><Briefcase size={16} /> Company Name</label>
                            <input type="text" value={exp.company} onChange={e => updateEntry(idx, 'company', e.target.value)} placeholder="e.g. Google" />
                        </div>
                        <div className="form-group">
                            <label>Position</label>
                            <input type="text" value={exp.position} onChange={e => updateEntry(idx, 'position', e.target.value)} placeholder="e.g. Senior Developer" />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={16} /> Start Date</label>
                            <input type="text" value={exp.startDate} onChange={e => updateEntry(idx, 'startDate', e.target.value)} placeholder="Month Year" />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={16} /> End Date</label>
                            <input type="text" value={exp.endDate} onChange={e => updateEntry(idx, 'endDate', e.target.value)} placeholder="Month Year or 'Present'" />
                        </div>
                        <div className="form-group full-width">
                            <label>Responsibilities & Achievements</label>
                            <textarea rows="4" value={exp.description} onChange={e => updateEntry(idx, 'description', e.target.value)} placeholder="Describe what you did... Use bullet points for impact."></textarea>
                        </div>
                    </div>
                </div>
            ))}
            <button className="add-btn" onClick={addEntry}><Plus size={18} /> Add Experience</button>
            <button className="save-btn" onClick={() => onSave({...profile, experience: entries})}><Save size={18} /> Save Experience</button>
        </div>
    );
};

const SkillsOverhaulSection = ({ profile, onSave }) => {
    const [skills, setSkills] = useState(profile.skills || []);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', level: 'Intermediate' });

    const addSkill = () => {
        if (!newSkill.name) return;
        const updated = [...skills, newSkill];
        setSkills(updated);
        onSave({...profile, skills: updated});
        setNewSkill({ name: '', category: 'Technical', level: 'Intermediate' });
    };

    const removeSkill = (idx) => {
        const updated = skills.filter((_, i) => i !== idx);
        setSkills(updated);
        onSave({...profile, skills: updated});
    };

    const categories = ['Technical', 'Soft Skills', 'Tools', 'Frameworks'];

    return (
        <div>
            <div className="section-header">
                <h2>Skills Matrix</h2>
                <p>Categorize your expertise to stand out to recruiters.</p>
            </div>
            
            <div className="entry-card" style={{ background: 'var(--bg-main)' }}>
                <div className="grid-form">
                    <div className="form-group">
                        <label>Skill Name</label>
                        <input type="text" placeholder="e.g. React" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Proficiency</label>
                        <select value={newSkill.level} onChange={e => setNewSkill({...newSkill, level: e.target.value})}>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Expert</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="submit-btn" onClick={addSkill} style={{ height: '45px', margin: 0 }}><Plus size={18} /> Add Skill</button>
                    </div>
                </div>
            </div>

            <div className="skills-categories" style={{ marginTop: '2rem' }}>
                {categories.map(cat => (
                    <div key={cat} className="skill-type-section">
                        <h3>{cat}</h3>
                        <div className="skill-tag-row">
                            {skills.filter(s => s.category === cat || (!s.category && cat === 'Technical')).map((s, idx) => (
                                <div key={idx} className="skill-tag">
                                    <span>{s.name} <small style={{ opacity: 0.6 }}>({s.level})</small></span>
                                    <span className="remove" onClick={() => removeSkill(skills.indexOf(s))}>&times;</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CertificationsSection = ({ profile, onSave }) => {
    const [entries, setEntries] = useState(profile.certifications || []);
    useEffect(() => { setEntries(profile.certifications || []); }, [profile.certifications]);

    const addEntry = () => {
        setEntries([...entries, { name: '', organization: '', date: '', link: '' }]);
    };

    const removeEntry = (idx) => {
        const newEntries = entries.filter((_, i) => i !== idx);
        setEntries(newEntries);
        onSave({...profile, certifications: newEntries});
    };

    const updateEntry = (idx, field, val) => {
        const newEntries = [...entries];
        newEntries[idx][field] = val;
        setEntries(newEntries);
    };

    return (
        <div>
            <div className="section-header">
                <h2>Certifications</h2>
                <p>Showcase your verified credentials.</p>
            </div>
            {entries.map((cert, idx) => (
                <div key={idx} className="entry-card animate-fade-in">
                    <button className="delete-btn" onClick={() => removeEntry(idx)}><Trash2 size={18} /></button>
                    <div className="grid-form">
                        <div className="form-group">
                            <label><Award size={16} /> Certificate Name</label>
                            <input type="text" value={cert.name} onChange={e => updateEntry(idx, 'name', e.target.value)} placeholder="e.g. AWS Solutions Architect" />
                        </div>
                        <div className="form-group">
                            <label>Issuing Organization</label>
                            <input type="text" value={cert.organization} onChange={e => updateEntry(idx, 'organization', e.target.value)} placeholder="e.g. Amazon Web Services" />
                        </div>
                        <div className="form-group">
                            <label><Calendar size={16} /> Issue Date</label>
                            <input type="text" value={cert.date} onChange={e => updateEntry(idx, 'date', e.target.value)} placeholder="e.g. March 2024" />
                        </div>
                        <div className="form-group">
                            <label><Globe size={16} /> Credential Link</label>
                            <input type="text" value={cert.link} onChange={e => updateEntry(idx, 'link', e.target.value)} placeholder="Verification URL" />
                        </div>
                    </div>
                </div>
            ))}
            <button className="add-btn" onClick={addEntry}><Plus size={18} /> Add Certification</button>
            <button className="save-btn" onClick={() => onSave({...profile, certifications: entries})}><Save size={18} /> Save Certifications</button>
        </div>
    );
};

