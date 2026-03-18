import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, phone, education, careerInterest } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const userData = { 
            email, 
            password, 
            name, 
            role: role || 'APPLIER',
            personal: { phone },
            targetRole: careerInterest
        };

        // If education is a string (from simple reg form), wrap it
        if (education && typeof education === 'string') {
            userData.education = [{ degree: education }];
        }

        const user = new User(userData);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
