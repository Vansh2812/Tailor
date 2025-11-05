// backend/controllers/storeController.js
import Store from '../models/storeModel.js';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
export const getStores = async (req, res) => {
  try {
    const stores = await Store.find({});
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores', error: error.message });
  }
};

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store', error: error.message });
  }
};

// @desc    Create a new store
// @route   POST /api/stores
// @access  Public
export const createStore = async (req, res) => {
  try {
    const { name, ownerName, mobile, address } = req.body;
    const newStore = new Store({ name, ownerName, mobile, address });
    const savedStore = await newStore.save();
    res.status(201).json(savedStore);
  } catch (error) {
    res.status(500).json({ message: 'Error creating store', error: error.message });
  }
};

// @desc    Update an existing store
// @route   PUT /api/stores/:id
// @access  Public
export const updateStore = async (req, res) => {
  try {
    const { name, ownerName, mobile, address } = req.body;
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      { name, ownerName, mobile, address },
      { new: true }
    );
    if (!updatedStore) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ message: 'Error updating store', error: error.message });
  }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Public
export const deleteStore = async (req, res) => {
  try {
    const deletedStore = await Store.findByIdAndDelete(req.params.id);
    if (!deletedStore) return res.status(404).json({ message: 'Store not found' });
    res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store', error: error.message });
  }
};
