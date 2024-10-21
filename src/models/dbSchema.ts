import mongoose from 'npm:mongoose';

const connectDb = async (mongoUri: string) => {
  if (!mongoUri) {
    throw new Error('MongoDB URI is not set in environment variables');
  }
  await mongoose.connect(mongoUri, {
    // @ts-ignore a
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB.');
};

export default connectDb;
