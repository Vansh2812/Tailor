import WorkOrder from '../models/WorkOrder.js';
import Store from '../models/Store.js';
import RepairWork from '../models/RepairWork.js';

// ✅ Fetch all work orders
export const getWorkOrders = async (req, res) => {
  try {
    const workOrders = await WorkOrder.find().sort({ date: -1 });
    res.json(workOrders);
  } catch (err) {
    console.error("❌ Error fetching work orders:", err);
    res.status(500).json({ error: 'Failed to fetch work orders.' });
  }
};

// ✅ Create new work order
export const createWorkOrder = async (req, res) => {
  try {
    const {
      customerName,
      clothesName,
      storeId,
      storeName,
      repairWorks,
      totalAmount,
    } = req.body;

    // Basic validation
    if (
      !customerName ||
      !clothesName ||
      !storeId ||
      !storeName ||
      !repairWorks ||
      repairWorks.length === 0 ||
      !totalAmount
    ) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newOrder = new WorkOrder({
      customerName,
      clothesName, // ✅ New field
      storeId,
      storeName,
      repairWorks,
      totalAmount,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("❌ Error creating work order:", err);
    res.status(500).json({ error: 'Failed to create work order.' });
  }
};

// ✅ Get system statistics (dashboard summary)
export const getStats = async (req, res) => {
  try {
    const totalOrders = await WorkOrder.countDocuments();
    const totalRevenueData = await WorkOrder.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

    const totalStores = await Store.countDocuments();
    const totalRepairWorks = await RepairWork.countDocuments();
    const recentOrders = await WorkOrder.find().sort({ date: -1 }).limit(5);

    res.json({
      totalOrders,
      totalRevenue,
      totalStores,
      totalRepairWorks,
      recentOrders,
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};
