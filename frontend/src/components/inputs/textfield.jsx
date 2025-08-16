import { useField } from "formik";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Eye } from "lucide-react";
import { EyeClosed } from "lucide-react";

const FormikTextField = ({
  label,
  placeholder,
  isRequired,
  isDisabled,
  maxLength = 130,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <TextField
      labelName={label}
      placeholder={placeholder}
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

FormikTextField.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  isRequired: PropTypes.bool,
  isDisabled: PropTypes.bool,
  maxLength: PropTypes.number,
};

const TextField = ({
  labelName,
  name,
  type,
  value,
  onChange,
  placeholder,
  onBlur,
  isRequired,
  prefix,
  suffix,
  readOnly,
  key,
  inputClassName,
  error,
  touched,
  labelClassName,
  disabled,
  maxLength = 130,
}) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const handleInputChange = (e) => {
    onChange(e);
  };

  const handlePasswordChange = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div>
      <div className="to-input-field " key={key}>
        <Label
          className={cn("c-black mb-1", labelClassName)} // Adjusting label styling with cn
          htmlFor={name} // Updated to use `name` as `htmlFor` to match input id
        >
          {labelName} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          {" "}
          {/* Wrapper to position prefix, suffix, and input correctly */}
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {prefix}
            </div>
          )}
          <Input
            className={cn(
              prefix ? "pl-10" : "", // Adjust padding if prefix is present
              suffix ? "pr-10" : "", // Adjust padding if suffix is present
              inputClassName,
              disabled
                ? " cursor-not-allowed"
                : "border-border-primary bg-white"
            )}
            id={name}
            name={name}
            onBlur={onBlur}
            type={isShowPassword ? "text" : type}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 fnt-14">
              {suffix}
            </div>
          )}
        </div>
        {type === "password" && (
          <div className="password" onClick={handlePasswordChange}>
            {isShowPassword
              ? Eye({ width: 20, height: 20 })
              : EyeClosed({ width: 20, height: 20 })}
          </div>
        )}
        {touched && error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TextField;

export { FormikTextField, TextField };
