import React, { useState, useEffect } from 'react';
import { adminApi, notificationApi } from '../db/api';
import { useAuth } from '../hooks/useAuth';
import {
    BarChart3, Users, Briefcase, Ticket, Activity,
    ShieldCheck, AlertCircle, Search, MoreVertical, Trash2, Edit3
} from 'lucide-react';

export const AdminDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({ userCount: 0, jobCount: 0, appCount: 0, ticketCount: 0 });
    const [recentNotifs, setRecentNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, statsRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getStats()
            ]);
            setAllUsers(usersRes.data);
            setStats(statsRes.data);
            
            // Notifications for activity feed - simplified for now
            // In a real app we might get more detailed activity
            setRecentNotifs([]); // Optionally fetch from a generic notification endpoint
        } catch (err) {
            console.error("Admin Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const deleteUser = async (userId) => {
        if (!confirm('Delete this user and all related data?')) return;
        try {
            await adminApi.deleteUser(userId);
            loadData();
        } catch (err) {
            console.error("Delete user error:", err);
        }
    };

    const updateRole = async (userId, newRole) => {
        try {
            await adminApi.updateUser(userId, { role: newRole });
            setEditingUser(null);
            loadData();
        } catch (err) {
            console.error("Update role error:", err);
        }
    };

    if (loading) return <div>Loading Admin Panel...</div>;

    const filteredUsers = allUsers.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <span className="val">{stats.userCount}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Briefcase size={24} color="var(--secondary)" />
                    <div className="stat-info">
                        <span className="label">Active Jobs</span>
                        <span className="val">{stats.jobCount}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Ticket size={24} color="var(--warning)" />
                    <div className="stat-info">
                        <span className="label">Applications</span>
                        <span className="val">{stats.appCount}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Activity size={24} color="var(--success)" />
                    <div className="stat-info">
                        <span className="label">Tickets</span>
                        <span className="val">{stats.ticketCount}</span>
                    </div>
                </div>
            </div>

            <div className="admin-sections">
                <section className="analytics-overview glass">
                    <div className="section-header">
                        <h3>Platform Traffic & Engagement</h3>
                        <p>Real-time analytics across all system nodes</p>
                    </div>
                    <div className="analytics-mock-chart">
                        <div className="chart-bar" style={{ height: '60%' }}></div>
                        <div className="chart-bar" style={{ height: '80%' }}></div>
                        <div className="chart-bar" style={{ height: '45%' }}></div>
                        <div className="chart-bar" style={{ height: '90%' }}></div>
                        <div className="chart-bar" style={{ height: '70%' }}></div>
                        <div className="chart-bar" style={{ height: '85%' }}></div>
                        <div className="chart-bar" style={{ height: '55%' }}></div>
                    </div>
                    <div className="chart-labels">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </section>

                <section className="system-health glass">
                    <h3>Recent System Alerts</h3>
                    <div className="activity-list">
                        <div className="activity-item">
                            <ShieldCheck size={16} color="var(--success)" />
                            <p><strong>DB Backup</strong>: Global sync completed successfully.</p>
                        </div>
                        <div className="activity-item">
                            <AlertCircle size={16} color="var(--warning)" />
                            <p><strong>High Traffic</strong>: API node 04 experiencing spike.</p>
                        </div>
                    </div>
                </section>
            </div>

            <style>{`
        .admin-container { display: flex; flex-direction: column; gap: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .stat-card { padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--border); display: flex; align-items: center; gap: 1.5rem; }
        .stat-info .label { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
        .stat-info .val { font-size: 2rem; font-weight: 900; color: var(--text-main); }
        
        .admin-sections { display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem; }
        .analytics-overview { padding: 2.5rem; border-radius: var(--radius-xl); border: 1px solid var(--border); }
        .analytics-mock-chart { height: 200px; display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin: 3rem 0 1rem; border-bottom: 2px solid var(--border); }
        .chart-bar { flex: 1; background: var(--primary); border-radius: 4px 4px 0 0; opacity: 0.8; transition: all 0.3s; }
        .chart-bar:hover { opacity: 1; transform: scaleY(1.05); }
        .chart-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }

        .system-health { padding: 2.5rem; border-radius: var(--radius-xl); border: 1px solid var(--border); }
        .activity-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .activity-item { display: flex; gap: 1rem; font-size: 0.9rem; border-left: 3px solid var(--border); padding-left: 1.25rem; }

        @media (max-width: 1024px) {
          .admin-sections { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};
