/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import SubmitTest from './submitted.model.js';

import createResponse from '../../../utils/response.js';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';

const errorMessages = {
  NOT_FOUND: 'Test not found',
  ID_REQUIRED: 'ID is required',
};

const submitTest = async (req, res) => {
  try {
    const payload = {
      userId: req.user._id,
      ...req.body, // Spread req.body directly to include all its fields
    };

    const test = await SubmitTest.create(payload);

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'Test submitted successfully.',
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

export const submitTestController = {
  submitTest,
};
