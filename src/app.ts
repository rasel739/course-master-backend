import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import httpStatus from 'http-status';
import compression from 'compression';
import routes from './app/routes';
import config from './config';
import globalErrorHandler from './app/middlewares/globalErrorHandlar';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { sanitizeInputs } from './app/middlewares/sanitizeInputs';
import { initEmailService } from './utils/email.utils';

const app: Application = express();

// initEmailService();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (config.allowed_origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);
app.use(sanitizeInputs);
// import all routes
app.use('/api/v1', routes);

// helth check
app.use('/helth', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// global error handler
app.use(globalErrorHandler);

// handle not found routes
app.use((req: Request, res: Response) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'Resource Not Found',
      },
    ],
  });
});

export default app;
