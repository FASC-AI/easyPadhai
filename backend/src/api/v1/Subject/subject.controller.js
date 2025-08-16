/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Subject from './subject.model';

import createResponse from '../../../utils/response';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import userprofileModel from '../User-Profile/userprofile.model';

const errorMessages = {
  NOT_FOUND: 'Subject not found',
  ID_REQUIRED: 'ID is required',
};

const createSubject = async (req, res) => {
  try {
    const payload = req.body;

    const order = await Subject.countDocuments();
    const subject = await Subject.create({
      ...payload,
      order: order + 1,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'subject created successfully.',
      data: subject,
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
const getAllSubject = async (req, res) => {
  try {
    const { search } = extractCommonQueryParams(req);
    let query = {};
    const { isActive } = req.query;
    const userRole = req.user?.userRole;
    let userData;

    // Fetch user data for editor role
    if (userRole === 'editor') {
      userData = await userprofileModel.findOne({ userId: req.user._id });
      // Ensure subjects are filtered by subjectId array for editor
      if (userData && userData.subjectId && userData.subjectId.length > 0) {
        query._id = { $in: userData.subjectId }; // Filter subjects by subjectId array
      } else {
        // If no subjectId found, return empty result
        return createResponse({
          res,
          statusCode: httpStatus.OK,
          status: true,
          message: 'No subjects assigned to this editor',
          data: {
            subject: [],
            count: 0,
          },
        });
      }
    }

    // Apply isActive filter based on role
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true'; // Convert string to boolean
    }

    // Apply search filter
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
            { nameEn: { $regex: search, $options: 'i' } },
            { codee: { $regex: search, $options: 'i' } },
          ];
    }

    // Execute query without pagination
    const list = await Subject.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean(); // Use lean for performance

    // Get total count
    const totalCount = list.length;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Subjects retrieved',
      data: {
        subject: list,
        count: totalCount,
      },
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
const getAllSubjectWeb = async (req, res) => {
  try {
    // Extract common query parameters including pagination
    const { search, skip = 0, page = 1 } = extractCommonQueryParams(req);
    let { limit } = req.query;
    limit = parseInt(limit, 10) || null; // Set to null if not provided
    let query = {};
    const { isActive } = req.query;
    const userRole = req.user?.userRole;
    let userData;

    // Fetch user data for editor role
    if (userRole === 'editor') {
      userData = await userprofileModel.findOne({ userId: req.user._id });
      // Ensure subjects are filtered by subjectId array for editor
      if (userData && userData.subjectId && userData.subjectId.length > 0) {
        query._id = { $in: userData.subjectId }; // Filter subjects by subjectId array
      } else {
        // If no subjectId found, return empty result
        return createResponse({
          res,
          statusCode: httpStatus.OK,
          status: true,
          message: 'No subjects assigned to this editor',
          data: {
            subject: [],
            count: 0,
          },
        });
      }
    }

    // Apply isActive filter based on role
    if (userRole !== 'admin') {
      query.isActive = true;
    } else {
      if (typeof isActive !== 'undefined') {
        query.isActive = isActive === 'true'; // Convert string to boolean
      }
    }

    // Apply search filter
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
            { nameEn: { $regex: search, $options: 'i' } },
            { codee: { $regex: search, $options: 'i' } },
          ];
    }

    // Execute query with sorting
    const findQuery = Subject.find(query).sort({ order: 1, createdAt: -1 });

    // Apply pagination only if limit is provided and no search term
    if (!search && limit !== null) {
      // Calculate skip based on page and limit if page is provided
      const effectiveSkip = page > 1 ? (page - 1) * limit : skip;
      findQuery.skip(Number(effectiveSkip)).limit(Number(limit));
    }

    const [list, totalCount] = await Promise.all([
      findQuery,
      Subject.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Subjects retrieved',
      data: {
        subject: list,
        count: totalCount,
        // Include pagination metadata
        pagination: {
          limit: search
            ? totalCount
            : limit !== null
              ? Number(limit)
              : totalCount,
          skip: search ? 0 : Number(skip),
          page: search ? 1 : Number(page),
          totalPages: search
            ? 1
            : limit !== null
              ? Math.ceil(totalCount / limit)
              : 1,
        },
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

const updateSubject = async (req, res) => {
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

    if (req.body.codee) {
      const existingSubject = await Subject.findOne({
        codee: req.body.codee,
        _id: { $ne: id }, // Exclude current class from check
      });
      if (existingSubject) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Subject code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE',
        });
      }
    }

    const updatedBy = getUserIdFromRequest(req);
    const subject = await Subject.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!subject) {
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
      message: 'Subject updated successfully.',
      data: subject,
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
const getSubjectById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const subject = await Subject.findById(id);
    if (!subject) {
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
      message: 'subject fetched successfully.',
      data: subject,
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
const deleteSubject = async (req, res) => {
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

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
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
      message: 'subject deleted successfully.',
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
const reorderSubject = async (req, res) => {
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

    const result = await Subject.bulkWrite(updates);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Subject order updated successfully',
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update subject order',
      error: error.message,
    });
  }
};
export const SubjectController = {
  createSubject,
  getAllSubject,
  getAllSubjectWeb,
  updateSubject,
  getSubjectById,
  deleteSubject,
  reorderSubject,
};
