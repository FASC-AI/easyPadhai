/* eslint-disable import/prefer-default-export */
import httpStatus from 'http-status';
import OfflineTest from './offline.model.js';
import striptags from 'striptags';
import createResponse from '../../../utils/response.js';
import Test from '../Test/test.model.js';
import Instruction from '../Instruction/Instruction.model.js';
import PDFDocument from 'pdfkit';
import {  PassThrough  } from 'stream';
import mongoose from 'mongoose';
import Paper from '../Paper/paper.model.js';
import { convert } from 'html-to-text';
import { ObjectId } from 'mongoose';
import sharp from 'sharp';
import fs from 'fs';
import {
  extractCommonQueryParams,
  getIdFromParams,
  getUserIdFromRequest,
  extractQueryParams,
} from '../../../utils/requestHelper.js';
import axios from 'axios';
import { Buffer } from 'buffer';

const errorMessages = {
  NOT_FOUND: 'Offline Test not found',
  ID_REQUIRED: 'ID is required',
};

const offlineTest = async (req, res) => {
  try {
    const { subjectId, topicId, lessonId, classId, bookId } = req.query;

    let matchQuery = { testType: 'offline', isLast: true };

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
    matchQuery.isActive = true;

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

    // Enhanced LaTeX to plain math conversion functions
    const convertLatexToPlain = (latex) => {
      let plainText = latex.replace(/<[^>]*>/g, '');
      const equations = plainText
        .split(/(?<=c\^2)\s*/)
        .filter((eq) => eq.trim());
      return equations
        .map((eq) =>
          eq
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
            .trim()
        )
        .join('. ');
    };

    const convertMathToPlain = (math) => {
      return math
        .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1)/($2)')
        .replace(/\^\{([^}]+)\}/g, '^$1')
        .replace(/\^([^{]\S*)/g, '^$1')
        .replace(/_\{([^}]+)\}/g, '_$1')
        .replace(/_([^{]\S*)/g, '_$1')
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
        .replace(/\\,/, ' ')
        .replace(/\\:/, ' ')
        .replace(/\\;/, ' ')
        .replace(/\\!/, '')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\big/g, '')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/\\/g, '');
    };

    // Save question paper if download is true
    if (download === true) {
      const query = { subjectId, classId, session, duration, bookId };
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
        instructionId: instructionId || [],
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
    instructionQuery.type = 'Offline Test';
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

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true, // Important for multi-page content
      autoFirstPage: true,
    });
    const stream = new PassThrough();
    doc.pipe(stream);

    const defaultFont = 'Helvetica';
    let baseFont = defaultFont;

    const registerFontIfExists = (fontName, path) => {
      try {
        doc.registerFont(fontName, path);
        return true;
      } catch (error) {
        console.error(
          `Failed to register font ${fontName} at ${path}: ${error.message}`
        );
        return false;
      }
    };

    // Register fonts with proper paths
    const devanagariRegistered = registerFontIfExists(
      'NotoSansDevanagari',
      `/opt/bitnami/apache/htdocs/dist/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf`
    );
    if (!devanagariRegistered) {
      registerFontIfExists(
        'Mangal',
        `/opt/bitnami/apache/htdocs/dist/fonts/Mangal.ttf`
      );
    }
    const arabicRegistered = registerFontIfExists(
      'NotoSansArabic',
      `/opt/bitnami/apache/htdocs/dist/fonts/NotoSansArabic-VariableFont_wdth,wght.ttf`
    );
    registerFontIfExists(
      'DejaVuSans',
      `/opt/bitnami/apache/htdocs/dist/fonts/DejaVuSans.ttf`
    );
    registerFontIfExists(
      'Helvetica',
      `/opt/bitnami/apache/htdocs/dist/fonts/Helvetica.ttf`
    );

    // Set baseFont based on availability
    if (devanagariRegistered) baseFont = 'NotoSansDevanagari';
    else if (
      registerFontIfExists(
        'Mangal',
        `/opt/bitnami/apache/htdocs/dist/fonts/Mangal.ttf`
      )
    )
      baseFont = 'Mangal';
    else baseFont = 'Helvetica';

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
      .text('Instructions for the Offline Test', 50, doc.y)
      .moveDown(0.3);

    // Process and render instructions with exact wording from the image
    const instructions = [
      {
        text: 'Compulsory: Attempt any three questions from remaining questions.',
        lang: 'English',
      },
      {
        text: 'Ensure a stable internet connection before starting the test.',
        lang: 'English',
      },
      {
        text: 'Switching tabs or refreshing the page may result in disqualification.',
        lang: 'English',
      },
      {
        text: 'अनिवार्य: टेस्ट शुरू करने से पहले स्थिर इंटरनेट कनेक्शन सुनिश्चित करें।',
        lang: 'Hindi',
      },
      {
        text: 'बचे हुए प्रश्नों में से किसी भी तीन प्रश्नों का प्रयास करना अनिवार्य है।',
        lang: 'Hindi',
      },
      {
        text: 'टैब बदलने या पेज रिफ्रेश करने पर अयोग्यता हो सकती है।',
        lang: 'Hindi',
      },
    ];

    let currentY = doc.y;
    let isHindiStarted = false;
    instructions.forEach((instruction, index) => {
      let currentFont = baseFont;

      // Select appropriate font based on language
      if (instruction.text.match(/[\u0900-\u097F]/)) {
        currentFont = devanagariRegistered
          ? 'NotoSansDevanagari'
          : registerFontIfExists(
                'Mangal',
                `/opt/bitnami/apache/htdocs/dist/fonts/Mangal.ttf`
              )
            ? 'Mangal'
            : baseFont;
        if (!isHindiStarted) {
          doc
            .font(currentFont)
            .fontSize(12)
            .text('ऑफलाइन टेस्ट के लिए निर्देश', 50, currentY)
            .moveDown(0.3);
          currentY = doc.y;
          isHindiStarted = true;
        }
      } else {
        currentFont = baseFont; // Default to Helvetica for English
      }

      doc
        .font(currentFont)
        .fontSize(10)
        .text(`• ${instruction.text}`, 70, currentY, { indent: 20, lineGap: 2 })
        .moveDown(0.1); // Reduced moveDown for tighter spacing

      currentY = doc.y;
    });
    doc.moveDown(0.5); // Minimal spacing after instructions

    groupedData.forEach((group, groupIndex) => {
      doc
        .font(baseFont)
        .fontSize(12)
        .text(`${group._id} Questions:`, 50, doc.y)
        .moveDown(0.5);

      let questionIndex = 1;
      group.tests.forEach(async (test) => {
        const marks = test.totalTrue || 'N/A';
        let questionText = convertLatexToPlain(
          convert(test?.description || '', { wordwrap: false })
        );

        let currentFont = baseFont;
        if (questionText.match(/[\u0900-\u097F]/)) {
          currentFont = devanagariRegistered
            ? 'NotoSansDevanagari'
            : registerFontIfExists(
                  'Mangal',
                  `/opt/bitnami/apache/htdocs/dist/fonts/Mangal.ttf`
                )
              ? 'Mangal'
              : baseFont;
        } else if (questionText.match(/[\u0600-\u06FF]/)) {
          currentFont = arabicRegistered ? 'NotoSansArabic' : baseFont;
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
            `/opt/bitnami/apache/htdocs/dist/fonts/DejaVuSans.ttf`
          )
            ? 'DejaVuSans'
            : baseFont;
        }

        // Render the question text
        const urlMatch = questionText.match(/\[(https?:\/\/[^\]]+)\]/);
        let imageUrl = null;
        if (urlMatch) {
          imageUrl = urlMatch[1];
          // Remove image URL markdown from questionText
          questionText = questionText
            .replace(/\[(https?:\/\/[^\]]+)\]/, '')
            .trim();
        }
        const questionY = doc.y;
        doc
          .fontSize(11)
          .text(`${questionIndex}.`, 50, questionY, { continued: true })
          .fontSize(10)
          .text(` ${questionText}`, 70, questionY);

        doc.moveDown(0.5);
        doc.text(imageUrl, 50, doc.y);

        const marksX = 500;
        const marksY = doc.y;
        const boxWidth = 25;
        const boxHeight = 15;

        // Draw rectangle
        doc
          .rect(marksX - 5, marksY - 5, boxWidth, boxHeight)
          .lineWidth(0.5)
          .strokeColor('#666666')
          .stroke();

        // Measure text height
        const textHeight = doc.heightOfString(marks, {
          width: boxWidth,
          align: 'center',
        });

        // Calculate vertical center Y position
        const textY = marksY - 5 + (boxHeight - textHeight) / 2;

        // Draw centered text
        doc.text(marks, marksX - 5, textY, {
          width: boxWidth,
          align: 'center',
        });

        doc.moveDown(0.5);

        const renderOptions = (options, optionY) => {
          const optionWidth = (550 - 70) / options.length;
          options.forEach((option, idx) => {
            const optionText = convertLatexToPlain(
              convert(option || '', { wordwrap: false })
            );
            let optionFont = baseFont;
            if (optionText.match(/[\u0900-\u097F]/)) {
              optionFont = devanagariRegistered
                ? 'NotoSansDevanagari'
                : registerFontIfExists(
                      'Mangal',
                      `/opt/bitnami/apache/htdocs/dist/fonts/Mangal.ttf`
                    )
                  ? 'Mangal'
                  : baseFont;
            } else if (optionText.match(/[\u0600-\u06FF]/)) {
              optionFont = arabicRegistered ? 'NotoSansArabic' : baseFont;
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
                `/opt/bitnami/apache/htdocs/dist/fonts/DejaVuSans.ttf`
              )
                ? 'DejaVuSans'
                : baseFont;
            }
            console.log(
              `Rendering option with font: ${optionFont} for text: ${optionText}`
            );

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
            test.optionText4,
          ].filter((opt) => opt !== undefined && opt !== null && opt !== '');
          if (options.length > 0) {
            renderOptions(options, doc.y);
          }
        } else if (group._id === 'True/False') {
          const options = ['True', 'False'];
          const optionY = doc.y;
          const optionWidth = (550 - 70) / options.length;
          options.forEach((option, idx) => {
            const optionX = 50 + idx * optionWidth;
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
        { text: 'Solve $2x + 3 = 7$', marks: '5' },
        { text: 'What is the value of $x^2$ when $x = 2$?', marks: '5' },
        { text: 'Integrate $\\int x \\, dx$ from $0$ to $1$', marks: '5' },
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

    console.log(categorizedPaperData, 'categorizedPaperData');
    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'paper list',
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
