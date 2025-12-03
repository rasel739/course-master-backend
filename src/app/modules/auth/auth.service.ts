import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import User from './auth.model';
import {
  ILogin,
  IRefreshTokenResponse,
  IRegister,
  IRegisterResponse,
} from './auth.type';
import config from '../../../config';
import { isDevelopment } from '../../../constants';
import { jwtUtils } from '../../../utils/jwt.utils';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { sendEmail } from '../../../utils/email.utils';

const createUser = async (payload: IRegister): Promise<IRegisterResponse> => {
  const { name, email, password, registrationKey } = payload;
  const isUserExists = await User.findOne({ email: payload?.email });

  if (isUserExists) {
    throw new ApiError(
      httpStatus.CONFLICT,
      isDevelopment ? 'Email already exists' : 'Unable to process your request',
    );
  }

  payload.role = 'student';
  if (registrationKey === config.admin_registration_key) {
    payload.role = 'admin';
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: payload.role,
  });

  const accessToken = jwtUtils.createToken(
    { userId: newUser._id, role: newUser.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtUtils.createToken(
    { userId: newUser._id, role: newUser.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  // sendEmail(newUser.email, newUser.name);

  return {
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: ILogin): Promise<IRegisterResponse> => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid login credentials');
  }

  const accessToken = jwtUtils.createToken(
    { userId: user._id, role: user.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtUtils.createToken(
    { userId: user._id, role: user.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken: JwtPayload | null;
  try {
    verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { userId } = verifiedToken;

  const isUserExist = await User.findOne({ _id: userId });
  if (!isUserExist) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const newAccessToken = jwtUtils.createToken(
    {
      id: isUserExist._id,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthService = {
  createUser,
  loginUser,
  refreshToken,
};
