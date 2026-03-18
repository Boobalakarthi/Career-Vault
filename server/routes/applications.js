import express from 'express';
import { Application } from '../models/Application.js';

const router = express.Router();

// Get all applications (for HR/Admin)
router.get('/', async (req, res) => {
    try {
        const apps = await Application.find().populate('jobId');
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get applications by user
router.get('/user/:userId', async (req, res) => {
    try {
        const apps = await Application.find({ applierId: req.params.userId }).populate('jobId');
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Apply for job
router.post('/', async (req, res) => {
    try {
        const app = new Application(req.body);
        await app.save();
        res.status(201).json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update application status
router.put('/:id/status', async (req, res) => {
    try {
        const app = await Application.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(app);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
