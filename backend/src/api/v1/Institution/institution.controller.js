/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Institutes from './institution.model';
import mongoose from 'mongoose';
import createResponse from '../../../utils/response';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';

const errorMessages = {
  NOT_FOUND: 'Institution not found',
  ID_REQUIRED: 'ID is required',
};

const createInstitutes = async (req, res) => {
  try {
    const payload = req.body;

    // Function to generate a random three-capital-letter code
    const generateRandomCode = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      return code;
    };

    // Generate a unique three-letter instituteCode
    let instituteCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Prevent excessive retries

    while (!isUnique && attempts < maxAttempts) {
      instituteCode = generateRandomCode();
      const existingInstitute = await Institutes.findOne({ instituteCode });
      if (!existingInstitute) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message:
          'Unable to generate a unique institute code after multiple attempts.',
        error: 'UNIQUE_CODE_GENERATION_FAILED',
      });
    }

    const institutes = await Institutes.create({
      ...payload,
      instituteCode,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Institutes created successfully.',
      data: institutes,
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

const getAllInstitutes = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    let query = {};
    const { isActive, isVerified, status } = req.query;
    const userRole = req.user?.userRole;

    // Apply filters
    if (userRole !== 'admin') {
      query.isActive = true;
    } else if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }
    if (typeof isVerified !== 'undefined') {
      query.isVerified = isVerified === 'true';
    }
    if (status) {
      query.status = status;
    }
    // query.isActive = true;

    // Add search filter for Institutes collection
    if (search) {
      query.$or = [
        { institutesName: { $regex: search, $options: 'i' } },
        { instituteCode: { $regex: search, $options: 'i' } },
        { 'address.address1': { $regex: search, $options: 'i' } },
      ];
    }

    // Aggregation pipeline
    const aggregateQuery = [
      { $match: query },
      {
        $lookup: {
          from: 'userinfos',
          localField: '_id',
          foreignField: 'institution',
          as: 'userProfiles',
        },
      },
      {
        $lookup: {
          from: 'batches',
          let: { userIds: '$userProfiles.userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$classTeacherId', '$$userIds'],
                },
                // Apply search filter to batch fields if search is provided
                ...(search
                  ? {
                      $or: [
                        { code: { $regex: search, $options: 'i' } },
                        {
                          'section.sectionsName': {
                            $regex: search,
                            $options: 'i',
                          },
                        },
                        { 'class.nameEn': { $regex: search, $options: 'i' } },
                      ],
                    }
                  : {}),
              },
            },
            {
              $lookup: {
                from: 'sections',
                localField: 'sectionId',
                foreignField: '_id',
                as: 'section',
              },
            },
            {
              $unwind: {
                path: '$section',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'class',
              },
            },
            {
              $unwind: {
                path: '$class',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'classTeacherId',
                foreignField: '_id',
                as: 'teacher',
              },
            },
            {
              $unwind: {
                path: '$teacher',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                code: 1,
                section: { name: '$section.sectionsName' },
                class: { name: '$class.nameEn' },
                teacher: {
                  name: '$teacher.name.english',
                  email: '$teacher.email',
                  mobile: '$teacher.mobile',
                },
              },
            },
          ],
          as: 'batchDetails',
        },
      },
      {
        $project: {
          _id: 1,
          institutesName: 1,
          description: 1,
          status: 1,
          instituteCode: 1,
          isActive: 1,
          isVerified: 1,
          address: 1,
          instituteType: 1,
          phone: 1,
          code: 1,
          batchDetails: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      // Apply pagination only if no search term is provided
      ...(search ? [] : [{ $skip: skip }, { $limit: limit }]),
    ];

    const [list, totalCount] = await Promise.all([
      Institutes.aggregate(aggregateQuery).exec(),
      Institutes.countDocuments(query),
    ]);

    // Populate state, district, and city names
    const populatedList = await Institutes.populate(list, [
      { path: 'address.stateId', select: 'name' },
      { path: 'address.districtId', select: 'name' },
      { path: 'address.cityId', select: 'name' },
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Institutes retrieved',
      data: {
        institutes: populatedList || [],
        count: totalCount || 0,
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
const getInstitutesById = async (req, res) => {
  try {
    const { search } = extractCommonQueryParams(req);
    const id = getIdFromParams(req);

    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: errorMessages.ID_REQUIRED,
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid institute ID format',
      });
    }

    // Aggregation pipeline to fetch institute and batch details
    const aggregateQuery = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'userinfos',
          localField: '_id',
          foreignField: 'institution',
          as: 'userProfiles',
        },
      },
      {
        $lookup: {
          from: 'batches',
          let: { userIds: '$userProfiles.userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$classTeacherId', '$$userIds'],
                },
                ...(search
                  ? {
                      $or: [
                        { code: { $regex: search, $options: 'i' } },
                        {
                          'section.sectionsName': {
                            $regex: search,
                            $options: 'i',
                          },
                        },
                        { 'class.nameEn': { $regex: search, $options: 'i' } },
                      ],
                    }
                  : {}),
              },
            },
            {
              $lookup: {
                from: 'sections',
                localField: 'sectionId',
                foreignField: '_id',
                as: 'section',
              },
            },
            {
              $unwind: {
                path: '$section',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'class',
              },
            },
            {
              $unwind: {
                path: '$class',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'classTeacherId',
                foreignField: '_id',
                as: 'teacher',
              },
            },
            {
              $unwind: {
                path: '$teacher',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                code: 1,
                section: { name: '$section.sectionsName' },
                class: { name: '$class.nameEn' },
                teacher: {
                  name: '$teacher.name.english',
                  email: '$teacher.email',
                  mobile: '$teacher.mobile',
                },
              },
            },
          ],
          as: 'batchDetails',
        },
      },
      {
        $match: {
          ...(search ? { 'batchDetails.0': { $exists: true } } : {}),
        },
      },
      {
        $project: {
          _id: 1,
          institutesName: 1,
          description: 1,
          status: 1,
          instituteCode: 1,
          isActive: 1,
          isVerified: 1,
          address: 1,
          instituteType: 1,
          phone: 1,
          code: 1,
          batchDetails: 1,
          createdAt: 1,
        },
      },
    ];

    const [institute] = await Institutes.aggregate(aggregateQuery).exec();

    if (!institute) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    // Populate state and district names
    const populatedInstitute = await Institutes.populate(
      [institute],
      [
        { path: 'address.stateId', select: 'name' },
        { path: 'address.districtId', select: 'name' },
        { path: 'address.cityId', select: 'name' },
      ]
    );

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Institute fetched successfully.',
      data: populatedInstitute[0],
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
const updateInstitutes = async (req, res) => {
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
    // Check if the new code already exists for another class
    if (req.body.codee) {
      const existingClass = await Institutes.findOne({
        codee: req.body.codee,
        _id: { $ne: id }, // Exclude current class from check
      });

      if (existingClass) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Class code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE',
        });
      }
    }
    const updatedBy = getUserIdFromRequest(req);
    const institutes = await Institutes.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    )
      .populate('address.stateId', 'name')
      .populate('address.districtId', 'name')
      .populate('address.cityId', 'name');

    if (!institutes) {
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
      message: 'Institution updated successfully.',
      data: institutes,
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Class code already exists. Please use a different code.',
        error: 'DUPLICATE_CODE',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const deleteInstitutes = async (req, res) => {
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

    const institutes = await Institutes.findByIdAndDelete(id)
      .populate('address.stateId', 'name')
      .populate('address.districtId', 'name')
      .populate('address.cityId', 'name');

    if (!institutes) {
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
      message: 'Institutes deleted successfully.',
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
export const InstitutesController = {
  createInstitutes,
  getAllInstitutes,
  updateInstitutes,
  getInstitutesById,
  deleteInstitutes,
};
