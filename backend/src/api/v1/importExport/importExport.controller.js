import httpStatus from 'http-status';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseCSV, exportToCSV, bulkUpsert } from '../utils/csvHelper';
import Class from '../models/class.model'; // You can generalize this later

const upload = multer({ dest: 'uploads/' });

export const uploadCSV = async (req, res) => {
    try {
        const modelType = req.params.model; // e.g., class, subject
        const Model = getModelByName(modelType); // Dynamic model resolver

        const filePath = req.file.path;
        const rows = await parseCSV(filePath);

        const result = await bulkUpsert(Model, rows, ['codee']); // You can change unique keys per model

        fs.unlinkSync(filePath); // Cleanup temp file

        return res.status(httpStatus.OK).json({
            status: true,
            message: 'CSV processed successfully',
            result,
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: 'CSV processing failed',
            error: error.message,
        });
    }
};

export const downloadCSV = async (req, res) => {
    try {
        const modelType = req.params.model;
        const Model = getModelByName(modelType);
        const data = await Model.find().lean();

        const fields = Object.keys(data[0] || {});
        const filePath = exportToCSV(data, fields, modelType);

        res.download(filePath, () => {
            fs.unlinkSync(filePath); // Delete file after download
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            status: false,
            message: 'CSV download failed',
            error: error.message,
        });
    }
};

// Model Resolver
const getModelByName = (name) => {
    switch (name) {
        case 'class': return Class;
        // Add other models here
        default: throw new Error('Invalid model type');
    }
};

// Middleware Export
export const csvUploadMiddleware = upload.single('file');
