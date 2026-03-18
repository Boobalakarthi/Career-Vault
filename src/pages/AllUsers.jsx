import React, { useState, useEffect } from 'react';
import { adminApi } from '../db/api';
import { 
    Users, Search, Edit3, Trash2, Shield, 
    Mail, Calendar, MoreVertical, Filter, Loader2
} from 'lucide-react';

export const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getUsers();
            setUsers(res.data);
        } catch (err) {
            console.error("Load users error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you absolutely sure? This will delete all user data permanently.')) return;
        try {
            await adminApi.deleteUser(id);
            loadUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await adminApi.updateUser(id, { role: newRole });
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="loading-container">
            <Loader2 size={40} className="spin" />
            <p>Syncing Registry...</p>
        </div>
    );

    return (
        <div className="users-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>User Registry</h1>
                    <p>Manage access levels and platform entitlements</p>
                </div>
                <div className="header-actions">
                    <div className="search-box glass">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Find by name or email..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="users-list-container glass">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Identitiy</th>
                            <th>Email Address</th>
                            <th>Permission Level</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar">{u.name?.charAt(0) || 'U'}</div>
                                        <strong>{u.name || 'Anonymous User'}</strong>
                                    </div>
                                </td>
                                <td><span className="email-text">{u.email}</span></td>
                                <td>
                                    {editingUser === u.id ? (
                                        <select 
                                            className="role-select"
                                            defaultValue={u.role} 
                                            onChange={e => handleRoleChange(u.id, e.target.value)}
                                            onBlur={() => setEditingUser(null)}
                                            autoFocus
                                        >
                                            <option value="APPLIER">APPLIER</option>
                                            <option value="HR">HR</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    ) : (
                                        <span className={`role-badge ${u.role}`}>
                                            <Shield size={12} /> {u.role}
                                        </span>
                                    )}
                                </td>
                                <td><span className="date-text">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button className="icon-btn" onClick={() => setEditingUser(u.id)}><Edit3 size={16} /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .users-page { display: flex; flex-direction: column; gap: 2rem; }
                .page-header { display: flex; justify-content: space-between; align-items: center; }
                .page-header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -1px; }
                .page-header p { color: var(--text-muted); }
                
                .search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1.25rem; border-radius: 99px; border: 1px solid var(--border); min-width: 320px; }
                .search-box input { border: none; background: none; font-size: 0.9rem; outline: none; width: 100%; }

                .users-list-container { border-radius: var(--radius-xl); border: 1px solid var(--border); overflow: hidden; }
                .users-table { width: 100%; border-collapse: collapse; text-align: left; }
                .users-table th { padding: 1.25rem; background: var(--bg-main); border-bottom: 2px solid var(--border); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); }
                .users-table td { padding: 1.25rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
                
                .user-info-cell { display: flex; align-items: center; gap: 1rem; }
                .user-avatar { width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
                
                .role-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; border: 1px solid transparent; }
                .role-badge.ADMIN { background: rgba(0,0,0,0.05); color: var(--text-main); border-color: var(--text-main); }
                .role-badge.HR { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
                .role-badge.APPLIER { background: rgba(79, 70, 229, 0.1); color: var(--primary); border-color: var(--primary); }
                
                .email-text { font-size: 0.9rem; color: var(--text-muted); }
                .date-text { font-size: 0.85rem; color: var(--text-muted); }
                
                .action-btns { display: flex; gap: 0.5rem; }
                .icon-btn { padding: 0.5rem; border-radius: var(--radius-sm); color: var(--text-muted); transition: all 0.2s; }
                .icon-btn:hover { background: var(--border); color: var(--text-main); }
                .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
                
                .role-select { padding: 0.4rem; border-radius: 4px; font-size: 0.85rem; border: 1px solid var(--primary); outline: none; }

                .loading-container { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--primary); }
                .spin { animation: rotate 1s linear infinite; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .search-box { width: 100%; min-width: 0; }
                    .users-table th:nth-child(4), .users-table td:nth-child(4) { display: none; }
                }
            `}</style>
        </div>
    );
};
