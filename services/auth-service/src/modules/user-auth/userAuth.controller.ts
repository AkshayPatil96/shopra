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

const isProd = process.env.NODE_ENV === 'production';

const setUserAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  status: string
) => {
  // Access token — SHORT lived
  setCookie(res, 'access_token_user', tokens.accessToken, {
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  // Refresh token — LONG lived & restricted
  setCookie(res, 'refresh_token_user', tokens.refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth', // very important
  });

  // Status cookie (non-sensitive)
  res.cookie('user_status', status, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
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

    // Access token cookie (path=/)
    res.clearCookie('access_token_user', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    // Refresh token cookie (path=/api/auth)
    res.clearCookie('refresh_token_user', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/api/auth',
    });

    // Non-httpOnly cookie
    res.clearCookie('user_status', {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);
