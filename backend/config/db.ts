import mongoose from 'mongoose';

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is missing. App will run in DEMO mode only (read-only for pre-seeded data).');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('--- DB Connected SUCCESSFULLY ---');
  } catch (err: any) {
    console.error('DB Connection Error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('The database server is unreachable at the provided address.');
    }
    process.exit(1);
  }
};
