import { globalErrorHandler } from '@/utils/errorHandler';
import HttpClient from './HttpClient';

const PATH = {
  vehicle: '/candidate',
};

const createVehicle = (payload, callback, error = globalErrorHandler) => {
  return HttpClient.post(`${PATH.vehicle}`, payload)
    .then(callback)
    .catch(error)
    .finally(stop);
};

const getVehicleById = (id, params, callback, error = globalErrorHandler) => {
  return HttpClient.get(`${PATH.vehicle}/${id}`, { params })
    .then(callback)
    .catch(error)
    .finally(stop);
};

const updateVehicleById = (
  id,
  values,
  callback,
  error = globalErrorHandler
) => {
  return HttpClient.patch(`${PATH.vehicle}/${id}`, values)
    .then(callback)
    .catch(error)
    .finally(stop);
};

// Add average data to the vehicle's setAverage array
const addAverageData = (id, averageData, callback, error = globalErrorHandler) => {
  return HttpClient.post(`${PATH.vehicle}/${id}/set-average`, averageData)
    .then(callback)
    .catch(error)
    .finally(stop);
};

export const VehicleService = {
  createVehicle,
  getVehicleById,
  updateVehicleById,
  addAverageData
};
