
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const authorize = require('../middleware/authorize');

// GET all clients - accessible by any authenticated user
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new client - admin only
router.post('/', authorize('admin'), async (req, res) => {
    const client = new Client(req.body);
    try {
        const newClient = await client.save();
        res.status(201).json(newClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a client - admin only
router.put('/:id', authorize('admin'), async (req, res) => {
    try {
        const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a client - admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
