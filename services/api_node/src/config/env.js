const dotenv = require("dotenv");

dotenv.config();

const requiredVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
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
  DB_NAME: process.env.DB_NAME
};

module.exports = env;
