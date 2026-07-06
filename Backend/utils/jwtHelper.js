import jwt from 'jsonwebtoken';

const FALLBACK_SECRET = 'qasr_elibas_dev_secret_change_in_production';

export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET not set — using development fallback. Set JWT_SECRET in production.');
  }
  return process.env.JWT_SECRET || FALLBACK_SECRET;
};

export const signToken = (payload, expiresIn = '30d') =>
  jwt.sign(payload, getJwtSecret(), { expiresIn });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());
