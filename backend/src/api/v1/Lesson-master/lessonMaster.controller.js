/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import LessonMaster from './lessonMaster.model.js';
import createResponse from '../../../utils/response.js';
import { Types } from 'mongoose';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';

const errorMessages = {
  NOT_FOUND: 'Lesson not found',
  ID_REQUIRED: 'ID is required',
};

const createLesson = async (req, res) => {
  try {
    const payload = req.body;
    const count = await LessonMaster.countDocuments();
    const Lessons = await LessonMaster.create({
      ...payload,
      order: count + 1,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Lesson added successfully.',
      data: Lessons,
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

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to create Lesson. Please try again.',
      error: error.message,
    });
  }
};

const getAllLessonWeb = async (req, res) => {
  try {
    const { skip: rawSkip, search } = extractCommonQueryParams(req);
    const { isActive } = req.query;
    let { limit } = req.query;

    // Default limit to 10 if not provided
    limit = parseInt(limit, 10) || null;

    console.log('Raw req.query:', req.query, limit);

    // Validate and set default values for limit and skip
    const skip = parseInt(rawSkip, 10) || 0; // Default to 0 if invalid or missing

    // Ensure limit and skip are positive

    // Base match stage for filtering
    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true';
    }

    let searchStage = [];
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      const searchRegex = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : { $regex: search, $options: 'i' };

      searchStage = [
        {
          $match: {
            $or: [
              { 'book.nameEn': searchRegex },
              { 'subject.nameEn': searchRegex },
              { 'class.nameEn': searchRegex },
              { codee: searchRegex },
              { nameEn: searchRegex },
            ],
          },
        },
      ];
    }

    // Aggregation pipeline for fetching lessons
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
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
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      {
        $unwind: {
          path: '$book',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...searchStage,
      {
        $project: {
          _id: 1,
          nameEn: 1,
          order: 1,
          subject: '$subject.nameEn',
          class: '$class.nameEn',
          book: '$book.nameEn',
          code: '$codee',
          description: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
      { $sort: { order: 1 } }, // Changed from createdAt to order in ascending order
      { $skip: skip },
      ...(limit ? [{ $limit: limit }] : []),
    ];

    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      ...searchStage,
      { $count: 'total' },
    ];

    const [listResult, countResult] = await Promise.all([
      LessonMaster.aggregate(pipeline),
      LessonMaster.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson retrieved',
      data: {
        Lessons: listResult,
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
const getAllLesson = async (req, res) => {
  try {
    const { search } = extractCommonQueryParams(req);
    const { isActive } = req.query;

    // Base match stage for filtering
    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true';
    }

    let searchStage = [];
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      const searchRegex = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : { $regex: search, $options: 'i' };

      searchStage = [
        {
          $match: {
            $or: [
              { 'book.nameEn': searchRegex },
              { 'subject.nameEn': searchRegex },
              { 'class.nameEn': searchRegex },
              { codee: searchRegex },
              { nameEn: searchRegex },
            ],
          },
        },
      ];
    }

    // Aggregation pipeline for fetching lessons
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
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
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      {
        $unwind: {
          path: '$book',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...searchStage,
      {
        $project: {
          _id: 1,
          nameEn: 1,
          order: 1,
          subject: '$subject.nameEn',
          class: '$class.nameEn',
          book: '$book.nameEn',
          code: '$codee',
          description: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
      { $sort: { order: 1 } },
    ];

    // Execute the pipeline
    const listResult = await LessonMaster.aggregate(pipeline);

    // Get total count from the result
    const totalCount = listResult.length;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson retrieved',
      data: {
        Lessons: listResult,
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
export const getLessonByLessonId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing lessonId parameter',
      });
    }

    const pipeline = [
      {
        $match: {
          bookId: {
            $in: [new Types.ObjectId(id)], // ✅ CORRECT: array with one ObjectId
          },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      {
        $unwind: {
          path: '$subject',
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
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      {
        $unwind: {
          path: '$book',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          nameEn: 1,
          description: 1,
          isActive: 1,
          createdAt: 1,
          subject: { $ifNull: ['$subject.nameEn', null] },
          class: { $ifNull: ['$class.nameEn', null] },
          book: { $ifNull: ['$book.nameEn', null] },
          code: { $ifNull: ['$codee', null] }, // Ensures consistency
        },
      },
    ];

    const result = await LessonMaster.aggregate(pipeline);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson retrieved',
      data: {
        Lessons: result,
        count: result.length,
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
const updateLesson = async (req, res) => {
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

    const updatedBy = getUserIdFromRequest(req);
    const Lessons = await LessonMaster.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!Lessons) {
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
      message: 'Lessons updated successfully.',
      data: Lessons,
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
        message: 'Lesson code already exists. Please use a different code.',
        error: 'DUPLICATE_CODE',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update Lesson. Please try again.',
      error: error.message,
    });
  }
};
const getLessonById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const lessons = await LessonMaster.findById(id);
    if (!lessons) {
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
      message: 'Lesson fetched successfully',
      data: lessons,
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
const deleteLesson = async (req, res) => {
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

    const lessons = await LessonMaster.findByIdAndDelete(id);

    if (!lessons) {
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
      message: 'Lessons deleted successfully',
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
const getLessonBySubjectClassBookId = async (req, res) => {
  try {
    const { subjectId, classId, bookId } = req.query;
    if (!subjectId || !classId || !bookId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'subjectId, classId, and bookId are required',
      });
    }

    // Query to find lessons
    const query = {
      subjectId: { $in: [subjectId] },
      classId: { $in: [classId] },
      bookId: { $in: [bookId] },
    };

    // Fetch lessons
    const lessons = await LessonMaster.find(query);

    // Get total count of lessons
    const totalCount = await LessonMaster.countDocuments(query);

    // if (!lessons || lessons.length === 0) {
    //   return createResponse({
    //     res,
    //     statusCode: httpStatus.NOT_FOUND,
    //     status: false,
    //     // message: errorMessages.NOT_FOUND,
    //   });
    // }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lessons fetched successfully',
      data: {
        lessons,
        total: totalCount,
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
const reorderLessons = async (req, res) => {
  try {
    const { order, lessonId } = req.body; // Expecting { order: [{ _id, order }], bookId }
    console.log(
      'Received reorder payload:',
      JSON.stringify({ order, lessonId }, null, 2)
    );

    // Validate payload
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        code: 400,
        status: false,
        message: 'Invalid payload: order must be a non-empty array',
      });
    }

    // Validate bookId if provided
    if (lessonId && !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        code: 400,
        status: false,
        message: 'Invalid lessonId',
      });
    }

    // Verify all lesson IDs exist and optionally filter by bookId
    const lessonIds = order.map((item) => item._id);
    const query = lessonId
      ? {
          _id: { $in: lessonIds },
          lessonId: { $in: [new mongoose.Types.ObjectId(lessonId)] },
        }
      : { _id: { $in: lessonIds } };
    const existingLessons = await LessonMaster.find(query);
    if (existingLessons.length !== order.length) {
      console.log(
        'Some lesson IDs not found or do not belong to bookId:',
        lessonIds
      );
      return res.status(400).json({
        code: 400,
        status: false,
        message: 'One or more lesson IDs not found or do not match bookId',
      });
    }

    // Check if order has changed
    const hasChanges = order.some((item) => {
      const lesson = existingLessons.find((l) => l._id.toString() === item._id);
      return lesson && lesson.order !== item.order;
    });
    if (!hasChanges) {
      console.log('No changes in order detected');
      return res.status(200).json({
        code: 200,
        status: true,
        message: 'Lesson order unchanged',
        data: { modifiedCount: 0 },
      });
    }

    // Prepare bulk write operations
    const bulkOps = order.map(({ _id, order }) => ({
      updateOne: {
        filter: lessonId
          ? { _id, lessonId: { $in: [new mongoose.Types.ObjectId(lessonId)] } }
          : { _id },
        update: { $set: { order } },
      },
    }));

    console.log('Bulk operations:', JSON.stringify(bulkOps, null, 2));
    const result = await LessonMaster.bulkWrite(bulkOps);
    console.log('Bulk write result:', result);

    return res.status(200).json({
      code: 200,
      status: true,
      message: 'Lesson order updated successfully',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error('Reorder error:', error);
    return res.status(500).json({
      code: 500,
      status: false,
      message: error.message || 'Failed to update lesson order',
    });
  }
};
export const LessonController = {
  createLesson,
  getAllLesson,
  getAllLessonWeb,
  updateLesson,
  getLessonById,
  getLessonByLessonId,
  deleteLesson,
  getLessonBySubjectClassBookId,
  reorderLessons,
};
