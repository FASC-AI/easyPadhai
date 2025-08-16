/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import lessonModel from './lesson.model';
import User from '../User/user.model';
import striptags from 'striptags';
import createResponse from '../../../utils/response';
import { lessonValidationSchema } from './lesson.validator';
import LessonTopicStatus from '../Topic/topic.model';
import mongoose from 'mongoose';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import userprofileModel from '../User-Profile/userprofile.model';

const errorMessages = {
  NOT_FOUND: 'Lesson not found',
  ID_REQUIRED: 'ID is required',
};

const createLesson = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.subjectId) {
      if (!mongoose.Types.ObjectId.isValid(payload.subjectId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid subjectId',
        });
      }
      payload.subjectId = [new mongoose.Types.ObjectId(payload.subjectId)];
    } else {
      payload.subjectId = [];
    }

    if (payload.classId) {
      if (!mongoose.Types.ObjectId.isValid(payload.classId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid classId',
        });
      }
      payload.classId = [new mongoose.Types.ObjectId(payload.classId)];
    } else {
      payload.classId = [];
    }

    // Handle lessonId and bookId
    if (payload.lessonId) {
      if (!mongoose.Types.ObjectId.isValid(payload.lessonId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid lessonId',
        });
      }
      payload.lessonId = [new mongoose.Types.ObjectId(payload.lessonId)];
    } else {
      payload.lessonId = [];
    }

    if (payload.bookId) {
      if (!mongoose.Types.ObjectId.isValid(payload.bookId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid bookId',
        });
      }
      payload.bookId = [new mongoose.Types.ObjectId(payload.bookId)];
    } else {
      payload.bookId = [];
    }

    // Convert boolean fields from strings to actual booleans
    payload.isTestRequired =
      payload.isTestRequired === 'true' || payload.isTestRequired === true;

    // Handle images
    if (payload.images) {
      if (typeof payload.images === 'string') {
        try {
          payload.images = JSON.parse(payload.images);
        } catch (e) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: 'Invalid images format: must be valid JSON',
          });
        }
      }
      if (!Array.isArray(payload.images)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Images must be an array',
        });
      }
      // Transform images to { url: String, name: String }
      payload.images = payload.images
        .map((image, index) => {
          let url, name;
          if (typeof image === 'string') {
            url = image;
            name = image.split('/').pop() || `image-${index}.png`;
          } else if (image && typeof image === 'object') {
            url = image.url || '';
            name =
              image.name ||
              image.filename ||
              url.split('/').pop() ||
              `image-${index}.png`;
          } else {
            url = '';
            name = `image-${index}.png`;
          }
          if (!url) {
            console.warn(`Invalid image at index ${index}: no valid URL`);
          }
          return { url, name };
        })
        .filter((image) => image.url);
    } else {
      payload.images = [];
    }

    // Get the user ID
    const userId = getUserIdFromRequest(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing user ID',
      });
    }

    // Assign user ID to createdBy and updatedBy
    payload.createdBy = userId;
    payload.updatedBy = userId;

    // Validate the payload
    try {
      await lessonValidationSchema.validate(payload, { abortEarly: false });
    } catch (validationError) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Validation error',
        error: validationError.errors,
      });
    }

    const profile = await lessonModel.create(payload);

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Lesson added successfully.',
      data: profile,
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

const getLessons = async (req, res) => {
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
    const query = {};

    // Add createdBy filter for editor role
    if (role.userRole === 'editor') {
      if (role.userRole === 'editor') {
        query.bookId = { $in: profile.bookId };
        query.subjectId = { $in: profile.subjectId };
      }
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
      // Lookup for classes
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
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'bookDetails',
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
        serial: 1,
        subjectNames: '$subjectDetails.nameEn',
        classNames: '$classDetails.nameEn',
        topic: 1,
        lesson: { $arrayElemAt: ['$lessonDetails.nameEn', 0] },
        book: { $arrayElemAt: ['$bookDetails.nameEn', 0] },
        readingDuration: 1,
        lessonTextContent: 1,
        videoTutorialLink: 1,
        isTestRequired: 1,
        skipTopic: 1,
        createdBy: { $arrayElemAt: ['$createdByDetails.name.english', 0] },
        updatedBy: { $arrayElemAt: ['$updatedByDetails.name.english', 0] },
        createdAt: 1,
      },
    });

    const results = await lessonModel.aggregate(pipeline);
    const lessons = results.map((row) => ({ ...row, id: row._id }));

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
            from: 'users',
            localField: 'updatedBy',
            foreignField: '_id',
            as: 'updatedByDetails',
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
          $match: {
            $or: [
              { topic: { $regex: search, $options: 'i' } },
              { lessonTitle: { $regex: search, $options: 'i' } },
              { lessonTextContent: { $regex: search, $options: 'i' } },
              { 'subjectDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'classDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'lessonDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'bookDetails.nameEn': { $regex: search, $options: 'i' } },
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
    const [countResult] = await lessonModel.aggregate(countPipeline);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson list fetched successfully.',
      data: {
        lessons,
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
const getLessonById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const profile = await lessonModel
      .findById(id)
      .populate('subjectId classId lessonId bookId');
    if (!profile) {
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
      message: 'Lessons fetched successfully.',
      data: profile,
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
    // No need to parse subjectId and classId as they are already strings
    req.body.updatedBy = updatedBy;

    const profile = await lessonModel.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!profile) {
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
      message: 'Lesson updated successfully.',
      data: profile,
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

    const profile = await lessonModel.findByIdAndDelete(id);

    if (!profile) {
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
      message: 'Lesson deleted successfully.',
      data: profile,
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
const lessonBySubject = async (req, res) => {
  try {
    const id = getIdFromParams(req);
    let lessonData = await lessonModel
      .find({ subjectId: id })
      .populate('subjectId');
    return createResponse({
      res,
      data: lessonData,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Subject List',
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
const getLessonTopic = async (req, res) => {
  try {
    if (!req.query.bookId || !req.query.subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'bookId and subjectId are required',
      });
    }

    let lessonData = await lessonModel
      .find({
        bookId: {
          $in: Array.isArray(req.query.bookId)
            ? req.query.bookId
            : req.query.bookId.split(','),
        },
        subjectId: {
          $in: Array.isArray(req.query.subjectId)
            ? req.query.subjectId
            : req.query.subjectId.split(','),
        },
      })
      .populate('lessonId')
      .sort({ order: 1 });

    // Extract unique lessonIds to query LessonTopicStatus
    const lessonIds = [
      ...new Set(
        lessonData
          .flatMap(
            (ele) => ele.lessonId?.map((les) => les._id?.toString()) || []
          )
          .filter(Boolean)
      ),
    ];

    // Fetch status data from LessonTopicStatus
    const lessonTopicStatuses = await LessonTopicStatus.find({
      lessonId: { $in: lessonIds },
      userId: req.user._id,
    }).lean();

    // Build a map of statuses for quick lookup
    const statusMap = lessonTopicStatuses.reduce((acc, statusDoc) => {
      const lessonId = statusDoc.lessonId.toString();
      acc[lessonId] = {
        lessonStatus: statusDoc.status || false,
        topicStatuses: statusDoc.topics.reduce((topicAcc, topic) => {
          topicAcc[topic._id.toString()] = topic.status || false;
          return topicAcc;
        }, {}),
      };
      return acc;
    }, {});

    const lessonMap = lessonData.reduce((acc, ele) => {
      (ele.lessonId || []).forEach((les) => {
        const lessonName = les?.nameEn || les?.lesson || 'Unknown Lesson';
        const lessonId = les?._id?.toString() || '';
        console.log(ele, 'element');
        if (!acc[lessonName]) {
          // Initialize lessonDescription
          let lessonDescription =
            ele.lessonTextContent || 'No description available';
          // Wrap words in lessonDescription that match wordMeanings' word property
          if (
            ele.wordMeanings?.length &&
            lessonDescription !== 'No description available'
          ) {
            ele.wordMeanings.forEach((item) => {
              if (!item.word || item.word.trim() === '') return; // Skip invalid words

              // Normalize both word and description
              const normalizedWord = item.word.trim().normalize('NFC');
              const normalizedDescription = lessonDescription.normalize('NFC');

              // Perform simple string replacement
              lessonDescription = normalizedDescription.replaceAll(
                normalizedWord,
                `<span class="vocab-word">${normalizedWord}</span>`
              );
            });
          }

          acc[lessonName] = {
            _id: lessonId,
            lessonKey: ele._id,
            isTestRequired: ele.isTestRequired,
            lesson: lessonName,
            status: statusMap[lessonId]?.lessonStatus || false,
            topics: [],
            wordMeanings: ele.wordMeanings,
            lessonDescription,
            videoTutorialLink: ele?.videoTutorialLink,
          };
        }
        // Only add topics with valid (non-"Unknown Topic") names
        if (ele.topic && ele.topic !== 'Unknown Topic') {
          acc[lessonName].topics.push({
            _id: ele._id?.toString() || '',
            topic: ele.topic,
            status:
              statusMap[lessonId]?.topicStatuses[ele._id?.toString()] || false,
          });
        }
      });
      return acc;
    }, {});

    const formattedData = Object.values(lessonMap).map(
      ({
        _id,
        lesson,
        lessonKey,
        status,
        topics,
        lessonDescription,
        videoTutorialLink,
        wordMeanings,
        isTestRequired,
      }) => ({
        _id,
        lesson,
        lessonKey,
        status: topics.every((t) => t.status === true),
        topics,
        lessonDescription,
        videoTutorialLink,
        wordMeanings,
        isTestRequired,
      })
    );

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lessons fetched successfully',
      data: formattedData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Error fetching lesson data',
      error: error.message,
    });
  }
};
const getTopicInfo = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const topicData = await lessonModel
      .findById(id)
      .select(
        'topic lessonDescription lessonTextContent wordMeanings isTestRequired'
      );

    if (!topicData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Topic not found',
      });
    }

    // Strip HTML tags from lessonTextContent (assuming incomplete logic, keeping as is)
    topicData.lessonTextContent = topicData.lessonTextContent
      ? topicData.lessonTextContent
      : '';

    // Wrap words in lessonTextContent that match wordMeanings' word property
    if (topicData.lessonTextContent && topicData.wordMeanings?.length) {
      let content = topicData.lessonTextContent;
      topicData.wordMeanings.forEach((item) => {
        if (!item.word || item.word.trim() === '') return; // Skip invalid words

        // Normalize both word and content
        const normalizedWord = item.word.trim().normalize('NFC');
        const normalizedContent = content.normalize('NFC');

        // Perform simple string replacement
        content = normalizedContent.replaceAll(
          normalizedWord,
          `<span class="vocab-word">${normalizedWord}</span>`
        );
      });
      topicData.lessonTextContent = content;
    }

    // Wrap words in lessonDescription that match wordMeanings' word property
    if (topicData.lessonDescription && topicData.wordMeanings?.length) {
      let description = topicData.lessonDescription;
      topicData.wordMeanings.forEach((item) => {
        if (!item.word || item.word.trim() === '') return; // Skip invalid words

        // Normalize both word and description
        const normalizedWord = item.word.trim().normalize('NFC');
        const normalizedDescription = description.normalize('NFC');

        // Perform simple string replacement
        description = normalizedDescription.replaceAll(
          normalizedWord,
          `<span class="vocab-word">${normalizedWord}</span>`
        );
      });
      topicData.lessonDescription = description;
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Topic info',
      data: topicData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Error fetching lesson data',
      error: error.message,
    });
  }
};
const getLessonBySubjectClassBookTopicId = async (req, res) => {
  try {
    const { subjectId, classId, bookId, lessonId } = req.query;
    if (!subjectId || !classId || !bookId || !lessonId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'subjectId, classId,lessonId and bookId are required',
      });
    }

    const query = {
      subjectId: { $in: [subjectId] },
      classId: { $in: [classId] },
      bookId: { $in: [bookId] },
      lessonId: { $in: [lessonId] },
      topic: { $ne: '' }, // exclude empty topics
    };

    const topics = await lessonModel
      .find(query)
      .select('_id topic')
      .sort({ serial: 1 });

    const totalCount = await lessonModel.countDocuments(query);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Topics fetched successfully',
      data: {
        topics,
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
const updateVideoTutorialLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoTutorialLink } = req.body;

    // Validate input
    if (!videoTutorialLink || typeof videoTutorialLink !== 'string') {
      return res
        .status(400)
        .json({ error: 'videoTutorialLink must be a non-empty string' });
    }

    // Find the lesson by ID
    const lesson = await lessonModel.findById(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Concatenate new value with a comma
    lesson.videoTutorialLink = lesson.videoTutorialLink
      ? `${lesson.videoTutorialLink},${videoTutorialLink}`
      : videoTutorialLink;

    // Save the updated lesson
    await lesson.save();

    res.status(200).json({
      message: 'videoTutorialLink updated successfully',
      status: true,
      videoTutorialLink: lesson.videoTutorialLink,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
export const lessonController = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  lessonBySubject,
  getLessonTopic,
  getTopicInfo,
  getLessonBySubjectClassBookTopicId,
  updateVideoTutorialLink,
};
