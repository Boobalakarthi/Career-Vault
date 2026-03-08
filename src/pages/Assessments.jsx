import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { ClipboardList, Play, Timer, Plus, Trash2 } from 'lucide-react';

export const Assessments = () => {
    const { user } = useAuth();
    const [activeTest, setActiveTest] = useState(null);

    // Real-time assessments
    const tests = useLiveQuery(() => db.assessments.toArray(), []);

    // HR/Admin can add assessments
    const [showAdd, setShowAdd] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', role: '', difficulty: 'Intermediate', questions: 20, duration: '45 min' });

    const addAssessment = async () => {
        if (!newTest.title) return;
        await db.assessments.add(newTest);
        setNewTest({ title: '', role: '', difficulty: 'Intermediate', questions: 20, duration: '45 min' });
        setShowAdd(false);
    };

    const deleteAssessment = async (id) => {
        if (!confirm('Delete this assessment?')) return;
        await db.assessments.delete(id);
    };

    if (!tests) return <div>Loading assessments...</div>;

    if (activeTest) {
        return (
            <div className="test-interface glass animate-fade-in">
                <div className="test-header">
                    <h2>{activeTest.title}</h2>
                    <div className="timer"><Timer size={18} /> 44:59 remaining</div>
                </div>
                <div className="test-body">
                    <div className="question-card">
                        <span className="q-count">Question 1 of {activeTest.questions}</span>
                        <p>What is the primary difference between useMemo and useCallback?</p>
                        <div className="options">
                            <label className="option"><input type="radio" name="q1" /> one returns a value, the other a function</label>
                            <label className="option"><input type="radio" name="q1" /> one is for classes, the other for hooks</label>
                        </div>
                    </div>
                </div>
                <div className="test-footer">
                    <button className="cancel-btn" onClick={() => setActiveTest(null)}>Exit Test</button>
                    <button className="save-btn" onClick={() => { alert('Assessment Submitted!'); setActiveTest(null); }}>Submit Assessment</button>
                </div>
                <style>{`
          .test-interface { padding: 2rem; max-width: 800px; margin: 0 auto; border-radius: var(--radius-lg); border: 1px solid var(--border); }
          .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
          .timer { color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
          .question-card { margin-bottom: 2rem; }
          .q-count { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
          .options { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
          .option { padding: 1rem; background: var(--bg-main); border-radius: var(--radius-md); border: 1px solid var(--border); cursor: pointer; }
          .test-footer { display: flex; justify-content: flex-end; gap: 1rem; flex-wrap: wrap; }
          .cancel-btn { padding: 0.75rem 1.5rem; color: var(--text-muted); }
          .save-btn { background: var(--primary); color: white; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="assessments-container animate-fade-in">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                    <h1>Skills Assessments</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Certify your skills and boost your match score by 20%</p>
                </div>
                {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                    <button onClick={() => setShowAdd(!showAdd)} style={{ background: 'var(--bg-dark)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Add Assessment
                    </button>
                )}
            </div>

            {showAdd && (
                <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>New Assessment</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <input type="text" placeholder="Assessment Title" value={newTest.title} onChange={e => setNewTest({ ...newTest, title: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} />
                        <input type="text" placeholder="Target Role" value={newTest.role} onChange={e => setNewTest({ ...newTest, role: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} />
                        <select value={newTest.difficulty} onChange={e => setNewTest({ ...newTest, difficulty: e.target.value })} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                        </select>
                        <button onClick={addAssessment} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>Create</button>
                    </div>
                </div>
            )}

            <div className="assessments-grid">
                {tests.map(test => (
                    <div key={test.id} className="test-card glass">
                        <div className="test-main">
                            <div className="test-icon"><ClipboardList size={24} /></div>
                            <div className="test-info">
                                <h3>{test.title}</h3>
                                <div className="test-meta">
                                    <span>{test.duration}</span>
                                    <span>{test.questions} Questions</span>
                                    <span className={`diff ${test.difficulty}`}>{test.difficulty}</span>
                                </div>
                                {test.role && <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>For: {test.role}</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="start-btn" onClick={() => setActiveTest(test)} style={{ flex: 1 }}>
                                Take Assessment <Play size={16} />
                            </button>
                            {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                                <button onClick={() => deleteAssessment(test.id)} style={{ padding: '0.75rem', color: 'var(--danger)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .assessments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .test-card { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.5rem; }
        .test-main { display: flex; gap: 1.25rem; }
        .test-icon { width: 48px; height: 48px; background: rgba(79, 70, 229, 0.1); color: var(--primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .test-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; flex-wrap: wrap; }
        .diff.Advanced { color: var(--danger); font-weight: 700; }
        .diff.Intermediate { color: var(--warning); font-weight: 700; }
        .diff.Beginner { color: var(--success); font-weight: 700; }
        .start-btn { padding: 0.75rem; background: var(--bg-dark); color: white; border-radius: var(--radius-md); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .start-btn:hover { background: black; transform: translateY(-2px); }

        @media (max-width: 768px) {
          .assessments-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};
