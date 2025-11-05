import WorkOrder from '../models/WorkOrder.js';

export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find();
    res.json(workOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkOrder = async (req, res) => {
  try {
    const workOrder = new WorkOrder(req.body);
    await workOrder.save();
    res.status(201).json(workOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Stats API
export const getStats = async (req, res) => {
  try {
    const totalOrders = await WorkOrder.countDocuments();
    const totalRevenueData = await WorkOrder.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;
    const totalStores = await (await import('../models/Store.js')).default.countDocuments();
    const totalRepairWorks = await (await import('../models/RepairWork.js')).default.countDocuments();
    const recentOrders = await WorkOrder.find().sort({ date: -1 }).limit(5);

    res.json({ totalOrders, totalRevenue, totalStores, totalRepairWorks, recentOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
