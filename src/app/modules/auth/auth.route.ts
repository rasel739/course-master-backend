import { AuthValidation } from './auth.validation';
import { Router } from 'express';
import { authLimiter } from '../../../utils/rateLimiter.utils';
import validateRequest from '../../middlewares/validateRequest';

import { AuthController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.createUser,
);

router.post(
  '/login',
  authLimiter,
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken,
);

export const AuthRoutes = router;
