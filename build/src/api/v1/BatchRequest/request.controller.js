/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import batchRequestSchema from './request.model.js';
import batchModel from '../Batch/batch.model.js';
import profileModel from '../User-Profile/userprofile.model.js';
import mongoose from 'mongoose';
import createResponse from '../../../utils/response.js';
import { format_dd_mmm_yyyy } from '../../../utils/date-format.js';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';
import { profileSchema } from '../User-Profile/userprofile.validator.js';

const errorMessages = {
  NOT_FOUND: 'Batch Request not found',
  ID_REQUIRED: 'ID is required',
};

const createBatchRequest = async (req, res) => {
  try {
    const payload = req.body;
    let batchData = await batchModel.findOne({ code: payload.code });
    if (batchData.classTeacherId == req.user._id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: true,
        message: 'Teacher cannot join its own batch',
      });
    }
    if (!batchData) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: true,
        message: 'Batch code not exixt',
      });
    }
    let porifleData = await profileModel
      .findOne({
        userId: req.user._id,
      })
      .populate('userId');
    if (
      //  batchData?.sectionId &&
      //     !porifleData?.sections?.some(
      //       (section) => section.toString() === batchData.sectionId.toString()
      //     )) ||

      !porifleData?.classId?.some(
        (classId) => classId.toString() === batchData.classId.toString()
      ) &&
      porifleData?.userId?.userRole === 'student'
    ) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'You are not allowed to join this batch',
      });
    }
    payload.batchId = batchData._id;
    payload.userId = req.user._id;
    let isRequestedBatch = await batchRequestSchema.findOne({
      userId: req.user._id,
      approve: null,
    });
    if (isRequestedBatch) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'You  have already requested to join batch.',
      });
    }
    let isJoinedBatch = await batchRequestSchema
      .findOne({
        userId: req.user._id,
        approve: true,
      })
      .populate('userId');
    if (isJoinedBatch && isJoinedBatch.userId.userRole !== 'teacher') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'You have already joined the batch.',
      });
    }
    let batchRequest = await batchRequestSchema.create(payload);
    let userData = await profileModel.findOne({ userId: req.user._id });
    userData.rollNo = payload.rollNo;
    userData.save();
    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Batch Request created successfully.',
      data: batchRequest,
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
const batchRequestApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const { approve } = req.body;
    if (typeof approve !== 'boolean') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Approve field must be a boolean value (true or false).',
      });
    }
    // done for removing request so it can reapply 17/07🟢
    if (approve) {
      const updatedBatch = await batchRequestSchema.findByIdAndUpdate(
        id,
        { approve },
        { new: true, runValidators: true }
      );
      if (!updatedBatch) {
        return createResponse({
          res,
          statusCode: httpStatus.NOT_FOUND,
          status: false,
          message: 'Batch not found.',
        });
      }
      const userData = await profileModel.findOne({
        userId: updatedBatch.userId,
      });

      console.log('userData', userData, updatedBatch.userId, updatedBatch);

      if (!userData) {
        console.error('No profile found for userId:', updatedBatch.userId);
        return res.status(404).json({ error: 'User profile not found' });
      }

      userData.joinedBatch = updatedBatch.batchId;

      await userData.save();
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: approve
          ? 'Batch approved successfully.'
          : 'Batch rejected successfully.',
        data: {
          id: updatedBatch._id,
          approve: updatedBatch.approve,
        },
      });
    } else {
      // delete the batch request
      const updatedBatch = await batchRequestSchema.findByIdAndDelete(id);
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'Batch rejected successfully.',
        data: {
          id: '',
          approve: approve,
        },
      });
    }
  } catch (error) {
    console.log(error);
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
      message: 'Failed to update batch approval status. Please try again.',
      error: error.message,
    });
  }
};
const requestedBatch = async (req, res) => {
  try {
    const id = req.user._id;
    let requestedBatchData = await batchRequestSchema
      .find({ approve: null })
      .populate('batchId userId');
    let requestedBatch = requestedBatchData.filter((batch) => {
      return batch?.batchId?.classTeacherId?.toString() === id.toString();
    });
    let formattedResults = await Promise.all(
      requestedBatch.map(async (batch) => {
        if (!batch?.userId) {
          return {
            id: batch._id,
            approve: batch?.approve ?? null,
            userRole: 'unknown',
            name: 'N/A',
            roll: '',
            sections: '',
            class: '',
          };
        }
        let profileData = await profileModel
          .findOne({ userId: batch.userId._id })
          .populate('sections classId');
        if (!profileData && batch.userId.userRole === 'student') {
          console.log(
            `No profile found for student userId: ${batch.userId._id}`
          );
        }

        return {
          id: batch._id,
          approve: batch?.approve ?? null,
          userRole: batch?.userId?.userRole ?? 'unknown',
          name: batch?.userId?.name?.english ?? 'N/A',
          roll:
            batch?.userId?.userRole === 'student' && profileData
              ? profileData.rollNo || ''
              : '',
          sections: profileData?.sections?.length
            ? profileData.sections
                .map((sec) => sec.sectionsName || '')
                .join(', ')
            : '',
          class: profileData?.classId?.length
            ? profileData.classId.map((cl) => cl.nameEn || '').join(', ')
            : '',
        };
      })
    );

    return createResponse({
      res,
      data: formattedResults,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Batch Data',
    });
  } catch (error) {
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
      message: 'Failed to fetch batch data. Please try again.',
      error: error.message,
    });
  }
};
const checkJoinedBatch = async (req, res) => {
  try {
    let profileData = await profileModel.findOne({ userId: req.user._id });

    if (!profileData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'profile not found',
      });
    }

    let batchData = await batchModel
      .findOne({
        _id: new mongoose.Types.ObjectId(profileData.joinedBatch),
        classId: { $in: profileData.classId },
      })
      .sort({ createdAt: -1 })
      .populate('classTeacherId');

    console.log(batchData, 'batchData');

    if (!batchData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Batch not found for this user.',
      });
    }

    let batchRequestData = await batchRequestSchema
      .find({
        userId: req.user._id,
        batchId: batchData?._id,
        approve: true,
      })
      .populate('userId')
      .populate({
        path: 'batchId',
        populate: {
          path: 'classTeacherId',
          model: 'User',
        },
      });

    if (!batchRequestData || batchRequestData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'You have not joined any batch',
      });
    }
    let studentData = await batchRequestSchema
      .find({ batchId: batchData?._id })
      .populate('userId');
    // Filter for teachers and add subject to each teacher's userId
    let arr = [];
    for (let data of studentData) {
      let subjectData = await profileModel
        .findOne({ userId: data?.userId?._id })
        .populate('subjectId');

      if (data?.userId?.userRole == 'teacher') {
        let newData = {
          ...data.toObject(),
          userId: {
            ...data.userId.toObject(),
            subject: subjectData?.subjectId[0]?.nameEn || null,
            subjectId: subjectData?.subjectId[0]?._id || null,
          },
        };
        arr.push(newData);
      }
    }

    // Add classTeacher data in the same structure as teachers
    let classTeacherData = null;
    if (batchData?.classTeacherId) {
      let classTeacherProfile = await profileModel
        .findOne({ userId: batchData?.classTeacherId?._id })
        .populate('subjectId');

      // Use the populated classTeacherId from batchData
      const classTeacherObj = batchData.classTeacherId.toObject
        ? batchData.classTeacherId.toObject()
        : batchData.classTeacherId;

      classTeacherData = {
        _id: classTeacherObj._id, // Use classTeacherId as _id to mimic teachers structure
        userId: {
          ...classTeacherObj,
          subject: classTeacherProfile?.subjectId[0]?.nameEn || null,
          subjectId: classTeacherProfile?.subjectId[0]?._id || null,
        },
        batchId: batchData._id,
        approve: true,
        createdAt: batchData.createdAt,
        updatedAt: batchData.updatedAt,
        __v: 0,
      };
      arr.push(classTeacherData); // Add classTeacher to the same array as teachers
    }

    return res.status(httpStatus.OK).json({
      status: true,
      message: 'Batch Data',
      data: arr, // Return the combined array
      batchCode: batchData.code || '',
    });

    // return createResponse({
    //   res,
    //   data: arr, // Return the combined array
    //   batchCode: batchData.code || '',
    //   statusCode: httpStatus.OK,
    //   status: true,
    //   message: 'Batch Data',
    // });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      error: error.message,
    });
  }
};

const removeStudentFromBatch = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { userIds } = req.body;

    // Ensure userIds is an array
    if (!Array.isArray(userIds)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'userIds must be an array.',
      });
    }
    console.log(userIds, 'userIds');

    if (!userIds || userIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'No user IDs provided.',
      });
    }
    console.log(userIds, teacherId, 'userIds0');

    const results = {
      successful: [],
      failed: [],
    };

    for (const userId of userIds) {
      const userData = await batchRequestSchema.findOne({ userId });

      if (!userData) {
        console.log(userData, 'userIds1');

        results.failed.push({
          userId,
          reason: 'Student not found in any batch request.',
        });
        continue;
      }

      const batchData = await batchModel.findById(userData.batchId);

      if (!batchData) {
        console.log(batchData, 'userIds2');

        results.failed.push({ userId, reason: 'Batch not found.' });
        continue;
      }

      // Check if current user is the class teacher
      if (String(batchData.classTeacherId) !== String(teacherId)) {
        results.failed.push({
          userId,
          reason: 'You are not authorized to remove students from this batch.',
        });
        continue;
      }

      await batchRequestSchema.findOneAndDelete({ userId });
      console.log(batchData, 'userIds3');

      // this is done my me alone me i am me it is my duty to fix this shit dont trust anything try it yourself - shreyash
      await profileModel.findOneAndUpdate(
        { userId, joinedBatch: batchData._id }, // ensure it matches
        { $unset: { joinedBatch: '' } }
      );

      results.successful.push(userId);
    }

    // Prepare response based on results
    if (results.successful.length === 0 && results.failed.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'No students were removed.',
        data: { failed: results.failed },
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Student removal process completed.',
      data: {
        successful: results.successful,
        failed: results.failed,
      },
    });
  } catch (error) {
    console.log(error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const BatchRequestController = {
  createBatchRequest,
  checkJoinedBatch,
  batchRequestApproval,
  requestedBatch,
  removeStudentFromBatch,
};
