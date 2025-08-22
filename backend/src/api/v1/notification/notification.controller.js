import httpStatus from 'http-status';
import Notification from './notification.model.js';
import createResponse from '../../../utils/response.js';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
} from '../../../utils/requestHelper.js';
import profileModel from '../User-Profile/userprofile.model.js';

const errorMessages = {
  NOT_FOUND: 'Notification not found',
  ID_REQUIRED: 'ID is required',
};

const createNotification = async (req, res) => {
  try {
    const payload = req.body;
    const userId = getUserIdFromRequest(req);
    console.log(payload, 'pal');
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
    const { limit = 10, skip = 0, search } = extractCommonQueryParams(req);
    const { isMobile } = req.query;
    const userId = getUserIdFromRequest(req);
    const userRole = req.user?.userRole;
    const now = new Date();

    let query = {};

    if (isMobile) {
      query.$and = [
        { $or: [{ fromm: { $lte: now } }, { fromm: { $exists: false } }] },
        { $or: [{ to: { $gte: now } }, { to: { $exists: false } }] },
      ];
    }

    // Filter by active status
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof req.query.isActive !== 'undefined') {
      query.isActive = req.query.isActive === 'true';
    }

    // Filter by read status
    if (typeof req.query.isRead !== 'undefined') {
      query.isRead = req.query.isRead === 'true';
    }

    // Filter by user role if not admin
    if (userRole === 'student' || userRole === 'teacher') {
      query.$and.push({
        'type._id': userRole,
      });
    }

    if (userRole === 'student') {
      // find userProfile
      const userProfile = await profileModel
        .findOne({ userId: req.user._id, joinedBatch: { $exists: true } })
        .populate('joinedBatch');
      if (!userProfile || !userProfile.joinedBatch) {
        return res
          .status(404)
          .json({ error: 'User profile or joined batch not found' });
      }

      const batchTeacher = await profileModel
        .findOne({ userId: userProfile.joinedBatch.classTeacherId })
        .populate('joinedBatch');
      console.log(batchTeacher, 'batchTeacher');

      query.$and.push({
        institution: batchTeacher.institution,
      });
      console.log(query, 'query');
    }
    if (userRole === 'teacher') {
      // find userProfile
      const userProfile = await profileModel
        .findOne({ userId: req.user._id })
        .populate('joinedBatch');
      console.log(userProfile, 'userProfile');
      query.$and.push({
        institution: userProfile.institution,
      });
      console.log(query, 'query');
    }

    // Search functionality
    if (search) {
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } },
          { 'type.nameEn': { $regex: search, $options: 'i' } },
        ],
      });
    }

    // institution filter
    // if (typeof req.query.institution !== 'undefined') {
    //   query.$and.push({
    //     'institution._id': req.query.institution,
    //   });
    // }

    // Deactivate expired notifications
    await Notification.updateMany(
      {
        to: { $lt: now },
        isActive: true,
      },
      { $set: { isActive: false } }
    );

    // Get notifications with pagination
    const [list, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('user', 'name email')
        .populate('institution', 'name'),
      Notification.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: list,
        count: totalCount,
        pagination: {
          limit: Number(limit),
          skip: Number(skip),
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Notification fetch error:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve notifications',
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
