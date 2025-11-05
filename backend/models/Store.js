import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);
export default Store;
