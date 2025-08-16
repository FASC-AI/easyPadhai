/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import batchSchema from './batch.model';
import requestModel from '../BatchRequest/request.model';
import mongoose from 'mongoose';
import userprofileModel from '../User-Profile/userprofile.model';
import createResponse from '../../../utils/response';
import { format_dd_mmm_yyyy } from '../../../utils/date-format';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import batchModel from './batch.model';

const errorMessages = {
  NOT_FOUND: 'Batch not found',
  ID_REQUIRED: 'ID is required',
};

const createBatch = async (req, res) => {
  try {
    let existBatches = await batchModel.findOne({
      classTeacherId: req.user._id,
    });
    if (existBatches) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'You already have existing batch for current year',
      });
    }
    const userData = await userprofileModel
      .findOne({ userId: req.user._id })
      .populate('institution');
    if (!userData) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User not found.',
        error: 'USER_NOT_FOUND',
      });
    }

    if (userData?.classId?.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId and sections arrays cannot be empty.',
        error: 'EMPTY_ARRAYS',
      });
    }

    const { classId, sectionId, code } = req.body;
    let existingUserCode;
    existingUserCode = await batchSchema.findOne({
      classId: classId,
      sectionId: sectionId,
    });
    if (!sectionId) {
      existingUserCode = await batchSchema.findOne({
        classId: classId,
      });
    }

    if (existingUserCode) {
      const existingInstitute = await userprofileModel
        .findOne({
          userId: existingUserCode.classTeacherId.toString(),
        })
        .populate('institution');
      console.log('existingInstitute', existingInstitute, existingUserCode);

      if (!existingInstitute || !existingInstitute.institution) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Institution for class teacher not found.',
          error: 'INSTITUTE_NOT_FOUND',
        });
      }

      if (
        !existingUserCode.createdAt ||
        isNaN(new Date(existingUserCode.createdAt))
      ) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid createdAt date in batch.',
          error: 'INVALID_DATE',
        });
      }

      const createdAtIST = new Date(
        existingUserCode.createdAt.getTime() + 5.5 * 60 * 60 * 1000
      );
      const createdAtYear = createdAtIST.getFullYear();
      const currentYear = new Date().getFullYear();

      if (
        userData.institution?.institutesName ===
          existingInstitute.institution.institutesName &&
        userData.institution?.instituteType ===
          existingInstitute.institution.instituteType &&
        createdAtYear === currentYear
      ) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Batch code already exists for this institution and year.',
          error: 'DUPLICATE_CODE',
        });
      }
    }

    // Prepare payload for new batch
    const payload = {
      ...req.body,
      classTeacherId: req.user._id, // Set classTeacherId
    };

    // Create new batch
    const batches = await batchSchema.create(payload);

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Batch created successfully.',
      data: batches,
    });
  } catch (error) {
    console.log(error.message, 'message');
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
        message:
          'Batch code already exists. Please use a different batch code.',
        error: 'DUPLICATE_CODE',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to create batch. Please try again.',
      error: error.message,
    });
  }
};
const getAllBatch = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);

    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedSkip = parseInt(skip, 10) || 0; // Default to 0 if skip is invalid

    // Ensure limit and skip are positive numbers
    if (parsedLimit < 0 || parsedSkip < 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Limit and skip must be non-negative numbers',
      });
    }

    let query = {};
    let searchRegex = search || '';
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      searchRegex = isSpecialCharSearch ? `^${search}$` : search;
      query = {};
    }

    const pipeline = [
      { $match: query },
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
          as: 'classTeacher',
        },
      },
      {
        $unwind: {
          path: '$classTeacher',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'batchrequests',
          let: { batchId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$batchId', '$$batchId'] },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                approve: 1,
                userRole: { $ifNull: ['$user.userRole', ''] },
              },
            },
          ],
          as: 'batchRequests',
        },
      },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  {
                    'section.sectionsName': {
                      $regex: searchRegex,
                      $options: 'i',
                    },
                  },
                  { 'class.nameEn': { $regex: searchRegex, $options: 'i' } },
                  {
                    'classTeacher.name.english': {
                      $regex: searchRegex,
                      $options: 'i',
                    },
                  },
                  {
                    'classTeacher.email': {
                      $regex: searchRegex,
                      $options: 'i',
                    },
                  },
                  { code: { $regex: searchRegex, $options: 'i' } },
                ],
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          code: 1,

          section: { sectionsName: { $ifNull: ['$section.sectionsName', ''] } },
          class: { nameEn: { $ifNull: ['$class.nameEn', ''] } },
          classTeacher: {
            'name.english': { $ifNull: ['$classTeacher.name.english', ''] },
            email: { $ifNull: ['$classTeacher.email', ''] },
            userRole: { $ifNull: ['$classTeacher.userRole', ''] },
          },
          approvedRequestsCount: {
            $size: {
              $filter: {
                input: '$batchRequests',
                as: 'request',
                cond: {
                  $and: [
                    { $eq: ['$$request.approve', true] },
                    { $eq: ['$$request.userRole', 'teacher'] },
                  ],
                },
              },
            },
          },
          approvedStudentRequestsCount: {
            $size: {
              $filter: {
                input: '$batchRequests',
                as: 'request',
                cond: {
                  $and: [
                    { $eq: ['$$request.approve', true] },
                    { $eq: ['$$request.userRole', 'student'] },
                  ],
                },
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: parsedSkip },
      { $limit: parsedLimit },
    ];

    const [listResult, countResult] = await Promise.all([
      batchSchema.aggregate(pipeline),
      batchSchema
        .aggregate([...pipeline.slice(0, -2), { $count: 'total' }])
        .then((res) => (res[0] ? res[0].total : 0)),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Batches retrieved',
      data: {
        batches: listResult,
        count: countResult,
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
const getBatchById = async (req, res) => {
  try {
    const id = req.user._id;

    const batchData = await batchSchema.aggregate([
      { $match: { classTeacherId: id } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classId',
        },
      },
      { $unwind: { path: '$classId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'sectionId',
          foreignField: '_id',
          as: 'sectionId',
        },
      },
      { $unwind: { path: '$sectionId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'userinfos',
          localField: 'classTeacherId',
          foreignField: 'userId',
          as: 'userInformation',
        },
      },
      {
        $unwind: {
          path: '$userInformation',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'institutes',
          localField: 'userInformation.institution',
          foreignField: '_id',
          as: 'instituteData',
        },
      },
      {
        $unwind: {
          path: '$instituteData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'subjects',
          let: { subjectIds: '$userInformation.subjectId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$subjectIds'],
                },
              },
            },
          ],
          as: 'subjectData',
        },
      },
      {
        $unwind: {
          path: '$subjectData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          code: 1,
          class: '$classId.nameEn',
          classId: '$classId._id',
          subjectData: '$subjectData',
          section: '$sectionId.sectionsName',
          sectionId: '$sectionId._id',
          institute: '$instituteData.institutesName',
          createdAt: 1,
          classTeacher: { $literal: true },
        },
      },
    ]);

    const formattedBatches = batchData.map((batch) => ({
      id: batch._id,
      code: batch.code,
      section: batch.section || '',
      sectionId: batch.sectionId || '',
      class: batch.class,
      classId: batch.classId,
      subject: batch.subjectData,
      institute: batch.institute || '',
      createdAt: format_dd_mmm_yyyy(batch.createdAt),
      classTeacher: batch.classTeacher,
    }));

    let requestedBatchData = await requestModel.find({
      userId: id,
      approve: true,
    });

    const additionalBatches = [];
    for (let data of requestedBatchData) {
      if (!data.batchId) continue; // Skip if batchId is undefined

      const btachInfo = await batchSchema
        .findById(data.batchId)
        .populate('classTeacherId classId sectionId');

      if (!btachInfo) continue; // Skip if batchInfo is not found

      const profileData = await userprofileModel
        .findOne({
          userId: btachInfo.classTeacherId?._id,
        })
        .populate('subjectId institution');

      if (!profileData) continue; // Skip if profileData is not found

      additionalBatches.push({
        id: btachInfo._id,
        code: btachInfo?.code,
        section: btachInfo?.sectionId?.sectionsName || '',
        sectionId: btachInfo?.sectionId?._id || '',
        class: btachInfo?.classId?.nameEn,
        classId: btachInfo?.classId?._id,
        subject: profileData?.subjectId?.[0],
        institute: profileData?.institution?.institutesName || '',
        createdAt: format_dd_mmm_yyyy(btachInfo.createdAt),
        classTeacher: false,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Batches retrieved',
      data: [...formattedBatches, ...additionalBatches],
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

const getBatchInfo = async (req, res) => {
  try {
    const batchCode = req.body.batchCode;

    if (!batchCode) {
      return res
        .status(400)
        .json({ status: false, message: 'Batch code is required' });
    }

    const batchInfo = await batchSchema.aggregate([
      { $match: { code: batchCode } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classId',
        },
      },
      { $unwind: { path: '$classId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'sectionId',
          foreignField: '_id',
          as: 'sectionId',
        },
      },
      { $unwind: { path: '$sectionId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'userinfos',
          localField: 'classTeacherId',
          foreignField: 'userId',
          as: 'userInformation',
        },
      },
      {
        $unwind: { path: '$userInformation', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'institutes',
          localField: 'userInformation.institution',
          foreignField: '_id',
          as: 'instituteData',
        },
      },
      { $unwind: { path: '$instituteData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          class: '$classId.nameEn',
          section: '$sectionId.sectionsName',
          institute: {
            $ifNull: ['$instituteData.institutesName', 'Unknown Institute'],
          }, // Correct field name
          type: { $ifNull: ['$instituteData.instituteType', 'Unknown Type'] },
        },
      },
    ]);

    if (!batchInfo || batchInfo.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: 'Batch not found' });
    }

    // Log for debugging
    console.log('Batch Info:', JSON.stringify(batchInfo, null, 2));

    const obj = batchInfo[batchInfo.length - 1];

    return res
      .status(200)
      .json({ status: true, message: 'Batch info retrieved', data: obj });
  } catch (error) {
    console.error('Error in getBatchInfo:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
const batchStudentList = async (req, res) => {
  try {
    let classId = req.query.classId;
    const batchId = req.query.batchId;

    const userProfule = await userprofileModel.findOne({
      userId: req.user._id,
    });

    let batchData = await batchModel.findOne({
      classId: classId,
      classTeacherId: req.user._id,
    });

    if (!batchData) {
      batchData = await batchModel.findById(userProfule.joinedBatch);
    }

    if (!batchData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Batch not found for this teacher.',
      });
    }

    // Fetch approved requests for the batch and populate the user data
    let requestedBatch = await requestModel
      .find({
        batchId: batchId,
        approve: true,
      })
      .populate('userId');

    // Corrected map: wrap object in parentheses or use `return`
    let userData = requestedBatch
      .filter((user) => user?.userId?.userRole == 'student')
      .map((user) => ({
        name: user?.userId?.name?.english,
        _id: user?.userId?._id,
      }));

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Student list fetched successfully',
      data: userData,
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

export const BatchController = {
  createBatch,
  getAllBatch,
  getBatchById,
  getBatchInfo,
  batchStudentList,
};
