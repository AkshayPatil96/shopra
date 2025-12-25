import { Request, Response, NextFunction, RequestHandler } from 'express';
import { asyncHandler } from '@repo/error-handler';
import { setCookie } from '../../infra/cookies.js';
import {
  requestUserRegistration,
  verifyUserAccount,
  loginUserAccount,
  refreshUserSession,
  initiateUserPasswordReset,
  resetUserPassword,
  getUserProfileData,
} from './userAuth.service.js';

const setUserAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  status: string
) => {
  setCookie(res, 'access_token_user', tokens.accessToken);
  setCookie(res, 'refresh_token_user', tokens.refreshToken);
  setCookie(res, 'user_status', status);
};

export const userRegistration: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, name } = req.body;

    await requestUserRegistration({ email, name });

    res.status(200).json({ message: 'OTP sent to email. Please check your account.' });
  }
);

export const verifyUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp, password, name } = req.body;

    const { user, tokens } = await verifyUserAccount({ email, otp, password, name });
    const tokenPayload = { accessToken: tokens.accessToken };

    setUserAuthCookies(res, tokens, user.status);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      ...tokenPayload,
      data: user,
    });
  }
);

export const loginUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const { user, tokens } = await loginUserAccount({ email, password });
    const tokenPayload = { accessToken: tokens.accessToken };

    setUserAuthCookies(res, tokens, user.status);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      ...tokenPayload,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });
  }
);

export const refreshToken: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    let refreshTokenValue: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      refreshTokenValue = authHeader.substring(7, authHeader.length);
    }

    if (!refreshTokenValue) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { user, tokens } = await refreshUserSession(refreshTokenValue);
    const tokenPayload = { accessToken: tokens.accessToken };

    setUserAuthCookies(res, tokens, user.status);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      ...tokenPayload,
      data: { ...user },
    });
  }
);

export const forgotPassword: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    await initiateUserPasswordReset(email);

    res.status(200).json({ message: 'OTP sent to email. Please check your account.' });
  }
);

export const resetPassword: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, token, newPassword } = req.body;

    await resetUserPassword({ email, token, newPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  }
);

export const getUserProfile: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.auth?.userId;
    const userData = await getUserProfileData(userId);

    res.status(200).json({
      status: 'success',
      data: userData,
    });
  }
);

export const logoutUser: RequestHandler = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const isProd = process.env.NODE_ENV === 'production';
    const baseCookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    } as const;

    res.cookie('access_token_user', '', { ...baseCookieOptions, maxAge: 0 });
    res.cookie('refresh_token_user', '', { ...baseCookieOptions, maxAge: 0 });
    res.cookie('user_status', '', { ...baseCookieOptions, maxAge: 0 });
    res.clearCookie('access_token_user', baseCookieOptions);
    res.clearCookie('refresh_token_user', baseCookieOptions);
    res.clearCookie('user_status', baseCookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);
