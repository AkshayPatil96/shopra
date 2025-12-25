import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";

/**
 * Roles encoded in JWT
 */
export type AuthRole = "user" | "seller";

/**
 * Payload stored inside tokens
 * (keep minimal & stable)
 */
interface TokenPayload {
  sub: string; // userId
  role: AuthRole;
  iss: string;
  aud: string;
}

/**
 * Lazily read env vars (NEVER at import time)
 */
const getEnv = (
  key: string,
  transform?: (value: string) => string
): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key} for JWT signing`);
  }
  return transform ? transform(value) : value;
};

/**
 * Lazily build signing + verification config
 */
const buildJwtConfig = () => {
  const privateKey = getEnv("JWT_PRIVATE_KEY", (key) =>
    key.replace(/\\n/g, "\n")
  );

  const issuer = getEnv("JWT_ISSUER");
  const audience = getEnv("JWT_AUDIENCE");

  const accessTokenTtl = (process.env.JWT_ACCESS_TTL ??
    "15m") as any;

  const refreshTokenTtl = (process.env.JWT_REFRESH_TTL ??
    "7d") as any;

  const signOptions: SignOptions = {
    algorithm: "RS256",
    issuer,
    audience,
  };

  const verifyOptions: VerifyOptions = {
    algorithms: ["RS256"],
    issuer,
    audience,
  };

  return {
    privateKey,
    issuer,
    audience,
    accessTokenTtl,
    refreshTokenTtl,
    signOptions,
    verifyOptions,
  };
};

/**
 * Cache config after first access
 * (env is immutable at runtime)
 */
let cachedConfig: ReturnType<typeof buildJwtConfig> | null = null;

const getJwtConfig = () => {
  if (!cachedConfig) {
    cachedConfig = buildJwtConfig();
  }
  return cachedConfig;
};

/**
 * Low-level signer (internal use only)
 */
const signToken = (
  userId: string,
  role: AuthRole,
  expiresIn: any
): string => {
  const { privateKey, signOptions } = getJwtConfig();

  return jwt.sign(
    { sub: userId, role },
    privateKey as jwt.PrivateKey,
    {
      ...signOptions,
      expiresIn,
    }
  );
};

/**
 * Generate short-lived access token
 */
export const generateAccessToken = (
  userId: string,
  role: AuthRole
): string => {
  const { accessTokenTtl } = getJwtConfig();
  return signToken(userId, role, accessTokenTtl);
};

/**
 * Generate long-lived refresh token
 * (auth-service ONLY)
 */
export const generateRefreshToken = (
  userId: string,
  role: AuthRole
): string => {
  const { refreshTokenTtl } = getJwtConfig();
  return signToken(userId, role, refreshTokenTtl);
};

/**
 * Verify refresh token
 * (auth-service ONLY)
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  if (!token) {
    throw new Error("Refresh token is required");
  }

  const { privateKey, verifyOptions } = getJwtConfig();

  const payload = jwt.verify(token, privateKey, verifyOptions) as any;

  if (!payload?.sub || !payload?.role) {
    throw new Error("Invalid refresh token payload");
  }

  return payload;
};

/**
 * Convenience helper used by login / refresh flows
 */
export const issueAuthTokens = (
  userId: string,
  role: AuthRole
) => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId, role),
});
