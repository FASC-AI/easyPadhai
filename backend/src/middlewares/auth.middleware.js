import User from '../api/v1/User/user.model.js';
import jwtUtils from '../utils/jwtHelper.js';
import CookieService from '../services/cookie.service.js';
import createResponse from '../utils/response.js';

// eslint-disable-next-line consistent-return
const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      token = CookieService.getCookie(req, 'token');
    }

    if (!token) {
      return createResponse({
        res,
        statusCode: 401,
        status: false,
        message: 'Authorization token is missing',
      });
    }

    const decoded = jwtUtils.verifyToken(token);

    if (!decoded) {
      // throw new Error('Invalid token');
      return createResponse({
        res,
        statusCode: 401,
        status: false,
        message: 'Invalid token',
      });
    }

    let user = await User.findById(decoded.id);

    if (!user.isActive) {
      return createResponse({
        res,
        statusCode: 401,
        status: false,
        message: 'User is inactive, please contact admin',
      });
    }

    if (!user) {
      user = await Candidate.findById(decoded.id);
      if (!user) {
        return createResponse({
          res,
          statusCode: 401,
          status: false,
          message: 'User not found',
        });
      }
    }

    req.adminuser = user;
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Not authorized to access this resource',
      status: false,
      message: 'Not authorized to access this resource',
    });
  }
};

export default auth;
