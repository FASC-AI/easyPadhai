import fs from 'fs';
import csv from 'csv-parser';
import { Parser } from 'json2csv';

/**
 * Parse CSV and return rows
 */
export const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',', skipLines: 0, quote: '"' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

/**
 * Export JSON to CSV
 */
export const exportToCSV = (data, fields, filenamePrefix = 'export') => {
  const json2csv = new Parser({ fields, quote: '"' });
  const csv = json2csv.parse(data);
  const fileName = `${filenamePrefix}-${Date.now()}.csv`;
  const filePath = `./exports/${fileName}`;
  fs.writeFileSync(filePath, csv);
  return filePath;
};

/**
 * Bulk Insert/Update
 */
export const bulkUpsert = async (Model, data, uniqueKeys = []) => {
  const bulkOps = data.map((row) => {
    const filter = {};
    uniqueKeys.forEach((key) => {
      filter[key] = row[key];
    });
    return {
      updateOne: {
        filter,
        update: { $set: row },
        upsert: true,
      },
    };
  });

  const result = await Model.bulkWrite(bulkOps);
  return result;
};
