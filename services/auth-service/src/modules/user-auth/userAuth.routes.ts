import { Router } from 'express';
import { isAuthenticatedUser, validateBody } from '@repo/shared-middleware';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyUserSchema,
} from '@repo/shared-types';
import {
  forgotPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshToken,
  resetPassword,
  userRegistration,
  verifyUser,
} from './userAuth.controller.js';

const router: Router = Router();

router.post('/register', validateBody(RegisterSchema), userRegistration);
router.post('/verify-otp', validateBody(VerifyUserSchema), verifyUser);
router.post('/login', validateBody(LoginSchema), loginUser);
router.get('/refresh-token', refreshToken);
router.post('/forgot-password', validateBody(ForgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(ResetPasswordSchema), resetPassword);
router.post('/logout', isAuthenticatedUser, logoutUser);
router.get('/me', isAuthenticatedUser, getUserProfile);

export default router;
