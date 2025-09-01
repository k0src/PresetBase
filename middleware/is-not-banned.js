export function checkUserBanned(req, res, next) {
  // Only check if user is authenticated
  if (req.user && req.user.banned === "t") {
    return res.status(403).json({
      error: {
        code: "USER_BANNED",
        message:
          "Your account has been banned. Please contact support for assistance.",
      },
    });
  }

  next();
}

export function requireNotBanned(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
      },
    });
  }

  if (req.user.banned === "t") {
    return res.status(403).json({
      error: {
        code: "USER_BANNED",
        message:
          "Your account has been banned. Please contact support for assistance.",
      },
    });
  }

  next();
}
