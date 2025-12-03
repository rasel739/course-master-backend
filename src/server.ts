import app from './app';
import config from './config';
import { connectDB } from './config/db';

const server = app.listen(config.port, async () => {
  connectDB();
  console.log(`Application is running on port ${config.port}`);
});

const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');

  server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});
