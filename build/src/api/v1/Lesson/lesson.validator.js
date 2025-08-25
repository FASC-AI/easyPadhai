import * as Yup from 'yup';

export const lessonValidationSchema = Yup.object().shape({
  subjectId: Yup.array()
    .of(Yup.string())
    .min(1, 'Subject is required')
    .required('Subject is required'),

  classId: Yup.array().of(
    Yup.string().min(1, 'Class is required').required('Class is required')
  ),

  topic: Yup.string().trim(),
  lessonDescription: Yup.string().trim(),
  readingDuration: Yup.string(),

  lessonTextContent: Yup.string().trim(),
  wordMeanings: Yup.array().of(
    Yup.object().shape({
      word: Yup.string(),
      meaning: Yup.string(),
    })
  ),
  images: Yup.array().of(
    Yup.object().shape({
      url: Yup.string(),
      filename: Yup.string(),
    })
  ),

  videoTutorialLink: Yup.string().trim().nullable(),

  isTestRequired: Yup.boolean(),
});
