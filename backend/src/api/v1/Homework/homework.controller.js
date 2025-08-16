/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import homeworkModel from './homework.model';
import requestModel from '../BatchRequest/request.model';
import striptags from 'striptags';
import createResponse from '../../../utils/response';
import homeworkValidationSchema from './homework.validator';
import batchModel from '../Batch/batch.model';
import studentNotification from '../StudentNotification/studentnotification.model';
import userprofileModel from '../User-Profile/userprofile.model';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import User from '../User/user.model';
const errorMessages = {
  NOT_FOUND: 'Homework not found',
  ID_REQUIRED: 'ID is required',
};

const createHomework = async (req, res) => {
  try {
    const payload = { ...req.body };

    const userId = getUserIdFromRequest(req);
    payload.createdBy = userId;
    payload.updatedBy = userId;

    try {
      await homeworkValidationSchema.validate(payload, { abortEarly: false });
    } catch (validationError) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Validation error',
        error: validationError.errors,
      });
    }

    const homework = await homeworkModel.create(payload);

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Homework created successfully.',
      data: homework,
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Validation or casting error',
        error: error.message,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
};

const getHomeWork = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const role = await User.findById(req.user._id);
    const profile = await userprofileModel.findOne({ userId: req.user._id });
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const query = { isLast: true };

    // Add createdBy filter for editor role
    if (role.userRole === 'editor') {
      query.bookId = { $in: profile.bookId };
      query.subjectId = { $in: profile.subjectId };
    }

    const pipeline = [
      { $match: query },
      // Lookup for subjects
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      {
        $lookup: {
          from: 'lessons',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topicDetails',
        },
      },
      // Lookup for classes
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classDetails',
        },
      },
      // Lookup for createdBy (users)
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByDetails',
        },
      },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      {
        $lookup: {
          from: 'lessonmasters',
          localField: 'lessonId',
          foreignField: '_id',
          as: 'lessonDetails',
        },
      },
      // Lookup for updatedBy (users)
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedByDetails',
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { topic: { $regex: search, $options: 'i' } },
            { lessonTitle: { $regex: search, $options: 'i' } },
            { lessonTextContent: { $regex: search, $options: 'i' } },
            { 'subjectDetails.nameEn': { $regex: search, $options: 'i' } },
            { 'bookDetails.nameEn': { $regex: search, $options: 'i' } },
            { 'classDetails.nameEn': { $regex: search, $options: 'i' } },
            { 'lessonDetails.nameEn': { $regex: search, $options: 'i' } },
            { 'topicDetails.topic': { $regex: search, $options: 'i' } },
            {
              'createdByDetails.name.english': {
                $regex: search,
                $options: 'i',
              },
            },
            {
              'updatedByDetails.name.english': {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      });
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortCriteria = { [sortBy]: sortOrder };
    pipeline.push({ $sort: sortCriteria });

    pipeline.push({ $skip: skip }, { $limit: limitNum });

    pipeline.push({
      $project: {
        _id: 1,
        question: 1,
        solution: 1,
        hint: 1,
        subjectNames: '$subjectDetails.nameEn',
        classNames: '$classDetails.nameEn',
        topic: '$topicDetails.topic',
        lesson: { $arrayElemAt: ['$lessonDetails.nameEn', 0] },
        book: { $arrayElemAt: ['$bookDetails.nameEn', 0] },
        readingDuration: 1,
        lessonTextContent: 1,
        readingRestrictions: 1,
        skipTopic: 1,
        createdBy: { $arrayElemAt: ['$createdByDetails.name.english', 0] },
        updatedBy: { $arrayElemAt: ['$updatedByDetails.name.english', 0] },
        createdAt: 1,
      },
    });

    const results = await homeworkModel.aggregate(pipeline);
    const homework = results.map((row) => ({
      ...row,
      id: row._id,
      solution: row.solution ? striptags(row.solution) : '',
      hint: row.hint ? striptags(row.hint) : '',
    }));

    const countPipeline = [{ $match: query }];
    if (search) {
      countPipeline.push(
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectDetails',
          },
        },
        {
          $lookup: {
            from: 'lessons',
            localField: 'topicId',
            foreignField: '_id',
            as: 'topicDetails',
          },
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'classId',
            foreignField: '_id',
            as: 'classDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdByDetails',
          },
        },
        {
          $lookup: {
            from: 'books',
            localField: 'bookId',
            foreignField: '_id',
            as: 'bookDetails',
          },
        },
        {
          $lookup: {
            from: 'lessonmasters',
            localField: 'lessonId',
            foreignField: '_id',
            as: 'lessonDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'updatedBy',
            foreignField: '_id',
            as: 'updatedByDetails',
          },
        },
        {
          $match: {
            $or: [
              { topic: { $regex: search, $options: 'i' } },
              { lessonTitle: { $regex: search, $options: 'i' } },
              { lessonTextContent: { $regex: search, $options: 'i' } },
              { 'subjectDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'bookDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'classDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'lessonDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'topicDetails.topic': { $regex: search, $options: 'i' } },
              {
                'createdByDetails.name.english': {
                  $regex: search,
                  $options: 'i',
                },
              },
              {
                'updatedByDetails.name.english': {
                  $regex: search,
                  $options: 'i',
                },
              },
            ],
          },
        }
      );
    }
    countPipeline.push({ $count: 'total' });
    const [countResult] = await homeworkModel.aggregate(countPipeline);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson list fetched successfully.',
      data: {
        homework,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
const getHomeWorkById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const homework = await homeworkModel
      .findById(id)
      .populate('subjectId classId lessonId bookId topicId');
    if (!homework) {
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
      message: 'Homework fetched successfully.',
      data: homework,
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
const updateHomeWork = async (req, res) => {
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

    // Check if a homework with the provided id exists
    const existingHomework = await homeworkModel.findById(id);
    if (!existingHomework) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    const updatedBy = getUserIdFromRequest(req);
    const createdBy = updatedBy; // Assuming the same user creates and updates

    // Update the existing homework to set isLast: false
    await homeworkModel.updateOne(
      { _id: id },
      { $set: { isLast: false, updatedBy } }
    );

    // Create a new homework
    const newHomework = await homeworkModel.create({
      ...req.body,
      createdBy,
      updatedBy,
      isLast: true, // Optionally set isLast: true for the new homework
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Homework created successfully and previous homework updated.',
      data: newHomework,
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
const deleteHomeWork = async (req, res) => {
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

    const homework = await homeworkModel.findByIdAndDelete(id);

    if (!homework) {
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
      message: 'Homework deleted successfully.',
      data: homework,
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

// const homeworkByClassAndSubject = async (req, res) => {
//   try {
//     const { subjectId, classId, sections } = req.query;
//     if (!subjectId || !classId || !sections) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.BAD_REQUEST,
//         status: false,
//         message: 'subjectId, classId, and sections are required.',
//         code: httpStatus.BAD_REQUEST,
//       });
//     }

//     const batchData = await batchModel.findOne({
//        sectionId: sections,
//       classId: { $in: classId },
//     });

//     if (!batchData) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.NOT_FOUND,
//         status: false,
//         message: 'No batch found for the given section and class.',
//         code: httpStatus.NOT_FOUND,
//       });
//     }

//     const requestData = await requestModel.findOne({
//       userId: req.user._id,
//       batchId: batchData._id,
//       approve: true,
//     });

//     if (!requestData) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.FORBIDDEN,
//         status: false,
//         message: 'User is not authorized to access this batch.',
//         code: httpStatus.FORBIDDEN,
//       });
//     }

//     const homeworkData = await studentNotification
//       .find({
//         subjectId: subjectId,
//         classId: classId,
//         // isPublished: true,
//       })
//       .populate('homeworkId');

//     if (!homeworkData || homeworkData.length === 0) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.NOT_FOUND,
//         status: false,
//         message: 'No homework found for the given criteria.',
//         code: httpStatus.NOT_FOUND,
//       });
//     }

//     // Process homework data (handle solution and hint)
//     const processedData = homeworkData.map((homework) => {
//       const homeworkObj = homework.toObject();
//       homeworkObj.solution = homeworkObj.homeworkId.solution || '';
//       homeworkObj.hint = homeworkObj.homeworkId.hint || '';
//       return homeworkObj;
//     });

//     // Group homework by exact publishedDate timestamp
//     const groupedData = processedData.reduce((acc, homework) => {
//       // Use the full timestamp as a string
//        const publishedDate = homework.publishedDate.toISOString();
//       const homeworkEntry = {
//         question: homework.homeworkId.question,
//         solution: homework.homeworkId.solution,
//         hint: homework.homeworkId.hint,
//       };

//       // Find existing group for this exact publishedDate
//       const existingGroup = acc.find(
//         (group) => group.publishedDate === publishedDate
//       );
//       if (existingGroup) {
//         existingGroup.homework.push(homeworkEntry);
//       } else {
//         acc.push({
//            publishedDate,
//           homework: [homeworkEntry],
//         });
//       }

//       return acc;
//     }, []);

//     return createResponse({
//       res,
//       statusCode: httpStatus.OK,
//       status: true,
//       message: 'Homework data retrieved successfully.',
//       code: httpStatus.OK,
//       data: groupedData,
//     });
//   } catch (error) {
//     console.log('Server error:', error);
//     return createResponse({
//       res,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: 'Internal server error',
//       error: error.message,
//       code: httpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

const homeworkByClassAndSubject = async (req, res) => {
  try {
    const { subjectId, classId } = req.query;
    if (!subjectId || !classId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'subjectId, classId are required.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Handle subjectId and classId as arrays or single values
    let subjectIds = Array.isArray(subjectId) ? subjectId : [subjectId];
    let classIds = Array.isArray(classId) ? classId : [classId];
    try {
      if (typeof subjectId === 'string' && subjectId.startsWith('[')) {
        subjectIds = JSON.parse(subjectId);
      }
      if (typeof classId === 'string' && classId.startsWith('[')) {
        classIds = JSON.parse(classId);
      }
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message:
          'Invalid format for subjectId or classId. Must be valid IDs or JSON arrays.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Validate ObjectIds
    try {
      subjectIds = subjectIds.map((id) => new mongoose.Types.ObjectId(id));
      classIds = classIds.map((id) => new mongoose.Types.ObjectId(id));
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid subjectId, classId,  format.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    const batchData = await batchModel
      .findOne({
        classId: { $in: classIds },
      })
      .sort({ createdAt: -1 });

    if (!batchData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No batch found for the given section and class.',
        code: httpStatus.NOT_FOUND,
      });
    }

    const requestData = await requestModel.find({
      userId: req.user._id,
      batchId: batchData._id,
      approve: true,
    });

    if (!requestData) {
      return createResponse({
        res,
        statusCode: httpStatus.FORBIDDEN,
        status: false,
        message: 'User is not authorized to access this batch.',
        code: httpStatus.FORBIDDEN,
      });
    }
    const userProfule = await userprofileModel.findOne({
      userId: req.user._id,
    });

    // Aggregate to fetch homework and deduplicate homeworkId within each publishedDate
    const homeworkData = await studentNotification.aggregate([
      {
        $match: {
          subjectId: { $in: subjectIds },
          classId: { $in: classIds },
          batchId: userProfule.joinedBatch,
          type: 'homework',
        },
      },
      {
        $sort: { publishedDate: -1 }, // Sort by publishedDate descending
      },
      {
        $group: {
          _id: {
            publishedDate: '$publishedDate',
            homeworkId: '$homeworkId',
          }, // Group by both publishedDate and homeworkId to deduplicate within each date
          subjectId: { $first: '$subjectId' },
          classId: { $first: '$classId' },
        },
      },
      {
        $lookup: {
          from: 'homeworks',
          localField: '_id.homeworkId',
          foreignField: '_id',
          as: 'homeworkDetails',
        },
      },
      {
        $unwind: {
          path: '$homeworkDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          homeworkId: '$homeworkDetails._id',
          question: '$homeworkDetails.question',
          solution: '$homeworkDetails.solution',
          hint: '$homeworkDetails.hint',
          publishedDate: '$_id.publishedDate',
        },
      },
      {
        $sort: { publishedDate: -1 }, // Ensure final aggregation output is sorted
      },
    ]);

    if (!homeworkData || homeworkData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No homework found for the given criteria.',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Group homework by publishedDate
    const groupedData = homeworkData.reduce((acc, homework) => {
      // Validate publishedDate
      if (!homework.publishedDate || isNaN(new Date(homework.publishedDate))) {
        return acc; // Skip entries with invalid publishedDate
      }

      const publishedDate = new Date(homework.publishedDate).toISOString();
      const homeworkEntry = {
        homeworkId: homework.homeworkId,
        question: homework.question || 'No question provided',
        solution: homework.solution || '',
        hint: homework.hint || '',
      };

      const existingGroup = acc.find(
        (group) => group.publishedDate === publishedDate
      );
      if (existingGroup) {
        // Check for duplicate homeworkId within the same publishedDate
        if (
          !existingGroup.homework.some(
            (h) => h.homeworkId.toString() === homework.homeworkId.toString()
          )
        ) {
          existingGroup.homework.push(homeworkEntry);
        }
      } else {
        acc.push({
          publishedDate,
          homework: [homeworkEntry],
        });
      }

      return acc;
    }, []);

    // Sort by publishedDate in descending order (latest first)
    groupedData.sort(
      (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
    );

    if (groupedData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No valid homework data after processing.',
        code: httpStatus.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Homework data retrieved successfully.',
      code: httpStatus.OK,
      data: groupedData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

// Helper function to parse and validate IDs
const parseAndValidateIds = (input) => {
  let ids = [];

  try {
    // Handle array input (either as actual array or JSON string)
    if (typeof input === 'string' && input.startsWith('[')) {
      ids = JSON.parse(input);
    } else if (Array.isArray(input)) {
      ids = input;
    } else {
      ids = [input];
    }

    // Validate and convert to ObjectId
    return ids.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ID format: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });
  } catch (error) {
    throw new Error(
      `Invalid input format. Must be valid IDs or JSON arrays. ${error.message}`
    );
  }
};

// Helper function to fetch homework data
const getHomeworkData = async (subjectIds, classIds) => {
  return await studentNotification.aggregate([
    {
      $match: {
        subjectId: { $in: subjectIds },
        classId: { $in: classIds },
        type: 'homework',
      },
    },
    {
      $sort: { publishedDate: -1 },
    },
    {
      $group: {
        _id: {
          publishedDate: '$publishedDate',
          homeworkId: '$homeworkId',
        },
        subjectId: { $first: '$subjectId' },
        classId: { $first: '$classId' },
        publishedDate: { $first: '$publishedDate' },
      },
    },
    {
      $lookup: {
        from: 'homeworks',
        localField: '_id.homeworkId',
        foreignField: '_id',
        as: 'homeworkDetails',
      },
    },
    {
      $unwind: {
        path: '$homeworkDetails',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        homeworkId: '$homeworkDetails._id',
        question: '$homeworkDetails.question',
        solution: '$homeworkDetails.solution',
        hint: '$homeworkDetails.hint',
        publishedDate: 1,
      },
    },
    {
      $sort: { publishedDate: -1 },
    },
  ]);
};

// Helper function to group homework by date
const groupHomeworkByDate = (homeworkData) => {
  const dateMap = new Map();

  homeworkData.forEach((homework) => {
    if (!homework.publishedDate || isNaN(new Date(homework.publishedDate))) {
      return; // Skip invalid dates
    }

    const dateStr = new Date(homework.publishedDate).toISOString();
    const homeworkEntry = {
      homeworkId: homework.homeworkId,
      question: homework.question || 'No question provided',
      solution: homework.solution || '',
      hint: homework.hint || '',
    };

    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {
        publishedDate: dateStr,
        homework: [],
      });
    }

    // Check for duplicates before adding
    const existingHomework = dateMap.get(dateStr).homework;
    if (
      !existingHomework.some((h) => h.homeworkId.equals(homework.homeworkId))
    ) {
      existingHomework.push(homeworkEntry);
    }
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
  );
};
const getHomeWorkByTopic = async (req, res) => {
  try {
    const { topicId, lessonId } = req.query;

    // Validate that exactly one parameter is provided
    if (!topicId && !lessonId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Either topicId or lessonId is required in query parameters.',
      });
    }
    if (topicId && lessonId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Provide only one of topicId or lessonId in query parameters.',
      });
    }

    // Build query with $or to search by topicId or lessonId
    const query = {
      $or: [
        ...(topicId ? [{ topicId: { $in: [topicId] } }] : []),
        ...(lessonId ? [{ lessonId: { $in: [lessonId] } }] : []),
      ],
    };
    query.isLast = true;
    const homework = await homeworkModel
      .find(query)
      .select({
        _id: 1,
        question: 1,
        solution: 1,
        hint: 1,
        videoTutorialLink: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    const formattedHomework = homework.map((row) => ({
      id: row._id,
      question: row.question,
      solution: row.solution ? striptags(row.solution) : '',
      hint: row.hint ? striptags(row.hint) : '',
      videoTutorialLink: row.videoTutorialLink,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isPublished: false,
    }));

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Homework fetched successfully.',
      data: {
        homework: formattedHomework,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

const publishHomeWork = async (req, res) => {
  try {
    const { ids, publishedDate, batchId } = req.body;
    if (!batchId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Batch ID is required',
      });
    }

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or empty ID array',
      });
    }

    // Validate ObjectIds
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId(s): ${invalidIds.join(', ')}`,
      });
    }

    // Validate publishedDate
    const parsedDate = new Date(publishedDate);
    if (isNaN(parsedDate.getTime())) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published date',
      });
    }

    // Validate user authentication
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    // Get homework details
    const homeworks = await homeworkModel.find({ _id: { $in: ids } });
    if (homeworks.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No homework found with provided IDs',
      });
    }

    let totalNotificationsCreated = 0;
    let noStudentsFound = true;

    for (const homework of homeworks) {
      // Ensure subjectId and classId are arrays
      const homeworkSubjectId = Array.isArray(homework.subjectId)
        ? homework.subjectId
        : [homework.subjectId].filter(Boolean);
      const homeworkClassId = Array.isArray(homework.classId)
        ? homework.classId
        : [homework.classId].filter(Boolean);

      // Find matching users
      const users = await userprofileModel
        .find({
          subjectId: { $in: homeworkSubjectId },
          classId: { $in: homeworkClassId },
          joinedBatch: batchId,
        })
        .populate('userId');

      const notifications = users
        .filter((user) => user.userId?.userRole === 'student')
        .map((user) => ({
          batchId: batchId,
          userId: user.userId._id,
          homeworkId: homework._id,
          subjectId: homeworkSubjectId,
          classId: homeworkClassId,
          isReaded: false,
          type: 'homework',
          publishedDate: parsedDate,
          publishedBy: req.user._id,
          countRead: true,
        }));

      // Create notification for the teacher (logged-in user)
      const teacherNotification = {
        batchId: batchId,
        userId: req.user._id,
        homeworkId: homework._id,
        subjectId: homeworkSubjectId,
        classId: homeworkClassId,
        isReaded: false,
        type: 'homework',
        publishedDate: parsedDate,
        publishedBy: req.user._id,
        countRead: false,
      };

      // Combine student and teacher notifications
      const allNotifications = [...notifications, teacherNotification];

      if (notifications.length > 0) {
        noStudentsFound = false;
      }

      if (allNotifications.length > 0) {
        // Insert notifications
        try {
          await studentNotification.insertMany(allNotifications);
          totalNotificationsCreated += allNotifications.length;
        } catch (insertError) {
          throw insertError;
        }
      }
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: `Successfully published homework(s) and created ${totalNotificationsCreated} notification(s)`,
      data: { notificationsCreated: totalNotificationsCreated },
    });
  } catch (error) {
    console.error('Error in publishHomeWork:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
// const topicWisePublishedHomework = async (req, res) => {
//   try {
//     let topicIds = req.query.topicId;
//     if (!topicIds) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.BAD_REQUEST,
//         status: false,
//         message: 'topicId is required',
//       });
//     }

//     if (!Array.isArray(topicIds)) {
//       topicIds = Array.isArray(topicIds.split(','))
//         ? topicIds.split(',')
//         : [topicIds];
//     }

//     const invalidIds = topicIds.filter(
//       (id) => !mongoose.Types.ObjectId.isValid(id)
//     );
//     if (invalidIds.length > 0) {
//       console.error('Invalid topicIds:', invalidIds);
//       return createResponse({
//         res,
//         statusCode: httpStatus.BAD_REQUEST,
//         status: false,
//         message: `Invalid topicId(s): ${invalidIds.join(', ')}`,
//       });
//     }

//     if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.UNAUTHORIZED,
//         status: false,
//         message: 'User not authenticated or invalid user ID',
//       });
//     }

//     const homeworkData = await homeworkModel.find({
//       isPublished: true,
//       publishedBy: req.user._id,
//       topicId: { $in: topicIds },
//     });

//     return createResponse({
//       res,
//       statusCode: httpStatus.OK,
//       status: true,
//       message: homeworkData.length
//         ? `Found ${homeworkData.length} published homework(s)`
//         : 'No published homework found',
//       data: homeworkData,
//     });
//   } catch (error) {
//     console.error('Error in topicWisePublishedHomework:', error);
//     return createResponse({
//       res,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

const topicWisePublishedHomework = async (req, res) => {
  try {
    let topicIds = req.query.topicId;
    const batchId = req.query.batchId;

    if (!topicIds) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'topicId is required',
      });
    }

    // Handle topicIds as comma-separated string or single value
    if (!Array.isArray(topicIds)) {
      topicIds =
        typeof topicIds === 'string'
          ? topicIds.split(',').filter((id) => id.trim())
          : [topicIds];
    }

    // Validate topicIds
    const invalidIds = topicIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid topicId(s): ${invalidIds.join(', ')}`,
      });
    }

    // Validate user
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    // Fetch notification data to get homework IDs and publishedDate
    const studNotificationData = await studentNotification
      .find({
        publishedBy: req.user._id,
        type: 'homework',
        batchId: batchId,
      })
      .select('homeworkId publishedDate');

    // Create a map of homeworkId to an array of unique publishedDates
    const homeworkIds = [];
    const publishedDateMap = {};
    studNotificationData.forEach((stu) => {
      if (mongoose.Types.ObjectId.isValid(stu.homeworkId)) {
        const homeworkIdStr = stu.homeworkId.toString();
        if (!homeworkIds.includes(homeworkIdStr)) {
          homeworkIds.push(homeworkIdStr);
        }
        // Store unique published dates for each homeworkId
        if (!publishedDateMap[homeworkIdStr]) {
          publishedDateMap[homeworkIdStr] = new Set();
        }
        publishedDateMap[homeworkIdStr].add(stu.publishedDate.toISOString());
      }
    });

    // Convert Sets to Arrays for easier handling
    Object.keys(publishedDateMap).forEach((key) => {
      publishedDateMap[key] = Array.from(publishedDateMap[key]).map(
        (date) => new Date(date)
      );
    });

    // Fetch homework data using topicIds against both topicId and lessonId fields
    const homeworkData = await homeworkModel.find({
      _id: { $in: homeworkIds },
      $or: [
        { topicId: { $in: topicIds } },
        { lessonId: { $in: topicIds }, topicId: [] },
      ],
    });

    // Enrich homework data by creating one record per unique publishedDate
    const enrichedHomeworkData = [];
    homeworkData.forEach((homework) => {
      const homeworkIdStr = homework._id.toString();
      const publishedDates = publishedDateMap[homeworkIdStr] || [null];
      publishedDates.forEach((publishedDate) => {
        enrichedHomeworkData.push({
          ...homework.toObject(),
          publishedDate: publishedDate,
        });
      });
    });

    // Group enrichedHomeworkData by full publishedDate (including time)
    const groupedByPublishedDate = enrichedHomeworkData.reduce(
      (acc, homework) => {
        // Use full ISO date string for grouping (including date and time)
        const dateKey = homework.publishedDate
          ? new Date(homework.publishedDate).toISOString()
          : 'null';
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(homework);
        return acc;
      },
      {}
    );

    // Sort groups by publishedDate (ascending) and convert to array format
    const sortedGroupedData = Object.keys(groupedByPublishedDate)
      .map((dateKey) => ({
        publishedDate: dateKey === 'null' ? null : new Date(dateKey),
        homeworks: groupedByPublishedDate[dateKey],
      }))
      .sort((a, b) => {
        if (a.publishedDate === null && b.publishedDate === null) return 0;
        if (a.publishedDate === null) return 1;
        if (b.publishedDate === null) return -1;
        return a.publishedDate.getTime() - b.publishedDate.getTime();
      });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: sortedGroupedData.length
        ? `Found ${enrichedHomeworkData.length} published homework(s) grouped by publishedDate`
        : 'No published homework found',
      data: sortedGroupedData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const homeworkController = {
  createHomework,
  getHomeWork,
  homeworkByClassAndSubject,
  getHomeWorkByTopic,
  topicWisePublishedHomework,
  getHomeWorkById,
  updateHomeWork,
  deleteHomeWork,
  publishHomeWork,
};
