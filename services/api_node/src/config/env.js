const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const defaults = {
  PORT: '3000',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  DB_USER: 'root',
  DB_PASSWORD: '',
  DB_NAME: 'app'
};

const getEnvValue = (key) => {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }
  return defaults[key];
};

const requiredKeys = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
const missing = requiredKeys.filter((key) => {
  const value = isProduction ? process.env[key] : getEnvValue(key);
  return value === undefined || value === null || value === '';
});

if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const env = {
  port: Number(getEnvValue('PORT')),
  dbHost: getEnvValue('DB_HOST'),
  dbPort: Number(getEnvValue('DB_PORT')),
  dbUser: getEnvValue('DB_USER'),
  dbPassword: getEnvValue('DB_PASSWORD'),
  dbName: getEnvValue('DB_NAME')
};

module.exports = { env };
