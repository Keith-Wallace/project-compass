import { Radio as MantineRadio, type RadioGroupProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioGroupProps<T>
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'error' | 'children'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
  options: RadioOption[];
}

export function RadioGroup<T>({ form, name, options, ...rest }: FormRadioGroupProps<T>) {
  return (
    <MantineRadio.Group {...form.getInputProps(name)} {...rest}>
      {options.map((option) => (
        <MantineRadio key={option.value} value={option.value} label={option.label} mt="xs" />
      ))}
    </MantineRadio.Group>
  );
}
