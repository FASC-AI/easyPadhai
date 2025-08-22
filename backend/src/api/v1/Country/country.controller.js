import Country from './country.model.js';

import {
  getUserIdFromRequest,
  extractCommonQueryParams,
  getIdFromParams,
} from '../../../utils/requestHelper.js';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../../utils/responseHelper.js';
import { getCommonSearchConditionForMasters } from '../../../utils/commonHelper.js';

const errorMessages = {
  NOT_FOUND: 'Country not found',
  ID_REQUIRED: 'ID is required',
};

const createCountry = async (req, res, next) => {
  try {
   
    const { name, isActive, } = req.body;
    const createdBy = getUserIdFromRequest(req);

    const country = await Country.create({
      name,
      createdBy,
      updatedBy: createdBy,
      isActive,
     
    });

    return sendSuccessResponse(res, { country });
  } catch (error) {
    next(error);
  }
};

const getAllCountries = async (req, res) => {
  try {
    const { limit, skip, search, isActive } = extractCommonQueryParams(req);
    let query = {};

    const userRole = req.user?.userRole;

    // If user is not admin, only show active institutions
    if (userRole !== 'admin') {
      query.isActive = true;
    } else{
    if (isActive === 'true' || isActive === true) {
      query.isActive = true;
    } else if (isActive === 'false' || isActive === false) {
      query.isActive = false;
    }
  }

    if (search) {
      query.$or = getCommonSearchConditionForMasters(search);
    }

    const [list, totalCount] = await Promise.all([
      Country.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Country.countDocuments(query),
    ]);

    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};



const getCountryById = async (req, res) => {
  try {
    let id = getIdFromParams(req);
    let country = await Country.findById({ _id: id });
    if (!country) {
      throw new Error(errorMessages.NOT_FOUND);
    }
    return sendSuccessResponse(res, { country });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const updateCountry = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const updatedBy = getUserIdFromRequest(req);
    const country = await Country.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updatedBy } },
      { new: true }
    );

    if (!country) {
      throw new Error(errorMessages.NOT_FOUND);
    }

    return sendSuccessResponse(res, { country });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const deleteCountry = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const country = await Country.findOneAndDelete({ _id: id });

    if (!country) {
      throw new Error(errorMessages.NOT_FOUND);
    }

    return sendSuccessResponse(res);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const bulkUpload = async (req, res, next) => {
  try {
    const fileData = req.fileData;

   
    const countries = await Country.insertMany(fileData);

    return sendSuccessResponse(res, { countries });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

export const countryController = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
  bulkUpload,
};
