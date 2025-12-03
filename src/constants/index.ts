import config from '../config';

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';

export const ENUM_USER_ROLE = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;
