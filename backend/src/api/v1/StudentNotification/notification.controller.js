import httpStatus from 'http-status';
import Notification from './notification.model';
import createResponse from '../../../utils/response';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
} from '../../../utils/requestHelper';

const errorMessages = {
  NOT_FOUND: 'Notification not found',
  ID_REQUIRED: 'ID is required',
};

const createNotification = async (req, res) => {
  try {
    const payload = req.body;
    const userId = getUserIdFromRequest(req);

    const notification = await Notification.create({
      ...payload,
      user: userId,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Notification created successfully.',
      data: notification,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0] || 'Validation error',
        status: false,
        error: error.message,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message,
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    const userId = getUserIdFromRequest(req);
    let query = {  };
    const { isActive, isRead } = req.query;
    const userRole = req.user?.userRole;
    const now = new Date();

    // If user is not admin, only show active institutions
    if (userRole !== 'admin') {
      query.isActive = true;

    } else {
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }
    else if (isActive === 'true' || isActive === true) {
      query.isActive = true;
    } else if (isActive === 'false' || isActive === false) {
      query.isActive = false;
    }
    }
    if (typeof isRead !== 'undefined') {
      query.isRead = isRead === 'true';
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }
    await Notification.updateMany(
      {
        to: { $lt: now },
        isActive: true,
      },
      { $set: { isActive: false } }
    );


    const [list, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notifications retrieved',
      data: {
        notifications: list,
        count: totalCount,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
      error: error.message,
    });
  }
};

const updateNotification = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: errorMessages.ID_REQUIRED,
      });
    }

    const updatedBy = getUserIdFromRequest(req);
    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notification updated successfully.',
      data: notification,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    const userId = getUserIdFromRequest(req);

    const notification = await Notification.findOne({
      _id: id,
     
    });

    if (!notification) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notification fetched successfully.',
      data: notification,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: errorMessages.ID_REQUIRED,
      });
    }

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const toggleNotificationStatus = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    const userId = getUserIdFromRequest(req);
    const { isRead } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notification status updated successfully.',
      data: notification,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const NotificationController = {
  createNotification,
  getAllNotifications,
  updateNotification,
  getNotificationById,
  deleteNotification,
  toggleNotificationStatus,
}; 