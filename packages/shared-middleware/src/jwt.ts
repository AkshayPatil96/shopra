import jwt, { type VerifyOptions } from "jsonwebtoken";

/**
 * Roles allowed in JWT
 */
export type AuthRole = "user" | "seller";

/**
 * Shape of access token payload
 * (keep this SMALL and STABLE)
 */
export interface AccessTokenPayload {
  sub: string; // userId
  role: AuthRole;
  iss: string;
  aud: string;
}

/**
 * Lazily read env variables.
 * NEVER read process.env at module top-level.
 */
const getEnv = (
  key: string,
  transform?: (value: string) => string
): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Missing environment variable ${key} for JWT verification`
    );
  }

  return transform ? transform(value) : value;
};

/**
 * Lazily build JWT verification config.
 * This runs ONLY at request time.
 */
const buildVerifyConfig = () => {
  const publicKey = getEnv("JWT_PUBLIC_KEY", (key) =>
    // handle multiline RSA keys in .env
    key.replace(/\\n/g, "\n")
  );

  const issuer = getEnv("JWT_ISSUER");
  const audience = getEnv("JWT_AUDIENCE");

  const options: VerifyOptions = {
    algorithms: ["RS256"],
    issuer,
    audience,
  };

  return { publicKey, options };
};

/**
 * Optional: cache config after first use
 * (avoids re-reading env on every request)
 */
let cachedConfig: ReturnType<typeof buildVerifyConfig> | null = null;

const getVerifyConfig = () => {
  if (!cachedConfig) {
    cachedConfig = buildVerifyConfig();
  }
  return cachedConfig;
};

/**
 * Verify access token (RS256, public key)
 * Used ONLY by API Gateway / shared middleware
 */
export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  if (!token) {
    throw new Error("Access token is required");
  }

  const { publicKey, options } = getVerifyConfig();

  const payload = jwt.verify(
    token,
    publicKey,
    options
  ) as AccessTokenPayload;

  if (!payload?.sub || !payload?.role) {
    throw new Error("Invalid access token payload");
  }

  return payload;
};
