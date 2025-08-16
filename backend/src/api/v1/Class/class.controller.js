import httpStatus from 'http-status';
import Class from './class.model';
import createResponse from '../../../utils/response';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
} from '../../../utils/requestHelper';
import userprofileModel from '../User-Profile/userprofile.model';
const errorMessages = {
  NOT_FOUND: 'Class not found',
  ID_REQUIRED: 'ID is required',
  INVALID_PAGE: 'Page must be a positive integer',
  INVALID_CLASS_CODE: 'Class code must be a valid number',
};

const createClass = async (req, res) => {
  try {
    const { classCode, ...payload } = req.body;
    const createdBy = getUserIdFromRequest(req);

    const count = await Class.countDocuments();
    const classes = await Class.create({
      ...payload,
      order: count + 1,
      createdBy,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Class created successfully.',
      data: classes,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: error.message,
        error: error.errors,
      });
    }
    if (error.code === 11000) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Class code already exists. Please try again.',
        error: 'DUPLICATE_CODE',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to create class. Please try again.',
      error: error.message,
    });
  }
};

const getAllClassWeb = async (req, res) => {
  try {
    // Log raw query parameters for debugging
    console.log('Raw req.query:', req.query);

    // Extract query parameters directly from req.query
    const { search, page, limit, sortBy, order, isActive } = req.query;
    const userRole = req.user?.userRole;
    let query = {};
    let userData;

    // Log extracted parameters for debugging
    console.log('Extracted parameters:', {
      search,
      page,
      limit,
      sortBy,
      order,
      isActive,
    });

    // Determine if pagination is applied (both page and limit must be valid numbers)
    const isPaginated =
      page !== undefined &&
      limit !== undefined &&
      !isNaN(parseInt(page)) &&
      !isNaN(parseInt(limit));
    console.log('isPaginated:', isPaginated);

    // Parse pagination parameters
    let pageNum = 1; // Default for response consistency
    let limitNum = 10,
      skip,
      totalPages;
    if (isPaginated) {
      pageNum = Math.max(1, parseInt(page, 10));
      limitNum = Math.max(1, parseInt(limit, 10));
      skip = (pageNum - 1) * limitNum;
      console.log(
        'Pagination applied - pageNum:',
        pageNum,
        'limitNum:',
        limitNum,
        'skip:',
        skip
      );
    } else {
      console.log('No pagination - fetching all data');
    }

    // Fetch user data for editor role
    if (userRole === 'editor') {
      userData = await userprofileModel.findOne({ userId: req.user._id });
      if (userData && userData.classId && userData.classId.length > 0) {
        query._id = { $in: userData.classId };
      } else {
        return createResponse({
          res,
          statusCode: httpStatus.OK,
          status: true,
          message: 'No classes assigned to this editor',
          data: {
            Classes: [],
            count: 0,
            totalPages: 0,
            currentPage: pageNum,
          },
        });
      }
    }

    // Apply isActive filter based on role
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    // Apply search filter
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [{ nameEn: { $regex: search, $options: 'i' } }];
    }

    // Log MongoDB query for debugging
    console.log('MongoDB query:', query);

    // Build sort object - always sort by order field first
    const sortObj = { order: 1 }; // Default to ascending order by 'order' field

    // If custom sort is requested, override the default
    if (sortBy && order && ['asc', 'desc'].includes(order.toLowerCase())) {
      sortObj[sortBy] = order.toLowerCase() === 'desc' ? -1 : 1;
      console.log('Sorting by query params:', sortObj);
    } else {
      console.log('Default sorting by order field:', sortObj);
    }

    // Get total count for pagination
    const totalCount = await Class.countDocuments(query).exec();

    // Calculate total pages
    totalPages = isPaginated ? Math.ceil(totalCount / limitNum) : 1;

    // Build the query with sorting
    let findQuery = Class.find(query).sort(sortObj);

    // Apply pagination if needed
    if (isPaginated) {
      findQuery = findQuery.skip(skip).limit(limitNum);
    }

    // Execute the query
    const list = await findQuery.lean().exec();

    // Log order values with indices to verify sorting
    console.log(
      'Order values with indices:',
      list.map((doc, index) => ({
        index,
        _id: doc._id,
        order: doc.order,
        nameEn: doc.nameEn,
      }))
    );

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Classes retrieved',
      data: {
        Classes: list,
        count: totalCount,
        totalPages,
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error('Error in getAllClass:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
const getAllClass = async (req, res) => {
  try {
    // Log raw query parameters for debugging
    console.log('Raw req.query:', req.query);

    // Extract query parameters
    const extractedParams = extractCommonQueryParams(req);
    console.log('Extracted params:', extractedParams);

    // Extract search and isActive from query
    const { search } = extractedParams;
    const { isActive } = req.query;
    const userRole = req.user?.userRole;
    let query = {};
    let userData;

    // Fetch user data for editor role
    if (userRole === 'editor') {
      userData = await userprofileModel.findOne({ userId: req.user._id });
      if (userData && userData.classId && userData.classId.length > 0) {
        query._id = { $in: userData.classId };
      } else {
        return createResponse({
          res,
          statusCode: httpStatus.OK,
          status: true,
          message: 'No classes assigned to this editor',
          data: {
            Classes: [],
            count: 0,
          },
        });
      }
    }

    // Apply isActive filter based on role
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    // Apply search filter
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [{ nameEn: { $regex: search, $options: 'i' } }];
    }

    // Log query for debugging
    console.log('MongoDB query:', query);

    // Execute query without pagination
    const list = await Class.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean(); // Use lean for performance

    // Get total count
    const totalCount = list.length;

    // Log results for debugging
    console.log('Results:', {
      totalCount,
      classesCount: list.length,
    });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Classes retrieved',
      data: {
        Classes: list,
        count: totalCount,
      },
    });
  } catch (error) {
    console.error('Error in getAllClass:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
const updateClass = async (req, res) => {
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

    const { classCode, ...updatePayload } = req.body;
    const updatedBy = getUserIdFromRequest(req);
    const classes = await Class.findByIdAndUpdate(
      id,
      { $set: { ...updatePayload, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!classes) {
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
      message: 'Class updated successfully.',
      data: classes,
    });
  } catch (error) {
    if (error.code === 11000) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Class code already exists. Please try again.',
        error: 'DUPLICATE_CODE',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update class. Please try again.',
      error: error.message,
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const classes = await Class.findById(id);
    if (!classes) {
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
      message: 'Class fetched successfully',
      data: classes,
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

const deleteClass = async (req, res) => {
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

    const classes = await Class.findByIdAndDelete(id);

    if (!classes) {
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
      message: 'Class deleted successfully',
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

const reorderClasses = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Order must be an array',
      });
    }

    const updates = order.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    const result = await Class.bulkWrite(updates);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Class order updated successfully',
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update class order',
      error: error.message,
    });
  }
};

export const ClassController = {
  createClass,
  getAllClass,
  getAllClassWeb,
  updateClass,
  getClassById,
  deleteClass,

  reorderClasses,
};
