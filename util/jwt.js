import jwt from "jsonwebtoken";
import crypto from "crypto";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function generateAccessToken(payload) {
  if (!payload.userId || !payload.email) {
    throw new Error("userId and email are required for access token");
  }

  const jti = crypto.randomBytes(16).toString("hex");

  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: "access",
      jti,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "presetbase",
      audience: "presetbase-users",
    }
  );

  return { token, jti };
}

export function generateRefreshToken(payload) {
  if (!payload.userId) {
    throw new Error("userId is required for refresh token");
  }

  const jti = crypto.randomBytes(16).toString("hex");

  const token = jwt.sign(
    {
      userId: payload.userId,
      type: "refresh",
      jti,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "presetbase",
      audience: "presetbase-users",
    }
  );

  return { token, jti };
}

export function verifyAccessToken(token) {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "presetbase",
      audience: "presetbase-users",
    });

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw error;
  }
}

export function verifyRefreshToken(token) {
  if (!token) {
    throw new Error("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: "presetbase",
      audience: "presetbase-users",
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

export function generateTokenPair(payload) {
  const { token: accessToken, jti: accessJti } = generateAccessToken(payload);
  const { token: refreshToken, jti: refreshJti } = generateRefreshToken({
    userId: payload.userId,
  });

  return {
    accessToken,
    refreshToken,
    accessJti,
    refreshJti,
    expiresIn: JWT_EXPIRES_IN,
  };
}

export function decodeToken(token) {
  return jwt.decode(token);
}

export function isTokenExpired(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function getTokenExpiration(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}
