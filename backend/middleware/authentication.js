import CustomError from "../errors/index.js";

import { isTokenValid } from "../utils/jwt.js";


 export const authenticateUser = async(req, res, next) => {
    const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
}

export const authorizeRoles= (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError(
                'Unauthorized to access this route'
              );
        }
        next()
    }
}
