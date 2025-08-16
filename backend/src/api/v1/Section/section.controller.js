/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Section from './section.model';

import createResponse from '../../../utils/response';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';

const errorMessages = {
  NOT_FOUND: 'Section not found',
  ID_REQUIRED: 'ID is required',
};

const createSection = async (req, res) => {
  try {
    const payload = req.body;
    const count = await Section.countDocuments();
    const section = await Section.create({
      ...payload,
      order: count + 1,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Section created successfully.',
      data: section,
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
const getAllSection = async (req, res) => {
  try {
    const { search } = extractCommonQueryParams(req);
    let query = {};
    const { isActive } = req.query;
    const userRole = req.user?.userRole;

    // If user is not admin, only show active sections
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true'; // Convert string to boolean
    }

    // Apply search filter
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'sectionsName' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
            { sectionsName: { $regex: search, $options: 'i' } },
            { codee: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
    }

    // Execute query without pagination
    const list = await Section.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean(); // Use lean for performance

    // Get total count
    const totalCount = list.length;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Sections retrieved',
      data: {
        section: list,
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
const getAllSectionWeb = async (req, res) => {
  try {
    // Extract query parameters
    const { search, page, limit, sortBy, order, isActive } = req.query;
    const userRole = req.user?.userRole;
    let query = {};

    // Determine if pagination is applied
    const isPaginated =
      page !== undefined &&
      limit !== undefined &&
      !isNaN(parseInt(page)) &&
      !isNaN(parseInt(limit));

    // Parse pagination parameters
    let pageNum = 1;
    let limitNum = 10,
      skip,
      totalPages;
    if (isPaginated) {
      pageNum = Math.max(1, parseInt(page, 10));
      limitNum = Math.max(1, parseInt(limit, 10));
      skip = (pageNum - 1) * limitNum;
    }

    // Apply isActive filter based on role
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { sectionsName: { $regex: search, $options: 'i' } },
        { codee: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const totalCount = await Section.countDocuments(query).exec();

    // Calculate total pages
    totalPages = isPaginated ? Math.ceil(totalCount / limitNum) : 1;

    // Build sort object - start with default sorting by order
    let sortObj = { order: -1 };

    // If custom sort is requested, create a new sort object
    if (sortBy && order && ['asc', 'desc'].includes(order.toLowerCase())) {
      sortObj = { [sortBy]: order.toLowerCase() === 'desc' ? -1 : 1 };
    }

    // Build and execute the query with proper numeric sorting
    let findQuery = Section.find(query)
      .sort(sortObj)
      .collation({ locale: 'en', numericOrdering: true });

    if (isPaginated) {
      findQuery = findQuery.skip(skip).limit(limitNum);
    }

    const sections = await findQuery.lean().exec();

    // Final sort in memory as additional safeguard
    sections.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Infinity;
      const orderB = b.order !== undefined ? b.order : Infinity;
      return orderA - orderB;
    });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Sections retrieved',
      data: {
        section: sections,
        count: totalCount,
        totalPages,
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error('Error in getAllSectionWeb:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const updateSection = async (req, res) => {
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
      const existingSection = await Section.findOne({
        codee: req.body.codee,
        _id: { $ne: id }, // Exclude current class from check
      });

      if (existingSection) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Section code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE',
        });
      }
    }

    const updatedBy = getUserIdFromRequest(req);
    const section = await Section.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!section) {
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
      message: 'Section updated successfully.',
      data: section,
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
const getSectionById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const section = await Section.findById(id);
    if (!section) {
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
      message: 'Section fetched successfully.',
      data: section,
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
const deleteSection = async (req, res) => {
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

    const section = await Section.findByIdAndDelete(id);

    if (!section) {
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
      message: 'Section deleted successfully.',
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
const reorderSection = async (req, res) => {
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

    const result = await Section.bulkWrite(updates);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Section order updated successfully',
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update section order',
      error: error.message,
    });
  }
};
export const SectionController = {
  createSection,
  getAllSection,
  updateSection,
  getSectionById,
  deleteSection,
  reorderSection,
  getAllSectionWeb,
};
