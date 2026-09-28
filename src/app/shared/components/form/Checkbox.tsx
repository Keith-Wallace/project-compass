import { Checkbox as MantineCheckbox, type CheckboxProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface CheckboxFieldProps<T>
  extends Omit<CheckboxProps, 'checked' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function Checkbox<T>({ form, name, ...rest }: CheckboxFieldProps<T>) {
  return <MantineCheckbox {...form.getInputProps(name, { type: 'checkbox' })} {...rest} />;
}
