import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useAuth } from '../hooks/useAuth';
import {
    BarChart3, Users, Briefcase, Ticket, Activity,
    ShieldCheck, AlertCircle, Search, MoreVertical, Trash2, Edit3
} from 'lucide-react';

export const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    // Real-time data
    const allUsers = useLiveQuery(() => db.users.toArray(), []);
    const jobCount = useLiveQuery(() => db.jobs.count(), []);
    const ticketCount = useLiveQuery(() => db.tickets.count(), []);
    const appCount = useLiveQuery(() => db.applications.count(), []);
    const recentNotifs = useLiveQuery(() => db.notifications.reverse().limit(5).toArray(), []);

    if (!allUsers) return <div>Loading Admin Panel...</div>;

    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const deleteUser = async (userId) => {
        if (!confirm('Delete this user and all related data?')) return;
        await db.users.delete(userId);
        await db.profiles.where({ userId }).delete();
        await db.applications.where({ applierId: userId }).delete();
    };

    const updateRole = async (userId, newRole) => {
        await db.users.update(userId, { role: newRole });
        setEditingUser(null);
    };

    return (
        <div className="admin-container animate-fade-in">
            <div className="admin-header">
                <h1>Global System Control</h1>
                <p>Platform-Wide Monitoring and Management</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <Users size={24} color="var(--primary)" />
                    <div className="stat-info">
                        <span className="label">Total Users</span>
                        <span className="val">{allUsers.length}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Briefcase size={24} color="var(--secondary)" />
                    <div className="stat-info">
                        <span className="label">Active Jobs</span>
                        <span className="val">{jobCount || 0}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Ticket size={24} color="var(--warning)" />
                    <div className="stat-info">
                        <span className="label">Applications</span>
                        <span className="val">{appCount || 0}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Activity size={24} color="var(--success)" />
                    <div className="stat-info">
                        <span className="label">Tickets</span>
                        <span className="val">{ticketCount || 0}</span>
                    </div>
                </div>
            </div>

            <div className="admin-sections">
                <section className="user-management glass">
                    <div className="section-header">
                        <h3>User & Role Management</h3>
                        <div className="search-bar">
                            <Search size={16} />
                            <input type="text" placeholder="Search by email or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.name || 'N/A'}</strong></td>
                                        <td>{u.email}</td>
                                        <td>
                                            {editingUser === u.id ? (
                                                <select defaultValue={u.role} onChange={e => updateRole(u.id, e.target.value)} onBlur={() => setEditingUser(null)} autoFocus>
                                                    <option>APPLIER</option>
                                                    <option>HR</option>
                                                    <option>ADMIN</option>
                                                </select>
                                            ) : (
                                                <span className={`role-badge ${u.role}`}>{u.role}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="icon-btn" onClick={() => setEditingUser(u.id)} title="Edit role"><Edit3 size={14} /></button>
                                                <button className="icon-btn" onClick={() => deleteUser(u.id)} title="Delete user" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="system-health glass">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {recentNotifs && recentNotifs.length > 0 ? recentNotifs.map((n, idx) => (
                            <div key={idx} className="activity-item">
                                {n.type === 'success' ? <ShieldCheck size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--warning)" />}
                                <p><strong>{n.title}</strong>: {n.message}</p>
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity.</p>
                        )}
                    </div>
                </section>
            </div>

            <style>{`
        .admin-container { display: flex; flex-direction: column; gap: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .stat-card { padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; }
        .stat-info .label { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .stat-info .val { font-size: 1.75rem; font-weight: 800; color: var(--text-main); }
        .admin-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
        .user-management { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-main); padding: 0.5rem 1rem; border-radius: var(--radius-full); border: 1px solid var(--border); }
        .search-bar input { border: none; background: none; outline: none; font-size: 0.85rem; width: 200px; }
        .table-wrapper { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; margin-top: 2rem; min-width: 500px; }
        .admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid var(--border); font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; }
        .admin-table td { padding: 1rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
        .role-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid; }
        .role-badge.APPLIER { color: var(--primary); border-color: var(--primary); }
        .role-badge.HR { color: var(--secondary); border-color: var(--secondary); }
        .role-badge.ADMIN { color: var(--text-main); border-color: var(--text-main); }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--success); margin-right: 0.5rem; }
        .system-health { padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border); }
        .activity-list { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .activity-item { display: flex; gap: 1rem; font-size: 0.85rem; border-left: 2px solid var(--border); padding-left: 1rem; }
        .icon-btn { color: var(--text-muted); padding: 0.4rem; border-radius: var(--radius-sm); }
        .icon-btn:hover { background: var(--border); color: var(--text-main); }

        @media (max-width: 768px) {
          .admin-sections { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .search-bar input { width: 120px; }
          .user-management { padding: 1.25rem; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};
