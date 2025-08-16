import * as Yup from "yup";
export const VALIDATIONS = {
   customEmailValidation : Yup.string()
    .email('Invalid email')
    .test('is-valid-email', 'Invalid email', (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[^\s@]{2,}$/;
      return emailRegex.test(value);
    })
    .required('This field is required')
  
};
