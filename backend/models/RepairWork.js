import mongoose from 'mongoose';

const repairWorkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

const RepairWork = mongoose.model('RepairWork', repairWorkSchema);
export default RepairWork;
