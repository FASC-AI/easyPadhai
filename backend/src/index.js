import config from './config/index.js';
import logger from './core/logger.js';
import { createServer } from './core/server.js';
import connectDB from './utils/db.js';
import dotenv from 'dotenv';

dotenv.config();

// connect db
connectDB();

const port = config.port || 3000;
const server = createServer();

server.listen(port, () => {
  logger.info(`api running on ${port}`);
});
