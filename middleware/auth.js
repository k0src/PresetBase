import { verifyAccessToken, extractTokenFromHeader } from "../util/jwt.js";
import User from "../models/User.js";
import TokenBlacklistManager from "../models/TokenBlacklistManager.js";

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: {
          code: "MISSING_TOKEN",
          message: "Access token is required",
        },
      });
    }

    const decoded = verifyAccessToken(token);
    if (await TokenBlacklistManager.isBlacklisted(decoded.jti)) {
      return res.status(401).json({
        error: {
          code: "TOKEN_REVOKED",
          message: "Access token has been revoked",
        },
      });
    }

    const user = await User.getById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    req.token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    let errorCode = "AUTHENTICATION_FAILED";
    let statusCode = 401;

    if (error.message === "Access token expired") {
      errorCode = "TOKEN_EXPIRED";
    } else if (error.message === "Invalid access token") {
      errorCode = "INVALID_TOKEN";
    }

    return res.status(statusCode).json({
      error: {
        code: errorCode,
        message: error.message,
      },
    });
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      },
    });
  }
  next();
}

export function requireOwnership(resourceIdParam = "id") {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Authentication required",
        },
      });
    }

    next();
  };
}

export function getUserRateLimitKey(req) {
  if (req.user) {
    return `user:${req.user.id}`;
  }
  return req.ip || req.connection.remoteAddress;
}

export function csrfProtection(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"] || req.body._csrf;
  const sessionToken = req.headers["x-session-token"];

  if (!csrfToken || !sessionToken) {
    return res.status(403).json({
      error: {
        code: "CSRF_TOKEN_MISSING",
        message: "CSRF token is required",
      },
    });
  }

  // Simple CSRF validation - in production, use a more robust method
  if (csrfToken !== sessionToken) {
    return res.status(403).json({
      error: {
        code: "CSRF_TOKEN_INVALID",
        message: "Invalid CSRF token",
      },
    });
  }

  next();
}

export function generateCSRFToken(req) {
  // Simple implementation - in production, use crypto.randomBytes
  return Buffer.from(`${req.user?.id || "anonymous"}:${Date.now()}`).toString(
    "base64"
  );
}
