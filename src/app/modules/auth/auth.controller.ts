import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { AuthService } from './auth.service';
import config from '../../../config';
import sendResponse from '../../../shared/sendResponse';
import { isProduction } from '../../../constants';
import { IRefreshTokenResponse, IRegisterResponse } from './auth.type';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.createUser(req.body);

  const { refreshToken } = result;
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRegisterResponse>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Registration successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  const { refreshToken } = result;

  const cookieOptions = {
    secure: isProduction,
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRegisterResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'login successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  const cookieOptions = {
    secure: isProduction,
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'login successfully',
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  if (userId) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logout successful',
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  const result = await AuthService.getMe(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

export const AuthController = {
  createUser,
  loginUser,
  refreshToken,
  logout,
  getMe,
};
