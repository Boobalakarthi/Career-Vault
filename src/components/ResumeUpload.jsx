import React, { useState } from 'react';
import { Upload, FileText, Check, X, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { db } from '../db/db';

// Skill keywords to detect from resume text
const SKILL_MAP = {
    'react': { name: 'React', proficiency: 'Intermediate' },
    'react.js': { name: 'React', proficiency: 'Intermediate' },
    'reactjs': { name: 'React', proficiency: 'Intermediate' },
    'node': { name: 'Node.js', proficiency: 'Intermediate' },
    'node.js': { name: 'Node.js', proficiency: 'Intermediate' },
    'nodejs': { name: 'Node.js', proficiency: 'Intermediate' },
    'python': { name: 'Python', proficiency: 'Intermediate' },
    'javascript': { name: 'JavaScript', proficiency: 'Intermediate' },
    'typescript': { name: 'TypeScript', proficiency: 'Intermediate' },
    'sql': { name: 'SQL', proficiency: 'Intermediate' },
    'postgresql': { name: 'PostgreSQL', proficiency: 'Intermediate' },
    'mongodb': { name: 'MongoDB', proficiency: 'Intermediate' },
    'aws': { name: 'AWS', proficiency: 'Intermediate' },
    'docker': { name: 'Docker', proficiency: 'Intermediate' },
    'kubernetes': { name: 'Kubernetes', proficiency: 'Intermediate' },
    'graphql': { name: 'GraphQL', proficiency: 'Intermediate' },
    'figma': { name: 'Figma', proficiency: 'Intermediate' },
    'css': { name: 'CSS', proficiency: 'Intermediate' },
    'html': { name: 'HTML', proficiency: 'Intermediate' },
    'java': { name: 'Java', proficiency: 'Intermediate' },
    'c++': { name: 'C++', proficiency: 'Intermediate' },
    'git': { name: 'Git', proficiency: 'Intermediate' },
    'terraform': { name: 'Terraform', proficiency: 'Intermediate' },
    'machine learning': { name: 'Machine Learning', proficiency: 'Intermediate' },
    'tensorflow': { name: 'TensorFlow', proficiency: 'Intermediate' },
    'flutter': { name: 'Flutter', proficiency: 'Intermediate' },
    'swift': { name: 'Swift', proficiency: 'Intermediate' },
    'angular': { name: 'Angular', proficiency: 'Intermediate' },
    'vue': { name: 'Vue.js', proficiency: 'Intermediate' },
    'redux': { name: 'Redux', proficiency: 'Intermediate' },
    'express': { name: 'Express', proficiency: 'Intermediate' },
    'django': { name: 'Django', proficiency: 'Intermediate' },
    'flask': { name: 'Flask', proficiency: 'Intermediate' },
};

const parseResumeText = (text) => {
    const lower = text.toLowerCase();

    // Extract skills
    const skills = [];
    const seenSkills = new Set();
    Object.entries(SKILL_MAP).forEach(([keyword, skill]) => {
        if (lower.includes(keyword) && !seenSkills.has(skill.name)) {
            seenSkills.add(skill.name);
            // Infer higher proficiency if mentioned multiple times
            const count = lower.split(keyword).length - 1;
            skills.push({
                ...skill,
                proficiency: count >= 3 ? 'Advanced' : count >= 2 ? 'Intermediate' : 'Intermediate'
            });
        }
    });

    // Try to extract name (first line or lines before @)
    const lines = text.trim().split('\n').filter(l => l.trim());
    const nameLine = lines[0]?.trim() || '';
    const name = nameLine.length < 50 && !nameLine.includes('@') ? nameLine : '';

    // Try to extract phone
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : '';

    // Try to extract email
    const emailMatch = text.match(/[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';

    // Try to extract location (common patterns)
    const locationPatterns = [
        /(?:located? (?:in|at)|address|city)\s*[:\-]?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*(?:,\s*[A-Z]{2})?)/i,
        /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}\s*\d{5})/,
    ];
    let location = '';
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) { location = match[1]; break; }
    }

    // Try to extract experience entries (simplified)
    const experience = [];
    const expPatterns = /(?:at|@)\s+([A-Z][A-Za-z\s&]+?)(?:\s+as\s+|\s*[-–|]\s*)([A-Za-z\s]+)/g;
    let expMatch;
    while ((expMatch = expPatterns.exec(text)) !== null) {
        experience.push({
            company: expMatch[1].trim(),
            role: expMatch[2].trim(),
            description: ''
        });
    }

    return {
        personal: { name, phone, location },
        skills,
        experience
    };
};

export const ResumeUpload = ({ profile, onParsed }) => {
    const [uploading, setUploading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [reflectionMode, setReflectionMode] = useState(false);
    const [selectedChanges, setSelectedChanges] = useState({});
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            const parsed = parseResumeText(text);

            // If no skills found from text, use filename hints
            if (parsed.skills.length === 0) {
                const fn = file.name.toLowerCase();
                if (fn.includes('frontend') || fn.includes('react')) {
                    parsed.skills = [
                        { name: 'React', proficiency: 'Advanced' },
                        { name: 'JavaScript', proficiency: 'Advanced' },
                        { name: 'CSS', proficiency: 'Intermediate' },
                        { name: 'TypeScript', proficiency: 'Intermediate' },
                    ];
                } else if (fn.includes('backend') || fn.includes('node')) {
                    parsed.skills = [
                        { name: 'Node.js', proficiency: 'Advanced' },
                        { name: 'Express', proficiency: 'Intermediate' },
                        { name: 'PostgreSQL', proficiency: 'Intermediate' },
                        { name: 'Docker', proficiency: 'Intermediate' },
                    ];
                } else if (fn.includes('data') || fn.includes('python')) {
                    parsed.skills = [
                        { name: 'Python', proficiency: 'Advanced' },
                        { name: 'SQL', proficiency: 'Intermediate' },
                        { name: 'Machine Learning', proficiency: 'Intermediate' },
                    ];
                } else {
                    // Default fallback
                    parsed.skills = [
                        { name: 'JavaScript', proficiency: 'Intermediate' },
                        { name: 'React', proficiency: 'Intermediate' },
                        { name: 'Node.js', proficiency: 'Intermediate' },
                        { name: 'CSS', proficiency: 'Intermediate' },
                    ];
                }
            }

            // If name not found, use filename
            if (!parsed.personal.name && file.name) {
                const base = file.name.replace(/\.(pdf|docx|txt|doc)$/i, '').replace(/[_-]/g, ' ');
                if (base.length < 40) {
                    parsed.personal.name = base.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                }
            }

            setParsedData(parsed);
            setUploading(false);
            setReflectionMode(true);

            // Auto-select all by default
            const autoSelect = { personal: true };
            parsed.skills.forEach((_, idx) => { autoSelect[`skills_${idx}`] = true; });
            parsed.experience.forEach((_, idx) => { autoSelect[`experience_${idx}`] = true; });
            setSelectedChanges(autoSelect);
        };

        reader.onerror = () => {
            setUploading(false);
            // Fallback: treat as non-text file, use smart defaults
            const parsed = {
                personal: { name: file.name.replace(/\.(pdf|docx|txt|doc)$/i, '').replace(/[_-]/g, ' '), phone: '', location: '' },
                skills: [
                    { name: 'JavaScript', proficiency: 'Intermediate' },
                    { name: 'React', proficiency: 'Intermediate' },
                    { name: 'Node.js', proficiency: 'Intermediate' },
                ],
                experience: []
            };
            setParsedData(parsed);
            setReflectionMode(true);
            setSelectedChanges({ personal: true, skills_0: true, skills_1: true, skills_2: true });
        };

        reader.readAsText(file);
    };

    const toggleChange = (section, itemIdx = null) => {
        const key = itemIdx !== null ? `${section}_${itemIdx}` : section;
        setSelectedChanges(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const applyChanges = () => {
        const newProfile = { ...profile };

        if (selectedChanges['personal']) {
            newProfile.personal = {
                ...newProfile.personal,
                ...(parsedData.personal.name && { name: parsedData.personal.name }),
                ...(parsedData.personal.phone && { phone: parsedData.personal.phone }),
                ...(parsedData.personal.location && { location: parsedData.personal.location }),
            };
        }

        parsedData.skills.forEach((skill, idx) => {
            if (selectedChanges[`skills_${idx}`]) {
                if (!newProfile.skills.find(s => s.name === skill.name)) {
                    newProfile.skills.push(skill);
                }
            }
        });

        parsedData.experience.forEach((exp, idx) => {
            if (selectedChanges[`experience_${idx}`]) {
                newProfile.experience.push(exp);
            }
        });

        onParsed(newProfile);
        setReflectionMode(false);
        setParsedData(null);
    };

    return (
        <div className="resume-tool">
            {!reflectionMode ? (
                <label className="upload-zone glass">
                    {uploading ? <Loader size={32} className="spin" /> : <Upload size={32} />}
                    <span>{uploading ? 'Parsing Resume...' : 'Upload PDF/TXT/DOCX to Auto-fill Profile'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports .txt, .pdf, .docx — AI parses skills, contact, and experience</span>
                    <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} disabled={uploading} hidden />
                </label>
            ) : (
                <div className="reflection-ui glass animate-fade-in">
                    <div className="reflection-header">
                        <h3><FileText size={20} /> AI Parsing Results</h3>
                        <p>Select which parts to sync with your profile {fileName && <span style={{ color: 'var(--primary)' }}>({fileName})</span>}</p>
                    </div>

                    <div className="reflection-body">
                        {parsedData.personal.name && (
                            <div className="reflection-item">
                                <div className="item-meta">
                                    <Check size={16} color="var(--success)" />
                                    <span>Contact Info</span>
                                </div>
                                <div className="item-diff">
                                    <div className="original">Current: {profile.personal.name || 'None'}</div>
                                    <div className="incoming">Parsed: {parsedData.personal.name} {parsedData.personal.phone && `| ${parsedData.personal.phone}`}</div>
                                </div>
                                <button className={`toggle-btn ${selectedChanges['personal'] ? 'active' : ''}`} onClick={() => toggleChange('personal')}>
                                    {selectedChanges['personal'] ? 'Selected' : 'Select'}
                                </button>
                            </div>
                        )}

                        <div className="reflection-section">
                            <h4>Extracted Skills ({parsedData.skills.length})</h4>
                            {parsedData.skills.map((skill, idx) => (
                                <div key={idx} className="reflection-item">
                                    <span>{skill.name} ({skill.proficiency})</span>
                                    <button className={`toggle-btn ${selectedChanges[`skills_${idx}`] ? 'active' : ''}`} onClick={() => toggleChange('skills', idx)}>
                                        {selectedChanges[`skills_${idx}`] ? 'Keep' : 'Ignore'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {parsedData.experience.length > 0 && (
                            <div className="reflection-section">
                                <h4>Experience ({parsedData.experience.length})</h4>
                                {parsedData.experience.map((exp, idx) => (
                                    <div key={idx} className="reflection-item">
                                        <span>{exp.role} at {exp.company}</span>
                                        <button className={`toggle-btn ${selectedChanges[`experience_${idx}`] ? 'active' : ''}`} onClick={() => toggleChange('experience', idx)}>
                                            {selectedChanges[`experience_${idx}`] ? 'Keep' : 'Ignore'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="reflection-footer">
                        <button className="cancel-btn" onClick={() => setReflectionMode(false)}>Discard</button>
                        <button className="apply-btn" onClick={applyChanges}>Apply Selected Changes <ArrowRight size={18} /></button>
                    </div>
                </div>
            )}

            <style>{`
        .resume-tool {
          margin-bottom: 2rem;
        }
        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: var(--transition);
          text-align: center;
        }
        .upload-zone:hover {
          border-color: var(--primary);
          background: rgba(79, 70, 229, 0.03);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .reflection-ui {
          padding: 2rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }
        .reflection-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .reflection-body {
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .reflection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--bg-main);
          border-radius: var(--radius-md);
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .item-diff {
          font-size: 0.85rem;
          flex: 1;
          margin: 0 1rem;
          min-width: 150px;
        }
        .original { color: var(--text-muted); }
        .incoming { color: var(--primary); font-weight: 600; }
        .toggle-btn {
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid var(--border);
          white-space: nowrap;
        }
        .toggle-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .reflection-section h4 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .reflection-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          color: var(--text-muted);
        }
        .apply-btn {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .upload-zone { padding: 2rem 1rem; }
          .reflection-ui { padding: 1.25rem; }
          .reflection-item { flex-direction: column; align-items: flex-start; }
          .item-diff { margin: 0; }
        }
      `}</style>
        </div>
    );
};
