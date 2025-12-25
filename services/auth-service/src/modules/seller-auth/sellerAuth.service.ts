import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JsonWebTokenError, ValidationError } from '@repo/error-handler';
import { sendMail } from '@repo/shared-email';
import {
  ensureSellerOtpRequestAllowed,
  trackSellerOtpRequest,
  storeSellerOtp,
  validateSellerOtp,
  storeSellerPasswordResetToken,
  verifySellerPasswordResetToken,
} from './sellerAuth.cache.js';
import {
  createSeller,
  findSellerByEmail,
  findSellerByEmailWithPassword,
  findSellerById,
  updateSellerPassword,
  aggregateSellerProfile,
  createShopRecord,
} from '../../repositories/seller.repository.js';
import { issueAuthTokens, verifyRefreshToken } from '../../infra/jwt.js';

const SELLER_FRONTEND_URL = process.env.SELLER_FRONTEND_URL || 'http://localhost:8001';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const formatName = (name?: string) => `${name || ''}`.trim();


export const requestSellerRegistration = async ({ name, email }: { name: string; email: string }) => {
  const existingSeller = await findSellerByEmail(email);

  if (existingSeller) {
    throw new ValidationError('Email is already registered as seller');
  }

  await ensureSellerOtpRequestAllowed(email);
  await trackSellerOtpRequest(email);

  const otp = generateOtp();

  await sendMail({
    email,
    subject: 'Welcome! Activate Your Account',
    template: 'seller-activation-mail.ejs',
    data: { user: { name: formatName(name) }, otp },
  });

  await storeSellerOtp(email, otp);
};

export const verifySellerAccount = async ({
  email,
  otp,
  password,
  name,
  phone,
  country,
}: {
  email: string;
  otp: string;
  password: string;
  name: string;
  phone?: string;
  country?: string;
}) => {
  await validateSellerOtp(email, otp);

  const hashedPassword = await bcrypt.hash(password, 10);
  const seller = await createSeller({ email, name, password: hashedPassword, phone, country });
  const tokens = issueAuthTokens(seller._id.toString(), 'seller');

  return { seller, tokens, role: 'seller' as const };
};

export const loginSellerAccount = async ({ email, password }: { email: string; password: string }) => {
  const seller = await findSellerByEmailWithPassword(email);

  if (!seller) {
    throw new ValidationError('Invalid email or password');
  }

  if (seller.password) {
    const isPasswordValid = await bcrypt.compare(password, seller.password);

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }
  }

  const tokens = issueAuthTokens(seller._id.toString(), 'seller');

  return { seller, tokens, role: 'seller' as const };
};

export const refreshSellerSession = async (token?: string) => {
  if (!token) {
    throw new JsonWebTokenError('Invalid or expired refresh token');
  }

  const decoded = verifyRefreshToken(token);

  if (!decoded?.sub) {
    throw new JsonWebTokenError('Invalid or expired refresh token');
  }

  const seller = await findSellerById(decoded.sub);

  if (!seller) {
    throw new ValidationError('Seller not found');
  }

  const tokens = issueAuthTokens(seller._id.toString(), 'seller');

  return { seller, tokens, role: 'seller' as const };
};

export const initiateSellerPasswordReset = async (email: string) => {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  const seller = await findSellerByEmail(email);

  if (!seller) {
    throw new ValidationError('No user found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  await ensureSellerOtpRequestAllowed(email);
  await trackSellerOtpRequest(email);
  const resetUrl = `${SELLER_FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  await sendMail({
    email,
    subject: 'Reset Your Password',
    template: 'forgot-password.ejs',
    data: { user: { name: formatName(seller.name) }, resetUrl },
  });

  await storeSellerPasswordResetToken(email, resetToken);
};

export const resetSellerPassword = async ({
  email,
  token,
  newPassword,
}: {
  email: string;
  token: string;
  newPassword: string;
}) => {
  const seller = await findSellerByEmailWithPassword(email);

  if (!seller) {
    throw new ValidationError('No seller found with this email');
  }

  const isSamePassword = await bcrypt.compare(newPassword, seller.password || '');

  if (isSamePassword) {
    throw new ValidationError('New password must be different from the old password');
  }

  await verifySellerPasswordResetToken(email, token);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateSellerPassword(email, hashedPassword);
};

export const getSellerProfileData = async (sellerId?: string) => {
  if (!sellerId) {
    throw new ValidationError('Seller not authenticated');
  }

  const sellerData = await aggregateSellerProfile(sellerId);

  if (!sellerData) {
    throw new ValidationError('Seller not authenticated');
  }

  return sellerData;
};

export const createSellerShop = async ({
  sellerId,
  shopData,
}: {
  sellerId?: string;
  shopData: Record<string, unknown>;
}) => {
  if (!sellerId) {
    throw new ValidationError('Seller not authenticated');
  }

  const data = { ...shopData, sellerId };

  return createShopRecord(data);
};
