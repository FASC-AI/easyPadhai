import TextField from '@/components/inputs/formik/TextField/TextField';
import { useField } from 'formik';

const FormikUrlField = ({
  label,
  placeholder,
  isRequired,
  helpertext,
  isDisabled,
  maxLength = 100000000,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <TextField
      labelName={label}
      placeholder={placeholder}
      helpertext={helpertext}
      error={meta.touched && meta.error}
      isRequired={isRequired}
      touched={meta.touched}
      disabled={isDisabled === true ? true : false}
      maxLength={maxLength}
      {...field}
      {...props}
    />
  );
};

export default FormikUrlField;
