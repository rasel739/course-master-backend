import { AuthValidation } from './auth.validation';
import { Router } from 'express';
import { authLimiter } from '../../../utils/rateLimiter.utils';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthController } from './auth.controller';
import { ENUM_USER_ROLE } from '../../../constants';

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

router.post(
  '/logout',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.STUDENT),
  AuthController.logout,
);

router.get(
  '/me',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.STUDENT),
  AuthController.getMe,
);
export const AuthRoutes = router;
