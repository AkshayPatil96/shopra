import { Request, Response, NextFunction, RequestHandler } from 'express';
import { asyncHandler } from '@repo/error-handler';
import { setCookie } from '../../infra/cookies.js';
import {
  requestSellerRegistration,
  verifySellerAccount,
  loginSellerAccount,
  refreshSellerSession,
  initiateSellerPasswordReset,
  resetSellerPassword,
  getSellerProfileData,
  createSellerShop,
} from './sellerAuth.service.js';

const setSellerAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  status: string
) => {
  setCookie(res, 'access_token_seller', tokens.accessToken);
  setCookie(res, 'refresh_token_seller', tokens.refreshToken);
  setCookie(res, 'seller_status', status);
};

export const sellerRegistration: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email } = req.body;

    await requestSellerRegistration({ name, email });

    res.status(200).json({ message: 'OTP sent to email. Please check your account.' });
  }
);

export const verifySeller: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, otp, password, name, phone, country } = req.body;

    const { seller, tokens } = await verifySellerAccount({ email, otp, password, name, phone, country });
    const tokenPayload = { accessToken: tokens.accessToken };

    setSellerAuthCookies(res, tokens, seller.status);

    res.status(201).json({
      status: 'success',
      message: 'Seller registered successfully',
      ...tokenPayload,
      data: seller,
    });
  }
);

export const loginSeller: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const { seller, tokens } = await loginSellerAccount({ email, password });
    const tokenPayload = { accessToken: tokens.accessToken };

    setSellerAuthCookies(res, tokens, seller.status);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      ...tokenPayload,
      data: {
        id: seller._id,
        email: seller.email,
        name: seller.name,
        phone: seller.phone,
        country: seller.country,
        status: seller.status,
      },
    });
  }
);

export const sellerRefreshToken: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    let refreshTokenValue: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      refreshTokenValue = authHeader.substring(7, authHeader.length);
    }

    if (!refreshTokenValue) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { seller, tokens } = await refreshSellerSession(refreshTokenValue);
    const tokenPayload = { accessToken: tokens.accessToken };

    setSellerAuthCookies(res, tokens, seller.status);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      ...tokenPayload,
      data: seller,
    });
  }
);

export const sellerForgotPassword: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;

    await initiateSellerPasswordReset(email);

    res.status(200).json({ message: 'OTP sent to email. Please check your account.' });
  }
);

export const sellerResetPassword: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, token, newPassword } = req.body;

    await resetSellerPassword({ email, token, newPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  }
);

export const getSellerProfile: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const sellerId = req.auth?.userId;
    const sellerData = await getSellerProfileData(sellerId);

    res.status(200).json({
      status: 'success',
      data: sellerData,
    });
  }
);

export const logoutSeller: RequestHandler = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const isProd = process.env.NODE_ENV === 'production';
    const baseCookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    } as const;

    res.cookie('access_token_seller', '', { ...baseCookieOptions, maxAge: 0 });
    res.cookie('refresh_token_seller', '', { ...baseCookieOptions, maxAge: 0 });
    res.cookie('seller_status', '', { ...baseCookieOptions, maxAge: 0 });
    res.clearCookie('access_token_seller', baseCookieOptions);
    res.clearCookie('refresh_token_seller', baseCookieOptions);
    res.clearCookie('seller_status', baseCookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }
);

export const createShop: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const sellerId = req.auth?.userId;

    const shopData = {
      name: req.body.name,
      bio: req.body.bio,
      address: req.body.address,
      opening_hours: req.body.opening_hours,
      category: req.body.category,
      website: req.body.website,
    } as Record<string, unknown>;

    const shop = await createSellerShop({ sellerId, shopData });

    res.status(201).json({
      status: 'success',
      message: 'Shop created successfully',
      data: shop,
    });
  }
);
