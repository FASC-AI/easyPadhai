import mongoose from 'mongoose';
import logger from '../core/logger.js';
import config from '../config/index.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    logger.info('Connected to MongoDB', config);
  } catch (err) {
    logger.error('Error connecting to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
