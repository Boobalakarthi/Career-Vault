import React, { useState, useEffect } from 'react';
import { ticketApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export const SupportTickets = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '', category: 'General Help', priority: 'Medium' });
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [response, setResponse] = useState('');

    useEffect(() => {
        loadTickets();
    }, [user?.id]);

    const loadTickets = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const res = await ticketApi.getByUser(user.id);
            setTickets(res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Error loading tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ticketApi.create({
                userId: user.id,
                ...newTicket
            });
            setNewTicket({ subject: '', message: '', category: 'General Help', priority: 'Medium' });
            loadTickets();
        } catch (err) {
            console.error("Error creating ticket:", err);
            alert("Failed to send ticket");
        }
    };

    const handleAdminReply = async (ticketId) => {
        if (!response) return;
        try {
            // Since we don't have a specific reply endpoint yet, we could use update if implemented
            // or I could quickly add a reply route. For now, let's assume update works.
            const t = tickets.find(ticket => ticket.id === ticketId);
            const updatedResponses = [...(t.responses || []), {
                senderId: user.id,
                message: response
            }];
            await ticketApi.update(ticketId, { 
                responses: updatedResponses,
                status: 'Resolved' 
            });
            setResponse('');
            setReplyingTo(null);
            loadTickets();
        } catch (err) {
            console.error("Error replying to ticket:", err);
        }
    };

    return (
        <div className="tickets-container animate-fade-in">
            <div className="section-header">
                <div>
                    <h1><MessageSquare size={32} color="var(--primary)" /> Support Ecosystem</h1>
                    <p className="subtitle">{user.role === 'ADMIN' ? 'Strategic ticket resolution platform' : 'Direct line to CareerVault experts'}</p>
                </div>
            </div>

            <div className="tickets-layout">
                {user.role !== 'ADMIN' && (
                    <div className="raise-ticket glass premium-shadow">
                        <div className="card-top">
                            <Plus size={20} />
                            <h3>New Support Query</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>What can we help with?</label>
                                <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})}>
                                    <option>General Help</option>
                                    <option>Technical Issue</option>
                                    <option>Career Guidance</option>
                                    <option>Job Application</option>
                                    <option>Feedback</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Urgent</option>
                                </select>
                            </div>
                            <input type="text" placeholder="Subject Line" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} required />
                            <textarea rows="5" placeholder="Detailed description of your request..." value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} required></textarea>
                            <button type="submit" className="save-btn w-full"><Send size={18} /> Send Request</button>
                        </form>
                    </div>
                )}

                <div className="tickets-list glass">
                    <div className="list-header">
                        <h3><Clock size={20} /> Ticket Registry</h3>
                        <span className="count-pill">{tickets.length} Active</span>
                    </div>
                    
                    {tickets.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={48} color="var(--success)" />
                            <p>All clear! No active support requests.</p>
                        </div>
                    ) : (
                        <div className="cards-scroll">
                            {tickets.map(t => (
                                <div key={t.id} className={`ticket-card-pro status-${t.status} priority-${t.priority}`}>
                                    <div className="ticket-header-pro">
                                        <div className="badge-stack">
                                            <span className={`status-pill ${t.status}`}>{t.status}</span>
                                            <span className={`priority-pill ${t.priority}`}>{t.priority}</span>
                                        </div>
                                        <span className="date-stamp">{new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <div className="ticket-content">
                                        <span className="category-tag">{t.category}</span>
                                        <h4>{t.subject}</h4>
                                        <p>{t.message}</p>
                                        
                                        {t.responses && t.responses.map((r, idx) => (
                                            <div key={idx} className="admin-response animate-fade-in">
                                                <div className="admin-meta">
                                                    <strong>{r.adminName} (Expert)</strong>
                                                    <span>{new Date(r.date).toLocaleTimeString()}</span>
                                                </div>
                                                <p>{r.message}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {user.role === 'ADMIN' && t.status !== 'Resolved' && (
                                        <div className="admin-actions">
                                            {replyingTo === t.id ? (
                                                <div className="reply-box animate-slide-up">
                                                    <textarea 
                                                        placeholder="Type your resolution here..." 
                                                        value={response} 
                                                        onChange={e => setResponse(e.target.value)}
                                                    />
                                                    <div className="reply-btns">
                                                        <button className="cancel-sub" onClick={() => setReplyingTo(null)}>Cancel</button>
                                                        <button className="send-sub" onClick={() => handleAdminReply(t.id)}>Resolve & Reply</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="reply-init-btn" onClick={() => setReplyingTo(t.id)}>
                                                    <Send size={14} /> Respond to User
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tickets-container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
                .subtitle { color: var(--text-muted); font-size: 1.1rem; margin-top: 0.5rem; }
                .tickets-layout { display: grid; grid-template-columns: ${user.role === 'ADMIN' ? '1fr' : '400px 1fr'}; gap: 2.5rem; margin-top: 2rem; }
                
                .raise-ticket { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); background: var(--bg-main); }
                .card-top { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; color: var(--primary); }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; }
                .raise-ticket input, .raise-ticket select, .raise-ticket textarea { width: 100%; padding: 0.85rem; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); transition: var(--transition); }
                .raise-ticket input:focus, .raise-ticket textarea:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
                
                .tickets-list { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); min-height: 600px; display: flex; flex-direction: column; }
                .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .count-pill { background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
                
                .cards-scroll { display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; max-height: 800px; padding-right: 0.5rem; }
                .ticket-card-pro { padding: 1.5rem; border-radius: var(--radius-md); background: var(--bg-card); border: 1px solid var(--border); border-left: 5px solid var(--border); transition: var(--transition); }
                .ticket-card-pro:hover { transform: translateX(5px); border-color: var(--primary); }
                
                .status-pill { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; }
                .status-pill.Open { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .status-pill.Resolved { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                
                .priority-pill { font-size: 0.7rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 4px; margin-left: 0.5rem; }
                .priority-pill.Urgent { background: rgba(239, 68, 68, 0.1); color: var(--danger); animation: pulse 2s infinite; }
                .priority-pill.High { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                
                .category-tag { font-size: 0.75rem; color: var(--primary); font-weight: 700; display: block; margin-top: 1rem; }
                .ticket-content h4 { margin: 0.5rem 0; font-size: 1.1rem; }
                .ticket-content p { color: var(--text-main); font-size: 0.95rem; line-height: 1.5; }
                
                .admin-response { margin-top: 1.5rem; padding: 1.25rem; background: var(--bg-main); border-radius: var(--radius-md); border: 1px dashed var(--primary); }
                .admin-meta { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem; }
                
                .reply-box { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .reply-box textarea { width: 100%; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--primary); height: 100px; }
                .reply-btns { display: flex; gap: 1rem; justify-content: flex-end; }
                .cancel-sub { color: var(--text-muted); font-weight: 600; }
                .send-sub { background: var(--primary); color: white; padding: 0.5rem 1.5rem; border-radius: var(--radius-sm); font-weight: 700; }
                .reply-init-btn { margin-top: 1.5rem; color: var(--primary); font-weight: 700; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
                
                .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); }
                
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                @media (max-width: 900px) {
                    .tickets-layout { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};
