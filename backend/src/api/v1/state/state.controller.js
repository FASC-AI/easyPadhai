import State from './state.model';
import {
  getCommonSearchConditionForMasters,
  capitalizeFirstLetter,
} from '../../../utils/commonHelper';
import {
  getUserIdFromRequest,
  extractCommonQueryParams,
  getIdFromParams,
} from '../../../utils/requestHelper';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../../utils/responseHelper';


const errorMessages = {
  NOT_FOUND: 'State not found',
  ID_REQUIRED: 'ID is required',
};

const createState = async (req, res, next) => {
  try {
    const payload = req.body;

    const createdBy = getUserIdFromRequest(req);

    const state = await State.create({
      createdBy,
      updatedBy: createdBy,
      ...payload,
    });

    return sendSuccessResponse(res, { state });
  } catch (error) {
    return next(error);
  }
};

const getAllStates = async (req, res) => {
  try {
    const { limit, skip, search,isActive } = extractCommonQueryParams(req);
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
      State.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('country'),
      State.countDocuments(query),
    ]);
    return sendSuccessResponse(res, { list }, totalCount);
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const getStateById = async (req, res) => {
  try {
    let id = getIdFromParams(req);
    let state = await State.findById({ _id: id }).populate('country');;
    if (!state) {
      throw new Error(errorMessages.NOT_FOUND);
    }
    return sendSuccessResponse(res, { state });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const updateState = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const updatedBy = getUserIdFromRequest(req);
    const state = await State.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updatedBy } },
      { new: true }
    ).populate('country');

    if (!state) {
      throw new Error(errorMessages.NOT_FOUND);
    }

    return sendSuccessResponse(res, { state });
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

const deleteState = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    if (!id) {
      throw new Error(errorMessages.ID_REQUIRED);
    }

    const state = await State.findOneAndDelete({ _id: id }).populate('country');;

    if (!state) {
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
    const alreadyExist = [];
    const newStates = [];
    const missingData = [];

    for (const elem of fileData) {
      if (elem) {
        // Check if the state already exists
        const capitalizedStateName = capitalizeFirstLetter(elem['State Name']);
        const findIfDataExists = await State.findOne({
          'name.english': capitalizedStateName,
        }).lean();

        if (findIfDataExists) {
          alreadyExist.push(elem['State Name']);
        } else {
          // Add the new state to the list for bulk insertion
          newStates.push({
            'name.english': capitalizedStateName,
         
          });
        }
      }
    }

    // Insert all new states at once using insertMany
    if (newStates.length > 0) {
      await State.insertMany(newStates);
    }

    const isPartial = missingData.length > 0 || alreadyExist.length > 0;

    if (isPartial) {
      // If there are missing or already existing items, send a partial success response
      return res.status(409).send({
        message: 'Bulk upload partially done',
        data: { missingData, alreadyExist },
      });
    } else {
      // If everything is successfully processed, send a success response
      return sendSuccessResponse(res, {
        message: 'Bulk upload completed successfully',
      });
    }
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};

export const stateController = {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
  bulkUpload,
};
