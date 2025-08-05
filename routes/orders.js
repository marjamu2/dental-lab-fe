
const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/Order');
const authorize = require('../middleware/authorize');


// GET all orders
router.get('/', async (req, res) => {
    try {
        const orders = await WorkOrder.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new order - admin only
router.post('/', authorize('admin'), async (req, res) => {
    const order = new WorkOrder(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) an order - admin and user can update
router.put('/:id', authorize('admin', 'user'), async (req, res) => {
    try {
        const updatedOrder = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an order - admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        await WorkOrder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Orden eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
