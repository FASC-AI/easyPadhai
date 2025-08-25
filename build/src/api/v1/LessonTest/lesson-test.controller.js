
/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import LessonTest from './lesson-test.model.js';
import createResponse from '../../../utils/response.js';

import mongoose from 'mongoose';

const addLessonTest = async (req, res) => {
  try {
    const { userId, classId, subjectId, lessonId, test } = req.body;

    // Validate required fields
    if (!userId || !classId || !subjectId || !lessonId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'userId, classId, subjectId, and lessonId are required',
      });
    }

    // Validate ObjectId formats
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(classId) ||
      !mongoose.isValidObjectId(subjectId) ||
      !mongoose.isValidObjectId(lessonId)
    ) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid userId, classId, subjectId, or lessonId',
      });
    }

    // Validate test array (if provided)
    if (test && !Array.isArray(test)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'test must be an array',
      });
    }

    // Validate each test object in the array
    if (test && test.length > 0) {
      for (const testItem of test) {
        if (
          !testItem.questionId ||
          !mongoose.isValidObjectId(testItem.questionId)
        ) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: 'Each test object must have a valid questionId',
          });
        }
        
        if (testItem.answer && !Array.isArray(testItem.answer)) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: 'answer in test object must be an array',
          });
        }
      }
    }

    // Create new LessonTest document
    const newLessonTest = new LessonTest({
      userId,
      classId,
      subjectId,
      lessonId,
      test: test || [], // Default to empty array if test is not provided
    });

    // Save the document
    await newLessonTest.save();

    // Format response data
    const formattedData = {
      _id: newLessonTest._id,
      userId: newLessonTest.userId,
      classId: newLessonTest.classId,
      subjectId: newLessonTest.subjectId,
      lessonId: newLessonTest.lessonId,
      test: newLessonTest.test.map(({ questionId, answer }) => ({
        questionId,
        answer,
      })),
      createdAt: newLessonTest.createdAt,
      updatedAt: newLessonTest.updatedAt,
    };

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'LessonTest created successfully',
      data: formattedData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Error creating LessonTest',
      error: error.message,
    });
  }
};
export const lessonTestController = {
 addLessonTest
};
  