import mongoose from 'mongoose';

const workOrderSchema = mongoose.Schema(
  {
    customerName: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    storeName: { type: String, required: true },
    repairWorks: [
      {
        repairWorkId: { type: mongoose.Schema.Types.ObjectId, ref: 'RepairWork', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
