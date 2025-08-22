import * as Yup from 'yup';
import profileModel from './userprofile.model.js';

const nameRegex = /^[A-Za-z\s]{1,50}$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const mobileRegex = /^\d{10}$/;
const pinCodeRegex = /^\d{6}$/;

const messages = {
  nameRequired: 'Name is required',
  nameInvalid: 'Name must contain only letters and spaces, up to 50 characters',
  emailRequired: 'Email is required',
  emailInvalid: 'Invalid email address',
  mobileRequired: 'Mobile number is required',
  mobileInvalid: 'Mobile number must be 10 digits',
  pinCodeInvalid: 'Pincode must be exactly 6 digits',
  roleInvalid: 'Role must be either "admin" or "editor"',
  classIdRequired: 'Class ID is required',
  subjectIdRequired: 'Subject ID is required',
  bookIdRequired:'Book ID is required',
  roleRequired: 'Role is required',
};

const checkUniqueness = async (field, value, currentId) => {
  try {
    const query = { [field]: value };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existingUser = await profileModel.findOne(query);
    return !existingUser;
  } catch (error) {
    throw new Error(`Error checking ${field} uniqueness: ${error.message}`);
  }
};

export const profileSchema = (id) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()

      .matches(nameRegex, messages.nameInvalid),
    email: Yup.string()
      .trim()
      .lowercase()

      .matches(emailRegex, messages.emailInvalid),
    mobile: Yup.string()
      .trim()

      .matches(mobileRegex, messages.mobileInvalid),
    userId: Yup.string().nullable(),
    institution: Yup.array().of(Yup.string()).nullable(),
    sections: Yup.array().of(Yup.string()).nullable(),

    classId: Yup.array()
      .of(Yup.string())
      .min(1, messages.classIdRequired)
      .required(messages.classIdRequired),
    subjectId: Yup.array()
      .of(Yup.string())
      .min(1, messages.subjectIdRequired)
      .required(messages.subjectIdRequired),
      bookId: Yup.array()
      .of(Yup.string())
     ,
    address: Yup.object(),
    address: Yup.object()
      .shape({
        address1: Yup.string().trim().default(''),
        address2: Yup.string().trim().default(''),
        state: Yup.string().nullable(),
        district: Yup.string().nullable(),
        country: Yup.string().nullable(),
        pinCode: Yup.string().trim().default('').matches(pinCodeRegex, {
          message: messages.pinCodeInvalid,
          excludeEmptyString: true,
        }),
      })
      .default(() => ({}))
      .optional(),
    role: Yup.string(),
    password: Yup.string(),
  });

export const validateProfile = (id) => async (req, res, next) => {
  try {
    await profileSchema(id).validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const formattedErrors = error.inner.reduce((acc, err) => {
      acc[err.path] = err.message;
      return acc;
    }, {});
    res.status(400).json({ errors: formattedErrors });
  }
};

export default validateProfile;
