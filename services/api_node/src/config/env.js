const dotenv = require("dotenv");

dotenv.config();

const requiredVars = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];
const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_TTL_SECONDS: process.env.ACCESS_TOKEN_TTL_SECONDS
    ? Number(process.env.ACCESS_TOKEN_TTL_SECONDS)
    : 900,
  REFRESH_TOKEN_TTL_SECONDS: process.env.REFRESH_TOKEN_TTL_SECONDS
    ? Number(process.env.REFRESH_TOKEN_TTL_SECONDS)
    : 60 * 60 * 24 * 7
};

module.exports = env;
