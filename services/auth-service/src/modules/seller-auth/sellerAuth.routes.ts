import { Router } from 'express';
import { isAuthenticatedSeller, validateBody } from '@repo/shared-middleware';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSellerSchema,
  ResetPasswordSchema,
  VerifySellerSchema,
} from '@repo/shared-types';
import {
  createShop,
  getSellerProfile,
  loginSeller,
  logoutSeller,
  sellerForgotPassword,
  sellerRefreshToken,
  sellerRegistration,
  sellerResetPassword,
  verifySeller,
} from './sellerAuth.controller.js';

const router: Router = Router();

router.post('/register', validateBody(RegisterSellerSchema), sellerRegistration);
router.post('/verify-otp', validateBody(VerifySellerSchema), verifySeller);
router.post('/login', validateBody(LoginSchema), loginSeller);
router.get('/refresh-token', sellerRefreshToken);
router.post('/forgot-password', validateBody(ForgotPasswordSchema), sellerForgotPassword);
router.post('/reset-password', validateBody(ResetPasswordSchema), sellerResetPassword);
router.post('/logout', isAuthenticatedSeller, logoutSeller);
router.get('/me', isAuthenticatedSeller, getSellerProfile);
router.post('/create-shop', isAuthenticatedSeller, createShop);

export default router;
