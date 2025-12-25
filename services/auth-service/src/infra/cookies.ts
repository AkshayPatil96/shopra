import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: Partial<{ maxAge: number; path: string }> = {}
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: options?.maxAge ?? 7 * 24 * 60 * 60 * 1000,
    path: options?.path ?? '/',
  });
};
