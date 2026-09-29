import { Radio, type RadioGroupProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupFieldProps<T>
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'error' | 'children' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
  options: RadioOption[];
}

export function RadioGroup<T>({ form, name, options, ...rest }: RadioGroupFieldProps<T>) {
  return (
    <Radio.Group {...form.getInputProps(name)} {...rest}>
      {options.map((option) => (
        <Radio key={option.value} value={option.value} label={option.label} mt="xs" />
      ))}
    </Radio.Group>
  );
}
