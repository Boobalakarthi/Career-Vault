import React, { useState, useEffect } from 'react';
import { assessmentApi, assessmentResultApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import { ClipboardList, Play, Timer, Plus, Trash2 } from 'lucide-react';

export const Assessments = () => {
    const { user } = useAuth();
    const [activeTest, setActiveTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            setLoading(true);
            const res = await assessmentApi.getAll();
            setTests(res.data);
        } catch (err) {
            console.error("Error loading assessments:", err);
        } finally {
            setLoading(false);
        }
    };

    const startTest = (test) => {
        setActiveTest(test);
        setCurrentQuestion(0);
        setAnswers({});
        setTimeLeft(45 * 60); // 45 minutes
        setIsFinished(false);
    };

    useEffect(() => {
        if (activeTest && timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && activeTest && !isFinished) {
            submitTest();
        }
    }, [activeTest, timeLeft, isFinished]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (val) => {
        setAnswers({ ...answers, [currentQuestion]: val });
    };

    const submitTest = async () => {
        setIsFinished(true);
        try {
            await assessmentResultApi.submit({
                userId: user.id,
                testId: activeTest.id,
                score: Math.floor(Math.random() * 40) + 60, // Still simulated for now
            });
        } catch (err) {
            console.error("Error submitting test:", err);
        }
    };

    // HR/Admin can add assessments
    const [showAdd, setShowAdd] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', role: '', difficulty: 'Intermediate', questions: 3, duration: '45 min' });

    const addAssessment = async () => {
        if (!newTest.title) return;
        try {
            await assessmentApi.create(newTest);
            setNewTest({ title: '', role: '', difficulty: 'Intermediate', questions: 3, duration: '45 min' });
            setShowAdd(false);
            loadTests();
        } catch (err) {
            console.error("Error adding assessment:", err);
        }
    };

    const deleteAssessment = async (id) => {
        if (!confirm('Delete this assessment?')) return;
        try {
            await assessmentApi.delete(id);
            loadTests();
        } catch (err) {
            console.error("Error deleting assessment:", err);
        }
    };

    if (loading) return <div>Loading assessments...</div>;

    if (activeTest) {
        if (isFinished) {
            return (
                <div className="test-interface glass animate-fade-in text-center">
                    <div className="success-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2>Assessment Completed!</h2>
                    <p>Your results have been synced to your profile.</p>
                    <button className="save-btn" style={{ marginTop: '2rem' }} onClick={() => setActiveTest(null)}>Back to Home</button>
                    <style>{`.text-center { text-align: center; padding: 4rem; }`}</style>
                </div>
            );
        }

        return (
            <div className="test-interface glass animate-fade-in">
                <div className="test-header">
                    <div>
                        <h2>{activeTest.title}</h2>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${((currentQuestion + 1) / (activeTest.questions?.length || 3)) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="timer"><Timer size={18} /> {formatTime(timeLeft)}</div>
                </div>
                <div className="test-body">
                    <div className="question-card">
                        <span className="q-count">Question {currentQuestion + 1} of {activeTest.questions?.length || 3}</span>
                        <p className="question-text">{activeTest.questions?.[currentQuestion]?.q || "Sample Question Text"}</p>
                        <div className="options">
                            {(activeTest.questions?.[currentQuestion]?.options || ["Option A", "Option B", "Option C", "Option D"]).map((opt, i) => (
                                <label key={i} className={`option ${answers[currentQuestion] === opt ? 'selected' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name={`q${currentQuestion}`} 
                                        checked={answers[currentQuestion] === opt}
                                        onChange={() => handleAnswer(opt)}
                                    /> 
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="test-footer">
                    <button className="cancel-btn" onClick={() => setActiveTest(null)}>Exit Test</button>
                    {currentQuestion < (activeTest.questions?.length || 3) - 1 ? (
                        <button className="save-btn" onClick={() => setCurrentQuestion(prev => prev + 1)}>Next Question</button>
                    ) : (
                        <button className="save-btn" onClick={submitTest}>Submit Assessment</button>
                    )}
                </div>
                <style>{`
          .test-interface { padding: 2.5rem; max-width: 850px; margin: 0 auto; border-radius: var(--radius-lg); border: 1px solid var(--border); }
          .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
          .progress-bar-container { width: 200px; height: 6px; background: var(--border); border-radius: 3px; margin-top: 0.5rem; overflow: hidden; }
          .progress-bar-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
          .timer { color: var(--danger); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem; }
          .question-text { font-size: 1.25rem; font-weight: 600; margin-bottom: 2rem; }
          .options { display: grid; gap: 1rem; }
          .option { padding: 1.25rem; background: var(--bg-main); border-radius: var(--radius-md); border: 2px solid var(--border); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem; }
          .option:hover { border-color: var(--primary); background: rgba(79, 70, 229, 0.03); }
          .option.selected { border-color: var(--primary); background: rgba(79, 70, 229, 0.05); }
          .option input { pointer-events: none; }
          .test-footer { display: flex; justify-content: space-between; margin-top: 3rem; }
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
                            <button className="start-btn" onClick={() => startTest(test)} style={{ flex: 1 }}>
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
