import { ValidationError } from '@repo/error-handler';
import { redisClient } from '../../cache/index.js';

const userKey = (type: string, email: string) => `user-auth:${type}:${email}`;

export const ensureUserOtpRequestAllowed = async (email: string) => {
  if (await redisClient.get(userKey('otp_lock', email))) {
    throw new ValidationError('Too many failed OTP attempts. Please try again later!');
  }
  if (await redisClient.get(userKey('otp_spam_lock', email))) {
    throw new ValidationError('Too many OTP requests. Please try again later!');
  }
  if (await redisClient.get(userKey('otp_cooldown', email))) {
    throw new ValidationError('Please wait 1 minute before requesting a new OTP!');
  }
};

export const trackUserOtpRequest = async (email: string) => {
  const key = userKey('otp_request_count', email);
  const attempts = parseInt((await redisClient.get(key)) || '0', 10);

  if (attempts >= 5) {
    await redisClient.set(userKey('otp_spam_lock', email), 'true', 'EX', 15 * 60);
    throw new ValidationError('Too many OTP requests. Please try again after 15 minutes!');
  }

  await redisClient.set(key, String(attempts + 1), 'EX', 15 * 60);
};

export const storeUserOtp = async (email: string, otp: string) => {
  await redisClient.set(userKey('otp', email), otp, 'EX', 10 * 30);
  await redisClient.set(userKey('otp_cooldown', email), 'true', 'EX', 2 * 60);
};

export const validateUserOtp = async (email: string, otp: string) => {
  const storedOtp = await redisClient.get(userKey('otp', email));

  if (!storedOtp) {
    throw new ValidationError('OTP has expired. Please request a new one.');
  }

  const failedKey = userKey('otp_attempts', email);
  const failedAttempts = parseInt((await redisClient.get(failedKey)) || '0', 10);

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redisClient.set(userKey('otp_lock', email), 'true', 'EX', 15 * 60);
      await redisClient.del(userKey('otp', email));
      throw new ValidationError('Too many failed OTP attempts. Please try again after 15 minutes!');
    }

    await redisClient.set(failedKey, String(failedAttempts + 1), 'EX', 5 * 60);
    throw new ValidationError(`Invalid OTP. You have ${2 - failedAttempts} attempts left.`);
  }

  await redisClient.del(userKey('otp', email));
  await redisClient.del(failedKey);
};

export const storeUserPasswordResetToken = async (email: string, token: string) => {
  await redisClient.set(userKey('password_reset', email), token, 'EX', 10 * 60);
};

export const verifyUserPasswordResetToken = async (email: string, token: string) => {
  const storedToken = await redisClient.get(userKey('password_reset', email));

  if (!storedToken || storedToken !== token) {
    throw new ValidationError('Invalid or expired password reset token');
  }

  await redisClient.del(userKey('password_reset', email));
};
