import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export const SupportTickets = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, [user]);

    const loadTickets = async () => {
        let data;
        if (user.role === 'ADMIN') {
            data = await db.tickets.toArray();
        } else {
            data = await db.tickets.where({ userId: user.id }).toArray();
        }
        setTickets(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticket = {
            userId: user.id,
            userName: user.name,
            ...newTicket,
            status: 'Open',
            createdAt: new Date().toISOString()
        };
        await db.tickets.add(ticket);
        setNewTicket({ subject: '', message: '' });
        loadTickets();
    };

    return (
        <div className="tickets-container animate-fade-in">
            <div className="section-header">
                <h1>Support Command Center</h1>
                <p>{user.role === 'ADMIN' ? 'Manage global support requests' : 'Get help with your career journey'}</p>
            </div>

            <div className="tickets-layout">
                {user.role !== 'ADMIN' && (
                    <div className="raise-ticket glass">
                        <h3><Plus size={18} /> Raise a Ticket</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Subject" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} required />
                            <textarea rows="4" placeholder="Describe your issue..." value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} required></textarea>
                            <button type="submit" className="save-btn">Submit Ticket</button>
                        </form>
                    </div>
                )}

                <div className="tickets-list glass">
                    <h3>Recent Tickets</h3>
                    {tickets.length === 0 ? <p className="text-muted">No tickets found.</p> : (
                        tickets.map(t => (
                            <div key={t.id} className="ticket-card">
                                <div className="ticket-meta">
                                    <span className={`status-badge ${t.status}`}>{t.status}</span>
                                    <span className="date">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4>{t.subject}</h4>
                                <p>{t.message}</p>
                                {user.role === 'ADMIN' && <button className="reply-btn">Reply as Admin</button>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
        .tickets-layout { display: grid; grid-template-columns: ${user.role === 'ADMIN' ? '1fr' : '1fr 2fr'}; gap: 2rem; }
        .raise-ticket { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .raise-ticket form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .tickets-list { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .ticket-card { padding: 1rem; border-radius: var(--radius-md); background: var(--bg-main); margin-bottom: 1rem; border-left: 4px solid var(--primary); }
        .ticket-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .status-badge { font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 4px; }
        .status-badge.Open { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .date { font-size: 0.75rem; color: var(--text-muted); }
        .reply-btn { margin-top: 1rem; font-size: 0.8rem; color: var(--primary); font-weight: 600; }
      `}</style>
        </div>
    );
};
