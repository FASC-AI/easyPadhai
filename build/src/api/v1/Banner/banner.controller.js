/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Banner from './banner.model.js';
import createResponse from '../../../utils/response.js';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
} from '../../../utils/requestHelper.js';

const errorMessages = {
  NOT_FOUND: 'Banner not found',
  ID_REQUIRED: 'ID is required',
};

const createBanner = async (req, res) => {
  try {
    const payload = req.body;
    
    // Check if banner code already exists
    const existingBanner = await Banner.findOne({ codee: payload.codee });
    if (existingBanner) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Banner code already exists. Please use a different code.',
        error: 'DUPLICATE_CODE'
      });
    }

    const banner = await Banner.create({
      ...payload,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Banner created successfully.',
      data: banner,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
        status: false,
        error: error.errors,
      });
    }
    if (error.code === 11000) { // MongoDB duplicate key error
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Banner code already exists. Please use a different code.',
        error: 'DUPLICATE_CODE'
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to create banner. Please try again.',
      error: error.message,
    });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
  
    const { isActive } = req.query;
      const userRole = req.user.userRole; 

      let query = {};
      
    if (userRole !== 'admin') {
      query.isActive = true;
    } else {
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true'; // Convert string to boolean
      
    }
    else if (isActive === 'true' || isActive === true) {
      query.isActive = true;
    } else if (isActive === 'false' || isActive === false) {
      query.isActive = false;
    }
  }
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'bannersName' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
          { bannersName: { $regex: search, $options: 'i' } },
          { codee: { $regex: search, $options: 'i' } },
        ];
    }

    const [list, totalCount] = await Promise.all([
      Banner.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Banner.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Banners retrieved',
      data: {
        Banners: list,
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

const updateBanner = async (req, res) => {
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

    // Check if the new code already exists for another banner
    if (req.body.codee) {
      const existingBanner = await Banner.findOne({ 
        codee: req.body.codee,
        _id: { $ne: id } // Exclude current banner from check
      });
      
      if (existingBanner) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Banner code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE'
        });
      }
    }

    const updatedBy = getUserIdFromRequest(req);
    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!banner) {
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
      message: 'Banner updated successfully.',
      data: banner,
    });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Banner code already exists. Please use a different code.',
        error: 'DUPLICATE_CODE'
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update banner. Please try again.',
      error: error.message,
    });
  }
};

const getBannerById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const banner = await Banner.findById(id);
    if (!banner) {
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
      message: 'Banner fetched successfully',
      data: banner,
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

const deleteBanner = async (req, res) => {
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

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
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
      message: 'Banner deleted successfully',
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

export const BannerController = {
  createBanner,
  getAllBanners,
  updateBanner,
  getBannerById,
  deleteBanner
}; 