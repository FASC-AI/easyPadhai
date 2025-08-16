const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    subjectId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
    ],

    classId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
      },
    ],
    lessonId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LessonMaster',
        required: true,
      },
    ],
    bookId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
    ],
    topic: {
      type: String,
      trim: true,
    },
    wordMeanings: [
      {
        word: {
          type: String,
          trim: true,
        },
        meaning: {
          type: String,
          trim: true,
        },
      },
    ],

    lessonDescription: {
      type: String,

      trim: true,
    },
    readingDuration: {
      type: String,
    },
    lessonTextContent: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: { type: String },
        name: { type: String },
      },
    ],
    videoTutorialLink: {
      type: String,
      trim: true,
    },
    serial: {
      type: String,
      trim: true,
    },
    isTestRequired: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      //   required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
