import express from 'express';
import { Ticket } from '../models/Ticket.js';

const router = express.Router();

// Get user tickets
router.get('/user/:userId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.params.userId });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create ticket
router.post('/', async (req, res) => {
    try {
        const ticket = new Ticket(req.body);
        await ticket.save();
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
