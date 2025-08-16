import { globalErrorHandler } from '@/utils/errorHandler';
import HttpClient from './HttpClient';

const PATH = {
    supplier: '/supplier',
};

const createSupplier = (payload, callback, error = globalErrorHandler) => {
    return HttpClient.post(`${PATH.supplier}`, payload)
        .then(callback)
        .catch(error)
        .finally(stop);
};

const getSupplierById = (id, params, callback, error = globalErrorHandler) => {
    return HttpClient.get(`${PATH.supplier}/${id}`, { params })
        .then(callback)
        .catch(error)
        .finally(stop);
};

const updateSupplierById = (
    id,
    values,
    callback,
    error = globalErrorHandler
) => {
    return HttpClient.patch(`${PATH.supplier}/${id}`, values)
        .then(callback)
        .catch(error)
        .finally(stop);
};
const addAverageData = (id, averageData, callback, error = globalErrorHandler) => {
    return HttpClient.post(`${PATH.supplier}/${id}/tender`, averageData)
        .then(callback)
        .catch(error)
        .finally(stop);
};
const additem = (id, payload, callback, error = globalErrorHandler) => {
    return HttpClient.post(`${PATH.supplier}/${id}/items`, payload)
        .then(callback)
        .catch(error)
        .finally(stop);
};
export const SupplierService = {
    createSupplier,
    getSupplierById,
    updateSupplierById,
    addAverageData,
    additem
};
