import { Checkbox as MantineCheckbox, type CheckboxProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface CheckboxFieldProps<T>
  extends Omit<CheckboxProps, 'checked' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function Checkbox<T>({ form, name, ...rest }: CheckboxFieldProps<T>) {
  return <MantineCheckbox {...form.getInputProps(name, { type: 'checkbox' })} {...rest} />;
}
