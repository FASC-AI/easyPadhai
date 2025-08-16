import { useField } from "formik";

const FormikRadioGroup = ({ options,isDisabled, ...props }) => {
  const [field] = useField(props);

  return (
    <div className="flex flex-col">
      <p className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 c-black mb-1">
        {props.label}
      </p>
      <div className="flex gap-4 mt-1 flex-wrap">
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              gap: '5px',
              paddingY: '10px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
            className=""
          >
            <input
              type="radio"
              {...field}
              {...props}
              value={option.value}
              checked={field.value === option.value}
              disabled={isDisabled}
            />
            <div className="text-[13px] font-medium whitespace-nowrap">
              {option.label}
              <br />
              <span style={{ fontSize: '12px', color: '#A6A6A6' }}>
                {option.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FormikRadioGroup;
