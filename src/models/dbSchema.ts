import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database.
 * @param {string} mongoUri - The MongoDB connection URI.
 * @throws Will throw an error if the MongoDB URI is not set.
 */
const connectDb = async (mongoUri: string) => {
  if (!mongoUri) {
    throw new Error('❗ MongoDB URI is not set in environment variables');
  }
  try {
    await mongoose.connect(mongoUri, {
      // @ts-ignore stfu
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
};

export default connectDb;
