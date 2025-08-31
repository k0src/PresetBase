import express from "express";
import User from "../../models/User.js";
import {
  generateTokenPair,
  verifyRefreshToken,
  verifyAccessToken,
} from "../../util/jwt.js";
import { authRateLimit } from "../../middleware/security.js";
import { authenticateToken } from "../../middleware/auth.js";
import TokenBlacklistManager from "../../models/TokenBlacklistManager.js";

const router = express.Router();

router.post("/register", authRateLimit, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: {
          code: "MISSING_FIELDS",
          message: "Username, email, and password are required",
        },
      });
    }

    const user = await User.create({ username, email, password });

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timestamp: user.timestamp,
      },
      ...tokens,
    });
  } catch (err) {
    console.error("Registration error:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        error: {
          code: "USER_EXISTS",
          message: "Username or email already in use",
        },
      });
    }

    return res.status(400).json({
      error: {
        code: "REGISTRATION_FAILED",
        message: err.message,
      },
    });
  }
});

router.post("/login", authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: "MISSING_CREDENTIALS",
          message: "Email and password are required",
        },
      });
    }

    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const isValidPassword = await User.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: {
        code: "LOGIN_FAILED",
        message: "Failed to authenticate user",
      },
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: "MISSING_REFRESH_TOKEN",
          message: "Refresh token is required",
        },
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (await TokenBlacklistManager.isBlacklisted(decoded.jti)) {
      return res.status(401).json({
        error: {
          code: "TOKEN_REVOKED",
          message: "Refresh token has been revoked",
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

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    res.json({
      message: "Token refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    let errorCode = "TOKEN_REFRESH_FAILED";
    let statusCode = 500;

    if (error.message.includes("expired")) {
      errorCode = "REFRESH_TOKEN_EXPIRED";
      statusCode = 401;
    } else if (error.message.includes("Invalid")) {
      errorCode = "INVALID_REFRESH_TOKEN";
      statusCode = 401;
    }

    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: error.message,
      },
    });
  }
});

router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: "MISSING_REFRESH_TOKEN",
          message: "Refresh token is required",
        },
      });
    }

    const decodedAccess = verifyAccessToken(req.token);
    const decodedRefresh = verifyRefreshToken(refreshToken);

    await TokenBlacklistManager.addToBlacklist(
      decodedAccess.jti,
      new Date(decodedAccess.exp * 1000)
    );
    await TokenBlacklistManager.addToBlacklist(
      decodedRefresh.jti,
      new Date(decodedRefresh.exp * 1000)
    );

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      error: {
        code: "LOGOUT_FAILED",
        message: "Failed to logout user",
      },
    });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timestamp: user.timestamp,
        authenticated_with: user.authenticated_with,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      error: {
        code: "PROFILE_FETCH_FAILED",
        message: "Failed to fetch user profile",
      },
    });
  }
});

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: {
          code: "NO_UPDATES",
          message: "No valid fields to update",
        },
      });
    }

    const updatedUser = await User.update(req.user.id, updates);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        updated_at: updatedUser.updated_at,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        error: {
          code: "USER_EXISTS",
          message: "Username or email already in use",
        },
      });
    }

    return res.status(400).json({
      error: {
        code: "PROFILE_UPDATE_FAILED",
        message: err.message,
      },
    });
  }
});

router.put("/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          code: "MISSING_PASSWORDS",
          message: "Current password and new password are required",
        },
      });
    }

    const user = await User.getById(req.user.id);
    const isValidPassword = await User.verifyPassword(
      currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          code: "INVALID_CURRENT_PASSWORD",
          message: "Current password is incorrect",
        },
      });
    }

    await User.updatePassword(req.user.id, newPassword);

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);

    res.status(500).json({
      error: {
        code: "PASSWORD_UPDATE_FAILED",
        message: "Failed to update password",
      },
    });
  }
});

// update user profile

// const passport = require("passport");

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//   }),
//   (req, res) => {
//     res.redirect("/");
//   }
// );

// router.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) console.error(err);
//     req.session.destroy(() => res.redirect("/"));
//   });
// });

export default router;
