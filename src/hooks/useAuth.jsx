import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, seedDatabase } from '../db/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await seedDatabase();
            const savedUser = localStorage.getItem('edply_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = async (email, password) => {
        const foundUser = await db.users.where({ email, password }).first();
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('edply_user', JSON.stringify(foundUser));
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('edply_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
