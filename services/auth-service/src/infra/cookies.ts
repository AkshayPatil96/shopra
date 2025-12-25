import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: Partial<{
    maxAge: number;
    path: string;
    sameSite: 'lax' | 'none' | 'strict';
  }> = {}
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: options.sameSite ?? (isProd ? 'none' : 'lax'),
    maxAge: options.maxAge,
    path: options.path ?? '/',
  });
};
