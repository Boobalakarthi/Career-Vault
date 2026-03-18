import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../db/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('edply_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authApi.login({ email, password });
            const foundUser = res.data;
            setUser(foundUser);
            localStorage.setItem('edply_user', JSON.stringify(foundUser));
            return { success: true, user: foundUser };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Invalid credentials' };
        }
    };

    const register = async (userData) => {
        try {
            const res = await authApi.register(userData);
            const newUser = res.data;
            setUser(newUser);
            localStorage.setItem('edply_user', JSON.stringify(newUser));
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('edply_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
