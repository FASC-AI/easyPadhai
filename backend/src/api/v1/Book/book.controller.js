/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Book from './book.model';
import mongoose from 'mongoose';
import createResponse from '../../../utils/response';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';

const errorMessages = {
  NOT_FOUND: 'Book not found',
  ID_REQUIRED: 'ID is required',
};

const createBook = async (req, res) => {
  try {
    const { bookCode, ...payload } = req.body;
    const createdBy = getUserIdFromRequest(req);
    // count book
    const count = await Book.countDocuments();
    const Books = await Book.create({
      ...payload,
      order: count + 1,
      createdBy,
    });
    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Book created successfully.',
      data: Books,
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
      message: 'Failed to create book. Please try again.',
      error: error.message,
    });
  }
};

const getAllBook = async (req, res) => {
  try {
    const { search } = extractCommonQueryParams(req);
    const { isActive, classId, subjectId } = req.query;

    // Base match stage for filtering
    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true'; // Convert string to boolean
    }
    if (classId) {
      matchStage.classId = new mongoose.Types.ObjectId(classId); // Convert to ObjectId
    }
    if (subjectId) {
      matchStage.subjectId = new mongoose.Types.ObjectId(subjectId); // Convert to ObjectId
    }

    // If search is provided, match after lookup to search on subject and class names
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
              { 'subject.nameEn': searchRegex }, // Search on subject's nameEn
              { 'class.nameEn': searchRegex }, // Search on class's nameEn
              { codee: searchRegex }, // Search on codee (will be renamed to code)
              { nameEn: searchRegex }, // Search on nameEn (will be renamed to book)
            ],
          },
        },
      ];
    }

    // Aggregation pipeline for fetching books with class, subject, and lesson counts
    const pipeline = [
      // Initial match for isActive, classId, and subjectId filters
      { $match: matchStage },
      // Lookup to join with Subject collection
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      // Unwind subject array
      {
        $unwind: {
          path: '$subject',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup to join with Class collection
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      // Unwind class array
      {
        $unwind: {
          path: '$class',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup to join with lessonMasters collection to count lessons
      {
        $lookup: {
          from: 'lessonmasters',
          localField: '_id',
          foreignField: 'bookId', // Matches the bookId in lessonMasters
          as: 'lessons',
        },
      },
      // Apply search filter after lookup
      ...searchStage,
      // Project to shape the response and rename fields
      {
        $project: {
          _id: 1,
          subject: '$subject',
          class: '$class',
          book: '$nameEn',
          code: '$codee',
          images: 1,
          description: 1,
          bookCode: 1,
          order: 1,
          isActive: 1,
          createdAt: 1,
          lessons: 1, // Include lessons array for counting
        },
      },
      // Group by class and subject to calculate counts
      {
        $group: {
          _id: {
            className: '$class.nameEn',
            subjectName: '$subject.nameEn',
          },
          books: { $push: '$$ROOT' },
          classCount: { $sum: 1 }, // Count of books per class
          subjectCount: { $sum: 1 }, // Count of books per subject (same as classCount in this group)
        },
      },
      // Project to include counts in each book and calculate lessonCount
      {
        $unwind: '$books',
      },
      {
        $project: {
          _id: '$books._id',
          bookCode: '$books.bookCode',
          order: '$books.order',
          subject: '$books.subject',
          class: '$books.class',
          book: '$books.book',
          code: '$books.code',
          images: '$books.images',
          description: '$books.description',
          isActive: '$books.isActive',
          createdAt: '$books.createdAt',
          classCount: '$classCount', // Total books for the class
          subjectCount: '$subjectCount', // Total books for the subject
          lessonCount: { $size: '$books.lessons' }, // Count of lessons for the book
        },
      },
      // Sort by order in ascending order
      { $sort: { order: 1 } },
    ];

    // Execute the pipeline
    const listResult = await Book.aggregate(pipeline);

    // Get total count from the result
    const totalCount = listResult.length;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Book retrieved',
      data: {
        Books: listResult || [],
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

const getAllBookWeb = async (req, res) => {
  try {
    // Log raw query parameters
    console.log('Raw req.query:', req.query);

    // Extract query parameters
    const {
      search,
      page,
      limit: rawLimit,
      sortBy,
      order: sortOrder,
      isActive,
      classId,
      subjectId,
    } = req.query;

    // Log extracted parameters
    console.log('Extracted Parameters:', {
      search,
      page,
      limit: rawLimit,
      sortBy,
      sortOrder,
      isActive,
      classId,
      subjectId,
    });

    // Check if pagination is requested (both page and limit must be provided)
    const isPaginated =
      page !== undefined &&
      rawLimit !== undefined &&
      !isNaN(parseInt(page)) &&
      !isNaN(parseInt(rawLimit)) &&
      parseInt(rawLimit) > 0;
    console.log('isPaginated:', isPaginated);

    // Parse pagination parameters
    let pageNum = 1;
    let limitNum, skip, totalPages;
    if (isPaginated) {
      pageNum = Math.max(1, parseInt(page, 10));
      limitNum = Math.max(1, parseInt(rawLimit, 10));
      skip = (pageNum - 1) * limitNum;
      console.log('Pagination params:', { pageNum, limitNum, skip });
    } else {
      console.log('No pagination - fetching all data');
    }

    // Base match stage
    let matchStage = {};
    try {
      if (typeof isActive !== 'undefined') {
        matchStage.isActive = isActive === 'true';
      }
      if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: 'Invalid classId',
          });
        }
        matchStage.classId = new mongoose.Types.ObjectId(classId);
      }
      if (subjectId) {
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: 'Invalid subjectId',
          });
        }
        matchStage.subjectId = new mongoose.Types.ObjectId(subjectId);
      }
    } catch (err) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId: ${err.message}`,
      });
    }

    // Search stage
    let searchStage = [];
    if (search) {
      try {
        const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
        const searchRegex = isSpecialCharSearch
          ? {
              $regex: `^${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              $options: 'i',
            }
          : {
              $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i',
            };

        searchStage = [
          {
            $match: {
              $or: [
                { 'subject.nameEn': searchRegex },
                { 'class.nameEn': searchRegex },
                { codee: searchRegex },
                { nameEn: searchRegex },
              ],
            },
          },
        ];
      } catch (err) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid search regex',
        });
      }
    }

    // Sort configuration
    let sortStage = { $sort: { order: 1 } };
    if (
      sortBy &&
      sortOrder &&
      ['asc', 'desc'].includes(sortOrder.toLowerCase())
    ) {
      const sortDirection = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
      // Validate sortBy field
      const validSortFields = [
        'createdAt',
        'order',
        'book',
        'code',
        'bookCode',
      ];
      if (!validSortFields.includes(sortBy)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: `Invalid sortBy field: ${sortBy}. Valid fields: ${validSortFields.join(', ')}`,
        });
      }
      sortStage = { $sort: { [sortBy]: sortDirection } };
      console.log('Custom sort applied:', sortStage);
    } else {
      console.log('Default sort applied:', sortStage);
    }

    // Main aggregation pipeline
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
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'lessonmasters',
          localField: '_id',
          foreignField: 'bookId',
          as: 'lessons',
        },
      },
      ...searchStage,
      {
        $project: {
          _id: 1,
          subject: '$subject',
          class: '$class',
          book: '$nameEn',
          code: '$codee',
          images: 1,
          description: 1,
          bookCode: 1,
          order: 1,
          isActive: 1,
          createdAt: { $ifNull: ['$createdAt', new Date(0)] }, // Ensure createdAt exists
          lessons: 1,
        },
      },
      {
        $group: {
          _id: {
            className: '$class.nameEn',
            subjectName: '$subject.nameEn',
          },
          books: { $push: '$$ROOT' },
          classCount: { $sum: 1 },
          subjectCount: { $sum: 1 },
        },
      },
      { $unwind: '$books' },
      {
        $project: {
          _id: '$books._id',
          bookCode: '$books.bookCode',
          order: '$books.order',
          subject: '$books.subject',
          class: '$books.class',
          book: '$books.book',
          code: '$books.code',
          images: '$books.images',
          description: '$books.description',
          isActive: '$books.isActive',
          createdAt: '$books.createdAt',
          classCount: '$classCount',
          subjectCount: '$subjectCount',
          lessonCount: { $size: '$books.lessons' },
        },
      },
      sortStage,
    ];

    // Log pipeline
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    // Add pagination if requested
    if (isPaginated) {
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });
    }

    // Count pipeline
    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      ...searchStage,
      { $count: 'total' },
    ];

    // Execute pipelines
    const [listResult, countResult] = await Promise.all([
      Book.aggregate(pipeline).collation({
        locale: 'en',
        numericOrdering: true,
      }),
      Book.aggregate(countPipeline),
    ]);

    // Log sample of listResult to inspect createdAt values
    console.log(
      'Sample Result (first 5):',
      listResult.slice(0, 5).map((doc) => ({
        _id: doc._id,
        createdAt: doc.createdAt,
        book: doc.book,
      }))
    );

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    totalPages = isPaginated ? Math.ceil(totalCount / limitNum) : 1;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Books retrieved',
      data: {
        Books: listResult || [],
        count: totalCount,
        totalPages,
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error('Error in getAllBookWeb:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
const updateBook = async (req, res) => {
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

    const { bookCode, ...updatePayload } = req.body;
    const updatedBy = getUserIdFromRequest(req);
    const Books = await Book.findByIdAndUpdate(
      id,
      { $set: { ...updatePayload, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!Books) {
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
      message: 'Book updated successfully.',
      data: Books,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update Book. Please try again.',
      error: error.message,
    });
  }
};
const getBookById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const books = await Book.findById(id);
    if (!books) {
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
      message: 'Book fetched successfully',
      data: books,
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
const deleteBook = async (req, res) => {
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

    const books = await Book.findByIdAndDelete(id);

    if (!books) {
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
      message: 'Book deleted successfully',
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
const getBooksBySubjectId = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    const { isActive, subjectId, classId } = req.query;

    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true';
    }

    if (subjectId) {
      matchStage.subjectId = {
        $in: subjectId.split(',').map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (classId) {
      matchStage.classId = {
        $in: classId.split(',').map((id) => new mongoose.Types.ObjectId(id)),
      };
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
              { 'subject.nameEn': searchRegex },
              { 'class.nameEn': searchRegex },
              { codee: searchRegex },
              { nameEn: searchRegex },
            ],
          },
        },
      ];
    }

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
          preserveNullAndEmptyArrays: true, // Keep books even if subject is not found
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
          preserveNullAndEmptyArrays: true, // Keep books even if subject is not found
        },
      },

      ...searchStage,

      {
        $project: {
          _id: 1,
          subject: '$subject.nameEn',
          images: 1,
          class: '$class.nameEn',
          book: '$nameEn',
          code: '$codee',
          description: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
      { $sort: { order: 1 } },
      // { $skip: skip },
      // { $limit: limit },
    ];

    const countPipeline = [
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
      ...searchStage,
      { $count: 'total' },
    ];

    // Execute both pipelines in parallel
    const [listResult, countResult] = await Promise.all([
      Book.aggregate(pipeline),
      Book.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Books retrieved',
      data: {
        Books: listResult,
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
const getBooksBySubjectClassId = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    const { isActive, subjectId, classId } = req.query;

    // Build match stage for filtering
    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true';
    }

    // Handle subjectId as an array
    if (subjectId) {
      matchStage.subjectId = {
        $in: subjectId
          .split(',')
          .map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    // Handle classId as an array
    if (classId) {
      matchStage.classId = {
        $in: classId
          .split(',')
          .map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    // Build search stage if search query is provided
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
              { 'subject.nameEn': searchRegex },
              { 'class.nameEn': searchRegex },
              { codee: searchRegex },
              { nameEn: searchRegex },
            ],
          },
        },
      ];
    }

    // Aggregation pipeline for fetching books
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
          preserveNullAndEmptyArrays: true, // Keep books even if subject is not found
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
          preserveNullAndEmptyArrays: true, // Keep books even if class is not found
        },
      },
      ...searchStage,
      {
        $project: {
          _id: 1,
          subject: '$subject.nameEn',
          images: 1,
          class: '$class.nameEn',
          book: '$nameEn',
          code: '$codee',
          description: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: Number(skip) || 0 },
      { $limit: Number(limit) || 10 },
    ];

    // Aggregation pipeline for counting total documents
    const countPipeline = [
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
      ...searchStage,
      { $count: 'total' },
    ];

    // Execute both pipelines in parallel
    const [listResult, countResult] = await Promise.all([
      Book.aggregate(pipeline),
      Book.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Books retrieved',
      data: {
        Books: listResult,
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
const getBooksBySubject = async (req, res) => {
  try {
    // Extract query params with default limit of 10
    const { limit = 10, skip = 0, search } = extractCommonQueryParams(req);
    const { isActive, subjectId, classId } = req.query;

    let matchStage = {};
    if (typeof isActive !== 'undefined') {
      matchStage.isActive = isActive === 'true';
    }

    if (subjectId) {
      matchStage.subjectId = {
        $in: subjectId.split(',').map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (classId) {
      matchStage.classId = {
        $in: classId.split(',').map((id) => new mongoose.Types.ObjectId(id)),
      };
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
              { 'subject.nameEn': searchRegex },
              { 'class.nameEn': searchRegex },
              { codee: searchRegex },
              { nameEn: searchRegex },
            ],
          },
        },
      ];
    }

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
          preserveNullAndEmptyArrays: true, // Keep books even if subject is not found
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
          preserveNullAndEmptyArrays: true, // Keep books even if class is not found
        },
      },

      ...searchStage,

      {
        $project: {
          _id: 1,
          subject: '$subject.nameEn',
          images: 1,
          class: '$class.nameEn',
          book: '$nameEn',
          code: '$codee',
          description: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline = [
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
      ...searchStage,
      { $count: 'total' },
    ];

    // Execute both pipelines in parallel
    const [listResult, countResult] = await Promise.all([
      Book.aggregate(pipeline),
      Book.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Books retrieved',
      data: {
        Books: listResult,
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
const reorderBooks = async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Order must be an array',
      });
    }

    // Validate ObjectIDs
    const invalidIds = order.filter(({ id }) => !mongoose.isValidObjectId(id));
    if (invalidIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectIDs: ${invalidIds.map((item) => item.id).join(', ')}`,
      });
    }

    const updates = order.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) }, // Convert string to ObjectID
        update: { $set: { order: Number(order) } }, // Ensure order is a number
      },
    }));

    const result = await Book.bulkWrite(updates);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Book order updated successfully',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update book order', // Fixed message
      error: error.message,
    });
  }
};
export const BookController = {
  createBook,
  getAllBook,
  getAllBookWeb,
  updateBook,
  getBookById,
  deleteBook,
  getBooksBySubjectId,
  getBooksBySubjectClassId,
  getBooksBySubject,
  reorderBooks,
};
