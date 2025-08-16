/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import profileModel from './userprofile.model';
import User from '../User/user.model';
import createResponse from '../../../utils/response';
import validateProfile from './userprofile.validator';
import bcrypt from 'bcryptjs';
import batchModel from '../Batch/batch.model';
import batchRequestModel from '../BatchRequest/request.model';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';
import sendEmail from '../../../utils/mailer';
import userprofileModel from './userprofile.model';
import mongoose from 'mongoose';
const errorMessages = {
  NOT_FOUND: 'Profile not found',
  ID_REQUIRED: 'ID is required',
};
const getProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const profile = await userprofileModel
      .findOne({ userId: id })
      .select('userId  classId sections subjectId institution address')
      .populate([
        { path: 'userId', select: 'picture name email mobile userRole' },
        { path: 'classId', select: 'nameEn' },
        { path: 'sections', select: 'sectionsName' },
        { path: 'subjectId', select: 'nameEn images' },
        {
          path: 'institution',
          select: '_id institutesName instituteType instituteCode',
        },
        { path: 'address.state', select: '_id name' },
        { path: 'address.district', select: '_id name' },
      ])
      .lean();
    if (!profile) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Profile not found',
      });
    }
    const role = profile.userId?.userRole || 'student';

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Profile fetched',
      data: {
        userDetails: {
          name: profile?.userId?.name?.english || '',
          email: profile?.userId?.email || '',
          mobile: profile?.userId?.mobile || '',
          role,
        },
        classDetail:
          profile?.classId?.map((cls) => ({
            class: cls?.nameEn,
            _id: cls?._id,
          })) || [],
        subjectDetail:
          profile?.subjectId?.map((sub) => ({
            subject: sub?.nameEn,
            _id: sub?._id,
            images: sub?.images,
          })) || [],
        sectionDetail:
          profile?.sections?.map((sec) => ({
            section: sec?.sectionsName,
            _id: sec?._id,
          })) || [],
        institute: profile?.institution?.institutesName || '',

        instituteId: profile?.institution?._id || null,
        instituteCode: profile?.institution?.instituteCode || '',
        type: profile?.institution?.instituteType || '',
        picture: profile?.userId?.picture || '',
        address1: profile?.address?.address1 || '',
        address2: profile?.address?.address2 || '',
        pincode: profile?.address?.pinCode || '',
        state: profile?.address?.state || null,
        district: profile?.address?.district || null,

        class: profile?.classId?.length > 0,
        section: profile?.sections?.length > 0,
        subject: profile?.subjectId?.length > 0,
        institutionRequired: role === 'teacher',
        institution: role === 'teacher' ? !!profile?.institution : true,
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
const createProfile = async (req, res) => {
  try {
    console.log('rehan');
    const payload = req.body;
    payload.status = 'Active';
    let userData;
    if (payload?.mobile?.length > 0 && payload.email?.length > 0) {
      userData = await User.findOne({
        $or: [{ email: payload.email }, { mobile: payload.mobile }],
      });
    }
    if (payload.mobile?.length > 0) {
      userData = await User.findOne({ mobile: payload.mobile });
    }
    if (payload.email?.length > 0) {
      userData = await User.findOne({ email: payload.email });
    }

    console.log(userData, 'userData');
    if (!userData) {
      const defaultMpin = 'Ep@12345';
      const hashedMpin = await bcrypt.hash(defaultMpin, 10);
      userData = await User.create({
        email: payload.email,
        mobile: payload.mobile,
        userRole: payload.role,
        password: hashedMpin,
        isActive: true,
        createdBy: req.user._id,
        updatedBy: req.user._id,
        name: { english: req.body.name, hindi: '', hinglish: '' },
      });
    }
    payload.userId = userData._id;
    (payload.createdBy = req.user._id),
      (payload.updatedBy = req.user._id),
      delete payload.name;
    delete payload.email;
    delete payload.mobile;

    await validateProfile(payload, { abortEarly: false });
    const profile = await profileModel.create({
      ...payload,
      status: 'Active',
    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'User and profile created successfully.',
      data: profile,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Validation error',
        status: false,
        error: error.errors,
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

const createProfileWithInvitation = async (req, res) => {
  try {
    const payload = req.body;
    payload.status = 'Invited';
    let userData = await User.findOne({
      $or: [{ email: payload.email }, { mobile: payload.mobile }],
    });
    if (!userData) {
      userData = await User.create({
        email: payload.email,
        mobile: payload.mobile,
        userRole: payload.role,
        name: { english: req.body.name, hindi: '', hinglish: '' },
        isActive: false,
      });
    }

    payload.userId = userData._id;
    (payload.createdBy = req.user._id),
      (payload.updatedBy = req.user._id),
      await userData.save();

    await validateProfile(payload, { abortEarly: false });
    const dynamicValues = {
      userName: req.body.name || 'User',
      email: payload.email,
      invitationUrl: `${process.env.BASE_URL}/accept-invitation?token=${'sagfhsjav'}`,
    };

    await sendEmail(
      req.body.email,
      req.body.name || 'User',
      'Welcome to Our Platform!',
      'welcome',
      dynamicValues
    );
    delete payload.name;
    delete payload.email;
    delete payload.mobile;
    delete payload.role;
    const profile = await profileModel.create({
      ...payload,
      status: 'Active',
    });
    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'User and profile created successfully.',
      data: profile,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Validation error',
        status: false,
        error: error.errors,
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

const getProfileList = async (req, res) => {
  console.log('res');
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'createdAt',
      role,
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const userIdToExclude = req.user?._id;

    // Base user query
    const userQuery = {
      _id: { $ne: userIdToExclude },
    };

    // Add search filters
    if (search) {
      userQuery.$or = [
        { 'name.english': { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Add filterRole to query
    if (role) {
      userQuery.userRole = { $regex: `^${role}$`, $options: 'i' }; // Exact match for role
    }

    const formattedStatus =
      status && status !== 'all'
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : null;

    // Main aggregation pipeline
    const pipeline = [
      { $match: userQuery },
      {
        $lookup: {
          from: 'userinfos',
          localField: '_id',
          foreignField: 'userId',
          as: 'profileDetails',
        },
      },
      {
        $unwind: {
          path: '$profileDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (formattedStatus) {
      pipeline.push({
        $match: {
          $or: [
            { 'profileDetails.status': formattedStatus },
            { profileDetails: { $exists: false } },
          ],
        },
      });
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    pipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          userId: '$profileDetails._id',
          name: '$name.english',
          email: 1,
          mobile: 1,
          userRole: 1,
          picture: { $ifNull: ['$picture', ''] },
          createdAt: 1,
          lastLogin: { $ifNull: ['$lastLogin', null] },
          status: '$profileDetails.status',
        },
      }
    );

    const results = await User.aggregate(pipeline);

    // Count pipeline
    const countPipeline = [
      { $match: userQuery },
      {
        $lookup: {
          from: 'userinfos',
          localField: '_id',
          foreignField: 'userId',
          as: 'profileDetails',
        },
      },
      {
        $unwind: {
          path: '$profileDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (formattedStatus) {
      countPipeline.push({
        $match: {
          $or: [
            { 'profileDetails.status': formattedStatus },
            { profileDetails: { $exists: false } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const [countResult] = await User.aggregate(countPipeline);
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    const responseData = {
      status: true,
      message: 'Profile list fetched successfully.',
      data: {
        profiles: results,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    };

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      ...responseData,
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

const updateProfile = async (req, res) => {
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

    // Remove email, mobile, and name from the data to be saved in profileModel
    const { email, mobile, name, ...profileData } = req.body;

    // Always unset email, mobile, and name in profileModel
    const updateData = {
      $set: { ...profileData, updatedBy },
      $unset: { email: '', mobile: '', name: '' },
    };

    const profile = await profileModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: errorMessages.NOT_FOUND,
      });
    }

    // Update User model if email, mobile, name, or role are provided
    if (email || mobile || name || req.body.role) {
      const userId = profile.userId; // Assuming userId is the field in profileModel that references the User
      if (!userId) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'User ID not found in profile',
        });
      }

      const userData = await User.findById(userId);
      if (!userData) {
        return createResponse({
          res,
          statusCode: httpStatus.NOT_FOUND,
          status: false,
          message: 'User not found for this profile',
        });
      }

      // Update User fields if provided
      if (req.body.role) userData.userRole = req.body.role;
      if (name) userData.name.english = name;
      if (email) userData.email = email;
      if (mobile) userData.mobile = mobile;
      await userData.save();
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Profile updated successfully.',
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
const getProfileById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const profile = await profileModel.findById(id).populate('userId');
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
      message: 'Profile fetched successfully.',
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

const validateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
      });
    } else {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return createResponse({
        res,
        statusCode: httpStatus.CONFLICT,
        status: false,
      });
    } else {
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
const updateProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Status is required.',
      });
    }
    const validStatuses = ['Pending', 'Active', 'Inactive', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }
    const updatedProfile = await profileModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    let profile = await userprofileModel.findById(id);
    let userData = await User.findById(profile.userId);
    if (status == 'Active') {
      userData.isActive = true;
    }
    if (status == 'Inactive') {
      userData.isActive = false;
    }
    userData.save();
    if (!updatedProfile) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Profile not found.',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      data: updatedProfile,
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
const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Email and password are required',
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User not found',
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.status = true;
    user.isActive = true;
    let userInfo = await userprofileModel.findOne({ userId: user._id });
    if (userInfo) {
      userInfo.status = 'Active';
    }
    await userInfo.save();
    await user.save();
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      data: { email: user.email },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Something went wrong',
    });
  }
};
const createOrUpdateProfile = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const payload = req.body;
    const userData = await User.findById(userId);
    if (!userData) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User not found',
      });
    }

    const profileData = {
      ...payload,
      userId,
      createdBy: userId,
      updatedBy: userId,
      status: payload.status || 'Active',
    };
    await validateProfile(profileData, { abortEarly: false });

    const userUpdate = {};
    if (payload.email) userUpdate.email = payload.email;
    if (payload.mobile) userUpdate.mobile = payload.mobile;
    if (payload.name)
      userUpdate.name = { english: payload.name, hindi: '', hinglish: '' };
    if (payload.role) userUpdate.userRole = payload.role;
    userUpdate.updatedBy = userId;
    if (payload.picture) userUpdate.picture = payload.picture;
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: userUpdate });
    }

    delete profileData.name;
    delete profileData.email;
    delete profileData.mobile;
    delete profileData.role;

    const existingProfile = await profileModel.findOne({ userId });

    const profile = await profileModel
      .findOneAndUpdate(
        { userId },
        { $set: profileData },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      )
      .populate(
        'classId sections subjectId batchCode address.state address.district userId'
      );

    if (userData.userRole === 'student' && payload?.sections?.length > 1) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Student cannot add multiple sections',
      });
    }
    if (userData.userRole === 'teacher' && payload?.subjectId?.length > 1) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Teacher cannot add multiple subjects',
      });
    }

    let role = payload.role || userData.userRole || 'student';
    if (!payload.role && userData.userRole !== 'teacher') {
      role = payload.classId?.length > 1 ? 'teacher' : 'student';
      await User.findByIdAndUpdate(userId, { $set: { userRole: role } });
    }

    await profile.save();
    return createResponse({
      res,
      statusCode: existingProfile ? httpStatus.OK : httpStatus.CREATED,
      status: true,
      message: existingProfile
        ? 'Profile updated successfully'
        : 'Profile created and role assigned',
      data: {
        class: profile.classId?.length > 0,
        section: profile.sections?.length > 0,
        subject: profile.subjectId?.length > 0,
        institutionRequired: role === 'teacher',
        institution: !!profile.institution,
        role,
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

const getStudentList = async (req, res) => {
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

    const query = { 'userDetails.userRole': 'student' };
    if (status && status !== 'all') {
      query.status =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $match: query },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userDetails.name.english': { $regex: search, $options: 'i' } },
            { 'userDetails.mobile': { $regex: search, $options: 'i' } },
            { 'userDetails.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortCriteria = { [sortBy]: sortOrder };
    pipeline.push(
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
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sectionDetails',
        },
      },

      {
        $lookup: {
          from: 'institutes',
          localField: 'institution',
          foreignField: '_id',
          as: 'institutionDetails',
        },
      },
      {
        $lookup: {
          from: 'batchrequests',
          let: { profUid: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$profUid'] },
                    { $eq: ['$approve', true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'batches',
                localField: 'batchId',
                foreignField: '_id',
                as: 'batchDoc',
              },
            },
            { $unwind: '$batchDoc' },
            { $project: { code: '$batchDoc.code', _id: 0 } },
          ],
          as: 'approvedBatchCodes',
        },
      },
      {
        $unwind: {
          path: '$institutionDetails',
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    pipeline.push(
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          name: '$userDetails.name.english',
          email: '$userDetails.email',
          mobile: '$userDetails.mobile',
          userRole: '$userDetails.userRole',
          lastLogin: { $ifNull: ['$userDetails.lastLogin', null] },
          class: '$classDetails',
          subjects: '$subjectDetails',
          institution: '$institutionDetails',
          sections: '$sectionDetails',
          batchfollow: '$approvedBatchCodes.code',
        },
      }
    );

    const results = await profileModel.aggregate(pipeline);
    const countPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $match: query },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { 'userDetails.name.english': { $regex: search, $options: 'i' } },
            { 'userDetails.mobile': { $regex: search, $options: 'i' } },
            { 'userDetails.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }
    countPipeline.push({ $count: 'total' });
    const [countResult] = await profileModel.aggregate(countPipeline);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Student list fetched successfully.',
      data: {
        students: results,
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

const getTeacherList = async (req, res) => {
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

    const query = { 'userDetails.userRole': 'teacher' };
    if (status && status !== 'all') {
      query.status =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $match: query },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userDetails.name.english': { $regex: search, $options: 'i' } },
            { 'userDetails.mobile': { $regex: search, $options: 'i' } },
            { 'userDetails.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortCriteria = { [sortBy]: sortOrder };
    pipeline.push(
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
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sectionDetails',
        },
      },

      {
        $lookup: {
          from: 'institutes',
          localField: 'institution',
          foreignField: '_id',
          as: 'institutionDetails',
        },
      },

      {
        $lookup: {
          from: 'batches',
          localField: 'userId',
          foreignField: 'classTeacherId',
          as: 'batches',
        },
      },
      {
        $lookup: {
          from: 'batchrequests',
          let: { profUid: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$profUid'] },
                    { $eq: ['$approve', true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'batches',
                localField: 'batchId',
                foreignField: '_id',
                as: 'batchDoc',
              },
            },
            { $unwind: '$batchDoc' },
            { $project: { code: '$batchDoc.code', _id: 0 } },
          ],
          as: 'approvedBatchCodes',
        },
      },

      {
        $unwind: {
          path: '$institutionDetails',
          preserveNullAndEmptyArrays: true,
        },
      }
    );
    pipeline.push(
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          name: '$userDetails.name.english',
          email: '$userDetails.email',
          mobile: '$userDetails.mobile',
          userRole: '$userDetails.userRole',
          lastLogin: { $ifNull: ['$userDetails.lastLogin', null] },
          class: '$classDetails',
          subjects: '$subjectDetails',
          institution: '$institutionDetails',
          sections: '$sectionDetails',
          batchfollow: '$approvedBatchCodes.code',
          batchCodes: {
            $map: {
              input: '$batches',
              as: 'b',
              in: '$$b.code',
            },
          },
        },
      }
    );

    const results = await profileModel.aggregate(pipeline);
    const countPipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $match: query },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { 'userDetails.name.english': { $regex: search, $options: 'i' } },
            { 'userDetails.mobile': { $regex: search, $options: 'i' } },
            { 'userDetails.email': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }
    countPipeline.push({ $count: 'total' });
    const [countResult] = await profileModel.aggregate(countPipeline);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limitNum);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Teacher list fetched successfully.',
      data: {
        teachers: results,
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
const getStudentById = async (req, res) => {
  try {
    let { id } = req.params;
    id = new mongoose.Types.ObjectId(id);

    const pipeline = [
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
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
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      {
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sectionDetails',
        },
      },
      {
        $lookup: {
          from: 'institutes',
          localField: 'institution',
          foreignField: '_id',
          as: 'institutionDetails',
        },
      },
      {
        $lookup: {
          from: 'batchrequests',
          let: { profUid: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$profUid'] },
                    { $eq: ['$approve', true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'batches',
                localField: 'batchId',
                foreignField: '_id',
                as: 'batchDoc',
              },
            },
            { $unwind: '$batchDoc' },

            // Add classId and sectionId to root for lookups
            {
              $addFields: {
                classId: '$batchDoc.classId',
                sectionId: '$batchDoc.sectionId',
              },
            },

            // Lookup class name
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'classInfo',
              },
            },
            {
              $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true },
            },

            // Lookup section name
            {
              $lookup: {
                from: 'sections',
                localField: 'sectionId',
                foreignField: '_id',
                as: 'sectionInfo',
              },
            },
            {
              $unwind: {
                path: '$sectionInfo',
                preserveNullAndEmptyArrays: true,
              },
            },

            // Project only required fields
            {
              $project: {
                approve: 1,
                batchDoc: 1,
                className: '$classInfo.name', // Adjust if field is 'className'
                sectionName: '$sectionInfo.name', // Adjust if field is 'sectionName'
              },
            },
          ],
          as: 'batchfollow',
        },
      },
      {
        $unwind: {
          path: '$institutionDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          name: '$userDetails.name.english',
          email: '$userDetails.email',
          mobile: '$userDetails.mobile',
          userRole: '$userDetails.userRole',
          lastLogin: '$userDetails.lastLogin',
          class: '$classDetails',
          subjects: '$subjectDetails',
          institution: '$institutionDetails',
          sections: '$sectionDetails',
          batchfollow: '$batchfollow',
        },
      },
    ];

    const [result] = await profileModel.aggregate(pipeline);

    if (!result) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Student not found.',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Student fetched successfully.',
      data: result,
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

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacherProfile = await profileModel
      .findById(id)
      .populate({ path: 'userId', select: 'name email mobile userRole' });

    if (!teacherProfile) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Teacher not found.',
      });
    }

    const batches = await batchModel
      .find({
        classTeacherId: teacherProfile.userId._id,
      })
      .populate({ path: 'classId', select: 'nameEn codee' })
      .populate({ path: 'sectionId', select: 'nameEn codee' });

    const approvedBatchRequests = await batchRequestModel
      .find({ userId: teacherProfile.userId._id, approve: true })
      .populate({
        path: 'batchId',
        populate: [
          {
            path: 'classId',
            select: 'nameEn codee',
          },
          {
            path: 'sectionId',
            select: 'sectionsName codee',
          },
        ],
      });

    const approvedBatchCodes = approvedBatchRequests.map((req) => {
      const batchDoc = req.batchId || {};

      let className = batchDoc.classId?.nameEn;
      if (!className && batchDoc.code) {
        const cls = teacherProfile.classId.find(
          (c) => c.codee === batchDoc.code
        );
        className = cls?.nameEn;
      }
      className = className || 'Class not found';

      let sectionName = batchDoc.sectionId?.sectionsName;
      if (!sectionName && batchDoc.code) {
        const sec = teacherProfile.sections.find(
          (s) => s.codee === batchDoc.code
        );
        sectionName = sec?.sectionsName;
      }
      sectionName = sectionName || 'Section not found';

      return {
        approve: req.approve,
        batchDoc,
        className,
        sectionName,
      };
    });

    const responseData = {
      _id: teacherProfile._id,
      userId: teacherProfile.userId._id,
      status: teacherProfile.status,
      createdAt: teacherProfile.createdAt,

      batchfollow: approvedBatchCodes,
      batchCodes: batches,
    };

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Teacher fetched successfully.',
      data: responseData,
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

export const profileController = {
  createProfile,
  getProfileList,
  createProfileWithInvitation,
  getProfileById,
  updateProfile,
  validateEmail,
  validateMobile,
  updateProfileStatus,
  setPassword,
  createOrUpdateProfile,
  getProfile,
  getStudentList,
  getTeacherList,
  getTeacherById,
  getStudentById,
};
