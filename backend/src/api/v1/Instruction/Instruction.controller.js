/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Instruction from './Instruction.model.js';
import mongoose from 'mongoose';
import createResponse from '../../../utils/response.js';
import profileModel from '../User-Profile/userprofile.model.js';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';

const errorMessages = {
  NOT_FOUND: 'Instruction not found',
  ID_REQUIRED: 'ID is required',
};

// update Instruction references - dont change it it is a fine fix if you update this the binding will break 26/06/2025 by Shreyash
export async function updateInstructionReferences(modelName, docId, newName) {
  try {
    const pathMap = {
      Class: 'classes',
      Subject: 'subjects',
      Book: 'book',
      LessonMaster: 'lesson',
      Lesson: 'topic',
    };

    const path = pathMap[modelName];
    if (!path) {
      console.error(`No path mapping for model: ${modelName}`);
      return;
    }

    const result = await mongoose
      .model('Instruction')
      .updateMany(
        { [`${path}._id`]: docId },
        { $set: { [`${path}.$.nameEn`]: newName } }
      );

    console.log(
      `Updated ${result.nModified} Test documents for ${modelName} ${docId}`
    );
    return result;
  } catch (error) {
    console.error('Error updating test references:', error);
    throw error;
  }
}

const createInstruction = async (req, res) => {
  try {
    const payload = req.body;
    const instruction = await Instruction.create({
      ...payload,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Instruction created successfully.',
      data: instruction,
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

const getAllInstruction = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    let query = {};
    const { isActive } = req.query;
    const userRole = req.user?.userRole;

    const profileDate = await profileModel.findOne({
      userId: req.user._id,
    });

    // If user is not admin, only show active institutions
    if (userRole !== 'admin') {
      query.isActive = true;
      if (profileDate.subjectId) {
        query.subjects = {
          $elemMatch: { _id: { $in: profileDate.subjectId } },
        };
      }

      if (profileDate.classId) {
        query.classes = {
          $elemMatch: { _id: { $in: profileDate.classId } },
        };
      }
    } else {
      if (typeof isActive !== 'undefined') {
        query.isActive = isActive === 'true'; // Convert string to boolean
      } else if (isActive === 'true' || isActive === true) {
        query.isActive = true;
      } else if (isActive === 'false' || isActive === false) {
        query.isActive = false;
      }
    }
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
            { InstructionsName: { $regex: search, $options: 'i' } },
            { codee: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
    }

    const [list, totalCount] = await Promise.all([
      Instruction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Instruction.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Instruction retrieved',
      data: {
        instruction: list,
        count: totalCount,
      },
    });
  } catch (error) {
    return createResponse({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
      error: error.message,
    });
  }
};

const updateInstruction = async (req, res) => {
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
      const existingInstruction = await Instruction.findOne({
        codee: req.body.codee,
        _id: { $ne: id }, // Exclude current class from check
      });
      if (existingInstruction) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message:
            'Instruction code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE',
        });
      }
    }

    const updatedBy = getUserIdFromRequest(req);
    const instruction = await Instruction.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!instruction) {
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
      message: 'Instruction updated successfully.',
      data: instruction,
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
const getInstructionById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const instruction = await Instruction.findById(id);
    if (!instruction) {
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
      message: 'Instruction fetched successfully',
      data: instruction,
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
const deleteInstruction = async (req, res) => {
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

    const instruction = await Instruction.findByIdAndDelete(id);

    if (!instruction) {
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
      message: 'Instruction deleted successfully',
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
const instructionList = async (req, res) => {
  try {
    // Extract class and subject IDs from request (e.g., query or body)
    const { classIds, subjectIds } = req.query; // Adjust to req.body if needed

    // Validate input
    if (!classIds || !subjectIds) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Class IDs and Subject IDs are required',
      });
    }

    // Convert string IDs to array if they are comma-separated
    const classIdArray = Array.isArray(classIds)
      ? classIds
      : classIds.split(',');
    const subjectIdArray = Array.isArray(subjectIds)
      ? subjectIds
      : subjectIds.split(',');

    // Query to find active instructions matching class and subject IDs
    const instructions = await Instruction.find({
      isActive: true,
      'classes._id': {
        $in: classIdArray.map((id) => new mongoose.Types.ObjectId(id)),
      },
      'subjects._id': {
        $in: subjectIdArray.map((id) => new mongoose.Types.ObjectId(id)),
      },
    }).select('_id type description InstructionsName'); // Select only required fields

    // If no data found
    if (!instructions || instructions.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message:
          'No active instructions found for the provided class and subject IDs',
      });
    }

    // Return success response
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Active instructions retrieved successfully',
      data: instructions,
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
const instructionBySubjectClass = async (req, res) => {
  try {
    const { subjectId, classId, type } = req.query;

    // Validate subjectId and classId
    if (subjectId && !mongoose.isValidObjectId(subjectId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid subjectId. Must be a valid ObjectId.',
      });
    }

    if (classId && !mongoose.isValidObjectId(classId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid classId. Must be a valid ObjectId.',
      });
    }

    // Build the query object
    let query = {
      isActive: true,
      type: type,
    };

    if (subjectId) {
      query['subjects._id'] = subjectId;
    }
    if (classId) {
      query['classes._id'] = classId;
    }

    // Fetch instructions from the database
    let instructions = await Instruction.find(query).lean();

    const response = {
      english: [],
      hindi: [],
    };

    // Process English instructions (using description field)
    response.english = instructions
      .filter((instr) => instr.description && instr.description.trim() !== '')
      .map((instr) => ({
        _id: instr._id,
        instructionsName: instr.InstructionsName,
        description: instr.description,
        type: instr.type,
        subjects: instr.subjects,
        classes: instr.classes,
        createdAt: instr.createdAt,
        updatedAt: instr.updatedAt,
      }));

    // Process Hindi instructions (filtered by type if provided)
    if (type) {
      query.type = type;
      instructions = await Instruction.find(query).lean();
    }

    response.hindi = instructions
      .filter((instr) => instr.hindi && instr.hindi.trim() !== '')
      .map((instr) => ({
        _id: instr._id,
        instructionsName: instr.InstructionsName,
        hindi: instr.hindi,
        type: instr.type,
        subjects: instr.subjects,
        classes: instr.classes,
        createdAt: instr.createdAt,
        updatedAt: instr.updatedAt,
      }));

    // Return the response
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Instructions fetched successfully',
      data: response,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in instructionBySubjectClass:', error);

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
export const InstructionController = {
  createInstruction,
  getAllInstruction,
  updateInstruction,
  getInstructionById,
  deleteInstruction,
  instructionList,
  instructionBySubjectClass,
};
