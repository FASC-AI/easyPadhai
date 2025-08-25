import LessonTopicStatus from './topic.model.js';
import lessonModel from '../Lesson/lesson.model.js';
import createResponse from '../../../utils/response.js';
import httpStatus from '../../../utils/httpStatus.js';
import LessonMaster from '../Lesson-master/lessonMaster.model.js';
import mongoose from 'mongoose';
const updateLessonTopicStatus = async (req, res) => {
  try {
    const { lessonId, topicId, status } = req.body;

    if (!lessonId || typeof status !== 'boolean') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'lessonId and status (boolean) are required',
      });
    }

    // Validate lessonId as ObjectId
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid lessonId format',
      });
    }
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    let lessonName = 'Unknown Lesson';
    let topicDoc = null;

    // If topicId is provided, validate and update topic status
    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid topicId format',
        });
      }

      topicDoc = await lessonModel
        .findOne({
          _id: topicId,
          lessonId: lessonObjectId,
        })
        .populate('lessonId');

      if (!topicDoc) {
        return createResponse({
          res,
          statusCode: httpStatus.NOT_FOUND,
          status: false,
          message: 'Topic or associated lesson not found',
        });
      }

      lessonName =
        topicDoc.lessonId?.nameEn ||
        topicDoc.lessonId?.lesson ||
        'Unknown Lesson';
    } else {
      // Fetch lesson name when topicId is not provided
      const lessonData = await LessonMaster.findOne({
        _id: lessonObjectId,
      }).select('nameEn lesson');
      if (!lessonData) {
        return createResponse({
          res,
          statusCode: httpStatus.NOT_FOUND,
          status: false,
          message: 'Lesson not found',
        });
      }
      lessonName = lessonData.nameEn || lessonData.lesson || 'Unknown Lesson';
    }

    // Find or create LessonTopicStatus document
    let statusDoc = await LessonTopicStatus.findOne({
      lessonId: lessonObjectId,
      userId: req.user._id,
    });

    if (!statusDoc) {
      statusDoc = new LessonTopicStatus({
        lessonId: lessonObjectId,
        lesson: lessonName,
        status: status,
        topics: [],
        userId: req.user._id,
      });
    } else if (
      statusDoc.lesson === 'Unknown Lesson' &&
      lessonName !== 'Unknown Lesson'
    ) {
      statusDoc.lesson = lessonName;
    }

    // If topicId is provided, update or add topic status
    if (topicId) {
      const topicObjectId = new mongoose.Types.ObjectId(topicId);
      const topicIndex = statusDoc.topics.findIndex(
        (t) => t._id.toString() === topicId
      );

      if (topicIndex >= 0) {
        statusDoc.topics[topicIndex].status = status;
        if (
          topicDoc.topic &&
          statusDoc.topics[topicIndex].topic !== topicDoc.topic
        ) {
          statusDoc.topics[topicIndex].topic = topicDoc.topic;
        }
      } else {
        statusDoc.topics.push({
          _id: topicObjectId,
          topic: topicDoc.topic || 'Unknown Topic',
          status,
        });
      }

      // Set lesson status based on all topics
      statusDoc.status =
        statusDoc.topics.length > 0
          ? statusDoc.topics.every((t) => t.status === true)
          : status;
    } else {
      // Update main status directly
      statusDoc.status = status;
    }

    await statusDoc.save();
    console.log('statusDoc', statusDoc);

    const formattedData = {
      _id: statusDoc.lessonId,
      lesson: statusDoc.lesson,
      status: statusDoc.status,
      topics: statusDoc.topics.map(({ _id, topic, status }) => ({
        _id,
        topic,
        status,
      })),
    };

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Lesson and topic status updated successfully',
      data: formattedData,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid lessonId or topicId format',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Error updating lesson and topic status',
      error: error.message,
    });
  }
};

export const topicController = {
  updateLessonTopicStatus,
};
