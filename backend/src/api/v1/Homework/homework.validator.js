import * as yup from 'yup';

const homeworkValidationSchema = yup.object().shape({
  subjectId: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Subject ID')
        .required()
    )
    .min(1, 'At least one Subject ID is required')
    .required('Subject ID is required'),

  classId: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Class ID')
        .required()
    )
    .min(1, 'At least one Class ID is required')
    .required('Class ID is required'),

  lessonId: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Lesson ID')
        .required()
    )
    .min(1, 'At least one Lesson ID is required')
    .required('Lesson ID is required'),

  bookId: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Book ID')
        .required()
    )
    .min(1, 'At least one Book ID is required')
    .required('Book ID is required'),

  topicId: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid Topic ID')
        .required()
    )
   ,

  question: yup.string().trim().nullable(),

  solution: yup.string().trim().nullable(),

  videoTutorialLink: yup.string().trim().nullable(),

  hint: yup.string().trim().nullable(),

  createdBy: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
    .nullable(),

  updatedBy: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
    .nullable(),
});

export default homeworkValidationSchema;
