import { ValidationError } from '@repo/error-handler';
import { redisClient } from '../../cache/index.js';

const sellerKey = (type: string, email: string) => `seller-auth:${type}:${email}`;

export const ensureSellerOtpRequestAllowed = async (email: string) => {
  if (await redisClient.get(sellerKey('otp_lock', email))) {
    throw new ValidationError('Too many failed OTP attempts. Please try again later!');
  }
  if (await redisClient.get(sellerKey('otp_spam_lock', email))) {
    throw new ValidationError('Too many OTP requests. Please try again later!');
  }
  if (await redisClient.get(sellerKey('otp_cooldown', email))) {
    throw new ValidationError('Please wait 1 minute before requesting a new OTP!');
  }
};

export const trackSellerOtpRequest = async (email: string) => {
  const key = sellerKey('otp_request_count', email);
  const attempts = parseInt((await redisClient.get(key)) || '0', 10);

  if (attempts >= 5) {
    await redisClient.set(sellerKey('otp_spam_lock', email), 'true', 'EX', 15 * 60);
    throw new ValidationError('Too many OTP requests. Please try again after 15 minutes!');
  }

  await redisClient.set(key, String(attempts + 1), 'EX', 15 * 60);
};

export const storeSellerOtp = async (email: string, otp: string) => {
  await redisClient.set(sellerKey('otp', email), otp, 'EX', 10 * 30);
  await redisClient.set(sellerKey('otp_cooldown', email), 'true', 'EX', 2 * 60);
};

export const validateSellerOtp = async (email: string, otp: string) => {
  const storedOtp = await redisClient.get(sellerKey('otp', email));

  if (!storedOtp) {
    throw new ValidationError('OTP has expired. Please request a new one.');
  }

  const failedKey = sellerKey('otp_attempts', email);
  const failedAttempts = parseInt((await redisClient.get(failedKey)) || '0', 10);

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redisClient.set(sellerKey('otp_lock', email), 'true', 'EX', 15 * 60);
      await redisClient.del(sellerKey('otp', email));
      throw new ValidationError('Too many failed OTP attempts. Please try again after 15 minutes!');
    }

    await redisClient.set(failedKey, String(failedAttempts + 1), 'EX', 5 * 60);
    throw new ValidationError(`Invalid OTP. You have ${2 - failedAttempts} attempts left.`);
  }

  await redisClient.del(sellerKey('otp', email));
  await redisClient.del(failedKey);
};

export const storeSellerPasswordResetToken = async (email: string, token: string) => {
  await redisClient.set(sellerKey('password_reset', email), token, 'EX', 10 * 60);
};

export const verifySellerPasswordResetToken = async (email: string, token: string) => {
  const storedToken = await redisClient.get(sellerKey('password_reset', email));

  if (!storedToken || storedToken !== token) {
    throw new ValidationError('Invalid or expired password reset token');
  }

  await redisClient.del(sellerKey('password_reset', email));
};
