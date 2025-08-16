/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import OfflineTest from './offline.model';
import striptags from 'striptags';
import createResponse from '../../../utils/response';
import Test from '../Test/test.model';
import Instruction from '../Instruction/Instruction.model';
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');
import mongoose from 'mongoose';
import Paper from '../Paper/paper.model';
import { convert } from 'html-to-text';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper';

const errorMessages = {
  NOT_FOUND: 'Offline Test not found',
  ID_REQUIRED: 'ID is required',
};

const offlineTest = async (req, res) => {
  try {
    const { subjectId, topicId, lessonId, classId, bookId } = req.query;
    const { ObjectId } = require('mongoose').Types;

    let matchQuery = { testType: 'offline' };

    if (subjectId)
      matchQuery['subjects'] = { $elemMatch: { _id: new ObjectId(subjectId) } };
    if (topicId)
      matchQuery['topic'] = { $elemMatch: { _id: new ObjectId(topicId) } };
    if (lessonId)
      matchQuery['lesson'] = { $elemMatch: { _id: new ObjectId(lessonId) } };
    if (classId)
      matchQuery['classes'] = { $elemMatch: { _id: new ObjectId(classId) } };
    if (bookId)
      matchQuery['book'] = { $elemMatch: { _id: new ObjectId(bookId) } };
    let instructionQuery = {};
    if (classId)
      instructionQuery['classes'] = {
        $elemMatch: { _id: new ObjectId(classId) },
      };
    if (subjectId)
      instructionQuery['subjects'] = {
        $elemMatch: { _id: new ObjectId(subjectId) },
      };

    let instructionData =
      await Instruction.findOne(instructionQuery).select('description');

    let testData = await Test.find(matchQuery);

    let [groupedData, totalMarksData] = await Promise.all([
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

    const totalMarks =
      totalMarksData.length > 0 ? totalMarksData[0].totalMarks : 0;

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Tests grouped by type with total marks successfully',
      data: {
        groupedTests: groupedData,
        totalMarks: totalMarks,
        instruction: instructionData?.description,
      },
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
};
const previewTest = async (req, res) => {
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

    const { ObjectId } = require('mongoose').Types;

    // Enhanced LaTeX to plain math conversion functions
    const convertLatexToPlain = (latex) => {
      // Remove HTML tags if present
      let plainText = latex.replace(/<[^>]*>/g, '');

      // Split the text into potential equations if no delimiters are present
      const equations = plainText
        .split(/(?<=c\^2)\s*/)
        .filter((eq) => eq.trim());

      // Process each equation
      return equations
        .map((eq) => {
          // Apply LaTeX conversion to each equation
          return eq
            .replace(/\$([^$]+)\$/g, (match, math) => convertMathToPlain(math))
            .replace(/\$\$([^$]+)\$\$/g, (match, math) =>
              convertMathToPlain(math)
            )
            .replace(/\\\(([^)]+)\\\)/g, (match, math) =>
              convertMathToPlain(math)
            )
            .replace(/\\\[(.*?)\\\]/g, (match, math) =>
              convertMathToPlain(math)
            )
            .trim();
        })
        .join('. '); // Join with a period and space for readability
    };

    const convertMathToPlain = (math) => {
      // Handle common math expressions
      return math
        .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1)/($2)')
        .replace(/\^\{([^}]+)\}/g, '^$1') // Exponents with curly braces
        .replace(/\^([^{]\S*)/g, '^$1') // Exponents without braces
        .replace(/_\{([^}]+)\}/g, '_$1') // Subscripts with curly braces
        .replace(/_([^{]\S*)/g, '_$1') // Subscripts without braces
        .replace(/\\sqrt\{(.*?)\}/g, '√($1)')
        .replace(/\\int/g, '∫')
        .replace(/\\sum/g, '∑')
        .replace(/\\pi/g, 'π')
        .replace(/\\infinity/g, '∞')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\neq/g, '≠')
        .replace(/\\pm/g, '±')
        .replace(/\\cdot/g, '·')
        .replace(/\\,/, ' ') // Thin space
        .replace(/\\:/, ' ') // Medium space
        .replace(/\\;/, ' ') // Thick space
        .replace(/\\!/, '') // Negative space
        .replace(/\\left/g, '') // Remove sizing commands
        .replace(/\\right/g, '')
        .replace(/\\big/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/\\/g, ''); // Remove remaining backslashes
    };

    // Save question paper if download is true
    if (download === true) {
      const query = {
        subjectId,
        classId,
        session,
        duration,
        bookId,
      };
      if (topicId) query.topicId = topicId;
      if (lessonId) query.lessonId = lessonId;

      if (id && id.length > 0) {
        await Paper.findByIdAndDelete(id);
      }

      await Paper.create({
        subjectId,
        classId,
        topicId: topicId || null,
        lessonId: lessonId || null,
        testIds,
        session,
        duration,
        bookId,
        instructionId: instructionId || [], // Ensure instructionId is an array
        createdBy: req.user._id,
        totalMarks: totalMarks || 0,
        generatedAt: new Date(),
        generatedBy: req?.user?._id || null,
      });

      return createResponse({
        res,
        statusCode: httpStatus.CREATED,
        status: true,
        message: 'test created',
      });
    }

    // Validate testIds
    if (!testIds) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'testIds is required',
      });
    }

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'testIds must be a non-empty array',
      });
    }

    let objectIdArray;
    try {
      objectIdArray = testIds.map((id) => {
        if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error(`Invalid test ID format: ${id}`);
        }
        return new ObjectId(id);
      });
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: error.message,
      });
    }

    let matchQuery = { _id: { $in: objectIdArray }, testType: 'offline' };

    const addToMatchQuery = (field, value, arrayField) => {
      if (value) {
        try {
          matchQuery[arrayField] = { $elemMatch: { _id: new ObjectId(value) } };
        } catch (error) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: `Invalid ${field} format`,
          });
        }
      }
    };

    const queryResponses = [
      addToMatchQuery('subjectId', subjectId, 'subjects'),
      addToMatchQuery('topicId', topicId, 'topic'),
      addToMatchQuery('lessonId', lessonId, 'lesson'),
      addToMatchQuery('classId', classId, 'classes'),
      addToMatchQuery('bookId', bookId, 'book'),
    ];

    for (const response of queryResponses) {
      if (response) return response;
    }

    let instructionQuery = {};
    if (
      instructionId &&
      Array.isArray(instructionId) &&
      instructionId.length > 0
    ) {
      try {
        instructionQuery = {
          _id: { $in: instructionId.map((id) => new ObjectId(id)) },
        };
      } catch (error) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: `Invalid instructionId format: ${error.message}`,
        });
      }
    }

    const addToInstructionQuery = (field, value, arrayField) => {
      if (value) {
        try {
          instructionQuery[arrayField] = {
            $elemMatch: { _id: new ObjectId(value) },
          };
        } catch (error) {
          return createResponse({
            res,
            statusCode: httpStatus.BAD_REQUEST,
            status: false,
            message: `Invalid ${field} format`,
          });
        }
      }
    };

    const instructionResponses = [
      addToInstructionQuery('classId', classId, 'classes'),
      addToInstructionQuery('subjectId', subjectId, 'subjects'),
    ];

    for (const response of instructionResponses) {
      if (response) return response;
    }

    let [instructionData, groupedData, totalMarksData] = await Promise.all([
      Instruction.find(instructionQuery).select('description hindi'),
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

    const totalMarksResult =
      totalMarksData.length > 0 ? totalMarksData[0].totalMarks : 0;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    const defaultFont = 'Helvetica';
    let baseFont = defaultFont;
    const registerFontIfExists = (fontName, path) => {
      try {
        doc.registerFont(fontName, path);
        return true;
      } catch (error) {
        console.error(`Failed to register font ${fontName}:`, error.message);
        return false;
      }
    };

    if (
      registerFontIfExists(
        'NotoSansDevanagari-VariableFont_wdth,wght',
        `/opt/bitnami/apache/htdocs/dist/fonts/NotoSansArabic-VariableFont_wdth,wght.ttf`
      )
    ) {
      baseFont = 'NotoSansDevanagari-VariableFont_wdth,wght';
    }
    if (
      registerFontIfExists(
        'NotoSansArabic-VariableFont_wdth,wght',
        `/opt/bitnami/apache/htdocs/dist/fonts/NotoSansArabic-VariableFont_wdth,wght.ttf`
      )
    ) {
      baseFont = 'NotoSansArabic-VariableFont_wdth,wght';
    }
    if (
      registerFontIfExists(
        'DejaVuSans',
        `/opt/bitnami/apache/htdocs/dist/fonts/DejaVuSans.ttf`
      )
    ) {
      baseFont = 'DejaVuSans';
    }
    registerFontIfExists(
      'Helvetica',
      `/opt/bitnami/apache/htdocs/dist/fonts/Helvetica.ttf`
    );

    const subjectName =
      groupedData[0]?.tests[0]?.subjects[0]?.nameEn || 'Unknown Subject';
    const className =
      groupedData[0]?.tests[0]?.classes[0]?.nameEn || 'Unknown Class';
    const sessionValue = session || 'Term-End Examination';

    doc
      .font(baseFont)
      .fontSize(16)
      .text(`${subjectName} Question Paper`, { align: 'center' })
      .moveDown(0.2);

    doc
      .font(baseFont)
      .fontSize(15)
      .text(`${sessionValue}`, { align: 'center' })
      .moveDown(0.5);

    doc
      .font(baseFont)
      .fontSize(14)
      .text(`${className}`, { align: 'center' })
      .moveDown(0.5);

    const durationValue = duration || '3 hours';
    const marksText = `Maximum Marks: ${totalMarksResult}`;

    const startY = doc.y;
    doc
      .font(baseFont)
      .fontSize(10)
      .text(`Time: ${durationValue}`, 50, startY, { align: 'left' });

    doc
      .font(baseFont)
      .fontSize(10)
      .text(marksText, 400, startY, { align: 'right' })
      .moveDown(1);

    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .lineWidth(1)
      .strokeColor('#AAAAAA')
      .stroke()
      .moveDown(1);

    doc
      .font(baseFont)
      .fontSize(12)
      .text('Instructions:', 50, doc.y)
      .moveDown(0.3);

    // Process both English and Hindi instructions
    const instructions = [];
    instructionData.forEach((instr) => {
      if (instr.description) {
        const englishText = convertLatexToPlain(
          convert(instr.description, { wordwrap: false })
        );
        instructions.push({ text: englishText, lang: 'English' });
      }
      if (instr.hindi) {
        const hindiText = convertLatexToPlain(
          convert(instr.hindi, { wordwrap: false })
        );
        instructions.push({ text: hindiText, lang: 'Hindi' });
      }
    });

    doc.font(baseFont).fontSize(10);
    instructions.forEach((instruction, index) => {
      const currentFont =
        instruction.lang === 'Hindi' &&
        baseFont === 'NotoSansDevanagari-VariableFont_wdth,wght'
          ? 'NotoSansDevanagari-VariableFont_wdth,wght'
          : baseFont;
      doc
        .font(currentFont)
        .text(
          `• ${instruction.text}${index < instructions.length - 1 ? '.' : ''}`,
          60,
          doc.y,
          { indent: 10 }
        );
      doc.moveDown(0.3);
    });
    doc.moveDown(1);

    groupedData.forEach((group, groupIndex) => {
      doc
        .font(baseFont)
        .fontSize(12)
        .text(`${group._id} Questions:`, 50, doc.y)
        .moveDown(0.5);

      let questionIndex = 1;
      group.tests.forEach((test) => {
        const marks = test.totalTrue || 'N/A';
        let questionText = convertLatexToPlain(
          convert(test?.description || '', { wordwrap: false })
        );

        let currentFont = baseFont;
        if (questionText.match(/[\u0600-\u06FF]/)) {
          currentFont = 'NotoSansArabic-VariableFont_wdth,wght';
        } else if (questionText.match(/[\u0900-\u097F]/)) {
          currentFont = 'NotoSansDevanagari-VariableFont_wdth,wght';
        } else if (
          questionText.match(
            /[+\-×÷=<>√∑∫π∞%‰°²³¹¼½¾⅓⅔⅛⅜⅝⅞⨀⨁⨂⨃⨄⨅⨆⨇⨈⨉⨊⨋⨌⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚⨛⨜⨝⨞⨟⨠⨡⨢⨣⨤⨥⨦⨧⨨⨩⨪⨫⨬⨭⨮⨯]/
          ) ||
          /\d+\s*[+\-×÷=]\s*\d+/.test(questionText) ||
          /x\^/.test(questionText) ||
          /[∫∑√π∞≤≥≠±·]/.test(questionText)
        ) {
          currentFont = registerFontIfExists(
            'DejaVuSans',
            `${__dirname}/fonts/DejaVuSans.ttf`
          )
            ? 'DejaVuSans'
            : baseFont;
        }

        const questionY = doc.y;
        doc
          .font(currentFont)
          .fontSize(11)
          .text(`${questionIndex}.`, 50, questionY, { continued: true })
          .font(currentFont)
          .fontSize(10)
          .text(` ${questionText}`, 70, questionY);

        const marksX = 500;
        const marksY = doc.y;
        doc
          .rect(marksX - 5, marksY - 5, 25, 15)
          .lineWidth(0.5)
          .strokeColor('#666666')
          .stroke();
        doc
          .font(currentFont)
          .text(marks, marksX, marksY, { width: 25, align: 'center' });

        doc.moveDown(0.5);

        const renderOptions = (options, optionY) => {
          const optionWidth = (550 - 70) / options.length;
          options.forEach((option, idx) => {
            const optionText = convertLatexToPlain(
              convert(option || '', { wordwrap: false })
            );
            let optionFont = baseFont;
            if (optionText.match(/[\u0600-\u06FF]/)) {
              optionFont = 'NotoSansArabic-VariableFont_wdth,wght';
            } else if (optionText.match(/[\u0900-\u097F]/)) {
              optionFont = 'NotoSansDevanagari-VariableFont_wdth,wght';
            } else if (
              optionText.match(
                /[+\-×÷=<>√∑∫π∞%‰°²³¹¼½¾⅓⅔⅛⅜⅝⅞⨀⨁⨂⨃⨄⨅⨆⨇⨈⨉⨊⨋⨌⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖⨗⨘⨙⨚⨛⨜⨝⨞⨟⨠⨡⨢⨣⨤⨥⨦⨧⨨⨩⨪⨫⨬⨭⨮⨯]/
              ) ||
              /\d+\s*[+\-×÷=]\s*\d+/.test(optionText) ||
              /x\^/.test(optionText) ||
              /[∫∑√π∞≤≥≠±·]/.test(optionText)
            ) {
              optionFont = registerFontIfExists(
                'DejaVuSans',
                `${__dirname}/fonts/DejaVuSans.ttf`
              )
                ? 'DejaVuSans'
                : baseFont;
            }

            const optionX = 70 + idx * optionWidth;
            doc
              .rect(optionX, optionY, 10, 10)
              .lineWidth(0.5)
              .strokeColor('#666666')
              .stroke();
            doc
              .font(optionFont)
              .fontSize(10)
              .text(
                `${String.fromCharCode(97 + idx)}) ${optionText}`,
                optionX + 15,
                optionY,
                { width: optionWidth - 15 }
              );
          });
          doc.moveDown(1);
        };

        if (group._id === 'MCQ') {
          const options = [
            test.optionText1,
            test.optionText2,
            test.optionText3,
            test.optionText4,
          ].filter((opt) => opt !== undefined && opt !== null && opt !== '');
          if (options.length > 0) {
            renderOptions(options, doc.y);
          }
        } else if (group._id === 'Assertion-Reason') {
          const options = [
            test.optionAssertionText1,
            test.optionAssertionText2,
            test.optionAssertionText3,
            test.optionAssertionText4,
          ].filter((opt) => opt !== undefined && opt !== null && opt !== '');
          if (options.length > 0) {
            renderOptions(options, doc.y);
          }
        } else if (group._id === 'True/False') {
          const options = ['True', 'False'];
          const optionY = doc.y;
          const optionWidth = (550 - 70) / options.length;
          options.forEach((option, idx) => {
            const optionX = 70 + idx * optionWidth;
            doc
              .circle(optionX + 5, optionY + 5, 5)
              .lineWidth(0.5)
              .strokeColor('#666666')
              .stroke();
            doc
              .font(baseFont)
              .fontSize(10)
              .text(option, optionX + 15, optionY, { width: optionWidth - 15 });
          });
          doc.moveDown(1);
        }

        questionIndex++;
      });

      if (groupIndex < groupedData.length - 1) {
        doc.moveDown(1);
      }
    });

    if (!groupedData.length) {
      doc
        .font(baseFont)
        .fontSize(12)
        .text('Questions:', 50, doc.y)
        .moveDown(0.5);

      const fallbackQuestions = [
        {
          text: 'Solve $2x + 3 = 7$',
          marks: '5',
        },
        {
          text: 'What is the value of $x^2$ when $x = 2$?',
          marks: '5',
        },
        {
          text: 'Integrate $\\int x \\, dx$ from $0$ to $1$',
          marks: '5',
        },
      ].map((q) => ({
        text: convertLatexToPlain(q.text),
        marks: q.marks,
      }));

      fallbackQuestions.forEach((q, index) => {
        const questionY = doc.y;
        doc
          .font(baseFont)
          .fontSize(11)
          .text(`${index + 1}.`, 50, questionY, { continued: true })
          .font(baseFont)
          .fontSize(10)
          .text(` ${q.text}`, 70, questionY);
        doc
          .rect(500 - 5, questionY - 5, 25, 15)
          .lineWidth(0.5)
          .strokeColor('#666666')
          .stroke();
        doc
          .font(baseFont)
          .text(q.marks, 500, questionY, { width: 25, align: 'center' })
          .moveDown(0.5);
      });
    }

    doc
      .font(baseFont)
      .fontSize(10)
      .text('Page 1', 0, doc.page.height - 50, { align: 'center' });

    doc.end();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="test_preview.pdf"'
    );
    stream.pipe(res);
  } catch (error) {
    console.error('Error in previewTest:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
};
const paperList = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;

    // Build query object based on provided query parameters
    const query = { createdBy: req.user._id };
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;

    let paperData = await Paper.find(query)
      .sort({ createdAt: -1 })
      .populate('testIds');

    let instructionData = await Instruction.find({
      'classes._id': new mongoose.Types.ObjectId(classId),
      'subjects._id': new mongoose.Types.ObjectId(subjectId),
      type: 'Offline Test',
    });

    const categorizedPaperData = paperData.map((paper) => {
      const questionCounts = {
        mcq: 0,
        trueFalse: 0,
        descriptive: 0,
        assertionReason: 0,
      };

      // Categorize tests by type and count them
      const category = paper.testIds.reduce(
        (acc, test) => {
          const typeKey = test.type.toLowerCase().replace(/[-/]/g, '');
          if (typeKey === 'mcq') {
            acc.mcq = acc.mcq || [];
            acc.mcq.push(test);
            questionCounts.mcq++;
          } else if (typeKey === 'truefalse') {
            acc.trueFalse = acc.trueFalse || [];
            acc.trueFalse.push(test);
            questionCounts.trueFalse++;
          } else if (typeKey === 'descriptive') {
            acc.descriptive = acc.descriptive || [];
            acc.descriptive.push(test);
            questionCounts.descriptive++;
          } else if (typeKey === 'assertionreason') {
            acc.assertionReason = acc.assertionReason || [];
            acc.assertionReason.push(test);
            questionCounts.assertionReason++;
          }
          return acc;
        },
        { mcq: [], trueFalse: [], descriptive: [], assertionReason: [] }
      );

      return {
        ...paper._doc,
        questionCounts,
        category, // Grouped tests by type
      };
    });
    let instructionIds = instructionData.map((ins) => ({
      instructionId: ins._id,
    }));

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: instructionIds,
      data: categorizedPaperData,
    });
  } catch (error) {
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
};
const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongoose').Types;

    // Validate paper ID
    let paperId;
    try {
      paperId = new ObjectId(id);
    } catch (error) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid paper ID format',
      });
    }

    // Find and delete the paper
    const deletedPaper = await Paper.findByIdAndDelete(paperId);

    // Check if paper was found and deleted
    if (!deletedPaper) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'Paper not found',
      });
    }

    // Return success response
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Paper deleted successfully',
    });
  } catch (error) {
    console.error('Error in deletePaper:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
      error: error.message,
    });
  }
};

export const offlineController = {
  offlineTest,
  previewTest,
  paperList,
  deletePaper,
};
