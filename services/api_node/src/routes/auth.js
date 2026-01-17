const express = require("express");
const {
  findUserByMobileRole,
  findUserByEmailRole,
  findUserById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken
} = require("../models/authModel");
const { createError } = require("../utils/errors");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../utils/tokens");
const env = require("../config/env");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000);

  await saveRefreshToken({ userId: user.id, tokenHash, expiresAt });

  return { accessToken, refreshToken };
};

const ensureActiveUser = (user) => {
  if (!user) {
    throw createError(401, "UNAUTHORIZED", "Invalid credentials");
  }
  if (user.status !== "ACTIVE") {
    throw createError(403, "USER_INACTIVE", "User is not active");
  }
};

router.post("/auth/login/customer", async (req, res, next) => {
  try {
    const { mobile, otp } = req.body || {};
    if (!mobile || !otp) {
      throw createError(400, "VALIDATION_ERROR", "Mobile and OTP are required");
    }
    if (otp !== "123456") {
      throw createError(401, "INVALID_CREDENTIALS", "Invalid OTP");
    }

    let user = await findUserByMobileRole(mobile, "CUSTOMER");
    if (!user) {
      user = await createUser({ mobile, role: "CUSTOMER" });
    }
    ensureActiveUser(user);

    const tokens = await issueTokens(user);
    return res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/login/agent", async (req, res, next) => {
  try {
    const { email, mobile, otp, password } = req.body || {};
    if (!email && !mobile) {
      throw createError(400, "VALIDATION_ERROR", "Email or mobile is required");
    }

    const otpValid = otp === "123456";
    const passwordValid = password === "password123";
    if (!otpValid && !passwordValid) {
      throw createError(401, "INVALID_CREDENTIALS", "Invalid OTP or password");
    }

    const user = email
      ? await findUserByEmailRole(email, "AGENT")
      : await findUserByMobileRole(mobile, "AGENT");
    ensureActiveUser(user);

    const tokens = await issueTokens(user);
    return res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/login/admin", async (req, res, next) => {
  try {
    const { email, password, otp } = req.body || {};
    if (!email || !password || !otp) {
      throw createError(400, "VALIDATION_ERROR", "Email, password, and OTP are required");
    }
    if (password !== "password123" || otp !== "123456") {
      throw createError(401, "INVALID_CREDENTIALS", "Invalid password or OTP");
    }

    const user = await findUserByEmailRole(email, "ADMIN");
    ensureActiveUser(user);

    const tokens = await issueTokens(user);
    return res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      throw createError(400, "VALIDATION_ERROR", "Refresh token is required");
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw createError(401, "UNAUTHORIZED", "Invalid or expired refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await findRefreshToken(tokenHash);
    if (!storedToken) {
      throw createError(401, "UNAUTHORIZED", "Refresh token not recognized");
    }
    if (new Date(storedToken.expires_at).getTime() < Date.now()) {
      await deleteRefreshToken(tokenHash);
      throw createError(401, "UNAUTHORIZED", "Refresh token expired");
    }

    const user = await findUserById(payload.sub);
    ensureActiveUser(user);

    await deleteRefreshToken(tokenHash);
    const tokens = await issueTokens(user);
    return res.status(200).json(tokens);
  } catch (error) {
    return next(error);
  }
});

router.post("/auth/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      throw createError(400, "VALIDATION_ERROR", "Refresh token is required");
    }
    const tokenHash = hashToken(refreshToken);
    await deleteRefreshToken(tokenHash);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/auth/admin-area", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
