import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useField } from 'formik';

const FormikCheckbox = ({ onChange, disabled, ...props }) => {
  const [field, , { setValue }] = useField(props);

  return (
    <div className="v-center">
      <Checkbox
        checked={field.value || false}
        id={props.id}
        disabled={disabled}
        {...field}
        {...props}
        onCheckedChange={(checked) => {
          if (disabled) return;
          setValue(checked);
          if (onChange) onChange(checked);
        }}
        className="w-5 h-5"
      />
      {props.label && (
        <Label
          htmlFor={props.id}
          className={cn(disabled && 'text-gray-800 opacity-90', 'ml-2')}
        >
          {props.label}
        </Label>
      )}
    </div>
  );
};

export default FormikCheckbox;
