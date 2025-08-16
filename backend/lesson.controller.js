/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import lessonModel from './lesson.model';
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

    payload.isTestRequired =
      payload.isTestRequired === 'true' || payload.isTestRequired === true;


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

    const userId = getUserIdFromRequest(req);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing user ID',
      });
    }

    payload.createdBy = userId;
    payload.updatedBy = userId;


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

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;
    const query = {};

    const pipeline = [
      { $match: query },
     
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
        subjectNames: '$subjectDetails.nameEn',
        classNames: '$classDetails.nameEn',
        topic: 1,
        lesson: { $arrayElemAt: ['$lessonDetails.nameEn', 0] },
        book: { $arrayElemAt: ['$bookDetails.nameEn', 0] },
        readingDuration: 1,
        lessonTextContent: 1,
        videoTutorialLink:1,
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
          $match: {
            $or: [
              { topic: { $regex: search, $options: 'i' } },
              { lessonTitle: { $regex: search, $options: 'i' } },
              { lessonTextContent: { $regex: search, $options: 'i' } },
              { 'subjectDetails.nameEn': { $regex: search, $options: 'i' } },
              { 'classDetails.nameEn': { $regex: search, $options: 'i' } },
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

    const profile = await lessonModel.findById(id).populate('subjectId classId lessonId bookId')
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
const lessonBySubject=async(req,res)=>{
  try{
    const id = getIdFromParams(req)
let lessonData=await lessonModel.find({subjectId:id}).populate('subjectId')
  return createResponse({
    res,
    data:lessonData,
    statusCode: httpStatus.OK,
    status: true,
    message: 'Subject List',
    
  });
  }
  catch(error){
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}
const getLessonTopic = async (req, res) => {
  try {
    if (!req.query.bookId || !req.query.subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "bookId and subjectId are required",
      });
    }

    let lessonData = await lessonModel
      .find({
        bookId: {
          $in: Array.isArray(req.query.bookId)
            ? req.query.bookId
            : req.query.bookId.split(","),
        },
        subjectId: {
          $in: Array.isArray(req.query.subjectId)
            ? req.query.subjectId
            : req.query.subjectId.split(","),
        },
      })
      .populate("lessonId");

    const lessonIds = [
      ...new Set(
        lessonData
          .flatMap(
            (ele) => ele.lessonId?.map((les) => les._id?.toString()) || []
          )
          .filter(Boolean)
      ),
    ];

    const lessonTopicStatuses = await LessonTopicStatus.find({
      lessonId: { $in: lessonIds },
    }).lean();

   
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
        const lessonName = les?.nameEn || les?.lesson || "Unknown Lesson";
        const lessonId = les?._id?.toString() || "";
        if (!acc[lessonName]) {
          acc[lessonName] = {
            _id: lessonId,
            lesson: lessonName,
            status: statusMap[lessonId]?.lessonStatus || false,
            topics: [],
            lessonDescription:
              ele.lessonTextContent || "No description available",
          };
        }
        
        if (ele.topic && ele.topic !== "Unknown Topic") {
          acc[lessonName].topics.push({
            _id: ele._id?.toString() || "",
            topic: ele.topic,
            status:
              statusMap[lessonId]?.topicStatuses[ele._id?.toString()] || false,
          });
        }
      });
      return acc;
    }, {});

    const formattedData = Object.values(lessonMap).map(
      ({ _id, lesson, status, topics, lessonDescription }) => ({
        _id,
        lesson,
        status,
        topics, 
        lessonDescription, 
      })
    );

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: "Lessons fetched successfully",
      data: formattedData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: "Error fetching lesson data",
      error: error.message,
    });
  }
};
const getTopicInfo = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const topicData = await lessonModel
      .findById(id)
      .select('topic lessonDescription lessonTextContent');

    if (!topicData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Topic not found',
      });
    }

    topicData.lessonTextContent = topicData.lessonTextContent
      ? topicData.lessonTextContent
      : '';

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
    const { subjectId, classId, bookId,lessonId } = req.query;
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
    };
    const topics = await lessonModel.find(query).select('_id topic');

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
};
