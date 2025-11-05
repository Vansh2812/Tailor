import express from 'express';
import Store from '../models/Store.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  const stores = await Store.find({});
  res.json(stores);
});

// Add new store
router.post('/', async (req, res) => {
  const store = new Store(req.body);
  const saved = await store.save();
  res.json(saved);
});

// Update store
router.put('/:id', async (req, res) => {
  const updated = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete store
router.delete('/:id', async (req, res) => {
  await Store.findByIdAndDelete(req.params.id);
  res.json({ message: 'Store deleted' });
});

export default router;
