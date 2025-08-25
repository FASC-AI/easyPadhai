/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import Whatsapp from './whatsapp.model.js';

import createResponse from '../../../utils/response.js';

import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';
import userprofileModel from '../User-Profile/userprofile.model.js';

const errorMessages = {
  NOT_FOUND: 'Whatsapp not found',
  ID_REQUIRED: 'ID is required',
};

const createWhatsapp = async (req, res) => {
  try {
    const payload = req.body;
    payload.createdBy=req.user._id
    payload.updatedBy = req.user._id;
    const whatsapp = await Whatsapp.create({
      ...payload,

    });

    return createResponse({
      res,
      statusCode: httpStatus.CREATED,
      status: true,
      message: 'whatsapp created successfully.',
      data: whatsapp,
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

const updateWhatsapp = async (req, res) => {
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
    const whatsapp = await Whatsapp.findByIdAndUpdate(
      id,
      { $set: { ...req.body, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!whatsapp) {
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
      message: 'Whatsapp updated successfully.',
      data: whatsapp,
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
const whatsApp=async(req,res)=>{
    try {
    

      const whatsapp = await Whatsapp.find()
      if (!whatsapp) {
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
        message: 'Whatsapp fetched successfully.',
        data: whatsapp[0],
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
}
const getWhatsAppById = async (req, res) => {
  try {
    const id = getIdFromParams(req);

    const whatsapp = await Whatsapp.findById(id);
    if (!whatsapp) {
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
      message: 'Whatsapp fetched successfully.',
      data: whatsapp,
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

export const whatsAppController = {
  createWhatsapp,
  whatsApp,
  updateWhatsapp,
  getWhatsAppById,
 
};
