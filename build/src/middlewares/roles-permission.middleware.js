import mongoose from 'mongoose';
import UserRole from '../modelsV2/masters/UserRole.js';
import httpStatus, { FORBIDDEN } from 'http-status';
import createResponse from '../utils/response.js';

const errorMessages = {
  FORBIDDEN: 'Unauthorized user',
};
const rolesPermissionCheck = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user.roleId;
      const userRole = await UserRole.findById(userRoleId);
      if (!userRole) {
        return createResponse({
          res,
          statusCode: httpStatus.FORBIDDEN,
          status: false,
          message: errorMessages.FORBIDDEN,
        });
      }
      const findModulePermission = (permissions, moduleName) => {
        for (let permission of permissions) {
          if (permission.moduleName === moduleName) {
            return permission;
          }
          if (permission.subItems && permission.subItems.length > 0) {
            const found = findModulePermission(permission.subItems, moduleName);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };

      const modulePermission = findModulePermission(
        userRole.permissions,
        moduleName
      );
      if (modulePermission && modulePermission.actions[action]) {
        return next();
      }
      return createResponse({
        res,
        statusCode: httpStatus.FORBIDDEN,
        status: false,
        message: errorMessages.FORBIDDEN,
      });
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: error.message,
      });
    }
  };
};

export default rolesPermissionCheck;
