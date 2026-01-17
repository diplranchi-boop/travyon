const pool = require("../db");

const findUserByMobileRole = async (mobile, role) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE mobile = ? AND role = ? LIMIT 1",
    [mobile, role]
  );
  return rows[0];
};

const findUserByEmailRole = async (email, role) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND role = ? LIMIT 1", [
    email,
    role
  ]);
  return rows[0];
};

const findUserById = async (userId) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows[0];
};

const createUser = async ({ email, mobile, role }) => {
  const [result] = await pool.query(
    "INSERT INTO users (email, mobile, role) VALUES (?, ?, ?)",
    [email || null, mobile || null, role]
  );
  return findUserById(result.insertId);
};

const saveRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt]
  );
};

const findRefreshToken = async (tokenHash) => {
  const [rows] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
    [tokenHash]
  );
  return rows[0];
};

const deleteRefreshToken = async (tokenHash) => {
  await pool.query("DELETE FROM refresh_tokens WHERE token_hash = ?", [tokenHash]);
};

module.exports = {
  findUserByMobileRole,
  findUserByEmailRole,
  findUserById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken
};
