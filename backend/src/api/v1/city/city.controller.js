import City from './city.model';
import mongoose from 'mongoose';
import {
  getUserIdFromRequest,
  extractCommonQueryParams,
  getIdFromParams,
} from '../../../utils/requestHelper';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../../utils/responseHelper';

import {
  getCommonSearchConditionForMasters,
  capitalizeFirstLetter,
} from '../../../utils/commonHelper';
import State from '../state/state.model';

const errorMessages = {
  NOT_FOUND: 'City not found',
  ID_REQUIRED: 'ID is required',
};

const createCity = async (req, res, next) => {
  try {
    const payload = req.body;

    const createdBy = getUserIdFromRequest(req);

    const city = await City.create({
      createdBy,
      updatedBy: createdBy,
      ...payload,
    });

    return sendSuccessResponse(res, { city });
  } catch (error) {
    return next(error);
  }
};

const getAllCitys = async (req, res) => {
  try {
    const { limit, skip, search ,isActive} = extractCommonQueryParams(req);
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
      City.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(['country', 'state','district']),
      City.countDocuments(query),
    ]);
    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const getCityById = async (req, res) => {
  try {
    let id = getIdFromParams(req);
    let city = await City.findById({ _id: id }).populate(['country', 'state','district']) ;
    if (!city) {
      throw new Error(errorMessages.NOT_FOUND);
    }
    return sendSuccessResponse(res, { city });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const updateCity = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const updatedBy = getUserIdFromRequest(req);
    const city = await City.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updatedBy } },
      { new: true }
    ).populate(['country', 'state','district']);

    if (!city) {
      throw new Error(errorMessages.NOT_FOUND);
    }

    return sendSuccessResponse(res, { city });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const deleteCity = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const city = await City.findOneAndDelete({ _id: id }).populate(['country', 'state']);;

    if (!city) {
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
    const missingData = [];
    const alreadyExist = [];
    const newCitys = []; 

    for (const elem of fileData) {
      if (elem) {
        const findIfDataExists = await City.findOne({
          'name.english': capitalizeFirstLetter(elem['City Name']),
        }).then((e) => (e ? e._id : null));

        if (findIfDataExists) {
          alreadyExist.push(elem['City Name']);
        } else {
          const findState = await State.findOne({
            'name.english': capitalizeFirstLetter(elem['State Name']),
          }).then((e) => (e ? e._id : null));

          if (!findState) {
            missingData.push({
              'State Name': capitalizeFirstLetter(elem['State Name']),
            });
          } else {
            newCitys.push({
              'name.english': capitalizeFirstLetter(elem['City Name']),
              stateId: findState,
          
            });
          }
        }
      }
    }

    if (newCitys.length > 0) {
      await City.insertMany(newCitys);
    }

    const isPartial = missingData.length > 0 || alreadyExist.length > 0;

    if (isPartial) {
      return sendErrorResponse(res, {
        message: 'Bulk upload partially done',
        data: { missingData, alreadyExist },
      });
    } else {
      return sendSuccessResponse(res, {
        message: 'Bulk upload completed successfully',
      });
    }
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const getCitysByState = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    const stateId = req.params.id;
   
    if (!stateId) {
      return sendErrorResponse(res, 'stateId is required', 400);
    }
    if (!mongoose.Types.ObjectId.isValid(stateId)) {
      return sendErrorResponse(res, 'Invalid stateId', 400);
    }
    let query = { state: stateId };
    if (search) {
      query.$or = getCommonSearchConditionForMasters(search);
    }

    const [list, totalCount] = await Promise.all([
      City.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      City.countDocuments(query),
    ]);

    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

export const CityController = {
  createCity,
  getAllCitys,
  getCityById,
  updateCity,
  deleteCity,
  bulkUpload,
  getCitysByState,
};
