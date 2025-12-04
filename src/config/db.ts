import mongoose from 'mongoose';
import config from './index';
import Course from '../app/modules/course/course.model';
import User from '../app/modules/auth/auth.model';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database_url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await createIndexes();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : ' MongoDB Connection Error';
    console.error(errorMessage);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    await Course.collection.createIndex({ title: 'text', description: 'text' });
    await Course.collection.createIndex({ category: 1, price: 1 });
    await User.collection.createIndex({ email: 1 }, { unique: true });

    console.log('Database indexes created');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : ' Index creation error';
    console.error(errorMessage);
  }
};
