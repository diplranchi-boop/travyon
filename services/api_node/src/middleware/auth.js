const { createError } = require("../utils/errors");
const { verifyAccessToken } = require("../utils/tokens");
const { findUserById } = require("../models/authModel");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      throw createError(401, "UNAUTHORIZED", "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      throw createError(401, "UNAUTHORIZED", "Invalid or expired access token");
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      throw createError(401, "UNAUTHORIZED", "User not found");
    }
    if (user.status !== "ACTIVE") {
      throw createError(403, "USER_INACTIVE", "User is not active");
    }

    req.user = user;
    req.tokenPayload = payload;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(createError(401, "UNAUTHORIZED", "Missing authenticated user"));
  }
  if (!roles.includes(req.user.role)) {
    return next(createError(403, "FORBIDDEN", "Insufficient role"));
  }
  return next();
};

const allowRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return next(createError(401, "UNAUTHORIZED", "Missing authenticated user"));
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    return next(createError(500, "ROLE_CONFIG_ERROR", "No roles configured"));
  }
  if (!roles.includes(req.user.role)) {
    return next(createError(403, "FORBIDDEN", "Insufficient role"));
  }
  return next();
};

module.exports = {
  requireAuth,
  requireRole,
  allowRole
};
