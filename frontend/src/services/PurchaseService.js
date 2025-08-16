import { globalErrorHandler } from '@/utils/errorHandler';
import HttpClient from './HttpClient';

const PATH = {
    purchase: '/purchase',
};

const createPurchase = (payload, callback, error = globalErrorHandler) => {
    return HttpClient.post(`${PATH.purchase}`, payload)
        .then(callback)
        .catch(error)
        .finally(stop);
};

const getPurchaseById = (id, params, callback, error = globalErrorHandler) => {
    return HttpClient.get(`${PATH.purchase}/${id}`, { params })
        .then(callback)
        .catch(error)
        .finally(stop);
};

const updatePurchaseById = (
    id,
    values,
    callback,
    error = globalErrorHandler
) => {
    return HttpClient.patch(`${PATH.purchase}/${id}`, values)
        .then(callback)
        .catch(error)
        .finally(stop);
};

export const PurchaseService = {
    createPurchase,
    getPurchaseById,
    updatePurchaseById,
};
