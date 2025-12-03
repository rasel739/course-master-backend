import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  allowed_origins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ],
  admin_registration_key: process.env.ADMIN_REGISTRATION_KEY || 'rasel739',
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
  email: {
    email_user: process.env.EMAIL_USER,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    google_refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
};
