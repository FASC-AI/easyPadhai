import District from './district.model';
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
  NOT_FOUND: 'District not found',
  ID_REQUIRED: 'ID is required',
};

const createDistrict = async (req, res, next) => {
  try {
    const payload = req.body;

    const createdBy = getUserIdFromRequest(req);

    const district = await District.create({
      createdBy,
      updatedBy: createdBy,
      ...payload,
    });

    return sendSuccessResponse(res, { district });
  } catch (error) {
    return next(error);
  }
};

const getAllDistricts = async (req, res) => {
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
      District.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(['country', 'state']),
      District.countDocuments(query),
    ]);
    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const getDistrictById = async (req, res) => {
  try {
    let id = getIdFromParams(req);
    let district = await District.findById({ _id: id }).populate(['country', 'state']) ;
    if (!district) {
      throw new Error(errorMessages.NOT_FOUND);
    }
    return sendSuccessResponse(res, { district });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const updateDistrict = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const updatedBy = getUserIdFromRequest(req);
    const district = await District.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updatedBy } },
      { new: true }
    ).populate(['country', 'state']);

    if (!district) {
      throw new Error(errorMessages.NOT_FOUND);
    }

    return sendSuccessResponse(res, { district });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const district = await District.findOneAndDelete({ _id: id }).populate(['country', 'state']);;

    if (!district) {
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
    const newDistricts = []; 

    for (const elem of fileData) {
      if (elem) {
        const findIfDataExists = await District.findOne({
          'name.english': capitalizeFirstLetter(elem['District Name']),
        }).then((e) => (e ? e._id : null));

        if (findIfDataExists) {
          alreadyExist.push(elem['District Name']);
        } else {
          const findState = await State.findOne({
            'name.english': capitalizeFirstLetter(elem['State Name']),
          }).then((e) => (e ? e._id : null));

          if (!findState) {
            missingData.push({
              'State Name': capitalizeFirstLetter(elem['State Name']),
            });
          } else {
            newDistricts.push({
              'name.english': capitalizeFirstLetter(elem['District Name']),
              stateId: findState,
          
            });
          }
        }
      }
    }

    if (newDistricts.length > 0) {
      await District.insertMany(newDistricts);
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

const getDistrictsByState = async (req, res) => {
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
      District.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      District.countDocuments(query),
    ]);

    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

export const DistrictController = {
  createDistrict,
  getAllDistricts,
  getDistrictById,
  updateDistrict,
  deleteDistrict,
  bulkUpload,
  getDistrictsByState,
};
