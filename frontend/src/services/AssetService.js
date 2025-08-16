import { globalErrorHandler } from '@/utils/errorHandler';
import HttpClient from './HttpClient';

const PATH = {
    asset: '/asset',
};

const createAsset = (payload, callback, error = globalErrorHandler) => {
    return HttpClient.post(`${PATH.asset}`, payload)
        .then(callback)
        .catch(error)
        .finally(stop);
};

const getAssetById = (id, params, callback, error = globalErrorHandler) => {
    return HttpClient.get(`${PATH.asset}/${id}`, { params })
        .then(callback)
        .catch(error)
        .finally(stop);
};

const updateAssetById = (
    id,
    values,
    callback,
    error = globalErrorHandler
) => {
    return HttpClient.patch(`${PATH.asset}/${id}`, values)
        .then(callback)
        .catch(error)
        .finally(stop);
};

export const AssetService = {
    createAsset,
    getAssetById,
    updateAssetById,
};
