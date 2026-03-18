import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Loader } from 'lucide-react';

export const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        education: 'Undergraduate',
        careerInterest: '',
        agreeToTerms: false
    });
    const [otp, setOtp] = useState('');
    const [simulatedOtp] = useState('123456');

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!formData.agreeToTerms) {
            setError('You must agree to the Terms & Conditions');
            return false;
        }
        return true;
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (validateForm()) {
            setLoading(true);
            // Simulate sending OTP
            setTimeout(() => {
                setLoading(false);
                setStep(2);
            }, 1500);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (otp !== simulatedOtp) {
            setError('Invalid OTP. Use 123456 for demo.');
            return;
        }

        setLoading(true);
        const result = await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            education: formData.education,
            careerInterest: formData.careerInterest
        });

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
            setStep(1);
        }
    };

    return (
        <div className="register-page animate-fade-in">
            <div className="register-card glass">
                <div className="register-header">
                    <div className="logo-section">
                        <div className="logo-icon"><ShieldCheck size={32} /></div>
                        <h2>Create Account</h2>
                    </div>
                    <div className="progress-indicator">
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
                        <div className="step-line"></div>
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
                    </div>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleInitialSubmit} className="register-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label><User size={16} /> Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><Mail size={16} /> Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><Phone size={16} /> Mobile Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Education Level</label>
                                <select 
                                    value={formData.education}
                                    onChange={e => setFormData({...formData, education: e.target.value})}
                                >
                                    <option>School Student</option>
                                    <option>Diploma</option>
                                    <option>Undergraduate</option>
                                    <option>Postgraduate</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><Lock size={16} /> Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <div className="pw-strength">
                                    <div className={`strength-bar ${formData.password.length > 8 ? 'strong' : formData.password.length > 5 ? 'medium' : ''}`}></div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label><Lock size={16} /> Confirm Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Career Interest (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Frontend Development"
                                    value={formData.careerInterest}
                                    onChange={e => setFormData({...formData, careerInterest: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-footer">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={formData.agreeToTerms}
                                    onChange={e => setFormData({...formData, agreeToTerms: e.target.checked})}
                                />
                                <span>I agree to the <Link to="/terms">Terms & Conditions</Link></span>
                            </label>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? <Loader className="spin" size={20} /> : <>Continue <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="otp-section animate-fade-in">
                        <div className="otp-info">
                            <div className="otp-icon"><Mail size={48} /></div>
                            <h3>Verify your Email</h3>
                            <p>We've sent a 6-digit code to <strong>{formData.email}</strong></p>
                            <p className="demo-hint">Demo OTP: <strong>123456</strong></p>
                        </div>

                        <form onSubmit={handleOtpSubmit}>
                            <div className="otp-input-group">
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? <Loader className="spin" size={20} /> : <>Verify & Create Account <CheckCircle size={20} /></>}
                            </button>
                            <button type="button" className="retry-btn" onClick={() => setStep(1)}>
                                Back to details
                            </button>
                        </form>
                    </div>
                )}

                <div className="card-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>

            <style>{`
                .register-page {
                    min-height: calc(100vh - 100px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .register-card {
                    width: 100%;
                    max-width: 650px;
                    padding: 2.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                }
                .register-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .logo-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .progress-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .step-dot {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--border);
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                }
                .step-dot.active {
                    background: var(--primary);
                    color: white;
                }
                .step-line {
                    width: 30px;
                    height: 2px;
                    background: var(--border);
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .full-width {
                    grid-column: span 2;
                }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    background: var(--bg-main);
                    transition: var(--transition);
                }
                .form-group input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                .pw-strength {
                    height: 4px;
                    background: var(--border);
                    border-radius: 2px;
                    margin-top: 0.5rem;
                    overflow: hidden;
                }
                .strength-bar { height: 100%; width: 33%; transition: all 0.3s; }
                .strength-bar.medium { width: 66%; background: var(--warning); }
                .strength-bar.strong { width: 100%; background: var(--success); }
                
                .form-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .checkbox-label {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .checkbox-label input { margin-top: 0.2rem; }
                
                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    background: var(--primary);
                    color: white;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: var(--transition);
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                
                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--danger);
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .otp-section {
                    text-align: center;
                    padding: 1rem 0;
                }
                .otp-info { margin-bottom: 2rem; }
                .otp-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(79, 70, 229, 0.1);
                    color: var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .demo-hint {
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .otp-input-group { margin-bottom: 2rem; }
                .otp-input-group input {
                    width: 200px;
                    font-size: 2.5rem;
                    text-align: center;
                    letter-spacing: 0.5rem;
                    padding: 1rem;
                    border-bottom: 3px solid var(--primary);
                    border-top: none; border-left: none; border-right: none;
                }
                .retry-btn {
                    margin-top: 1.5rem;
                    background: none;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                .card-footer {
                    margin-top: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .card-footer a { color: var(--primary); font-weight: 700; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 600px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .full-width { grid-column: span 1; }
                    .register-card { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};
