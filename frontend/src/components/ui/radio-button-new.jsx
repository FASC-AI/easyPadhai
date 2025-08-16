import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function FormikRadioGroup({
  name,
  label,
  options,
  className,
  defaultValue,
  formik, // Accept formik instance as a prop
  required = false,
  onChange, // Custom onChange handler
}) {
  // Get field value and errors from the formik instance
  const fieldValue = name.includes(".")
    ? name.split(".").reduce((obj, key) => obj?.[key], formik.values)
    : formik.values[name];

  const hasError = formik.touched[name] && formik.errors[name];
  const errorMessage = name.includes(".")
    ? name.split(".").reduce((obj, key) => obj?.[key], formik.errors)
    : formik.errors[name];

  // Handle the radio change
  const handleChange = (value) => {
    // Update formik value
    formik.setFieldValue(name, value);

    // If custom onChange is provided, call it with the value
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label className="mb-2 block" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <RadioGroup
        defaultValue={defaultValue || fieldValue}
        value={fieldValue}
        onValueChange={handleChange}
        name={name}
        onBlur={() => formik.setFieldTouched(name, true)}
        className="flex flex-row items-center gap-4" // Display in a row with spacing
      >
        {options.map((option) => (
          <div className="flex items-center space-x-2" key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
            />
            <span className="font-inherit tracking-inherit text-inherit">
              {option.label}
            </span>
          </div>
        ))}
      </RadioGroup>

      {/* Display error message if the field has been touched and has an error */}
      {hasError && (
        <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
      )}
    </div>
  );
}
