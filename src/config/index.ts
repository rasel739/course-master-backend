import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
  default_student_pass: process.env.DEFAULT_STUDENT_PASS,
  default_admin_pass: process.env.DEFAULT_ADMIN_PASS,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  allowed_origins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ],
  jwt: {
    secret: process.env.JWT_SECRET || 'demo123',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'demo123',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '365d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    expires_in: process.env.REDIS_TOKEN_EXPIRES_IN || '7d',
  },
  email: process.env.EMAIL,
  appPass: process.env.APP_PASS,
};
