import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Play, Shield, MessageCircle, AlertCircle, TrendingUp, Trophy } from 'lucide-react';

export const InterviewPrep = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [targetJob, setTargetJob] = useState('Senior Frontend Developer');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        if (user) loadProfile();
    }, [user]);

    const loadProfile = async () => {
        const p = await db.profiles.where({ userId: user.id }).first();
        setProfile(p);
    };

    const generateQuestions = () => {
        const skills = profile?.skills.map(s => s.name) || ['React', 'JavaScript'];
        const mockQuestions = [
            { q: `Explain how you would architect a large scale application using ${skills[0] || 'your core stack'}.`, focus: 'System Design' },
            { q: "Tell me about a time you had to optimize a slow component. What was your process?", focus: 'Problem Solving' },
            { q: "How do you handle state management across deeply nested components?", focus: 'Technical Depth' },
            { q: "Describe your experience with CI/CD and automated testing.", focus: 'DevOps' }
        ];
        setQuestions(mockQuestions);
        setIsStarted(true);
    };

    return (
        <div className="prep-container animate-fade-in">
            <div className="section-header">
                <h1>AI Interview Simulator</h1>
                <p>Hone your skills with role-specific technical questions</p>
            </div>

            {!isStarted ? (
                <div className="setup-card glass">
                    <Sparkles size={40} color="var(--primary)" />
                    <h2>Ready to practice, {user.name}?</h2>
                    <p>The AI will generate questions based on your Profile Skills and the target role: <strong>{targetJob}</strong></p>
                    <button className="start-btn" onClick={generateQuestions}>
                        <Play size={18} /> Start Session
                    </button>
                </div>
            ) : (
                <div className="session-view glass">
                    <div className="progress-bar">
                        <div className="fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                    </div>

                    <div className="question-area">
                        <span className="focus-tag"><Shield size={14} /> {questions[currentIndex].focus}</span>
                        <h2 className="question-text">"{questions[currentIndex].q}"</h2>
                    </div>

                    <div className="feedback-tip glass">
                        <h4><MessageCircle size={16} /> Interview Tip</h4>
                        <p>Use the **STAR** method (Situation, Task, Action, Result) to provide a structured answer.</p>
                    </div>

                    <div className="controls">
                        <button className="nav-btn secondary" onClick={() => setIsStarted(false)}>End Session</button>
                        <button className="nav-btn primary" onClick={() => {
                            if (currentIndex < questions.length - 1) setCurrentIndex(v => v + 1);
                            else alert('Session Complete! You are ready for the real thing!') || setIsStarted(false);
                        }}>
                            Next Question <TrendingUp size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="stats-panel">
                <div className="stat glass">
                    <Trophy size={20} color="var(--warning)" />
                    <div>
                        <span>Confidence Score</span>
                        <strong>82%</strong>
                    </div>
                </div>
                <div className="stat glass">
                    <AlertCircle size={20} color="var(--primary)" />
                    <div>
                        <span>Common Pitfalls</span>
                        <strong>3 detected</strong>
                    </div>
                </div>
            </div>

            <style>{`
        .prep-container { display: flex; flex-direction: column; gap: 2rem; max-width: 900px; margin: 0 auto; }
        .setup-card { padding: 4rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; border: 1px solid var(--border); border-radius: var(--radius-lg); }
        .setup-card h2 { font-size: 2rem; }
        .setup-card p { color: var(--text-muted); max-width: 500px; }
        .start-btn { background: var(--primary); color: white; padding: 1rem 2.5rem; border-radius: var(--radius-md); font-weight: 700; display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
        .session-view { padding: 3rem; border: 1px solid var(--border); border-radius: var(--radius-lg); position: relative; }
        .progress-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: var(--bg-main); overflow: hidden; }
        .progress-bar .fill { height: 100%; background: var(--primary); transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .question-area { margin-bottom: 3rem; }
        .focus-tag { display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 1rem; }
        .question-text { font-size: 1.75rem; line-height: 1.4; font-weight: 700; color: var(--bg-dark); }
        .feedback-tip { padding: 1.5rem; background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-md); border-left: 4px solid var(--primary); margin-bottom: 3rem; }
        .feedback-tip h4 { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .feedback-tip p { font-size: 0.85rem; color: var(--text-main); line-height: 1.5; }
        .controls { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border); padding-top: 2rem; }
        .nav-btn { padding: 0.8rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
        .nav-btn.primary { background: var(--bg-dark); color: white; }
        .nav-btn.secondary { background: var(--bg-main); color: var(--text-muted); }
        .stats-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .stat { padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; }
        .stat span { display: block; font-size: 0.8rem; color: var(--text-muted); }
        .stat strong { font-size: 1.25rem; color: var(--text-main); }
      `}</style>
        </div>
    );
};
