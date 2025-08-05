
const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const authorize = require('../middleware/authorize');


// GET all suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new supplier - admin only
router.post('/', authorize('admin'), async (req, res) => {
    const supplier = new Supplier(req.body);
    try {
        const newSupplier = await supplier.save();
        res.status(201).json(newSupplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) a supplier - admin only
router.put('/:id', authorize('admin'), async (req, res) => {
    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSupplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a supplier - admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proveedor eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
