import studentNotification from './studentnotification.model';
import createResponse from '../../../utils/response';
import httpStatus from '../../../utils/httpStatus';
import mongoose from 'mongoose';
import {
  sendErrorResponse,
  sendSuccessResponse,
} from '../../../utils/responseHelper';
import homeworkModel from '../Homework/homework.model';
import Test from '../Test/test.model';
import userprofileModel from '../User-Profile/userprofile.model';

const errorMessages = {
  NOT_FOUND: 'Notification not found',
  ID_REQUIRED: 'ID is required',
};

const getAllNotification = async (req, res) => {
  try {
    // find joind batch
    const userProfule = await userprofileModel.findOne({
      userId: req.user._id,
    });

    // Fetch unread notifications for the user, sorted by createdAt in descending order
    const userNotificationData = await studentNotification
      .find({
        userId: req.user._id,
        isReaded: false,
        batchId: userProfule?.joinedBatch,
      })
      .sort({ createdAt: -1 });
    console.log(userNotificationData, 'userNotificationData');

    // Filter out invalid notifications
    const validNotifications = userNotificationData.filter(
      (n) => n.publishedDate && (n.homeworkId || n.testId || n.message)
    );

    const notificationMap = new Map(); // Map to store one notification per unique key

    for (const notification of validNotifications) {
      // Ensure subjectId and classId are arrays and handle null/undefined cases
      const subjectIds = Array.isArray(notification.subjectId)
        ? notification.subjectId.filter((id) => id)
        : notification.subjectId
          ? [notification.subjectId]
          : [];
      const classIds = Array.isArray(notification.classId)
        ? notification.classId.filter((id) => id)
        : notification.classId
          ? [notification.classId]
          : [];

      // Handle different notification types
      let dataEntry = null;

      if (notification.type === 'homework' && notification.homeworkId) {
        const homeworkData = await homeworkModel
          .findOne({
            _id: notification.homeworkId,
            subjectId: { $in: subjectIds },
            classId: { $in: classIds },
          })
          .populate('lessonId')
          .populate('topicId');

        if (homeworkData) {
          const topic =
            (homeworkData.topicId?.[0]?.topic ||
              homeworkData.topicId?.[0]?.title ||
              homeworkData.lessonId?.[0]?.nameEn) ??
            'Unknown Topic';

          dataEntry = {
            type: notification.type,
            publishedDate: notification.publishedDate
              ? notification.publishedDate.toISOString()
              : null,
            topic,
          };
        }
      } else if (notification.type === 'test' && notification.testId) {
        const testData = await Test.findOne({
          _id: notification.testId,
          'subjects._id': { $in: subjectIds },
          'classes._id': { $in: classIds },
        }).populate('lesson');

        if (testData) {
          const topic =
            (testData.lesson?.[0]?.nameEn ||
              testData.lesson?.[0]?.title ||
              testData.lesson?.[0]?.lessonName ||
              testData.topic?.[0]) ??
            'Unknown Topic';
          console.log(topic, 'topic');
          const topicName = typeof topic === 'string' ? topic : topic?.nameEn;

          dataEntry = {
            type: notification.type,
            publishedDate: notification.publishedDate
              ? notification.publishedDate.toISOString()
              : null,
            publishedTime: notification.publishedTime,
            testType: testData.type,
            topic: topicName,
          };
        }
      } else if (notification.type === 'message') {
        const message = notification.message ?? 'No message content';

        dataEntry = {
          type: notification.type,
          publishedDate: notification.publishedDate
            ? notification.publishedDate.toISOString()
            : null,
          topic: message,
        };
      }

      if (dataEntry) {
        // Create a unique key based on type and date-time
        const key =
          notification.type === 'test'
            ? `${
                notification.type
              }-${notification.publishedDate?.toISOString()}-${
                notification.publishedTime || ''
              }`
            : `${
                notification.type
              }-${notification.publishedDate?.toISOString()}`;

        // Only add or update if this is the first entry for the key or more recent
        if (
          !notificationMap.has(key) ||
          new Date(notification.createdAt) >
            new Date(notificationMap.get(key).createdAt)
        ) {
          notificationMap.set(key, {
            notificationIds: [notification._id.toString()],
            type: notification.type,
            isReaded: notification.isReaded,
            publishedDate: notification.publishedDate
              ? notification.publishedDate.toISOString()
              : null,
            subjectId: subjectIds,
            classId: classIds,
            createdAt: notification.createdAt
              ? notification.createdAt.toISOString()
              : null,
            updatedAt: notification.updatedAt
              ? notification.updatedAt.toISOString()
              : null,
            data: [dataEntry], // Store only one data entry
          });
        }
      }
    }

    const notifications = Array.from(notificationMap.values());

    // Sort to ensure "24 Jun 2025" appears first, then maintain original order within dates
    notifications.sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate) : new Date(0);
      const dateB = b.publishedDate ? new Date(b.publishedDate) : new Date(0);

      // Prioritize "24 Jun 2025" at the top
      const isDateA24Jun =
        dateA.toDateString() === new Date('2025-06-24').toDateString();
      const isDateB24Jun =
        dateB.toDateString() === new Date('2025-06-24').toDateString();

      if (isDateA24Jun && !isDateB24Jun) return -1; // a (24 Jun) comes first
      if (!isDateA24Jun && isDateB24Jun) return 1; // b (24 Jun) comes first
      return 0; // Maintain original order for same dates
    });

    console.log(notifications, 'arr');

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  } catch (error) {
    return sendErrorResponse(res, 'Failed to retrieve notifications', {
      error: error.message,
    });
  }
};
const getAllNotificationCount = async (req, res) => {
  try {
    // Fetch unread notifications for the user
    const profile = await userprofileModel.findOne({ userId: req.user._id });
    const userNotificationData = await studentNotification.find({
      userId: req.user._id,
      countRead: true,
      batchId: profile?.joinedBatch,
    });

    // Group notifications by publishedDate, subjectId, classId, type, and data.publishedDate
    const groupedNotifications = {};

    for (const notification of userNotificationData) {
      // Ensure subjectId and classId are arrays and handle null/undefined cases
      const subjectIds = Array.isArray(notification.subjectId)
        ? notification.subjectId.filter((id) => id)
        : notification.subjectId
          ? [notification.subjectId]
          : [];
      const classIds = Array.isArray(notification.classId)
        ? notification.classId.filter((id) => id)
        : notification.classId
          ? [notification.classId]
          : [];

      // Base key for notification metadata
      const baseKey = `${
        notification.publishedDate
          ? new Date(notification.publishedDate).toISOString().split('T')[0]
          : 'null'
      }_${subjectIds.sort().join(',')}_${classIds.sort().join(',')}_${
        notification.type
      }`;

      // Handle different notification types
      if (notification.type === 'homework' && notification.homeworkId) {
        const homeworkData = await homeworkModel
          .find({
            _id: notification.homeworkId,
            subjectId: { $in: subjectIds },
            classId: { $in: classIds },
            // isPublished: true,
          })
          .populate('topicId');

        for (const homework of homeworkData) {
          // Create a unique key including the homework's publishedDate
          const dataPublishedDate = notification.publishedDate
            ? new Date(notification.publishedDate).toISOString().split('T')[0]
            : 'null';
          const key = `${baseKey}_${dataPublishedDate}`;

          // Initialize the group if it doesn't exist
          if (!groupedNotifications[key]) {
            groupedNotifications[key] = {
              notificationIds: [],
              type: notification.type,
              isReaded: notification.isReaded,
              countRead: notification.countRead,
              publishedDate: notification.publishedDate
                ? notification.publishedDate.toISOString()
                : null,
              subjectId: subjectIds,
              classId: classIds,
              createdAt: notification.createdAt
                ? notification.createdAt.toISOString()
                : null,
              updatedAt: notification.updatedAt
                ? notification.updatedAt.toISOString()
                : null,
              data: [],
            };
          }

          // Add notification ID to the group
          groupedNotifications[key].notificationIds.push(
            notification._id.toString()
          );

          // Access topic from the first element of topicId array
          const topic =
            homework.topicId?.[0]?.topic ||
            homework.topicId?.[0]?.title ||
            homework.topicId?.[0]?.lessonName ||
            null;

          // Log warning if topic is null
          if (!topic) {
            console.warn(`No topic for homework ${homework._id}`);
          }

          // Add homework data to the group
          groupedNotifications[key].data.push({
            type: notification.type,
            publishedDate: notification.publishedDate
              ? notification.publishedDate.toISOString()
              : null,
            topic,
          });
        }
      } else if (notification.type === 'test' && notification.testId) {
        const testData = await Test.find({
          _id: notification.testId,
          'subjects._id': { $in: subjectIds },
          'classes._id': { $in: classIds },
          // isPublished: true,
        }).populate('lesson');

        for (const test of testData) {
          const dataPublishedDate = notification.publishedDate
            ? new Date(notification.publishedDate).toISOString().split('T')[0]
            : 'null';
          const key = `${baseKey}_${dataPublishedDate}`;

          if (!groupedNotifications[key]) {
            groupedNotifications[key] = {
              notificationIds: [],
              type: notification.type,
              isReaded: notification.isReaded,
              countRead: notification.countRead,
              publishedDate: notification.publishedDate
                ? notification.publishedDate.toISOString()
                : null,
              subjectId: subjectIds,
              classId: classIds,
              createdAt: notification.createdAt
                ? notification.createdAt.toISOString()
                : null,
              updatedAt: notification.updatedAt
                ? notification.updatedAt.toISOString()
                : null,
              data: [],
            };
          }

          groupedNotifications[key].notificationIds.push(
            notification._id.toString()
          );

          const topic =
            test.lesson?.[0]?.nameEn ||
            test.lesson?.[0]?.title ||
            test.lesson?.[0]?.lessonName ||
            test.topic?.[0] ||
            null;

          // Log warning if topic is null
          if (!topic) {
            console.warn(`No topic for test ${test._id}`);
          }

          // Add test data to the group
          groupedNotifications[key].data.push({
            type: test.type || notification.type,
            publishedDate: notification.publishedDate
              ? test?.publishedDate?.toISOString()
              : null,
            topic,
          });
        }
      } else if (notification.type === 'message') {
        // Handle message type notifications
        const dataPublishedDate = notification.publishedDate
          ? new Date(notification.publishedDate).toISOString().split('T')[0]
          : 'null';
        const key = `${baseKey}_${dataPublishedDate}`;

        if (!groupedNotifications[key]) {
          groupedNotifications[key] = {
            notificationIds: [],
            type: notification.type,
            isReaded: notification.isReaded,
            countRead: notification.countRead,
            publishedDate: notification.publishedDate
              ? notification.publishedDate.toISOString()
              : null,
            subjectId: subjectIds,
            classId: classIds,
            createdAt: notification.createdAt
              ? notification.createdAt.toISOString()
              : null,
            updatedAt: notification.updatedAt
              ? notification.updatedAt.toISOString()
              : null,
            data: [],
          };
        }

        groupedNotifications[key].notificationIds.push(
          notification._id.toString()
        );

        // Add message data to the group
        const message = notification.message || null;

        // Log warning if message is null
        if (!message) {
          console.warn(`No message for notification ${notification._id}`);
        }

        groupedNotifications[key].data.push({
          type: notification.type,
          publishedDate: notification.publishedDate
            ? notification.publishedDate.toISOString()
            : null,
          topic: message, // Include message instead of topic
        });
      }
    }

    // Convert grouped notifications to an array and filter out empty groups
    const arr = Object.values(groupedNotifications).filter(
      (group) => group.data.length > 0
    );

    // Sort the array by publishedDate in descending order (latest first)
    arr.sort((a, b) => {
      const dateA = a.publishedDate ? new Date(a.publishedDate) : new Date(0);
      const dateB = b.publishedDate ? new Date(b.publishedDate) : new Date(0);
      return dateB - dateA;
    });

    // Return response
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notifications retrieved successfully',
      data: arr,
    });
  } catch (error) {
    return sendErrorResponse(res, 'Failed to retrieve notifications', {
      error: error.message,
    });
  }
};
const updateNotificationStatus = async (req, res) => {
  try {
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }
    const { classId, subjectId } = req.body;
    if (!classId || !subjectId) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message:
          'Missing required query parameters: classId, subjectId, or type',
      });
    }
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid classId format',
      });
    }
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid subjectId format',
      });
    }
    const query = {
      userId: new mongoose.Types.ObjectId(req.user._id),
      countRead: true,
      classId: new mongoose.Types.ObjectId(classId),
      subjectId: new mongoose.Types.ObjectId(subjectId),
    };
    const updateResult = await studentNotification.updateMany(query, {
      $set: {
        countRead: false,
        updatedAt: new Date(),
      },
    });
    if (updateResult.matchedCount === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'No unread notifications found for the specified criteria',
        data: {
          modifiedCount: 0,
          matchedCount: 0,
        },
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: `Successfully marked ${updateResult.modifiedCount} notification(s) as read`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to update notification status',
      error: error.message,
    });
  }
};
const lastHomework = async (req, res) => {
  try {
    // Validate req.user and req.user._id
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing user ID',
      });
    }

    // Find the latest publishedDate
    const latestDateDoc = await studentNotification
      .findOne({
        batchId: req.query.batchId,
        publishedBy: req.user._id,
        type: 'homework',
        subjectId: req.query.subjectId,
        classId: req.query.classId,
      })
      .sort({ publishedDate: -1 })
      .select('publishedDate');

    if (!latestDateDoc) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No homework found for the user',
      });
    }

    // Fetch all documents for the latest publishedDate and populate homeworkId
    const homeworkData = await studentNotification
      .find({
        batchId: req.query.batchId,
        publishedBy: req.user._id,
        type: 'homework',
        subjectId: req.query.subjectId,
        classId: req.query.classId,
        publishedDate: latestDateDoc.publishedDate,
      })
      .populate({
        path: 'homeworkId',
        select: 'question', // Select only the question field
      })
      .lean(); // Use lean() for performance

    // Remove duplicate homeworkId entries
    const seenHomeworkIds = new Set();
    const uniqueQuestions = homeworkData
      .filter((doc) => {
        // Skip documents with invalid or missing homeworkId/question
        if (!doc.homeworkId || !doc.homeworkId.question) {
          return false;
        }
        // Only include if homeworkId hasn't been seen
        const homeworkIdStr = doc.homeworkId._id.toString();
        if (seenHomeworkIds.has(homeworkIdStr)) {
          return false;
        }
        seenHomeworkIds.add(homeworkIdStr);
        return true;
      })
      .map((doc) => ({ question: doc.homeworkId.question }));

    // Log invalid homeworkId references for debugging
    const invalidDocs = homeworkData.filter(
      (doc) => !doc.homeworkId || !doc.homeworkId.question
    );
    if (invalidDocs.length > 0) {
      console.warn(`Found ${invalidDocs.length} invalid homeworkId references`);
    }

    // Format the response
    const formattedResponse = {
      publishedDate: latestDateDoc.publishedDate,
      question: uniqueQuestions,
    };

    // Check if any questions were found
    if (formattedResponse.question.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No valid questions found for the latest homework',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Latest homework retrieved successfully',
      data: formattedResponse,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Failed to fetch latest homework',
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message, classId, subjectId, userIds, batchId } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or empty message',
      });
    }

    // Validate userIds
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or empty user ID array',
      });
    }

    const invalidUserIds = userIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidUserIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid user ID(s): ${invalidUserIds.join(', ')}`,
      });
    }

    // Validate classId (single ObjectId)
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing class ID',
      });
    }

    // Validate subjectId (single ObjectId)
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing subject ID',
      });
    }

    // Validate authenticated user
    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User not authenticated or invalid user ID',
      });
    }

    // Find users who are students and are associated with the provided classId and subjectId
    const users = await userprofileModel
      .find({
        userId: { $in: userIds },
        // classId: classId, // Exact match in the classId array
        // subjectId: subjectId, // Exact match in the subjectId array
        joinedBatch: batchId,
      })
      .populate({
        path: 'userId',
        select: 'userRole',
      });

    const validUsers = users.filter(
      (user) => user.userId && user.userId.userRole === 'student'
    );
    if (validUsers.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message:
          'No valid student users found for the provided class and subject IDs',
      });
    }

    // Create notifications for each valid user
    const notifications = validUsers.map((user) => ({
      batchId: batchId,
      userId: user.userId._id,
      classId,
      subjectId,
      type: 'message',
      countRead: true,
      message: message.trim(),
      publishedBy: req.user._id,
      publishedDate: new Date(),
      isReaded: false,
    }));

    await studentNotification.insertMany(notifications);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: `Successfully sent message to ${notifications.length} user(s)`,
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
export const studentNotificationController = {
  getAllNotification,
  getAllNotificationCount,
  updateNotificationStatus,
  lastHomework,
  sendMessage,
};
