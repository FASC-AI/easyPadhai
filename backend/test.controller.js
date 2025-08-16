/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Test from './test.model';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import createResponse from '../../../utils/response';
import batchModel from '../Batch/batch.model';
import requestModel from '../BatchRequest/request.model';
import SubmitTest from '../Submitted-Test/submitted.model';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import userprofileModel from '../User-Profile/userprofile.model';
import studentNotification from '../StudentNotification/studentnotification.model';

const errorMessages = {
  NOT_FOUND: 'Test not found',
  ID_REQUIRED: 'ID is required',
};

const createTest = async (req, res) => {
  try {
    const payload = req.body;
    const test = await Test.create({
      ...payload,
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Test created successfully.',
      data: test,
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

const getAllTest = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    let query = {};
    const { isActive } = req.query;
    const userRole = req.user?.userRole;

    // If user is not admin, only show active institutions
    if (userRole !== 'admin') {
      query.isActive = true;
    } else {
      if (typeof isActive !== 'undefined') {
        query.isActive = isActive === 'true'; // Convert string to boolean
      } else if (isActive === 'true' || isActive === true) {
        query.isActive = true;
      } else if (isActive === 'false' || isActive === false) {
        query.isActive = false;
      }
    }
    if (search) {
      const isSpecialCharSearch = /^[^\w\s]+$/.test(search);
      query[isSpecialCharSearch ? 'nameEn' : '$or'] = isSpecialCharSearch
        ? { $regex: `^${search}$`, $options: 'i' }
        : [
            { TestsName: { $regex: search, $options: 'i' } },
            { codee: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
    }
    query.isLast = true;
    const [list, totalCount] = await Promise.all([
      Test.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Test.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Test retrieved',
      data: {
        test: list,
        count: totalCount,
      },
    });
  } catch (error) {
    return createResponse({
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
      error: error.message,
    });
  }
};

const updateTest = async (req, res) => {
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

    // Check if a test with the provided id exists
    const existingTestById = await Test.findById(id);
    if (!existingTestById) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Test with provided ID not found.',
      });
    }

    // Check for duplicate code if provided
    if (req.body.codee) {
      const existingTestByCode = await Test.findOne({
        codee: req.body.codee,
        _id: { $ne: id }, // Exclude the current test
      });
      if (existingTestByCode) {
        return createResponse({
          res,
          statusCode: httpStatus.CONFLICT,
          status: false,
          message: 'Test code already exists. Please use a different code.',
          error: 'DUPLICATE_CODE',
        });
      }
    }

    const createdBy = getUserIdFromRequest(req);

    // Update the existing test to set isLast: false
    await Test.updateOne(
      { _id: id },
      { $set: { isLast: false, updatedBy: createdBy } }
    );

    // Create a new test, copying all fields from existingTestById and overriding with req.body
    const newTest = await Test.create({
      ...existingTestById.toObject(), // Copy all fields from existing test
      ...req.body, // Override with fields from req.body
      _id: undefined, // Ensure a new _id is generated
      createdBy,
      lastId: id,
      updatedBy: createdBy,
      isLast: true, // Set isLast: true for the new test
      createdAt: undefined, // Ensure new timestamps are generated
      updatedAt: undefined,
      __v: undefined, // Remove version key
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Test created successfully and previous test updated.',
      data: newTest,
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
const getTestById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const test = await Test.findById(id)
      .populate('classes', 'nameEn') // populate classes field, only nameEn field
      .populate('subjects', 'nameEn') // same for subjects
      .populate('book', 'nameEn')
      .populate('lesson', 'nameEn')
      .populate('topic', 'nameEn');
    if (!test) {
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
      message: 'Test fetched successfully',
      data: test,
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
const deleteTest = async (req, res) => {
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

    const test = await Test.findByIdAndDelete(id);

    if (!test) {
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
      message: 'Test deleted successfully',
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
const getTestByBook = async (req, res) => {
  try {
    const { classId, subjectId, bookId, lessonId, topicId } = req.query;
    if (!classId || !subjectId || !bookId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId, subjectId, and bookId are required.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    let classIds = Array.isArray(classId) ? classId : [classId];
    let subjectIds = Array.isArray(subjectId) ? subjectId : [subjectId];
    let bookIds = Array.isArray(bookId) ? bookId : [bookId];
    let lessonIds = lessonId
      ? Array.isArray(lessonId)
        ? lessonId
        : [lessonId]
      : [];
    let topicIds = topicId
      ? Array.isArray(topicId)
        ? topicId
        : [topicId]
      : [];

    // Parse JSON strings if provided
    try {
      if (typeof classId === 'string' && classId.startsWith('['))
        classIds = JSON.parse(classId);
      if (typeof subjectId === 'string' && subjectId.startsWith('['))
        subjectIds = JSON.parse(subjectId);
      if (typeof bookId === 'string' && bookId.startsWith('['))
        bookIds = JSON.parse(bookId);
      if (lessonId && typeof lessonId === 'string' && lessonId.startsWith('['))
        lessonIds = JSON.parse(lessonId);
      if (topicId && typeof topicId === 'string' && topicId.startsWith('['))
        topicIds = JSON.parse(topicId);
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid JSON format in query parameters.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Validate and convert IDs to ObjectIds
    const validateAndConvertIds = (ids, paramName) => {
      return ids.map((id, index) => {
        try {
          const trimmedId = id.toString().trim();
          if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
            throw new Error(
              `Invalid ObjectId for ${paramName} at index ${index}: ${trimmedId}`
            );
          }
          return new mongoose.Types.ObjectId(trimmedId);
        } catch (error) {
          throw new Error(
            `Validation error for ${paramName} at index ${index}: ${error.message}`
          );
        }
      });
    };

    try {
      classIds = validateAndConvertIds(classIds, 'classId');
      subjectIds = validateAndConvertIds(subjectIds, 'subjectId');
      bookIds = validateAndConvertIds(bookIds, 'bookId');
      if (lessonIds.length > 0)
        lessonIds = validateAndConvertIds(lessonIds, 'lessonId');
      if (topicIds.length > 0)
        topicIds = validateAndConvertIds(topicIds, 'topicId');
    } catch (error) {
      console.log('ObjectId conversion error:', error.message);
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId format in query parameters: ${error.message}`,
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Define base query
    const baseQuery = {
      isActive: true,
      'classes._id': { $in: classIds },
      'subjects._id': { $in: subjectIds },
      'book._id': { $in: bookIds },
      testType: 'online',
    };

    // Initialize final query based on conditions
    let finalQuery = { ...baseQuery };

    if (topicIds.length > 0 && lessonIds.length > 0) {
      // Condition 3: Include lessonId and topicId
      finalQuery = {
        ...baseQuery,
        'lesson._id': { $in: lessonIds },
        'topic._id': { $in: topicIds },
      };
    } else if (lessonIds.length > 0) {
      // Condition 2: Include lessonId
      finalQuery = {
        ...baseQuery,
        'lesson._id': { $in: lessonIds },
      };
    } // Condition 1: Only baseQuery (classId, subjectId, bookId, testType)

    // Fetch data
    finalQuery.isLast = true;
    const testData = await Test.find(finalQuery);

    // Process test data
    const processTestData = (data) =>
      data.map((test) => {
        const testObj = test.toObject();
        testObj.description = testObj.description || '';
        testObj.descriptionSol = testObj.descriptionSol || '';
        testObj.isPublished = false;
        return testObj;
      });

    const processedData = processTestData(testData);

    // Check if any data was found
    if (processedData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No tests found for the given criteria.',
        code: httpStatus.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Test data retrieved successfully.',
      code: httpStatus.OK,
      data: processedData,
    });
  } catch (error) {
    console.log('Server error:', error);
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

const publishTest = async (req, res) => {
  try {
    const { ids, publishedDate, duration, publishedTime, instructionId } =
      req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or empty ID array',
      });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      console.error('Invalid ObjectIds:', invalidIds);
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId(s): ${invalidIds.join(', ')}`,
      });
    }

    const parsedDate = new Date(publishedDate);
    if (isNaN(parsedDate.getTime())) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published date',
      });
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    const tests = await Test.find({ _id: { $in: ids } });
    if (tests.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No tests found with provided IDs',
      });
    }
    let normalizedInstructionIds = [];

    if (Array.isArray(instructionId) && instructionId.length > 0) {
      // Remove duplicates
      const uniqueIds = [...new Set(instructionId)];

      // Validate ObjectIds
      const invalidInstructionIds = uniqueIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidInstructionIds.length > 0) {
        console.error('Invalid instructionId(s):', invalidInstructionIds);
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: `Invalid instructionId(s): ${invalidInstructionIds.join(', ')}`,
        });
      }

      // If all are valid and unique
      normalizedInstructionIds = uniqueIds;
    }

    let totalNotificationsCreated = 0;
    let noStudentsFound = true;

    for (const test of tests) {
      const subjectIds = test.subjects
        .filter((subject) => mongoose.Types.ObjectId.isValid(subject._id))
        .map((subject) => subject._id);
      const classIds = test.classes
        .filter((classItem) => mongoose.Types.ObjectId.isValid(classItem._id))
        .map((classItem) => classItem._id);

      if (subjectIds.length === 0 || classIds.length === 0) {
        console.warn(`Test ${test._id} has no valid subject or class IDs`);
        continue;
      }
      const users = await userprofileModel
        .find({
          subjectId: { $in: subjectIds },
          classId: { $in: classIds },
        })
        .populate('userId');

      const notifications = users
        .filter((user) => user?.userId?.userRole === 'student')
        .map((user) => ({
          userId: user.userId._id,
          subjectId: subjectIds,
          classId: classIds,
          testId: test._id,
          isReaded: false,
          type: 'test',
          duration: duration,
          publishedBy: req.user._id,
          publishedDate: parsedDate,
          publishedTime: publishedTime,
          instructionId: normalizedInstructionIds,
          countRead: true,
        }));
      const teacherNotification = {
        userId: req.user._id,
        subjectId: subjectIds,
        classId: classIds,
        testId: test._id,
        isReaded: false,
        type: 'test',
        duration: duration,
        publishedBy: req.user._id,
        publishedDate: parsedDate,
        publishedTime: publishedTime,
        instructionId: normalizedInstructionIds,
        countRead: false,
      };
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
      message: `Successfully published  test(s) and created notifications`,
    });
  } catch (error) {
    console.error('Error in publishTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
const getPublishedTest = async (req, res) => {
  try {
    const userId = req?.user?._id;
    if (!userId) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated.',
        code: httpStatus.UNAUTHORIZED,
      });
    }

    // Extract subjectId and classId from query parameters
    const { subjectId, classId } = req.query;

    const userProfile = await userprofileModel.findOne({ userId }).lean();
    console.log('User profile:', userProfile); // Debug log
    if (
      !userProfile ||
      !userProfile.classId ||
      !Array.isArray(userProfile.classId)
    ) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'No valid class IDs found in user profile.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    const validateAndConvertIds = (ids, paramName) => {
      return ids.map((id, index) => {
        const trimmedId = id.toString().trim();
        if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
          throw new Error(
            `Invalid ObjectId for ${paramName} at index ${index}: ${trimmedId}`
          );
        }
        return new mongoose.Types.ObjectId(trimmedId);
      });
    };

    let classIds;
    try {
      classIds = validateAndConvertIds(userProfile.classId, 'classId');
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid classId format: ${error.message}`,
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Validate subjectId if provided
    let subjectObjectId;
    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid subjectId format.',
          code: httpStatus.BAD_REQUEST,
        });
      }
      subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    }

    // Validate classId if provided
    let queryClassId;
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid classId format.',
          code: httpStatus.BAD_REQUEST,
        });
      }
      queryClassId = new mongoose.Types.ObjectId(classId);
      if (!classIds.some((id) => id.equals(queryClassId))) {
        return createResponse({
          res,
          statusCode: httpStatus.FORBIDDEN,
          status: false,
          message: 'User does not have access to the specified class.',
          code: httpStatus.FORBIDDEN,
        });
      }
    }

    const matchQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      classId: queryClassId ? queryClassId : { $in: classIds },
      type: 'test',
    };
    if (subjectObjectId) {
      matchQuery.subjectId = subjectObjectId;
    }

    // Check for duplicate notifications
    const duplicateNotifications = await studentNotification.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'tests',
          localField: 'testId',
          foreignField: '_id',
          as: 'testData',
        },
      },

      {
        $unwind: {
          path: '$testData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { 'testData.testType': 'online' },
            { testData: { $exists: false } },
          ],
        },
      },
      {
        $group: {
          _id: {
            testId: '$testId',
            publishedDate: {
              $dateToString: { format: '%Y-%m-%d', date: '$publishedDate' },
            },
            publishedTime: '$publishedTime',
          },
          count: { $sum: 1 },
          notifications: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicateNotifications.length) {
      console.warn(
        'Duplicate notifications found:',
        JSON.stringify(duplicateNotifications, null, 2)
      );
    }

    // Fetch all relevant notifications
    const notifications = await studentNotification
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: 'tests',
            localField: 'testId',
            foreignField: '_id',
            as: 'testData',
          },
        },
        {
          $unwind: {
            path: '$testData',
            preserveNullAndEmptyArrays: false, // Exclude missing tests
          },
        },
        {
          $match: {
            'testData.testType': 'online',
          },
        },
        {
          $group: {
            _id: {
              publishedDate: {
                $dateToString: { format: '%Y-%m-%d', date: '$publishedDate' },
              },
              publishedTime: '$publishedTime',
            },
            testIds: { $addToSet: '$testId' },
            notificationIds: { $push: '$_id' },
          },
        },
        {
          $project: {
            _id: 0,
            publishedDate: '$_id.publishedDate',
            publishedTime: '$_id.publishedTime',
            testIds: 1,
            notificationIds: 1,
          },
        },
      ])
      .exec();
    console.log('Notifications:', JSON.stringify(notifications, null, 2)); // Debug log

    if (!notifications.length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No online tests found for the specified criteria.',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Fetch tests with populated topic
    const tests = await studentNotification
      .find({
        _id: { $in: notifications.flatMap((n) => n.notificationIds) },
      })
      .lean()
      .populate('instructionId')
      .populate({
        path: 'testId',
        match: { testType: 'online' },
        populate: {
          path: 'topic',
          model: 'Lesson',
        },
      });
    console.log(tests, 'tests');
    // Filter out notifications where testId didn't match
    const validTests = tests.filter((test) => test.testId);
    console.log(
      'Valid tests:',
      validTests.map((t) => ({
        _id: t._id,
        testId: t.testId?._id,
        testType: t.testId?.testType,
      }))
    ); // Debug log

    if (!validTests.length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No online tests found for the specified criteria.',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Group tests by publishedDate and publishedTime
    const groupedTests = notifications.reduce((acc, notification) => {
      const { publishedDate, publishedTime, testIds } = notification;
      const key = `${publishedDate}_${publishedTime}`;

      if (!acc[key]) {
        acc[key] = {
          publishedDate,
          publishedTime,
          topic: [], // Changed to string to match response structure
          tests: [],
        };
      }

      // Filter tests for this group and add unique tests
      const uniqueTestIds = new Set();
      validTests
        .filter((test) => testIds.some((id) => id.equals(test.testId?._id)))
        .forEach((test, index) => {
          if (!test.testId || !test.testId._id) {
            console.warn(
              `Skipping invalid test at index ${index}: testId is missing or invalid`
            );
            return;
          }

          const testId = test.testId._id.toString();
          if (uniqueTestIds.has(testId)) {
            return; // Skip duplicate testId
          }
          uniqueTestIds.add(testId);

          // Update topic if available
          if (test.testId?.topic?.[0]?.nameEn) {
            acc[key].topic = test.testId.topic[0].nameEn; // Set as string to match original response
          }

          acc[key].tests.push({
            _id: testId,
            code: test.testId?.codee || '', // Note: 'codee' might be a typo; should be 'code'?
            testType: test.testId?.testType || '',
            description: test.testId?.description || '',
            descriptionSol: test.testId?.descriptionSol || '',
            subject: test.testId?.subjects || [], // Note: 'subjects' vs 'subject' in original response
            class: test.testId?.classes || [], // Note: 'classes' vs 'class' in original response
            optionText1: test.testId?.optionText1 || '',
            mark1: test.testId?.mark1 || '',
            duration: test?.duration || '',
            publishedByvocab: test?.publishedBy || '',
            publishedDate: publishedDate, // Use notification's publishedDate
            publishedTime: publishedTime, // Use notification's publishedTime
            createdAt: test?.createdAt || '',
            updatedAt: test?.updatedAt || '',
            isActive: test.testId?.isActive ?? false,
            isPublished: test.testId?.isPublished ?? false,
            questionType: test.testId?.questionType || '',
            book: test.testId?.book || [],
            lesson: test.testId?.lesson || [],
            topic: test.testId?.topic?.length
              ? [
                  {
                    _id: test.testId.topic[0]._id,
                    nameEn: test.testId.topic[0].nameEn,
                  },
                ]
              : [],
            option1: test.testId?.option1 ?? false,
            option2: test.testId?.option2 ?? false,
            option3: test.testId?.option3 ?? false,
            option4: test.testId?.option4 ?? false,
            mark2: test.testId?.mark2 || '',
            mark3: test.testId?.mark3 || '',
            mark4: test.testId?.mark4 || '',
            totalTrue: test.testId?.totalTrue || '',
            optionText2: test.testId?.optionText2 || '',
            optionText3: test.testId?.optionText3 || '',
            optionText4: test.testId?.optionText4 || '',
            optionAssertionText1: test.testId?.optionAssertionText1 || '',
            optionAssertionText2: test.testId?.optionAssertionText2 || '',
            optionAssertionText3: test.testId?.optionAssertionText3 || '',
            optionAssertion1: test.testId?.optionAssertion1 ?? false,
            optionAssertion2: test.testId?.optionAssertion2 ?? false,
            optionAssertion3: test.testId?.optionAssertion3 ?? false,
            optionAssertion4: test.testId?.optionAssertion4 ?? false,
            markAssertion1: test.testId?.markAssertion1 || '',
            markAssertion2: test.testId?.markAssertion2 || '',
            markAssertion3: test.testId?.markAssertion3 || '',
            markAssertion4: test.testId?.markAssertion4 || '',
            optionTrue: test.testId?.optionTrue || '',
            markTrue: test.testId?.markTrue || '',
            optionFalse: test.testId?.optionFalse || '',
            markFalse: test.testId?.markFalse || '',
            codeExtra: test.testId?.code || 0, // Note: Using 'code' as in original response
            __v: test.testId?.__v || 0,
            instructionId: test?.instructionId || [],
          });
        });

      return acc;
    }, {});

    const processedTests = Object.values(groupedTests);

    // Sort by publishedDate and publishedTime in descending order
    processedTests.sort((a, b) => {
      const dateA = new Date(a.publishedDate);
      const dateB = new Date(b.publishedDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA;
      }
      const timeA = new Date(`1970-01-01 ${a.publishedTime}`);
      const timeB = new Date(`1970-01-01 ${b.publishedTime}`);
      return timeB - timeA;
    });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Online tests retrieved successfully.',
      code: httpStatus.OK,
      data: processedTests,
    });
  } catch (error) {
    console.error('Error in getPublishedTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};
const currentDayTest = async (req, res) => {
  try {
    if (!req.user?._id) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated',
        code: httpStatus.UNAUTHORIZED,
      });
    }

    const profileData = await userprofileModel.findOne({
      userId: req.user._id,
    });
    console.log('Profile userId:', profileData?.userId);
    if (!profileData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User profile not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    const userClassIds = [
      ...new Set(profileData.classId.map((id) => id.toString())),
    ];
    const userSubjectIds = [
      ...new Set(profileData.subjectId.map((id) => id.toString())),
    ];

    const currentDateTimeIST = moment.tz('Asia/Kolkata');
    const currentDateIST = currentDateTimeIST.clone().startOf('day');

    // Fetch tests for the authenticated user
    const testData = await studentNotification
      .find({
        userId: req.user._id,
        classId: { $in: userClassIds },
        subjectId: { $in: userSubjectIds },
        type: 'test',
        publishedDate: {
          $gte: currentDateIST.toDate(),
          $lt: currentDateIST.clone().add(1, 'day').toDate(),
        },
      })
      .populate('testId')
      .lean();

    if (!testData || testData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message:
          'No tests found for your classes and subjects on the current date',
        data: [],
      });
    }

    const seenTestIds = new Set();
    const filteredTests = await Promise.all(
      testData.map(async (test) => {
        try {
          if (!test.publishedTime || !test.testId || !test.duration) {
            return null;
          }

          // Parse published time
          const parsedTime = moment(test.publishedTime, 'h:mm A', true);
          if (!parsedTime.isValid()) {
            return null;
          }

          // Validate published date
          const publishedDate = moment
            .utc(test.publishedDate)
            .tz('Asia/Kolkata');
          if (!publishedDate.isValid()) {
            return null;
          }

          // Ensure test is for the current date
          const isSameDate = publishedDate
            .startOf('day')
            .isSame(currentDateIST);
          if (!isSameDate) {
            return null;
          }

          // Construct test start time
          const publicationDateTimeIST = moment.tz(
            {
              year: publishedDate.year(),
              month: publishedDate.month(),
              day: publishedDate.date(),
              hour: parsedTime.hour(),
              minute: parsedTime.minute(),
              second: 0,
              millisecond: 0,
            },
            'Asia/Kolkata'
          );

          // Calculate test end time based on duration
          const [hours, minutes] = test.duration.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) {
            console.log(
              `Invalid duration for test ${test._id.toString()}: ${
                test.duration
              }`
            );
            return null;
          }
          const duration = moment.duration({ hours, minutes });
          const testEndTime = publicationDateTimeIST.clone().add(duration);

          // Check if test is active (started and not expired)
          const isTestActive =
            currentDateTimeIST.isSameOrAfter(
              publicationDateTimeIST,
              'minute'
            ) && currentDateTimeIST.isBefore(testEndTime, 'minute');

          if (!isTestActive) {
            console.log(
              `Test ${test._id.toString()} excluded: Not active (Start: ${publicationDateTimeIST.format(
                'h:mm A'
              )}, End: ${testEndTime.format(
                'h:mm A'
              )}, Current: ${currentDateTimeIST.format('h:mm A')})`
            );
            return null;
          }

          // Check if test was submitted
          const submitTest = await SubmitTest.findOne({
            userId: req.user._id,
            publishedDate: test.publishedDate,
            publishedTime: test.publishedTime,
            duration: test.duration,
            'test.questionId': test.testId ? test.testId._id : test._id,
          }).lean();

          const attemptedStatus = submitTest ? 'attempted' : 'tobeattempt';

          return {
            ...test,
            attempted: attemptedStatus,
          };
        } catch (error) {
          console.log(
            `Error processing test ${test._id.toString()}:`,
            error.message
          );
          return null;
        }
      })
    );

    let validTests = filteredTests
      .filter((test) => test !== null)
      .filter((test) => {
        const testId = test.testId?._id.toString();
        if (seenTestIds.has(testId)) {
          return false;
        }
        seenTestIds.add(testId);
        return true;
      });

    validTests = validTests.filter((test) => {
      return test.attempted !== 'attempted';
    });
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: validTests.length
        ? 'Active tests retrieved successfully'
        : 'No active tests available at this time',
      data: validTests,
    });
  } catch (error) {
    console.error('Error in currentDayTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

const checkAttemptedTest = async (req, res) => {
  try {
    if (!req.user?._id) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated',
        code: httpStatus.UNAUTHORIZED,
      });
    }

    // Find user profile
    const profileData = await userprofileModel.findOne({
      userId: req.user._id,
    });
    if (!profileData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User profile not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    const userClassIds = profileData.classId.map((id) => id.toString());
    const userSubjectIds = profileData.subjectId.map((id) => id.toString());

    console.log('User Class IDs:', userClassIds);
    console.log('User Subject IDs:', userSubjectIds);

    if (!userClassIds.length || !userSubjectIds.length) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'No classes or subjects assigned to user',
        data: { isAttempted: false },
      });
    }

    const currentDateTimeIST = moment.tz('Asia/Kolkata');
    const currentDateIST = currentDateTimeIST.clone().startOf('day');

    // Log current server time and query date range
    console.log(
      'Current Server Time (IST):',
      currentDateTimeIST.format('YYYY-MM-DD HH:mm:ss Z')
    );
    console.log('Query Date Range (IST):', {
      gte: currentDateIST.format('YYYY-MM-DD HH:mm:ss Z'),
      lt: currentDateIST.clone().add(1, 'day').format('YYYY-MM-DD HH:mm:ss Z'),
    });

    // Find tests for the current day
    const testData = await studentNotification
      .find({
        classId: { $in: userClassIds },
        subjectId: { $in: userSubjectIds },
        type: 'test',
        publishedDate: {
          $gte: currentDateIST.toDate(),
          $lt: currentDateIST.clone().add(1, 'day').toDate(),
        },
      })
      .populate('testId', 'questionId')
      .lean();

    console.log('Tests Found:', testData.length);
    console.log(
      'Test Data:',
      testData.map((test) => ({
        testId: test._id.toString(),
        publishedDate: moment(test.publishedDate).format('YYYY-MM-DD'),
        publishedTime: test.publishedTime,
        classId: test.classId,
        subjectId: test.subjectId,
        testIdField: test.testId ? test.testId._id.toString() : 'Missing',
        questionId: test.testId,
      }))
    );

    if (!testData?.length) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message:
          'No tests found for your classes and subjects on the current date',
        data: { isAttempted: false },
      });
    }

    // Filter tests by publishedTime
    const filteredTests = testData.filter((test) => {
      try {
        if (!test.publishedTime) {
          console.log(`Missing publishedTime for test ${test._id.toString()}`);
          return false;
        }

        const parsedTime = moment(
          test.publishedTime,
          ['h:mm A', 'HH:mm'],
          true
        );
        if (!parsedTime.isValid()) {
          console.log(
            `Invalid publishedTime for test ${test._id.toString()}: ${
              test.publishedTime
            }`
          );
          return false;
        }

        const publishedDate = moment.utc(test.publishedDate).tz('Asia/Kolkata');
        if (!publishedDate.isValid()) {
          console.log(
            `Invalid publishedDate for test ${test._id.toString()}: ${
              test.publishedDate
            }`
          );
          return false;
        }

        const publicationDateTimeIST = moment.tz(
          {
            year: publishedDate.year(),
            month: publishedDate.month(),
            day: publishedDate.date(),
            hour: parsedTime.hour(),
            minute: parsedTime.minute(),
            second: 0,
            millisecond: 0,
          },
          'Asia/Kolkata'
        );

        const isTimeValid = publicationDateTimeIST.isSameOrAfter(
          currentDateTimeIST,
          'minute'
        );

        // Detailed logging for time check
        console.log('Time Check for Test:', {
          testId: test._id.toString(),
          publishedDate: publishedDate.format('YYYY-MM-DD'),
          publishedTime: test.publishedTime,
          publicationDateTimeIST: publicationDateTimeIST.format(
            'YYYY-MM-DD HH:mm:ss Z'
          ),
          currentDateTimeIST: currentDateTimeIST.format(
            'YYYY-MM-DD HH:mm:ss Z'
          ),
          isTimeValid,
        });

        return isTimeValid;
      } catch (error) {
        console.error(
          `Error processing test ${test._id.toString()}:`,
          error.message
        );
        return false;
      }
    });

    console.log('Filtered Tests:', filteredTests.length);
    console.log(
      'Filtered Test Details:',
      filteredTests.map((test) => ({
        testId: test._id.toString(),
        publishedDate: moment(test.publishedDate).format('YYYY-MM-DD'),
        publishedTime: test.publishedTime,
        questionId: test.testId,
      }))
    );

    if (!filteredTests.length) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'No tests available at or after the current time',
        data: { isAttempted: false },
      });
    }

    // Extract questionIds
    const questionIds = filteredTests
      .filter((test) => test.testId._id)
      .map((test) => test.testId._id);

    console.log('Question IDs:', questionIds);

    if (!questionIds.length) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'No valid tests found for submission check',
        data: { isAttempted: false },
      });
    }

    // Check for submissions
    const submittedTest = await SubmitTest.find({
      userId: req.user._id,
      'test.questionId': { $in: questionIds },
    }).populate('test.questionId');
    console.log(submittedTest, 'SUUSUSUSUUSUSUU');

    const isAttempted = !!submittedTest;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: isAttempted
        ? "Test submission found for today's questions"
        : "No test submission found for today's questions",
      data: { isAttempted, submittedTest },
    });
  } catch (error) {
    console.error('Error in checkAttemptedTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};
// const previousDayTests = async (req, res) => {
//   try {
//     if (!req.user?._id) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.UNAUTHORIZED,
//         status: false,
//         message: "User not authenticated",
//         code: httpStatus.UNAUTHORIZED,
//       });
//     }

//     const profileData = await userprofileModel.findOne({
//       userId: req.user._id,
//     });
//     console.log("Profile userId:", profileData?.userId);
//     if (!profileData) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.NOT_FOUND,
//         status: false,
//         message: "User profile not found",
//         code: httpStatus.NOT_FOUND,
//       });
//     }

//     const userClassIds = [
//       ...new Set(profileData.classId.map((id) => id.toString())),
//     ];
//     const userSubjectIds = [
//       ...new Set(profileData.subjectId.map((id) => id.toString())),
//     ];

//     const currentDateTimeIST = moment.tz("Asia/Kolkata");
//     const currentDateIST = currentDateTimeIST.clone().startOf("day");

//     const testData = await studentNotification
//       .find({
//         userId: req.user._id,
//         classId: { $in: userClassIds },
//         subjectId: { $in: userSubjectIds },
//         type: "test",
//       })
//       .populate("testId")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!testData || testData.length === 0) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.OK,
//         status: true,
//         message: "No tests found for your classes and subjects",
//         data: [],
//       });
//     }

//     const filteredTests = await Promise.all(
//       testData.map(async (test) => {
//         try {
//           if (!test.publishedTime || !test.testId || !test.duration) {
//             console.log(
//               `Missing publishedTime, testId, or duration for test ${test._id.toString()}`
//             );
//             return null;
//           }

//           const parsedTime = moment(test.publishedTime, "h:mm A", true);
//           if (!parsedTime.isValid()) {
//             console.log(
//               `Invalid publishedTime for test ${test._id.toString()}: ${
//                 test.publishedTime
//               }`
//             );
//             return null;
//           }

//           const publishedDate = moment
//             .utc(test.publishedDate)
//             .tz("Asia/Kolkata");
//           if (!publishedDate.isValid()) {
//             console.log(
//               `Invalid publishedDate for test ${test._id.toString()}`
//             );
//             return null;
//           }

//           const publicationDateTimeIST = moment.tz(
//             {
//               year: publishedDate.year(),
//               month: publishedDate.month(),
//               day: publishedDate.date(),
//               hour: parsedTime.hour(),
//               minute: parsedTime.minute(),
//               second: 0,
//               millisecond: 0,
//             },
//             "Asia/Kolkata"
//           );

//           const [hours, minutes] = test.duration.split(":").map(Number);
//           if (isNaN(hours) || isNaN(minutes)) {
//             console.log(
//               `Invalid duration for test ${test._id.toString()}: ${
//                 test.duration
//               }`
//             );
//             return null;
//           }

//           // Calculate test end time by adding duration to publicationDateTimeIST
//           const testEndTimeIST = publicationDateTimeIST
//             .clone()
//             .add(hours, "hours")
//             .add(minutes, "minutes");

//           console.log("Test userId:", test.userId);
//           console.log("Test publishedDate:", test.publishedDate);
//           console.log("Test publishedTime:", test.publishedTime);
//           console.log("Test duration:", test.duration);
//           console.log("Test testId:", test.testId._id);
//           console.log("Test end time:", testEndTimeIST.format());

//           const submitTest = await SubmitTest.findOne({
//             userId: req.user._id,
//             publishedDate: test.publishedDate,
//             publishedTime: test.publishedTime,
//             duration: test.duration,
//             "test.questionId": test.testId ? test.testId._id : test._id,
//           }).lean();

//           console.log("SubmitTest:", submitTest);

//           let attemptedStatus;
//           const now = moment.tz("Asia/Kolkata");
//           if (submitTest) {
//             attemptedStatus = "attempted";
//           } else if (
//             now.isSameOrAfter(publicationDateTimeIST) &&
//             now.isBefore(testEndTimeIST)
//           ) {
//             attemptedStatus = "to be attempt"; // Test is within duration
//           } else if (now.isBefore(publicationDateTimeIST)) {
//             attemptedStatus = "to be attempt"; // Test is in the future
//           } else {
//             attemptedStatus = "unattempted"; // Test duration has passed
//           }

//           return {
//             ...test,
//             attempted: attemptedStatus,
//             submitTestData: submitTest || null,
//             questionType: test.testId?.questionType || "unknown",
//           };
//         } catch (error) {
//           console.log(
//             `Error processing test ${test._id.toString()}:`,
//             error.message
//           );
//           return null;
//         }
//       })
//     );

//     const validTests = filteredTests.filter((test) => test !== null);

//     // Group tests by duration, publishedDate, and publishedTime
//     const groupedTests = validTests.reduce((acc, test) => {
//       const duration = test.duration;
//       const publishedDate = moment
//         .utc(test.publishedDate)
//         .tz("Asia/Kolkata")
//         .format("YYYY-MM-DD");
//       const publishedTime = test.publishedTime;

//       const key = `${duration}|${publishedDate}|${publishedTime}`;
//       if (!acc[key]) {
//         acc[key] = {
//           duration,
//           publishedDate,
//           publishedTime,
//           tests: [],
//         };
//       }
//       acc[key].tests.push(test);
//       return acc;
//     }, {});

//     // Convert groupedTests to an array and sort
//     const sortedGroupedTests = Object.values(groupedTests).sort((a, b) => {
//       const dateComparison = moment(b.publishedDate).diff(
//         moment(a.publishedDate)
//       );
//       if (dateComparison !== 0) return dateComparison;
//       const timeComparison = moment(a.publishedTime, "h:mm A").diff(
//         moment(b.publishedTime, "h:mm A")
//       );
//       if (timeComparison !== 0) return timeComparison;
//       return a.duration.localeCompare(b.duration);
//     });

//     console.log("Response data:", sortedGroupedTests);
//     return createResponse({
//       res,
//       statusCode: httpStatus.OK,
//       status: true,
//       message: sortedGroupedTests.length
//         ? "Tests retrieved successfully"
//         : "No valid tests available",
//       data: sortedGroupedTests,
//     });
//   } catch (error) {
//     console.error("Error in previousDayTests:", error);
//     return createResponse({
//       res,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: "Internal server error",
//       code: httpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// };
// const previousDayTests = async (req, res) => {
//   try {
//     if (!req.user?._id) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.UNAUTHORIZED,
//         status: false,
//         message: 'User not authenticated',
//         code: httpStatus.UNAUTHORIZED,
//       });
//     }

//     // Extract classId and subjectId from query parameters
//     const { classId, subjectId } = req.query;

//     // Validate query parameters
//     if (!classId || !subjectId) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.BAD_REQUEST,
//         status: false,
//         message: 'classId and subjectId are required in query parameters',
//         code: httpStatus.BAD_REQUEST,
//       });
//     }

//     // Convert to arrays and ensure uniqueness (in case comma-separated IDs are passed)
//     const userClassIds = Array.isArray(classId)
//       ? [...new Set(classId.map((id) => id.toString()))]
//       : [...new Set(classId.split(',').map((id) => id.toString().trim()))];
//     const userSubjectIds = Array.isArray(subjectId)
//       ? [...new Set(subjectId.map((id) => id.toString()))]
//       : [...new Set(subjectId.split(',').map((id) => id.toString().trim()))];

//     const currentDateTimeIST = moment.tz('Asia/Kolkata');
//     const currentDateIST = currentDateTimeIST.clone().startOf('day');

//     const testData = await studentNotification
//       .find({
//         userId: req.user._id,
//         classId: { $in: userClassIds },
//         subjectId: { $in: userSubjectIds },
//         type: "test",
//       })
//       .populate("testId")
//       .populate("instructionId")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!testData || testData.length === 0) {
//       return createResponse({
//         res,
//         statusCode: httpStatus.OK,
//         status: true,
//         message: 'No tests found for the provided classId and subjectId',
//         data: [],
//       });
//     }

//     const filteredTests = await Promise.all(
//       testData.map(async (test) => {
//         try {
//           if (!test.publishedTime || !test.testId || !test.duration) {
//             console.log(
//               `Missing publishedTime, testId, or duration for test ${test._id.toString()}`
//             );
//             return null;
//           }

//           const parsedTime = moment(test.publishedTime, 'h:mm A', true);
//           if (!parsedTime.isValid()) {
//             console.log(
//               `Invalid publishedTime for test ${test._id.toString()}: ${
//                 test.publishedTime
//               }`
//             );
//             return null;
//           }

//           const publishedDate = moment
//             .utc(test.publishedDate)
//             .tz('Asia/Kolkata');
//           if (!publishedDate.isValid()) {
//             console.log(
//               `Invalid publishedDate for test ${test._id.toString()}`
//             );
//             return null;
//           }

//           const publicationDateTimeIST = moment.tz(
//             {
//               year: publishedDate.year(),
//               month: publishedDate.month(),
//               day: publishedDate.date(),
//               hour: parsedTime.hour(),
//               minute: parsedTime.minute(),
//               second: 0,
//               millisecond: 0,
//             },
//             'Asia/Kolkata'
//           );

//           const [hours, minutes] = test.duration.split(':').map(Number);
//           if (isNaN(hours) || isNaN(minutes)) {
//             console.log(
//               `Invalid duration for test ${test._id.toString()}: ${
//                 test.duration
//               }`
//             );
//             return null;
//           }

//           // Calculate test end time by adding duration to publicationDateTimeIST
//           const testEndTimeIST = publicationDateTimeIST
//             .clone()
//             .add(hours, 'hours')
//             .add(minutes, 'minutes');

//           console.log('Test userId:', test.userId);
//           console.log('Test publishedDate:', test.publishedDate);
//           console.log('Test publishedTime:', test.publishedTime);
//           console.log('Test duration:', test.duration);
//           console.log('Test testId:', test.testId._id);
//           console.log('Test end time:', testEndTimeIST.format());

//           const submitTest = await SubmitTest.findOne({
//             userId: req.user._id,
//             publishedDate: test.publishedDate,
//             publishedTime: test.publishedTime,
//             duration: test.duration,
//             'test.questionId': test.testId ? test.testId._id : test._id,
//           }).lean();

//           console.log('SubmitTest:', submitTest);

//           let attemptedStatus;
//           const now = moment.tz('Asia/Kolkata');
//           if (submitTest) {
//             attemptedStatus = 'attempted';
//           } else if (
//             now.isSameOrAfter(publicationDateTimeIST) &&
//             now.isBefore(testEndTimeIST)
//           ) {
//             attemptedStatus = 'to be attempt';
//           } else if (now.isBefore(publicationDateTimeIST)) {
//             attemptedStatus = 'to be attempt';
//           } else {
//             attemptedStatus = 'unattempted';
//           }

//           return {
//             ...test,
//             attempted: attemptedStatus,
//             submitTestData: submitTest || null,
//             questionType: test.testId?.questionType || 'unknown',
//           };
//         } catch (error) {
//           console.log(
//             `Error processing test ${test._id.toString()}:`,
//             error.message
//           );
//           return null;
//         }
//       })
//     );

//     const validTests = filteredTests.filter((test) => test !== null);

//     // Group tests by duration, publishedDate, and publishedTime
//     const groupedTests = validTests.reduce((acc, test) => {
//       const duration = test.duration;
//       const publishedDate = moment
//         .utc(test.publishedDate)
//         .tz('Asia/Kolkata')
//         .format('YYYY-MM-DD');
//       const publishedTime = test.publishedTime;

//       const key = `${duration}|${publishedDate}|${publishedTime}`;
//       if (!acc[key]) {
//         acc[key] = {
//           duration,
//           publishedDate,
//           publishedTime,
//           tests: [],
//         };
//       }
//       acc[key].tests.push(test);
//       return acc;
//     }, {});

//     // Convert groupedTests to an array and sort in reverse chronological order
//     const sortedGroupedTests = Object.values(groupedTests).sort((a, b) => {
//       // First sort by date (newest first)
//       const dateComparison = moment(b.publishedDate).diff(moment(a.publishedDate));
//       if (dateComparison !== 0) return dateComparison;

//       // Then sort by time (newest first)
//       const timeA = moment(a.publishedTime, 'h:mm A');
//       const timeB = moment(b.publishedTime, 'h:mm A');
//       return timeB.diff(timeA); // Newest time first
//     });

//     console.log('Response data:', sortedGroupedTests);
//     return createResponse({
//       res,
//       statusCode: httpStatus.OK,
//       status: true,
//       message: sortedGroupedTests.length
//         ? 'Tests retrieved successfully'
//         : 'No valid tests available',
//       data: sortedGroupedTests,
//     });
//   } catch (error) {
//     console.error('Error in previousDayTests:', error);
//     return createResponse({
//       res,
//       statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: 'Internal server error',
//       code: httpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// };
const previousDayTests = async (req, res) => {
  try {
    if (!req.user?._id) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated',
        code: httpStatus.UNAUTHORIZED,
      });
    }

    const { classId, subjectId } = req.query;

    if (!classId || !subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId and subjectId are required in query parameters',
        code: httpStatus.BAD_REQUEST,
      });
    }

    const userClassIds = Array.isArray(classId)
      ? [...new Set(classId.map((id) => id.toString()))]
      : [...new Set(classId.split(',').map((id) => id.toString().trim()))];
    const userSubjectIds = Array.isArray(subjectId)
      ? [...new Set(subjectId.map((id) => id.toString()))]
      : [...new Set(subjectId.split(',').map((id) => id.toString().trim()))];

    const currentDateTimeIST = moment.tz('Asia/Kolkata');
    const currentDateIST = currentDateTimeIST.clone().startOf('day');

    const testData = await studentNotification
      .find({
        userId: req.user._id,
        classId: { $in: userClassIds },
        subjectId: { $in: userSubjectIds },
        type: 'test',
      })
      .populate('testId')
      .populate('instructionId')
      .sort({ createdAt: -1 })
      .lean();

    if (!testData || testData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'No tests found for the provided classId and subjectId',
        data: [],
      });
    }

    const filteredTests = await Promise.all(
      testData.map(async (test) => {
        try {
          if (!test.publishedTime || !test.testId || !test.duration) {
            console.log(
              `Missing publishedTime, testId, or duration for test ${test._id.toString()}`
            );
            return null;
          }

          const parsedTime = moment(test.publishedTime, 'h:mm A', true);
          if (!parsedTime.isValid()) {
            console.log(
              `Invalid publishedTime for test ${test._id.toString()}: ${
                test.publishedTime
              }`
            );
            return null;
          }

          const publishedDate = moment
            .utc(test.publishedDate)
            .tz('Asia/Kolkata');
          if (!publishedDate.isValid()) {
            console.log(
              `Invalid publishedDate for test ${test._id.toString()}`
            );
            return null;
          }

          const publicationDateTimeIST = moment.tz(
            {
              year: publishedDate.year(),
              month: publishedDate.month(),
              day: publishedDate.date(),
              hour: parsedTime.hour(),
              minute: parsedTime.minute(),
              second: 0,
              millisecond: 0,
            },
            'Asia/Kolkata'
          );

          const [hours, minutes] = test.duration.split(':').map(Number);
          if (isNaN(hours) || isNaN(minutes)) {
            console.log(
              `Invalid duration for test ${test._id.toString()}: ${
                test.duration
              }`
            );
            return null;
          }

          const testEndTimeIST = publicationDateTimeIST
            .clone()
            .add(hours, 'hours')
            .add(minutes, 'minutes');

          const submitTest = await SubmitTest.findOne({
            userId: req.user._id,
            publishedDate: test.publishedDate,
            publishedTime: test.publishedTime,
            duration: test.duration,
            'test.questionId': test.testId ? test.testId._id : test._id,
          }).lean();

          let attemptedStatus;
          const now = moment.tz('Asia/Kolkata');
          if (submitTest) {
            attemptedStatus = 'attempted';
          } else if (
            now.isSameOrAfter(publicationDateTimeIST) &&
            now.isBefore(testEndTimeIST)
          ) {
            attemptedStatus = 'to be attempt';
          } else if (now.isBefore(publicationDateTimeIST)) {
            attemptedStatus = 'to be attempt';
          } else {
            attemptedStatus = 'unattempted';
          }

          return {
            ...test,
            attempted: attemptedStatus,
            submitTestData: submitTest || null,
            questionType: test.testId?.questionType || 'unknown',
          };
        } catch (error) {
          console.log(
            `Error processing test ${test._id.toString()}:`,
            error.message
          );
          return null;
        }
      })
    );

    const validTests = filteredTests.filter((test) => test !== null);

    const groupedTests = validTests.reduce((acc, test) => {
      const duration = test.duration;
      const publishedDate = moment
        .utc(test.publishedDate)
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DD');
      const publishedTime = test.publishedTime;

      const key = `${duration}|${publishedDate}|${publishedTime}`;
      if (!acc[key]) {
        // Extract hindi and description from the first test's instructionId (assuming all tests in the group have the same instructionId)
        const hindi = test.instructionId.map(
          (instruction) => instruction.hindi
        );
        const description = test.instructionId.map(
          (instruction) => instruction.description
        );
        // Modify instructionId to exclude hindi and description (optional)
        const modifiedInstructionId = test.instructionId.map((instruction) => ({
          _id: instruction._id,
          isActive: instruction.isActive,
          type: instruction.type,
          InstructionsName: instruction.InstructionsName,
          classes: instruction.classes,
          subjects: instruction.subjects,
          createdAt: instruction.createdAt,
          updatedAt: instruction.updatedAt,
          code: instruction.code,
          __v: instruction.__v,
        }));

        acc[key] = {
          duration,
          publishedDate,
          publishedTime,
          hindi, // Add at group level
          description, // Add at group level
          tests: [],
        };
      }
      // Remove hindi and description from individual test's instructionId (optional)
      acc[key].tests.push({
        ...test,
        instructionId: test.instructionId.map((instruction) => ({
          _id: instruction._id,
          isActive: instruction.isActive,
          type: instruction.type,
          InstructionsName: instruction.InstructionsName,
          classes: instruction.classes,
          subjects: instruction.subjects,
          createdAt: instruction.createdAt,
          updatedAt: instruction.updatedAt,
          code: instruction.code,
          __v: instruction.__v,
        })),
      });
      return acc;
    }, {});

    const sortedGroupedTests = Object.values(groupedTests).sort((a, b) => {
      const dateComparison = moment(b.publishedDate).diff(
        moment(a.publishedDate)
      );
      if (dateComparison !== 0) return dateComparison;
      const timeA = moment(a.publishedTime, 'h:mm A');
      const timeB = moment(b.publishedTime, 'h:mm A');
      return timeB.diff(timeA);
    });

    console.log('Response data:', sortedGroupedTests);
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: sortedGroupedTests.length
        ? 'Tests retrieved successfully'
        : 'No valid tests available',
      data: sortedGroupedTests,
    });
  } catch (error) {
    console.error('Error in previousDayTests:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};
const getISTTime = (req, res) => {
  const istTime = new Date().toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    timeStyle: 'short',
  });
  res.json({ ist_time: istTime });
};

const studentTestMarks = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    if (!classId || !subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId and subjectId are required',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Fetch the teacher's batch
    let teacherBatch = await batchModel.findOne({
      classTeacherId: req.user._id,
    });
    if (!teacherBatch) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Teacher batch not found',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Fetch students who joined the teacher's batch
    let studenJoinedBatch = await requestModel.find({
      batchId: teacherBatch._id,
      approve: true,
    });
    if (!studenJoinedBatch.length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: "No students found in the teacher's batch",
        code: httpStatus.NOT_FOUND,
      });
    }

    // Extract user IDs of students who joined the batch
    const joinedStudentIds = studenJoinedBatch.map((student) =>
      student.userId.toString()
    );

    // Normalize time format
    const normalizeTime = (time) =>
      time
        ? moment(time, ['h:mm A', 'hh:mm A']).format('h:mm A') || 'Unknown'
        : 'Unknown';

    // Format date as "ddd, MMM DD"
    const formatDate = (date) =>
      moment.tz(date, 'Asia/Kolkata').format('ddd, MMM DD');

    // Current date and time in IST
    const currentMoment = moment.tz('Asia/Kolkata');
    // For testing with provided context: 01:28 AM IST, June 07, 2025
    // const currentMoment = moment.tz("2025-06-07 01:28", "YYYY-MM-DD HH:mm", "Asia/Kolkata");

    // Fetch submissions and filter by joined students
    const submittedData = await SubmitTest.find({
      classId,
      subjectId,
      userId: { $in: joinedStudentIds }, // Filter by students in the batch
    })
      .populate({
        path: 'test.questionId',
        select:
          'type totalTrue optionTrue option1 option2 option3 option4 optionText1 optionText2 optionText3 optionText4 mark1 mark2 mark3 mark4 optionAssertion1 optionAssertion2 optionAssertion3 optionAssertion4 optionAssertionText1 optionAssertionText2 optionAssertionText3 optionAssertionText4 markAssertion1 markAssertion2 markAssertion3 markAssertion4 description',
      })
      .populate({
        path: 'userId',
        select: 'name.english',
      });

    // Group submissions by publishedDate and publishedTime
    const groupedSubmissions = submittedData.reduce((acc, submission) => {
      const publishedDate = moment
        .tz(submission.publishedDate, 'Asia/Kolkata')
        .format('YYYY-MM-DD');
      const publishedTime = normalizeTime(submission.publishedTime);

      // Create a moment object for the submission's date and time
      const submissionMoment = moment.tz(
        `${publishedDate} ${publishedTime}`,
        'YYYY-MM-DD h:mm A',
        'Asia/Kolkata'
      );

      // Skip future submissions
      if (submissionMoment.isAfter(currentMoment)) {
        return acc;
      }

      const key = `${publishedDate}|${publishedTime}`;
      if (!acc[key]) {
        acc[key] = { publishedDate, publishedTime, submissions: [] };
      }

      let totalMarks = 0;
      let obtainedMarks = 0;

      submission.test.forEach((testItem, index) => {
        const question = testItem.questionId;
        const userAnswers = testItem.answer;

        if (!question) {
          return;
        }

        const questionTotalMarks = parseFloat(question.totalTrue) || 0;
        if (questionTotalMarks === 0) {
          return;
        }
        totalMarks += questionTotalMarks;

        const normalize = (val) => (val || '').toString().trim().toLowerCase();

        if (question.type === 'True/False') {
          const optionTrueValue = question.optionTrue
            ? normalize(question.optionTrue)
            : '';
          const correctAnswer = optionTrueValue === 'true' ? 'true' : 'false';
          const userAnswer = userAnswers[0] ? normalize(userAnswers[0]) : '';
          if (userAnswer === correctAnswer) {
            obtainedMarks += questionTotalMarks;
          }
        } else if (question.type === 'MCQ') {
          const correctOptions = [];
          const optionMarks = [
            parseFloat(question.mark1) || 0,
            parseFloat(question.mark2) || 0,
            parseFloat(question.mark3) || 0,
            parseFloat(question.mark4) || 0,
          ];
          if (question.option1)
            correctOptions.push({
              text: normalize(question.optionText1),
              mark: optionMarks[0],
            });
          if (question.option2)
            correctOptions.push({
              text: normalize(question.optionText2),
              mark: optionMarks[1],
            });
          if (question.option3)
            correctOptions.push({
              text: normalize(question.optionText3),
              mark: optionMarks[2],
            });
          if (question.option4)
            correctOptions.push({
              text: normalize(question.optionText4),
              mark: optionMarks[3],
            });

          const normalizedUserAnswers = userAnswers.map(normalize);
          let questionObtainedMarks = 0;
          normalizedUserAnswers.forEach((ans) => {
            const correctOption = correctOptions.find(
              (opt) => opt.text === ans
            );
            if (
              correctOption &&
              question[`option${correctOptions.indexOf(correctOption) + 1}`]
            ) {
              questionObtainedMarks += correctOption.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        } else if (question.type === 'Assertion-Reason') {
          const correctAssertions = [];
          const assertionMarks = [
            parseFloat(question.markAssertion1) || 0,
            parseFloat(question.markAssertion2) || 0,
            parseFloat(question.markAssertion3) || 0,
            parseFloat(question.markAssertion4) || 0,
          ];
          if (question.optionAssertion1)
            correctAssertions.push({
              text: normalize(question.optionAssertionText1),
              mark: assertionMarks[0],
              isCorrect: question.optionAssertion1,
            });
          if (question.optionAssertion2)
            correctAssertions.push({
              text: normalize(question.optionAssertionText2),
              mark: assertionMarks[1],
              isCorrect: question.optionAssertion2,
            });
          if (question.optionAssertion3)
            correctAssertions.push({
              text: normalize(question.optionAssertionText3),
              mark: assertionMarks[2],
              isCorrect: question.optionAssertion3,
            });
          if (question.optionAssertion4)
            correctAssertions.push({
              text: normalize(question.optionAssertionText4),
              mark: assertionMarks[3],
              isCorrect: question割Assertion4,
            });

          let questionObtainedMarks = 0;
          const normalizedUserAnswers = userAnswers.map(normalize);
          normalizedUserAnswers.forEach((ans) => {
            const correctAssertion = correctAssertions.find(
              (opt) => opt.text === ans
            );
            if (correctAssertion && correctAssertion.isCorrect) {
              questionObtainedMarks += correctAssertion.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        }
      });

      acc[key].submissions.push({
        userId: submission.userId._id.toString(),
        name: submission.userId.name?.english || 'Unknown',
        result: obtainedMarks + '/' + totalMarks,
      });

      return acc;
    }, {});

    const groupedResults = {};

    // Get unique publishedDate and publishedTime from studentNotification
    const notifications = await studentNotification
      .find({
        classId,
        subjectId,
        type: 'test',
        userId: { $in: joinedStudentIds }, // Filter by students in the batch
      })
      .populate({
        path: 'userId',
        select: 'name.english',
      });

    const notificationKeys = [
      ...new Set(
        notifications
          .map((n) => {
            const publishedDate = moment
              .tz(n.publishedDate, 'Asia/Kolkata')
              .format('YYYY-MM-DD');
            const publishedTime = normalizeTime(n.publishedTime);
            // Skip future notifications
            const notificationMoment = moment.tz(
              `${publishedDate} ${publishedTime}`,
              'YYYY-MM-DD h:mm A',
              'Asia/Kolkata'
            );
            if (notificationMoment.isAfter(currentMoment)) {
              return null;
            }
            return `${publishedDate}|${publishedTime}`;
          })
          .filter((key) => key !== null)
      ),
    ];

    // Process each unique date-time combination
    const allKeys = [
      ...new Set([...Object.keys(groupedSubmissions), ...notificationKeys]),
    ];

    for (const key of allKeys) {
      let [publishedDate, publishedTime] = key.split('|');

      const formattedDate = moment
        .tz(publishedDate, 'YYYY-MM-DD', 'Asia/Kolkata')
        .startOf('day');

      const dateNotifications = notifications.filter((n) => {
        const nDate = moment
          .tz(n.publishedDate, 'Asia/Kolkata')
          .format('YYYY-MM-DD');
        const nTime = normalizeTime(n.publishedTime);
        const notificationMoment = moment.tz(
          `${nDate} ${nTime}`,
          'YYYY-MM-DD h:mm A',
          'Asia/Kolkata'
        );
        return (
          nDate === publishedDate &&
          nTime === publishedTime &&
          !notificationMoment.isAfter(currentMoment)
        );
      });

      groupedResults[key] = groupedSubmissions[key]
        ? {
            publishedDate: formatDate(publishedDate),
            publishedTime,
            submissions: [...groupedSubmissions[key].submissions],
          }
        : {
            publishedDate: formatDate(publishedDate),
            publishedTime,
            submissions: [],
          };

      if (dateNotifications.length) {
        const submittedUserIds = new Set(
          groupedResults[key].submissions.map((sub) => sub.userId)
        );

        // Deduplicate notifications by userId
        const uniqueNotifications = [];
        const seenUserIds = new Set();
        dateNotifications.forEach((notification) => {
          if (!notification.userId) {
            return;
          }
          const userIdStr = notification.userId._id.toString();
          if (!seenUserIds.has(userIdStr)) {
            seenUserIds.add(userIdStr);
            uniqueNotifications.push(notification);
          }
        });

        uniqueNotifications.forEach((notification) => {
          const userIdStr = notification.userId._id.toString();
          if (!submittedUserIds.has(userIdStr)) {
            groupedResults[key].submissions.push({
              userId: userIdStr,
              name: notification.userId.name?.english || 'Unknown',
              result: 'Ab',
            });
          }
        });
      }

      groupedResults[key].submissions.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (!Object.keys(groupedResults).length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message:
          'No past or current submissions or notifications found for the given classId and subjectId',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Format results as a list, sorted by date and time in descending order
    const formattedResults = Object.keys(groupedResults)
      .sort((a, b) => {
        const [dateA, timeA] = a.split('|');
        const [dateB, timeB] = b.split('|');
        const momentA = moment.tz(
          `${dateA} ${timeA}`,
          'YYYY-MM-DD h:mm A',
          'Asia/Kolkata'
        );
        const momentB = moment.tz(
          `${dateB} ${timeB}`,
          'YYYY-MM-DD h:mm A',
          'Asia/Kolkata'
        );
        // Sort by date and time in descending order
        return momentB.diff(momentA);
      })
      .map((key) => ({
        publishedDate: groupedResults[key].publishedDate,
        publishedTime: groupedResults[key].publishedTime,
        submissions: groupedResults[key].submissions,
      }));

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Test marks retrieved successfully',
      data: formattedResults, // Return list of past and current results
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};
const studentTestMarksLeaderboard = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    // Validate query parameters
    if (!classId || !subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId and subjectId are required',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Fetch the student's approved batch
    const studentRequest = await requestModel.findOne({
      userId: req.user._id,
      approve: true,
    });
    if (!studentRequest) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Student is not enrolled in any approved batch',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Verify the batch belongs to the requested class
    const batch = await batchModel.findOne({
      _id: studentRequest.batchId,
      classId,
    });
    if (!batch) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No batch found for the given classId',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Fetch all students in the same batch
    const batchStudents = await requestModel.find({
      batchId: batch._id,
      approve: true,
    });
    if (!batchStudents.length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No students found in the batch',
        code: httpStatus.NOT_FOUND,
      });
    }

    const joinedStudentIds = batchStudents.map((student) =>
      student.userId.toString()
    );

    // Normalize time format
    const normalizeTime = (time) =>
      time
        ? moment(time, ['h:mm A', 'hh:mm A']).format('h:mm A') || 'Unknown'
        : 'Unknown';

    // Format date as "ddd, MMM DD"
    const formatDate = (date) =>
      moment.tz(date, 'Asia/Kolkata').format('ddd, MMM DD');

    // Current date and time in IST
    const currentMoment = moment.tz('Asia/Kolkata');

    // Fetch submissions for the class and subject
    const submittedData = await SubmitTest.find({
      classId,
      subjectId,
      userId: { $in: joinedStudentIds },
    })
      .populate({
        path: 'test.questionId',
        select:
          'type totalTrue optionTrue option1 option2 option3 option4 optionText1 optionText2 optionText3 optionText4 mark1 mark2 mark3 mark4 optionAssertion1 optionAssertion2 optionAssertion3 optionAssertion4 optionAssertionText1 optionAssertionText2 optionAssertionText3 optionAssertionText4 markAssertion1 markAssertion2 markAssertion3 markAssertion4 description',
      })
      .populate({
        path: 'userId',
        select: 'name.english',
      });

    // Group submissions by publishedDate and publishedTime
    const groupedSubmissions = submittedData.reduce((acc, submission) => {
      const publishedDate = moment
        .tz(submission.publishedDate, 'Asia/Kolkata')
        .format('YYYY-MM-DD');
      const publishedTime = normalizeTime(submission.publishedTime);

      const submissionMoment = moment.tz(
        `${publishedDate} ${publishedTime}`,
        'YYYY-MM-DD h:mm A',
        'Asia/Kolkata'
      );

      // Skip future submissions
      if (submissionMoment.isAfter(currentMoment)) {
        return acc;
      }

      const key = `${publishedDate}|${publishedTime}`;
      if (!acc[key]) {
        acc[key] = { publishedDate, publishedTime, submissions: [] };
      }

      let totalMarks = 0;
      let obtainedMarks = 0;

      submission.test.forEach((testItem) => {
        const question = testItem.questionId;
        const userAnswers = testItem.answer;

        if (!question) return;

        const questionTotalMarks = parseFloat(question.totalTrue) || 0;
        if (questionTotalMarks === 0) return;
        totalMarks += questionTotalMarks;

        const normalize = (val) => (val || '').toString().trim().toLowerCase();

        if (question.type === 'True/False') {
          const optionTrueValue = question.optionTrue
            ? normalize(question.optionTrue)
            : '';
          const correctAnswer = optionTrueValue === 'true' ? 'true' : 'false';
          const userAnswer = userAnswers[0] ? normalize(userAnswers[0]) : '';
          if (userAnswer === correctAnswer) {
            obtainedMarks += questionTotalMarks;
          }
        } else if (question.type === 'MCQ') {
          const correctOptions = [];
          const optionMarks = [
            parseFloat(question.mark1) || 0,
            parseFloat(question.mark2) || 0,
            parseFloat(question.mark3) || 0,
            parseFloat(question.mark4) || 0,
          ];
          if (question.option1)
            correctOptions.push({
              text: normalize(question.optionText1),
              mark: optionMarks[0],
            });
          if (question.option2)
            correctOptions.push({
              text: normalize(question.optionText2),
              mark: optionMarks[1],
            });
          if (question.option3)
            correctOptions.push({
              text: normalize(question.optionText3),
              mark: optionMarks[2],
            });
          if (question.option4)
            correctOptions.push({
              text: normalize(question.optionText4),
              mark: optionMarks[3],
            });

          const normalizedUserAnswers = userAnswers.map(normalize);
          let questionObtainedMarks = 0;
          normalizedUserAnswers.forEach((ans) => {
            const correctOption = correctOptions.find(
              (opt) => opt.text === ans
            );
            if (
              correctOption &&
              question[`option${correctOptions.indexOf(correctOption) + 1}`]
            ) {
              questionObtainedMarks += correctOption.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        } else if (question.type === 'Assertion-Reason') {
          const correctAssertions = [];
          const assertionMarks = [
            parseFloat(question.markAssertion1) || 0,
            parseFloat(question.markAssertion2) || 0,
            parseFloat(question.markAssertion3) || 0,
            parseFloat(question.markAssertion4) || 0,
          ];
          if (question.optionAssertion1)
            correctAssertions.push({
              text: normalize(question.optionAssertionText1),
              mark: assertionMarks[0],
              isCorrect: question.optionAssertion1,
            });
          if (question.optionAssertion2)
            correctAssertions.push({
              text: normalize(question.optionAssertionText2),
              mark: assertionMarks[1],
              isCorrect: question.optionAssertion2,
            });
          if (question.optionAssertion3)
            correctAssertions.push({
              text: normalize(question.optionAssertionText3),
              mark: assertionMarks[2],
              isCorrect: question.optionAssertion3,
            });
          if (question.optionAssertion4)
            correctAssertions.push({
              text: normalize(question.optionAssertionText4),
              mark: assertionMarks[3],
              isCorrect: question.optionAssertion4,
            });

          let questionObtainedMarks = 0;
          const normalizedUserAnswers = userAnswers.map(normalize);
          normalizedUserAnswers.forEach((ans) => {
            const correctAssertion = correctAssertions.find(
              (opt) => opt.text === ans
            );
            if (correctAssertion && correctAssertion.isCorrect) {
              questionObtainedMarks += correctAssertion.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        }
      });

      acc[key].submissions.push({
        userId: submission.userId._id.toString(),
        name: submission.userId.name?.english || 'Unknown',
        result: `${obtainedMarks}/${totalMarks}`,
      });

      return acc;
    }, {});

    // Fetch notifications to identify tests the student was supposed to take
    const notifications = await studentNotification
      .find({
        classId,
        subjectId,
        type: 'test',
        userId: req.user._id, // Only the student's notifications
      })
      .populate({
        path: 'userId',
        select: 'name.english',
      });

    const groupedResults = {};

    // Get unique publishedDate and publishedTime from notifications
    const notificationKeys = [
      ...new Set(
        notifications
          .map((n) => {
            const publishedDate = moment
              .tz(n.publishedDate, 'Asia/Kolkata')
              .format('YYYY-MM-DD');
            const publishedTime = normalizeTime(n.publishedTime);
            const notificationMoment = moment.tz(
              `${publishedDate} ${publishedTime}`,
              'YYYY-MM-DD h:mm A',
              'Asia/Kolkata'
            );
            if (notificationMoment.isAfter(currentMoment)) {
              return null;
            }
            return `${publishedDate}|${publishedTime}`;
          })
          .filter((key) => key !== null)
      ),
    ];

    // Process each unique date-time combination
    const allKeys = [
      ...new Set([...Object.keys(groupedSubmissions), ...notificationKeys]),
    ];

    for (const key of allKeys) {
      const [publishedDate, publishedTime] = key.split('|');

      groupedResults[key] = groupedSubmissions[key]
        ? {
            publishedDate: formatDate(publishedDate),
            publishedTime,
            submissions: groupedSubmissions[key].submissions.filter(
              (sub) => sub.userId === req.user._id.toString()
            ), // Only student's submissions
          }
        : {
            publishedDate: formatDate(publishedDate),
            publishedTime,
            submissions: [],
          };

      // Add absent status if no submission but notification exists
      const dateNotifications = notifications.filter((n) => {
        const nDate = moment
          .tz(n.publishedDate, 'Asia/Kolkata')
          .format('YYYY-MM-DD');
        const nTime = normalizeTime(n.publishedTime);
        return nDate === publishedDate && nTime === publishedTime;
      });

      if (dateNotifications.length && !groupedResults[key].submissions.length) {
        groupedResults[key].submissions.push({
          userId: req.user._id.toString(),
          name: req.user.name?.english || 'Unknown',
          result: 'Ab',
        });
      }
    }

    if (!Object.keys(groupedResults).length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message:
          'No past or current tests found for the given classId and subjectId',
        code: httpStatus.NOT_FOUND,
      });
    }

    // Format results as a list, sorted by date and time in descending order
    const formattedResults = Object.keys(groupedResults)
      .sort((a, b) => {
        const [dateA, timeA] = a.split('|');
        const [dateB, timeB] = b.split('|');
        const momentA = moment.tz(
          `${dateA} ${timeA}`,
          'YYYY-MM-DD h:mm A',
          'Asia/Kolkata'
        );
        const momentB = moment.tz(
          `${dateB} ${timeB}`,
          'YYYY-MM-DD h:mm A',
          'Asia/Kolkata'
        );
        return momentB.diff(momentA);
      })
      .map((key) => ({
        publishedDate: groupedResults[key].publishedDate,
        publishedTime: groupedResults[key].publishedTime,
        submissions: groupedResults[key].submissions.length
          ? groupedResults[key].submissions
          : [
              {
                userId: req.user._id.toString(),
                name: req.user.name?.english || 'Unknown',
                result: 'Ab',
              },
            ],
      }));

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Test marks retrieved successfully',
      data: formattedResults,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};
const getTestsByLessonAndTopic = async (req, res) => {
  try {
    const { lessonId, topicId } = req.query;

    // Validate input
    if (!lessonId || !topicId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Both lessonId and topicId are required',
      });
    }
    const tests = await Test.find({
      'lesson._id': lessonId,
      'topic._id': topicId,
      isLast: true,
    });

    if (!tests || tests.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No tests found for the specified lesson and topic',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Tests retrieved successfully',
      data: tests,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Something went wrong. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
const studentTestLeaderboard = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    if (!classId || !subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId and subjectId are required',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Normalize time format
    const normalizeTime = (time) =>
      time
        ? moment(time, ['h:mm A', 'hh:mm A']).format('h:mm A') || 'Unknown'
        : 'Unknown';

    // Format date as "ddd, MMM DD"
    const formatDate = (date) =>
      moment.tz(date, 'Asia/Kolkata').format('ddd, MMM DD');

    const submittedData = await SubmitTest.find({
      classId,
      subjectId,
    })
      .populate({
        path: 'test.questionId',
        select:
          'type totalTrue optionTrue option1 option2 option3 option4 optionText1 optionText2 optionText3 optionText4 mark1 mark2 mark3 mark4 optionAssertion1 optionAssertion2 optionAssertion3 optionAssertion4 optionAssertionText1 optionAssertionText2 optionAssertionText3 optionAssertionText4 markAssertion1 markAssertion2 markAssertion3 markAssertion4 description',
      })
      .populate({
        path: 'userId',
        select: 'name.english picture',
      });

    // Group submissions by publishedDate and publishedTime
    const groupedSubmissions = {};

    submittedData.forEach((submission) => {
      const publishedDate = moment
        .tz(submission.publishedDate, 'Asia/Kolkata')
        .format('YYYY-MM-DD');
      const publishedTime = normalizeTime(submission.publishedTime);
      const key = `${publishedDate}|${publishedTime}`;

      if (!groupedSubmissions[key]) {
        groupedSubmissions[key] = {
          publishedDate,
          publishedTime,
          userMarks: {},
        };
      }

      const userId = submission?.userId?._id.toString();
      console.log(userId, 'userId');
      let totalMarks = 0;
      let obtainedMarks = 0;

      submission.test.forEach((testItem) => {
        const question = testItem.questionId;
        const userAnswers = testItem.answer;

        if (!question) {
          return;
        }

        const questionTotalMarks = parseFloat(question.totalTrue) || 0;
        if (questionTotalMarks === 0) {
          return;
        }
        totalMarks += questionTotalMarks;

        const normalize = (val) => (val || '').toString().trim().toLowerCase();

        if (question.type === 'True/False') {
          const optionTrueValue = question.optionTrue
            ? normalize(question.optionTrue)
            : '';
          const correctAnswer = optionTrueValue === 'true' ? 'true' : 'false';
          const userAnswer = userAnswers[0] ? normalize(userAnswers[0]) : '';
          if (userAnswer === correctAnswer) {
            obtainedMarks += questionTotalMarks;
          }
        } else if (question.type === 'MCQ') {
          const correctOptions = [];
          const optionMarks = [
            parseFloat(question.mark1) || 0,
            parseFloat(question.mark2) || 0,
            parseFloat(question.mark3) || 0,
            parseFloat(question.mark4) || 0,
          ];
          if (question.option1)
            correctOptions.push({
              text: normalize(question.optionText1),
              mark: optionMarks[0],
            });
          if (question.option2)
            correctOptions.push({
              text: normalize(question.optionText2),
              mark: optionMarks[1],
            });
          if (question.option3)
            correctOptions.push({
              text: normalize(question.optionText3),
              mark: optionMarks[2],
            });
          if (question.option4)
            correctOptions.push({
              text: normalize(question.optionText4),
              mark: optionMarks[3],
            });

          const normalizedUserAnswers = userAnswers.map(normalize);
          let questionObtainedMarks = 0;
          normalizedUserAnswers.forEach((ans) => {
            const correctOption = correctOptions.find(
              (opt) => opt.text === ans
            );
            if (
              correctOption &&
              question[`option${correctOptions.indexOf(correctOption) + 1}`]
            ) {
              questionObtainedMarks += correctOption.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        } else if (question.type === 'Assertion-Reason') {
          const correctAssertions = [];
          const assertionMarks = [
            parseFloat(question.markAssertion1) || 0,
            parseFloat(question.markAssertion2) || 0,
            parseFloat(question.markAssertion3) || 0,
            parseFloat(question.markAssertion4) || 0,
          ];
          if (question.optionAssertion1)
            correctAssertions.push({
              text: normalize(question.optionAssertionText1),
              mark: assertionMarks[0],
              isCorrect: question.optionAssertion1,
            });
          if (question.optionAssertion2)
            correctAssertions.push({
              text: normalize(question.optionAssertionText2),
              mark: assertionMarks[1],
              isCorrect: question.optionAssertion2,
            });
          if (question.optionAssertion3)
            correctAssertions.push({
              text: normalize(question.optionAssertionText3),
              mark: assertionMarks[2],
              isCorrect: question.optionAssertion3,
            });
          if (question.optionAssertion4)
            correctAssertions.push({
              text: normalize(question.optionAssertionText4),
              mark: assertionMarks[3],
              isCorrect: question.optionAssertion4,
            });

          let questionObtainedMarks = 0;
          const normalizedUserAnswers = userAnswers.map(normalize);
          normalizedUserAnswers.forEach((ans) => {
            const correctAssertion = correctAssertions.find(
              (opt) => opt.text === ans
            );
            if (correctAssertion && correctAssertion.isCorrect) {
              questionObtainedMarks += correctAssertion.mark;
            }
          });
          obtainedMarks += questionObtainedMarks;
        }
      });

      if (!groupedSubmissions[key].userMarks[userId]) {
        groupedSubmissions[key].userMarks[userId] = {
          name: submission?.userId?.name?.english || 'Unknown',
          picture: submission?.userId?.picture || null,
          totalObtained: 0,
          totalPossible: 0,
        };
      }
      groupedSubmissions[key].userMarks[userId].totalObtained += obtainedMarks;
      groupedSubmissions[key].userMarks[userId].totalPossible += totalMarks;
    });

    // Generate leaderboard for each published date
    const leaderboard = Object.keys(groupedSubmissions)
      .map((key) => {
        const { publishedDate, publishedTime, userMarks } =
          groupedSubmissions[key];
        const data = Object.entries(userMarks)
          .filter(([userId, data]) => userId && userId !== 'undefined' && data) // Ensure userId is valid and data exists
          .map(([userId, data]) => ({
            userId,
            name: data.name || 'Unknown', // Fallback for missing name
            picture: data.picture,
            totalObtained: data.totalObtained || 0, // Fallback for missing totalObtained
            totalPossible: data.totalPossible || 0, // Fallback for missing totalPossible
            percentage: data.totalPossible
              ? ((data.totalObtained / data.totalPossible) * 100).toFixed(2)
              : '0.00',
          }))
          .sort(
            (a, b) =>
              b.totalObtained - a.totalObtained || a.name.localeCompare(b.name)
          )
          .slice(0, 5)
          .map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            name: entry.name,
            picture: entry.picture,
            totalObtained: entry.totalObtained,
            totalPossible: entry.totalPossible,
            percentage: entry.percentage,
          }));

        return {
          publishedDate: formatDate(publishedDate),
          publishedTime,
          data,
        };
      })
      .filter((entry) => entry.data.length > 0)
      .sort((a, b) => {
        const momentA = moment.tz(
          `${a.publishedDate} ${a.publishedTime}`,
          'ddd, MMM DD h:mm A',
          'Asia/Kolkata'
        );
        const momentB = moment.tz(
          `${b.publishedDate} ${b.publishedTime}`,
          'ddd, MMM DD h:mm A',
          'Asia/Kolkata'
        );
        return momentB.diff(momentA); // Sort by date and time in descending order
      });

    if (!leaderboard.length) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No submissions found for the given classId and subjectId',
        code: httpStatus.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboard,
    });
  } catch (error) {
    console.error('Error in studentTestLeaderboard:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Internal server error',
      code: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

const getUserTestByBook = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      bookId,
      lessonId,
      topicId,
      publishedDate,
      publishedTime,
    } = req.query;
    const userId = req.user._id; // Get userId from authenticated user

    console.log('User ID:', userId.toString());
    console.log('Query Parameters:', {
      classId,
      subjectId,
      bookId,
      lessonId,
      topicId,
      publishedDate,
      publishedTime,
    });

    if (!classId || !subjectId || !bookId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'classId, subjectId, and bookId are required.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    let classIds = Array.isArray(classId) ? classId : [classId];
    let subjectIds = Array.isArray(subjectId) ? subjectId : [subjectId];
    let bookIds = Array.isArray(bookId) ? bookId : [bookId];
    let lessonIds = lessonId
      ? Array.isArray(lessonId)
        ? lessonId
        : [lessonId]
      : [];
    let topicIds = topicId
      ? Array.isArray(topicId)
        ? topicId
        : [topicId]
      : [];

    // Parse JSON strings if provided
    try {
      if (typeof classId === 'string' && classId.startsWith('['))
        classIds = JSON.parse(classId);
      if (typeof subjectId === 'string' && subjectId.startsWith('['))
        subjectIds = JSON.parse(subjectId);
      if (typeof bookId === 'string' && bookId.startsWith('['))
        bookIds = JSON.parse(bookId);
      if (lessonId && typeof lessonId === 'string' && lessonId.startsWith('['))
        lessonIds = JSON.parse(lessonId);
      if (topicId && typeof topicId === 'string' && topicId.startsWith('['))
        topicIds = JSON.parse(topicId);
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid JSON format in query parameters.',
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Validate and convert IDs to ObjectIds
    const validateAndConvertIds = (ids, paramName) => {
      return ids.map((id, index) => {
        try {
          const trimmedId = id.toString().trim();
          if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
            throw new Error(
              `Invalid ObjectId for ${paramName} at index ${index}: ${trimmedId}`
            );
          }
          return new mongoose.Types.ObjectId(trimmedId);
        } catch (error) {
          throw new Error(
            `Validation error for ${paramName} at index ${index}: ${error.message}`
          );
        }
      });
    };

    try {
      classIds = validateAndConvertIds(classIds, 'classId');
      subjectIds = validateAndConvertIds(subjectIds, 'subjectId');
      bookIds = validateAndConvertIds(bookIds, 'bookId');
      if (lessonIds.length > 0)
        lessonIds = validateAndConvertIds(lessonIds, 'lessonId');
      if (topicIds.length > 0)
        topicIds = validateAndConvertIds(topicIds, 'topicId');
    } catch (error) {
      console.log('ObjectId conversion error:', error.message);
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId format in query parameters: ${error.message}`,
        code: httpStatus.BAD_REQUEST,
      });
    }

    // Define base query for Test
    const baseQuery = {
      isActive: true,
      'classes._id': { $in: classIds },
      'subjects._id': { $in: subjectIds },
      'book._id': { $in: bookIds },
      testType: 'online',
    };

    // Initialize final query based on conditions
    let finalQuery = { ...baseQuery };

    if (topicIds.length > 0 && lessonIds.length > 0) {
      finalQuery = {
        ...baseQuery,
        'lesson._id': { $in: lessonIds },
        'topic._id': { $in: topicIds },
      };
    } else if (lessonIds.length > 0) {
      finalQuery = {
        ...baseQuery,
        'lesson._id': { $in: lessonIds },
      };
    }

    // Fetch test data
    finalQuery.isLast = true;
    const testData = await Test.find(finalQuery);
    console.log(
      'Tests Found:',
      testData.map((t) => ({
        _id: t._id.toString(),
        lastId: t.lastId ? t.lastId.toString() : null,
      }))
    );

    // Process test data
    const processTestData = (data, notifiedTestIds) => {
      const processedData = [];
      const includedTestIds = new Set(); // Track included test _ids to avoid duplicacy
      const testsToReplace = new Map(); // Map lastId to test object for replacement

      console.log('Notified Test IDs:', Array.from(notifiedTestIds));

      // First pass: Prepare test objects and mark isPublished
      const testObjects = data.map((test) => {
        const testObj = test.toObject();
        testObj.description = testObj.description || '';
        testObj.descriptionSol = testObj.descriptionSol || '';
        testObj.testId = test._id; // Include testId as _id
        testObj.isPublished =
          test.lastId && notifiedTestIds.has(test.lastId.toString()); // Set isPublished based on lastId

        if (testObj.isPublished) {
          console.log(
            `Marking test _id: ${test._id.toString()} with lastId: ${test.lastId.toString()} as isPublished: true`
          );
          testsToReplace.set(test.lastId.toString(), testObj);
        } else {
          console.log(
            `Test _id: ${test._id.toString()} with lastId: ${
              test.lastId ? test.lastId.toString() : 'none'
            } remains isPublished: false`
          );
        }

        return testObj;
      });

      // Second pass: Build final list with replacements
      testObjects.forEach((testObj) => {
        // Skip if already included
        if (includedTestIds.has(testObj._id.toString())) {
          console.log(
            `Skipping test _id: ${testObj._id.toString()} (already included)`
          );
          return;
        }

        // If this test's _id matches a lastId in testsToReplace, use the replacement
        if (testsToReplace.has(testObj._id.toString())) {
          const replacementTest = testsToReplace.get(testObj._id.toString());
          console.log(
            `Replacing test _id: ${testObj._id.toString()} with _id: ${replacementTest._id.toString()}`
          );
          processedData.push(replacementTest);
          includedTestIds.add(replacementTest._id.toString());
        } else {
          console.log(`Including test _id: ${testObj._id.toString()} as is`);
          processedData.push(testObj);
          includedTestIds.add(testObj._id.toString());
        }
      });

      console.log(
        'Processed Data:',
        processedData.map((t) => ({
          _id: t._id.toString(),
          lastId: t.lastId ? t.lastId.toString() : null,
          isPublished: t.isPublished,
        }))
      );

      return processedData;
    };

    let processedData;

    // Only fetch notifications if both publishedDate and publishedTime are provided
    if (publishedDate && publishedTime) {
      // Collect lastIds that are valid ObjectIds
      const lastIds = testData
        .filter(
          (test) => test.lastId && mongoose.Types.ObjectId.isValid(test.lastId)
        )
        .map((test) => new mongoose.Types.ObjectId(test.lastId));

      console.log(
        'Last IDs:',
        lastIds.map((id) => id.toString())
      );

      // Normalize publishedDate to match database format
      let dateQuery;
      try {
        const inputDate = new Date(publishedDate);
        if (isNaN(inputDate.getTime())) {
          throw new Error('Invalid publishedDate format');
        }
        // Match date without time component (cover full day)
        dateQuery = {
          $gte: new Date(inputDate.setUTCHours(0, 0, 0, 0)),
          $lte: new Date(inputDate.setUTCHours(23, 59, 59, 999)),
        };
      } catch (error) {
        console.log('PublishedDate parsing error:', error.message);
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'Invalid publishedDate format.',
          code: httpStatus.BAD_REQUEST,
        });
      }

      // Normalize publishedTime
      const normalizedPublishedTime = publishedTime.trim();

      // Fetch notifications for lastIds
      const notificationQuery = {
        publishedBy: new mongoose.Types.ObjectId(userId),
        testId: { $in: lastIds },
        publishedDate: dateQuery,
        publishedTime: normalizedPublishedTime,
      };

      console.log(
        'Notification Query:',
        JSON.stringify(
          notificationQuery,
          (key, value) =>
            value instanceof mongoose.Types.ObjectId ? value.toString() : value,
          2
        )
      );

      const notifications = await studentNotification
        .find(notificationQuery)
        .select('testId');

      console.log(
        'Notifications Found:',
        notifications.map((n) => ({
          _id: n._id.toString(),
          testId: n.testId.toString(),
        }))
      );

      // Create a Set of testIds from notifications for quick lookup
      const notifiedTestIds = new Set(
        notifications.map((n) => n.testId.toString())
      );

      // Process tests with notification data
      processedData = processTestData(testData, notifiedTestIds);
    } else {
      // If publishedDate or publishedTime is missing, set isPublished to false for all
      console.log(
        'Missing publishedDate or publishedTime, setting isPublished to false'
      );
      processedData = processTestData(testData, new Set());
    }

    // Check if any data was found
    if (processedData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No tests found for the given criteria.',
        code: httpStatus.NOT_FOUND,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Test data retrieved successfully.',
      code: httpStatus.OK,
      data: processedData,
    });
  } catch (error) {
    console.log('Server error:', error);
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
const republishTest = async (req, res) => {
  try {
    const { ids, publishedDate, duration, publishedTime, instructionId } =
      req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or empty ID array',
      });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      console.error('Invalid ObjectIds:', invalidIds);
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid ObjectId(s): ${invalidIds.join(', ')}`,
      });
    }

    const parsedDate = new Date(publishedDate);
    if (isNaN(parsedDate.getTime())) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published date',
      });
    }

    if (!publishedTime || typeof publishedTime !== 'string') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published time',
      });
    }

    if (!duration || typeof duration !== 'string') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid duration',
      });
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    // Fetch tests with testType: "online"
    const tests = await Test.find({
      _id: { $in: ids },
      testType: 'online',
    });
    if (tests.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No online tests found with provided IDs',
      });
    }
    let normalizedInstructionIds = [];

    if (Array.isArray(instructionId) && instructionId.length > 0) {
      // Remove duplicates
      const uniqueIds = [...new Set(instructionId)];

      // Validate ObjectIds
      const invalidInstructionIds = uniqueIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidInstructionIds.length > 0) {
        console.error('Invalid instructionId(s):', invalidInstructionIds);
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: `Invalid instructionId(s): ${invalidInstructionIds.join(', ')}`,
        });
      }

      // If all are valid and unique
      normalizedInstructionIds = uniqueIds;
    }
    let totalNotificationsCreated = 0;
    let totalNotificationsDeleted = 0;
    let noTeachersFound = true;

    for (const test of tests) {
      const subjectIds = test.subjects
        .filter((subject) => mongoose.Types.ObjectId.isValid(subject._id))
        .map((subject) => subject._id);
      const classIds = test.classes
        .filter((classItem) => mongoose.Types.ObjectId.isValid(classItem._id))
        .map((classItem) => classItem._id);

      if (subjectIds.length === 0 || classIds.length === 0) {
        console.warn(`Test ${test._id} has no valid subject or class IDs`);
        continue;
      }

      // Find users with matching subjectId and classId
      const users = await userprofileModel
        .find({
          subjectId: { $in: subjectIds },
          classId: { $in: classIds },
        })
        .populate('userId');

      // Filter for teachers
      const teacherUsers = users.filter(
        (user) => user?.userId?.userRole === 'student'
      );
      if (teacherUsers.length > 0) {
        noTeachersFound = false;
      }

      // Collect all user IDs (teachers + authenticated teacher)
      const userIds = [
        ...teacherUsers.map((user) => user.userId._id),
        req.user._id,
      ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

      // Delete existing notifications for these users and test
      const deleteResult = await studentNotification.deleteMany({
        userId: { $in: userIds },
        testId: test._id,
        subjectId: { $in: subjectIds },
        classId: { $in: classIds },
        type: 'test',
      });
      totalNotificationsDeleted += deleteResult.deletedCount;
      console.log(
        `Deleted ${deleteResult.deletedCount} notifications for test ${test._id}`
      );

      // Prepare new notifications for teachers
      const notifications = teacherUsers.map((user) => ({
        userId: user.userId._id,
        subjectId: subjectIds,
        classId: classIds,
        testId: test._id,
        isReaded: false,
        type: 'test',
        instructionId: normalizedInstructionIds,
        duration,
        publishedBy: req.user._id,
        publishedDate: parsedDate,
        publishedTime,
        countRead: true,
      }));

      // Prepare teacher notification
      const teacherNotification = {
        userId: req.user._id,
        subjectId: subjectIds,
        classId: classIds,
        testId: test._id,
        isReaded: false,
        type: 'test',
        instructionId: normalizedInstructionIds,
        duration,
        publishedBy: req.user._id,
        publishedDate: parsedDate,
        publishedTime,
        countRead: false,
      };

      const allNotifications = [...notifications, teacherNotification];

      // Create new notifications
      if (allNotifications.length > 0) {
        await studentNotification.insertMany(allNotifications);
        totalNotificationsCreated += allNotifications.length;
        console.log(
          `Created ${allNotifications.length} notifications for test ${test._id}`
        );
      }
    }

    if (
      noTeachersFound &&
      totalNotificationsCreated === 1 &&
      totalNotificationsDeleted === 0
    ) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message:
          'Test(s) republished, but no teachers found. Only teacher notification created.',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: `Successfully republished ${tests.length} test(s). ${totalNotificationsCreated} notifications created and ${totalNotificationsDeleted} notifications deleted.`,
    });
  } catch (error) {
    console.error('Error in republishTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
const deletePublishedTest = async (req, res) => {
  try {
    const { duration, publishedDate, publishedTime } = req.body;

    // Validate input
    if (!duration || typeof duration !== 'string') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid duration',
      });
    }

    const parsedDate = new Date(publishedDate);
    if (isNaN(parsedDate.getTime())) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published date',
      });
    }

    if (!publishedTime || typeof publishedTime !== 'string') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid published time',
      });
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    // Delete notifications matching the criteria
    const deleteResult = await studentNotification.deleteMany({
      publishedBy: req.user._id,
      type: 'test',
      duration,
      publishedDate: parsedDate,
      publishedTime,
    });

    if (deleteResult.deletedCount === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No notifications found matching the provided criteria',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: `Successfully deleted ${deleteResult.deletedCount} notification(s)`,
    });
  } catch (error) {
    console.error('Error in deletePublishedTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};
export const TestController = {
  createTest,
  getAllTest,
  updateTest,
  getTestByBook,
  getTestById,
  deleteTest,
  publishTest,
  republishTest,
  getPublishedTest,
  currentDayTest,
  checkAttemptedTest,
  previousDayTests,
  getISTTime,
  studentTestMarks,
  studentTestMarksLeaderboard,
  getTestsByLessonAndTopic,
  studentTestLeaderboard,
  getUserTestByBook,
  deletePublishedTest,
};
