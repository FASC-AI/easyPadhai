//libs
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import nodemailer from 'nodemailer';
import userprofileModel from '../User-Profile/userprofile.model';
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(config.googleClientId);

//utilities
import createResponse from '../../../utils/response';
import {
  extractCommonQueryParams,
  extractQueryParams,
} from '../../../utils/requestHelper';
import validateTime from '../../../utils/timeValidation';
import hashUtils from '../../../utils/hashHelper';
import jwtUtils from '../../../utils/jwtHelper';
import { getClientIp } from '../../../utils/ipUtil';
import sendEmail from '../../../utils/mailer';
import aesUtils from '../../../utils/cryptoHash';
import { miscellaneousUtils } from '../../../utils/miscellaneous';
import { getCommonSearchConditionForMasters } from '../../../utils/commonHelper';
import profileModel from '../User-Profile/userprofile.model';
//models
import User from './user.model';
import UserOtp from '../common/otp.model';
import Profile from '../Profile/profile.model';

//misc
import {
  changepasswordValidation,
  createUserValidation,
  forgotPasswordUserValidation,
  loginUserValidation,
  mobileLoginUserValidation,
  resetpasswordValidation,
  verifyOtpValidation,
} from './user.validator';
import CookieService from '../../../services/cookie.service';
import config from '../../../config';

const register = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.email || !payload.mobile) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Email and mobile number is required.',
      });
    }

    let { email, mobile } = payload;

    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (user) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User with this email or mobile number, already exist.',
      });
    }

    await createUserValidation.validate(payload);

    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 9);
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();
    const { key, iv } = aesUtils.generateKeyAndIv();

    const hashedEmail = aesUtils.encrypt(payload.email, key, iv);

    payload.isActive = false;
    payload.emailVerified = false;
    payload.activeSessionId = '';
    payload.verificationToken = hashedToken;
    payload.verificationTokenExpires = verificationTokenExpires;
    payload.emailVerified = false;

    payload.password = '';

    const subject = 'Verify Your Email for Easy Padhai';
    const templateName = 'onboarding';

    // Dynamic values to replace placeholders in the template
    const userName = payload.name.english;

    const dynamicValues = {
      name: userName,
      verifyUrl: `${config.baseUrl}/verify-email?token=${token}&email=${hashedEmail}&key=${key.toString('hex')}&iv=${iv.toString('hex')}`,
      verifyUrlText: `${config.baseUrl.BASE_URL}/verify-email?token=${token}&email=${hashedEmail}&key=${key.toString('hex')}&iv=${iv.toString('hex')}`,
      email: email,
    };

    await sendEmail(email, userName, subject, templateName, dynamicValues);

    const newUser = new User(payload);

    await newUser.save();

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message:
        'You’ve signed up successfully, please check your registered email for verification',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.BAD_REQUEST,
      status: false,
      message: 'Failed to register user',
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    let { filters } = extractQueryParams(req);

    const { verificationToken, email, key, iv } = filters;

    if (!verificationToken || !email || !key || !iv) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid data.',
      });
    }

    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    const emailDecrypted = aesUtils.decrypt(email, keyBuffer, ivBuffer);

    if (!email) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "User's email is not provided.",
      });
    }

    const user = await User.findOne({ email: emailDecrypted });

    if (!user || !verificationToken) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: !user
          ? 'User with this email doesnot exist.'
          : !verificationToken
            ? 'Verification token must be provided as query parameters'
            : 'Some error occurred',
      });
    }

    if (user.emailVerified) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message:
          'Your email is already verified, you can proceed to your account',
      });
    }

    const isTokenValid = await hashUtils.compare(
      verificationToken,
      user.verificationToken
    );

    if (!isTokenValid) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid verification token.',
      });
    }

    if (validateTime(user.verificationTokenExpires, 'past')) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message:
          'This verification link is no longer valid, please contact to admin',
      });
    }

    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 9);
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    user.isActive = true;
    user.emailVerified = true;
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: "User's verification is successful. Login to continue.",
      data: {
        verificationToken,
        emailDecrypted,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.BAD_REQUEST,
      status: false,
      message: 'Failed to verify email',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    await loginUserValidation.validate(
      { email, password },
      { abortEarly: false }
    );

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
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.password || user.password == '') {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Please set the password first',
      });
    }

    if (!user.isActive) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Your account is not active',
      });
    }

    const isPasswordMatch = await hashUtils.compare(password, user.password);

    if (!isPasswordMatch) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwtUtils.generateToken({
      id: user._id,
    });

    user.token = token;
    if (user.userRole == 'teacher' || user.userRole == 'student') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: `Teacher or student cant login`,
        status: false,
      });
    }
    await user.save();

    // if (user.activeSessionId) {
    //   await mongoose.connection.db
    //     .collection('sessions')
    //     .deleteOne({ _id: user.activeSessionId });
    // }

    req.session.userId = user._id.toString();
    const lastLoginDate = moment().format('DD MMM, YYYY HH:mm:ss');
    const clientIp = getClientIp(req);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { activeSessionId: req.sessionID },
        lastLogin: {
          date: lastLoginDate,
          ip: clientIp,
        },
      }
    );

    CookieService.setCookie(res, 'token', token, {
      maxAge: 1000 * 60 * 60 * 12,
    });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Login successful',
      status: true,
      data: {
        token,
        name: user.name,
        id: user._id,
        userrole: user?.userRole,
      },
    });
  } catch (error) {
    if (error.message === 'Illegal arguments: string, undefined') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: `You don't have password, please set your password first`,
        status: false,
        error: error.errors,
      });
    }
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      status: false,
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const { user } = req;
    await User.findByIdAndUpdate(user._id, {
      $unset: { token: '' },
      $set: { activeSessionId: '' },
    });
    CookieService.clearCookie(res, 'token');
    req.session.destroy((err) => {
      if (err) {
        return createResponse({
          res,
          statusCode: httpStatus.INTERNAL_SERVER_ERROR,
          status: false,
          message: err.message,
        });
      }
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'Logout successful',
      });
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await forgotPasswordUserValidation.validate(
      { email },
      { abortEarly: false }
    );

    const user = await User.findOne({ email });
    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Email not found',
      });
    }

    await UserOtp.findOneAndDelete({ email });
    const otp = miscellaneousUtils.generateOTP(6);
    await UserOtp.create({ email, otp });

    const dynamicValues = {
      name: user.name.english,
      otp,
      otpValidity: '5 minutes',
    };

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return createResponse({
        res,
        statusCode: httpStatus.SERVICE_UNAVAILABLE,
        status: false,
        message: 'Email service configuration error',
        error: 'Missing EMAIL_USER or EMAIL_PASS',
      });
    }

    // Retry logic (up to 2 retries)
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use Gmail App Password
          },
        });

        await transporter.sendMail({
          from: `"Easy Padhai" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset OTP for Your Easy Padhai Account',
          html: `
            <p>Dear ${user.name.english},</p>
            <p>Your OTP for password reset is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 5 minutes.</p>
          `,
        });

        break; // Exit retry loop on success
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        attempts++;

        if (attempts >= maxAttempts) {
          return createResponse({
            res,
            statusCode: httpStatus.SERVICE_UNAVAILABLE,
            status: false,
            message: 'Failed to send OTP, please try again later',
            error: emailError.message,
          });
        }
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: error.errors[0] || 'Invalid email format',
        error: error.errors,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'An unexpected error occurred',
      error: error.message,
    });
  }
};

const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await verifyOtpValidation.validate({ email, otp }, { abortEarly: false });

    const userOtp = await UserOtp.findOne({
      email: email,
      otp: otp,
    });

    if (!userOtp) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid OTP',
      });
    }

    const otpGeneratedTime = new Date(userOtp.createdAt);

    if (validateTime(otpGeneratedTime, '5m')) {
      await UserOtp.deleteOne({ _id: userOtp._id });
      const token = uuidv4();
      const hashedToken = await hashUtils.hash(token);
      const verificationTokenExpires = new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString();
      await User.findOneAndUpdate(
        { email },
        { verificationToken: hashedToken, verificationTokenExpires }
      );
      return createResponse({
        res,
        statusCode: httpStatus.OK,
        status: true,
        message: 'OTP has been verified',
        data: {
          token: hashedToken,
        },
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.EXPECTATION_FAILED,
      status: false,
      message: 'OTP is expired',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
      error: error.message,
    });
  }
};

const addPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    await changepasswordValidation.validate(
      { email, password, token },
      { abortEarly: false }
    );

    let user = await User.findOne({ email });

    const expiryTime = new Date(user.verificationTokenExpires);

    user.verificationTokenExpires = null;
    user.verificationToken = '';

    if (validateTime(expiryTime, 'past')) {
      await user.save();
      return createResponse({
        res,
        statusCode: httpStatus.EXPECTATION_FAILED,
        status: false,
        message: 'Verification token is expired, please retry.',
      });
    }

    const hashedPassword = await hashUtils.hash(password);
    user.password = hashedPassword;
    await user.save();

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Password has been updated',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    await resetpasswordValidation.validate(
      { email, oldPassword, newPassword },
      { abortEarly: false }
    );

    const user = await User.findOne({ email });

    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await hashUtils.compare(oldPassword, user.password);
    if (!isMatch) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid credentials',
      });
    }

    user.password = await hashUtils.hash(newPassword);
    await user.save();

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Password set successfully',
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors[0],
        status: false,
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      status: false,
    });
  }
};

const listUser = async (req, res) => {
  try {
    const { limit, skip, search } = extractCommonQueryParams(req);
    let query = {};
    const projection = {
      name: 1,
      email: 1,
      mobile: 1,
      lastLogin: 1,
      userRole: 1,
      gender: 1,
      picture: 1,
      googleId: 1,
      emailVerified: 1,
    };

    if (search) {
      query.$or = getCommonSearchConditionForMasters(search);
    }

    const [list, totalCount] = await Promise.all([
      User.find(query, projection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Users retrieved',
      data: {
        users: list,
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

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'ID is not associated with request',
      });
    }

    const user = await User.findByIdAndUpdate(id, {
      deleted: true,
    });

    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User not found with given ID',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'User deleted',
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

const viewUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'ID is not associated with request',
      });
    }

    const user = await User.findById(
      id
      //   , {
      //   deleted: true,
      // }
    );
    if (!user || user.deleted === true) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User not found with given ID',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'User retrieved',
      data: {
        user: user,
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

const resendVerificationUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'ID is not associated with request',
      });
    }

    const user = await User.findById(
      id
      //   , {
      //   deleted: true,
      // }
    );

    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User not found with given ID',
      });
    }

    if (user.emailVerified) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "User's email is already verified",
      });
    }

    const subject = 'Verify Your Email for Easy Padhai';
    const templateName = 'onboarding';
    const userName = user.name.english;
    const token = uuidv4();
    const hashedToken = await bcrypt.hash(token, 9);
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    const { key, iv } = aesUtils.generateKeyAndIv();
    const hashedEmail = aesUtils.encrypt(user.email, key, iv);
    const dynamicValues = {
      name: userName,
      verifyUrl: `${config.baseUrl}/verify-email?token=${token}&email=${hashedEmail}&key=${key.toString('hex')}&iv=${iv.toString('hex')}`,
      verifyUrlText: `${config.baseUrl.BASE_URL}/verify-email?token=${token}&email=${hashedEmail}&key=${key.toString('hex')}&iv=${iv.toString('hex')}`,
      email: user.email,
    };

    sendEmail(user.email, userName, subject, templateName, dynamicValues);

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await user.save();

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Mail resent',
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

const verifytoken = async (req, res) => {
  try {
    const token = CookieService.getCookie(req, 'token');
    if (!token) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Unauthorized',
      });
    }

    const decoded = jwtUtils.verifyToken(token);

    if (!decoded) {
      return createResponse({
        res,
        status: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Invalid or expired token',

        error: { field: 'token', message: 'Invalid or expired token' },
      });
    }

    let user = await User.findById(decoded.id);
    const userProfile = await userprofileModel.findOne({
      userId: user._id,
    });

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Token is valid',
      data: {
        token,
        decoded,
        user,
        userProfile,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message,
      error: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  const { token, email: rawEmail, name, picture, signInMethod } = req.body;
  let newUser = false;

  try {
    let user;
    let profileImage = '';
    let email = rawEmail?.toLowerCase().trim();

    if (token) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.googleClientId,
      });

      const payload = ticket.getPayload();
      const {
        email: googleEmail,
        name: googleName,
        picture: googlePic,
        sub,
      } = payload;

      email = googleEmail?.toLowerCase().trim();

      user = await User.findOne({ email });

      if (!user) {
        newUser = true;
        user = await User.create({
          'name.english': googleName,
          email,
          googleId: sub,
          loginMethod: 'mobile',
        });
      }
      profileImage = user.picture || googlePic || '';
    } else if (email) {
      user = await User.findOne({ email });
      if (!user) {
        if (signInMethod === 'email') {
          return createResponse({
            res,
            statusCode: httpStatus.UNAUTHORIZED,
            status: false,
            message: 'User not found. Please sign up first.',
          });
        }
        newUser = true;
        user = await User.create({
          'name.english': name || email.split('@')[0],
          email,
          loginMethod: 'mobile',
        });
      }

      if (user.isActive === false) {
        return createResponse({
          res,
          statusCode: httpStatus.UNAUTHORIZED,
          status: false,
          message: 'User is inactive',
        });
      }

      profileImage = user.picture || picture || '';
    } else {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Token or email must be provided',
      });
    }

    await Profile.findOneAndUpdate(
      { userId: user._id },
      { picture: profileImage },
      { upsert: true, new: true }
    );

    const isMpinSet = (user.password && user.password !== '') || false;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: newUser
        ? 'User has been created'
        : !isMpinSet
          ? 'MPIN is not set yet'
          : 'Enter MPIN to verify',
      data: {
        id: user._id,
        isMpinSet,
        email: user.email,
        name: user.name?.english || '',
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

const setVerifyMPIN = async (req, res) => {
  try {
    const { mpin } = req.body;
    const { id } = req.params;

    await mobileLoginUserValidation.validate(
      { mpin, id },
      { abortEarly: false }
    );

    const user = await User.findById(id);

    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User does not exist',
      });
    }

    if (!user.isActive) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Your account is not active',
      });
    }

    if (!user.password || user.password === '') {
      const hashedNew = await hashUtils.hash(mpin);

      const reused = user.passwordHistory?.length
        ? await Promise.all(
            user.passwordHistory.map((old) => hashUtils.compare(mpin, old))
          )
        : [];

      if (reused.includes(true)) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'You cannot reuse a previously set MPIN.',
        });
      }

      user.password = hashedNew;
      user.mpinHistory = [hashedNew, ...(user.mpinHistory || [])].slice(0, 5);
    } else {
      const isPasswordMatch = await hashUtils.compare(mpin, user.password);
      if (!isPasswordMatch) {
        return createResponse({
          res,
          statusCode: httpStatus.UNAUTHORIZED,
          status: false,
          message: 'Invalid MPIN',
        });
      }
    }

    const token = jwtUtils.generateToken({ id: user._id });
    user.token = token;
    req.session.userId = user._id.toString();

    const lastLoginDate = moment().format('DD MMM, YYYY HH:mm:ss');
    const clientIp = getClientIp(req);
    user.activeSessionId = req.sessionID;
    user.lastLogin = { date: lastLoginDate, ip: clientIp };

    await user.save();

    CookieService.setCookie(res, 'token', token, {
      maxAge: 1000 * 60 * 60 * 12,
    });

    let existingProfile = await profileModel.findOne({ userId: user._id });
    if (!existingProfile) {
      existingProfile = await profileModel.create({
        userId: user?._id,
        picture: user?.picture || '',
        status: 'Active',
        role: '',
      });
    }
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'Login successful',
      status: true,
      data: {
        token,
        name: user?.name,
        id: user._id,
        userRole: user?.userRole,
        email: user?.email,
        picture: user?.picture,
        isProfileSet: {
          class: existingProfile?.classId?.length > 0,
          section: existingProfile?.sections?.length > 0,
          subject: existingProfile?.subjectId?.length > 0,
          institution: !!existingProfile?.institution,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Illegal arguments: string, undefined') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: `You don't have an MPIN, please set your MPIN first`,
        status: false,
      });
    }

    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors?.[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again later.',
      status: false,
    });
  }
};
const forgotMPIN = async (req, res) => {
  try {
    const { email, mpin } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'User with this email does not exist',
      });
    }
    if (!user.isActive) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Your account is not active',
      });
    }
    const reused = user.mpinHistory?.length
      ? await Promise.all(
          user.mpinHistory.map((old) => hashUtils.compare(mpin, old))
        )
      : [];
    if (reused.includes(true)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'You cannot reuse a previously set MPIN.',
      });
    }

    const hashedNewMPIN = await hashUtils.hash(mpin);
    user.password = hashedNewMPIN;
    user.mpinHistory = [hashedNewMPIN, ...(user.mpinHistory || [])].slice(0, 5);

    const lastLoginDate = moment().format('DD MMM, YYYY HH:mm:ss');
    const clientIp = getClientIp(req);
    user.lastLogin = { date: lastLoginDate, ip: clientIp };

    await user.save();

    const token = jwtUtils.generateToken({ id: user._id });
    user.token = token;
    req.session.userId = user._id.toString();
    user.activeSessionId = req.sessionID;

    CookieService.setCookie(res, 'token', token, {
      maxAge: 1000 * 60 * 60 * 12,
    });

    let existingProfile = await profileModel.findOne({ userId: user._id });
    if (!existingProfile) {
      existingProfile = await profileModel.create({
        userId: user._id,
        picture: user?.picture || '',
        status: 'Active',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      message: 'MPIN reset successful',
      status: true,
      data: {
        token,
        name: user?.name,
        id: user._id,
        userRole: user?.userRole,
        email: user?.email,
        picture: user?.picture,
        isProfileSet: {
          class: existingProfile?.classId?.length > 0,
          section: existingProfile?.sections?.length > 0,
          subject: existingProfile?.subjectId?.length > 0,
          institution: !!existingProfile?.institution,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Illegal arguments: string, undefined') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Invalid MPIN provided',
        status: false,
      });
    }

    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.errors?.[0] || 'Validation error',
        status: false,
        error: error.errors,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong. Please try again later.',
      status: false,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'User ID is required',
      });
    }

    const updateData = req.body;

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User not found',
      });
    }

    const { address1, address2, pinCode, state, district, institution } =
      updateData;
    let finalAddress = null;

    if (address1 || address2 || pinCode || state || district || institution) {
      const addressUpdate = {};
      if (address1) addressUpdate['address.address1'] = address1;
      if (address2) addressUpdate['address.address2'] = address2;
      if (pinCode) addressUpdate['address.pinCode'] = pinCode;
      if (state) addressUpdate['address.state'] = state;
      if (district) addressUpdate['address.district'] = district;
      if (institution) addressUpdate['institution'] = institution;
      const updatedProfile = await profileModel
        .findOneAndUpdate(
          { userId: id },
          { $set: addressUpdate },
          { new: true, runValidators: true }
        )
        .populate('address.state', '_id name')
        .populate('address.district', '_id name');

      finalAddress = updatedProfile?.address || null;
    } else {
      const existingProfile = await profileModel
        .findOne({ userId: id })
        .populate('address.state', '_id name')
        .populate('address.district', '_id name');

      finalAddress = existingProfile?.address || null;
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'User updated successfully',
      data: {
        ...updatedUser.toObject(),
        address: finalAddress,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: 'Something went wrong. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// eslint-disable-next-line import/prefer-default-export
export const userController = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  verifyotp,
  addPassword,
  changePassword,
  logout,
  listUser,
  deleteUser,
  viewUser,
  resendVerificationUser,
  verifytoken,
  googleLogin,
  setVerifyMPIN,
  forgotMPIN,
  updateUser,
};
