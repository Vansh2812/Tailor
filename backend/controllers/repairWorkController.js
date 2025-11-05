import RepairWork from '../models/RepairWork.js';

// Get all repair works
export const getRepairWorks = async (req, res) => {
  try {
    const works = await RepairWork.find();
    res.json(works);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new repair work
export const addRepairWork = async (req, res) => {
  try {
    const { name, price } = req.body;
    const newWork = new RepairWork({ name, price });
    const savedWork = await newWork.save();
    res.status(201).json(savedWork);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update repair work
export const updateRepairWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const updatedWork = await RepairWork.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );
    if (!updatedWork) return res.status(404).json({ message: 'Repair work not found' });
    res.json(updatedWork);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete repair work
export const deleteRepairWork = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWork = await RepairWork.findByIdAndDelete(id);
    if (!deletedWork) return res.status(404).json({ message: 'Repair work not found' });
    res.json({ message: 'Repair work deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
