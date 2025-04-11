import CustomError from "../errors/index.js";
import { isTokenValid } from '../utils/jwt.js';
import { StatusCodes } from 'http-status-codes';

export const authenticateUser = async (req, res, next) => {
  // Try to get token from signed cookies
  const token = req.signedCookies.token;
  
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication Invalid - No token provided' });
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    
    req.user = { name, userId, role };
    
    next();
  } catch (error) {
    console.error('Token validation error:', error.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication Invalid - Token validation failed' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        msg: 'Unauthorized to access this route',
      });
    }
    next();
  };
};
