import * as yup from 'yup';
import mongoose from 'mongoose';

const objectId = yup
  .string()
  .nullable()
  .notRequired()
  .test('is-object-id', '${path} must be a valid MongoDB ObjectId', value =>
    value === null || value === undefined || mongoose.Types.ObjectId.isValid(value)
  );

export const profileCreateSchema = yup.object({
  userId: objectId,
  picture: yup.string().url().nullable().notRequired(),

  classes: yup.array().of(objectId).notRequired(),
  sections: yup.array().of(objectId).notRequired(),
  subjects: yup.array().of(objectId).notRequired(),
  institution: objectId,
  batchCode: yup.array().of(objectId).notRequired(),

  rollNo: yup.string().trim().notRequired(),
  address1: yup.string().trim().notRequired(),
  address2: yup.string().trim().notRequired(),
  state: objectId,
  district: objectId,
  pincode: yup.string().trim().notRequired(),
});


export const profileUpdateSchema = profileCreateSchema.shape({
  userId: objectId.notRequired(),
});
