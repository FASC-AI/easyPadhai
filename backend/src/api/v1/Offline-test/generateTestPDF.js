import paperModel from '../Paper/paper.model.js';
import { generatePDF } from './pdfGenerator.js';
import createResponse from '../../../utils/response.js';
import httpStatus from 'http-status';
import mongoose from 'mongoose';

import Test from '../Test/test.model.js';
import Instruction from '../Instruction/Instruction.model.js';

const { ObjectId } = mongoose.Types;
/**
 * Generates and directly sends a PDF as response
 * @param {Object} params
 * @param {string} params.htmlContent - HTML to render
 * @param {import('express').Response} params.res - Express response object
 * @param {string} params.fileName - Name of the downloaded PDF
 * @param {Object} [params.options] - PDF generation options
 */

export const generateQuestionHTML = ({
  data,
  session,
  duration = '3 hours',
  totalMarksResult = '100',
  instructions = [],
}) => {
  const test = data[0]?.tests[0] || {};
  const subjectName = test?.subjects?.[0]?.nameEn || 'Unknown Subject';
  const className = test?.classes?.[0]?.nameEn || 'Unknown Class';
  const sessionValue = session || 'Term-End Examination';

  const hindiInstructions = instructions.filter((i) =>
    i.text.match(/[\u0900-\u097F]/)
  );
  const englishInstructions = instructions.filter(
    (i) => !i.text.match(/[\u0900-\u097F]/)
  );

  function renderQuestionsHTML(groupedData) {
    let html = '';

    groupedData.forEach((group, groupIndex) => {
      html += `
      <div class="mt-4 mb-2 font-semibold text-lg">${group._id} Questions:</div>
    `;

      group.tests.forEach((test, index) => {
        const questionText =
          test.description?.replace(/\[(https?:\/\/[^\]]+)\]/g, '') ||
          'No description';
        const imageMatch = test.description?.match(/\[(https?:\/\/[^\]]+)\]/);
        const imageUrl = imageMatch ? imageMatch[1] : null;
        const marks = test.totalTrue ?? 'N/A';

        html += `
        <div class="mb-4 pb-4">
          <div class="flex justify-between items-start">
            <div class="w-full pr-4">
              <div class="flex">
                <span class="font-bold mr-1">${index + 1}.</span>
                <div class="whitespace-pre-wrap">${questionText}</div>
              </div>
              ${
                imageUrl
                  ? `<div class="mt-2"><img src="${imageUrl}" alt="Question Image" class="max-w-xs border rounded" /></div>`
                  : ''
              }
            </div>
            <div class="text-sm text-center px-2 py-1 rounded w-[60px] h-[30px] flex items-center justify-center">
              ${marks}
            </div>
          </div>
      `;

        // Render options
        let options = [];
        if (group._id === 'MCQ') {
          options = [
            test.optionText1,
            test.optionText2,
            test.optionText3,
            test.optionText4,
          ];
        } else if (group._id === 'Assertion-Reason') {
          options = [
            test.optionAssertionText1,
            test.optionAssertionText2,
            test.optionAssertionText3,
            test.optionText4,
          ];
        } else if (group._id === 'True/False') {
          options = ['True', 'False'];
        }

        options = options.filter((opt) => opt?.trim());

        if (options.length) {
          html += `<div class="pl-6 mt-2 grid grid-cols-4 gap-y-1 gap-x-4 text-sm">`;
          options.forEach((opt, optIdx) => {
            html += `
            <div class="flex items-start">
              <div class="w-4 h-4 border border-gray-400 rounded-none mt-1 mr-2"></div>
             <div class="flex items-center whitespace-nowrap mt-1">
  <span class="mr-1">${String.fromCharCode(97 + optIdx)})</span>
  <span class="whitespace-pre-wrap">${opt}</span>
</div>

            </div>`;
          });
          html += `</div>`;
        }

        html += `</div>`; // close question block
      });

      if (groupIndex < groupedData.length - 1) {
        html += `<hr class="my-4 border-gray-300" />`;
      }
    });

    return html;
  }

  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');
    body {
      font-family: 'Noto Sans Devanagari', Arial, sans-serif;
    }
  </style>
</head>
<body class="p-8 text-[16px] leading-relaxed">
  <div class="text-center font-bold text-2xl mb-1">${subjectName} Question Paper</div>
  <div class="text-center font-semibold text-lg mb-1">${sessionValue}</div>
  <div class="text-center text-base mb-4">${className}</div>

  <div class="flex justify-between text-sm mb-4">
    <div>Time: ${duration}</div>
    <div>Maximum Marks: ${totalMarksResult}</div>
  </div>

  <hr class="border border-gray-300 mb-4" />

  ${
    englishInstructions.length > 0
      ? `
    <div class="text-base font-semibold mb-1">Instructions</div>
    <ul class="list-disc pl-8 mb-4">
      ${englishInstructions.map((i) => `<li class="mb-1">${i.text}</li>`).join('')}
    </ul>
  `
      : ''
  }

  ${
    hindiInstructions.length > 0
      ? `
    <div class="text-base font-semibold mb-1">निर्देश</div>
    <ul class="list-disc pl-8 mb-4">
      ${hindiInstructions.map((i) => `<li class="mb-1">${i.text}</li>`).join('')}
    </ul>
  `
      : ''
  }

  ${renderQuestionsHTML(data)}

  
</body>
</html>
  `;
};

export const generateTestPDF = async (req, res) => {
  try {
    const {
      subjectId,
      topicId,
      lessonId,
      classId,
      testIds,
      bookId,
      duration,
      session,
      download,
      totalMarks,
      instructionId,
      id,
    } = req.body;

    // === Create Paper if download ===
    if (download === true) {
      const query = { subjectId, classId, session, duration, bookId };
      if (topicId) query.topicId = topicId;
      if (lessonId) query.lessonId = lessonId;

      if (id) await paperModel.findByIdAndDelete(id);

      await paperModel.create({
        subjectId,
        classId,
        topicId: topicId || null,
        lessonId: lessonId || null,
        bookId,
        session,
        duration,
        instructionId: instructionId || [],
        testIds,
        createdBy: req.user._id,
        totalMarks: totalMarks || 0,
        generatedAt: new Date(),
        generatedBy: req.user._id,
      });

      return createResponse({
        res,
        statusCode: httpStatus.CREATED,
        status: true,
        message: 'Test created',
      });
    }

    // === Validate testIds ===
    if (!testIds || !Array.isArray(testIds) || testIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'testIds must be a non-empty array',
      });
    }

    // === Validate ObjectId format ===
    let objectIdArray;
    try {
      objectIdArray = testIds.map((id) => {
        if (!ObjectId.isValid(id)) {
          throw new Error(`Invalid test ID format: ${id}`);
        }
        return new ObjectId(id);
      });
    } catch (err) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: err.message,
      });
    }

    // === Build matchQuery ===
    const matchQuery = {
      _id: { $in: objectIdArray },
      testType: 'offline',
    };

    const addElemMatch = (field, val, arrayField) => {
      if (val && ObjectId.isValid(val)) {
        matchQuery[arrayField] = { $elemMatch: { _id: new ObjectId(val) } };
      } else if (val) {
        throw new Error(`Invalid ${field} format`);
      }
    };

    try {
      addElemMatch('subjectId', subjectId, 'subjects');
      addElemMatch('topicId', topicId, 'topic');
      addElemMatch('lessonId', lessonId, 'lesson');
      addElemMatch('classId', classId, 'classes');
      addElemMatch('bookId', bookId, 'book');
    } catch (err) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: err.message,
      });
    }

    // === Build instructionQuery ===
    let instructionQuery = { type: 'Offline Test' };
    try {
      if (instructionId?.length) {
        instructionQuery._id = {
          $in: instructionId.map((id) => new ObjectId(id)),
        };
      }

      if (classId && ObjectId.isValid(classId)) {
        instructionQuery.classes = {
          $elemMatch: { _id: new ObjectId(classId) },
        };
      }
      if (subjectId && ObjectId.isValid(subjectId)) {
        instructionQuery.subjects = {
          $elemMatch: { _id: new ObjectId(subjectId) },
        };
      }
    } catch (err) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid instructionId format: ${err.message}`,
      });
    }

    // === Fetch instruction, grouped tests, and total marks ===
    const [groupedData, totalMarksData] = await Promise.all([
      Test.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$type',
            tests: { $push: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Test.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalMarks: { $sum: { $toDouble: '$totalTrue' } },
          },
        },
        { $project: { totalMarks: 1, _id: 0 } },
      ]),
    ]);

    const totalMarksResult = totalMarksData?.[0]?.totalMarks || 0;

    let instructionData = await Instruction.find({
      _id: { $in: instructionId },
      type: 'Offline Test',
    }).exec();

    const instructions = [];

    instructionData.forEach((d) => {
      if (d.description)
        instructions.push({ text: d.description, lang: 'English' });
      if (d.hindi) instructions.push({ text: d.hindi, lang: 'Hindi' });
    });

    const html = generateQuestionHTML({
      data: groupedData,
      session,
      duration,
      totalMarksResult,
      instructions,
    });

    await generatePDF({
      htmlContent: html,
      res,
      fileName: 'QuestionPaper.pdf',
    });
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
