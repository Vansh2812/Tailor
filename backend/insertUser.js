// insertUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Create a new user
    const user = new User({
      name: 'Vinubhai',
      email: 'vanshgpatel2812@gmail.com',
      password: 'Vinubhai@1985', // will be hashed automatically
    });

    const savedUser = await user.save();
    console.log('✅ User saved:', savedUser);

    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

connectDB();
