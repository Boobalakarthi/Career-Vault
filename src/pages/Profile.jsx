import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import {
    User, Mail, Phone, MapPin, Globe, Linkedin, Github,
    Book, Briefcase, Code, Award, CheckCircle, Plus, Trash2, Save, FileText
} from 'lucide-react';
import { ResumeUpload } from '../components/ResumeUpload';
import { ATSResumeGenerator } from '../components/ATSResumeGenerator';
import { AssetLocker } from '../components/AssetLocker';
import { RewardsPanel } from '../components/RewardsPanel';

export const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');

    // Real-time profile from Dexie liveQuery
    const profile = useLiveQuery(
        () => user ? db.profiles.where({ userId: user.id }).first() : null,
        [user?.id]
    );

    // Auto-create profile if doesn't exist
    useEffect(() => {
        if (profile === null && user) {
            db.profiles.add({
                userId: user.id,
                email: user.email,
                personal: { name: user.name || '', phone: '', location: '', linkedin: '', portfolio: '', bio: '' },
                education: [],
                experience: [],
                skills: [],
                projects: [],
                certifications: []
            });
        }
    }, [profile, user]);

    const saveProfile = async (updatedProfile) => {
        await db.profiles.update(profile.id, updatedProfile);
        // liveQuery auto-updates — no manual setState needed
    };

    if (profile === undefined) return <div className="loading">Loading Profile...</div>;
    if (!profile) return <div className="loading">Setting up Profile...</div>;

    const calculateSecurityScore = () => {
        let filled = 0;
        if (profile.personal.name && profile.personal.phone) filled++;
        if (profile.education.length > 0) filled++;
        if (profile.experience.length > 0) filled++;
        if (profile.skills.length > 2) filled++;
        if (profile.projects.length > 0) filled++;
        if (profile.certifications.length > 0) filled++;
        return Math.round((filled / 6) * 100);
    };

    const securityScore = calculateSecurityScore();

    return (
        <div className="profile-container animate-fade-in">
            <div className="profile-header glass">
                <div className="profile-info">
                    <div className="avatar-placeholder">
                        {profile.personal.name ? profile.personal.name[0] : 'U'}
                    </div>
                    <div>
                        <h1>{profile.personal.name || 'Set your name'}</h1>
                        <p className="text-muted">{user.email}</p>
                    </div>
                </div>
                <div className="completeness-panel">
                    <div className="completeness-bar">
                        <div className="fill" style={{ width: `${securityScore}%` }}></div>
                    </div>
                    <span className="completeness-text">{securityScore}% Vault Security Score</span>
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
                        <Code size={18} /> Skills Matrix
                    </button>
                    <button className={`tab-btn ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>
                        <Award size={18} /> Certifications
                    </button>
                </aside>

                <section className="profile-main glass">
                    {activeTab === 'personal' && (
                        <>
                            <ResumeUpload profile={profile} onParsed={saveProfile} />
                            <PersonalSection profile={profile} onSave={saveProfile} />
                        </>
                    )}
                    {activeTab === 'education' && <ListSection type="education" profile={profile} onSave={saveProfile} />}
                    {activeTab === 'experience' && <ListSection type="experience" profile={profile} onSave={saveProfile} />}
                    {activeTab === 'skills' && <SkillsSection profile={profile} onSave={saveProfile} />}
                    {activeTab === 'certs' && (
                        <>
                            <ListSection type="certifications" profile={profile} onSave={saveProfile} />
                            <AssetLocker userId={user.id} />
                        </>
                    )}
                    <ATSResumeGenerator profile={profile} />
                    <RewardsPanel profile={profile} />
                </section>
            </div>

            <style>{`
        .profile-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .profile-header { padding: 2rem; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }
        .profile-info { display: flex; align-items: center; gap: 1.5rem; }
        .avatar-placeholder { width: 80px; height: 80px; background: linear-gradient(var(--secondary), var(--primary)); color: white; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; flex-shrink: 0; }
        .completeness-panel { width: 240px; min-width: 180px; }
        .completeness-bar { height: 8px; background: var(--border); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 0.5rem; }
        .completeness-bar .fill { height: 100%; background: var(--success); transition: width 0.5s ease; }
        .completeness-text { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        .profile-content { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; }
        .profile-sidebar { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border); height: fit-content; }
        .tab-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); color: var(--text-muted); font-weight: 500; text-align: left; }
        .tab-btn:hover { background: var(--bg-main); color: var(--text-main); }
        .tab-btn.active { background: var(--primary); color: white; }
        .profile-main { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 0.75rem; }
        .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .full-width { grid-column: span 2; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; }
        .save-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
        .add-btn { background: var(--bg-main); border: 1px dashed var(--border); padding: 0.8rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: var(--primary); font-weight: 600; }
        .entry-card { border: 1px solid var(--border); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; position: relative; }
        .delete-btn { position: absolute; top: 1rem; right: 1rem; color: var(--danger); }

        @media (max-width: 768px) {
          .profile-content { grid-template-columns: 1fr; }
          .profile-sidebar { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
          .profile-sidebar::-webkit-scrollbar { display: none; }
          .tab-btn { white-space: nowrap; padding: 0.6rem 0.9rem; font-size: 0.85rem; }
          .grid-form { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .profile-main { padding: 1.25rem; }
          .profile-header { padding: 1.25rem; }
          .avatar-placeholder { width: 56px; height: 56px; font-size: 1.5rem; }
        }
      `}</style>
        </div>
    );
};

const PersonalSection = ({ profile, onSave }) => {
    const [data, setData] = useState(profile.personal);
    useEffect(() => { setData(profile.personal); }, [profile.personal]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...profile, personal: data });
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <div className="section-header">
                <h2>Personal Details</h2>
                <button type="submit" className="save-btn"><Save size={18} /> Save</button>
            </div>
            <div className="grid-form">
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={data.phone || ''} onChange={e => setData({ ...data, phone: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input type="text" value={data.location || ''} onChange={e => setData({ ...data, location: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>LinkedIn</label>
                    <input type="text" value={data.linkedin || ''} onChange={e => setData({ ...data, linkedin: e.target.value })} />
                </div>
                <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea rows="4" value={data.bio || ''} onChange={e => setData({ ...data, bio: e.target.value })}></textarea>
                </div>
            </div>
        </form>
    );
};

const ListSection = ({ type, profile, onSave }) => {
    const items = profile[type] || [];

    const addItem = () => {
        const newItem = type === 'education'
            ? { institute: '', degree: '', endYear: '' }
            : type === 'experience' ? { company: '', role: '', description: '' }
                : { name: '', issuer: '', date: '' };
        onSave({ ...profile, [type]: [...items, newItem] });
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onSave({ ...profile, [type]: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        onSave({ ...profile, [type]: newItems });
    };

    return (
        <div>
            <div className="section-header">
                <h2 style={{ textTransform: 'capitalize' }}>{type}</h2>
                <button className="add-btn" onClick={addItem}><Plus size={18} /> Add New</button>
            </div>
            {items.map((item, idx) => (
                <div key={idx} className="entry-card animate-fade-in">
                    <button className="delete-btn" onClick={() => removeItem(idx)}><Trash2 size={16} /></button>
                    <div className="grid-form">
                        {Object.keys(item).map(key => (
                            <div key={key} className={`form-group ${key === 'description' ? 'full-width' : ''}`}>
                                <label style={{ textTransform: 'capitalize' }}>{key}</label>
                                {key === 'description' ?
                                    <textarea rows="3" value={item[key]} onChange={e => updateItem(idx, key, e.target.value)}></textarea> :
                                    <input type="text" value={item[key]} onChange={e => updateItem(idx, key, e.target.value)} />
                                }
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const SkillsSection = ({ profile, onSave }) => {
    const [skill, setSkill] = useState({ name: '', proficiency: 'Intermediate' });

    const addSkill = () => {
        if (!skill.name) return;
        onSave({ ...profile, skills: [...(profile.skills || []), skill] });
        setSkill({ name: '', proficiency: 'Intermediate' });
    };

    const removeSkill = (idx) => {
        onSave({ ...profile, skills: profile.skills.filter((_, i) => i !== idx) });
    };

    return (
        <div>
            <div className="section-header"><h2>Skills Matrix</h2></div>
            <div className="skills-input-row" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <input style={{ flex: 2, minWidth: '150px' }} type="text" placeholder="Skill (e.g. React)" value={skill.name} onChange={e => setSkill({ ...skill, name: e.target.value })} />
                <select style={{ flex: 1, minWidth: '120px' }} value={skill.proficiency} onChange={e => setSkill({ ...skill, proficiency: e.target.value })}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                </select>
                <button className="save-btn" onClick={addSkill}><Plus size={18} /> Add</button>
            </div>
            <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {profile.skills?.map((s, idx) => (
                    <div key={idx} className="skill-tag glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', position: 'relative' }}>
                        <button style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--danger)', fontSize: '0.7rem' }} onClick={() => removeSkill(idx)}><Trash2 size={12} /></button>
                        <div style={{ fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{s.proficiency}</div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', background: 'var(--primary)',
                                width: s.proficiency === 'Expert' ? '100%' : s.proficiency === 'Advanced' ? '75%' : s.proficiency === 'Intermediate' ? '50%' : '25%'
                            }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
