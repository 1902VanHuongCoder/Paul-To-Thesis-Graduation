import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/mydatabase'; // Replace with your MongoDB URI

export const connectToMongoDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if the connection fails
  }
};

