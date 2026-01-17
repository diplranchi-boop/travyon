const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: String(user.id),
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS
  });

const signRefreshToken = (user) =>
  jwt.sign({ role: user.role }, env.JWT_REFRESH_SECRET, {
    subject: String(user.id),
    expiresIn: env.REFRESH_TOKEN_TTL_SECONDS
  });

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
