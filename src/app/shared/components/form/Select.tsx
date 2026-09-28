import { Select as MantineSelect, type SelectProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface FormSelectProps<T>
  extends Omit<SelectProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function Select<T>({ form, name, ...rest }: FormSelectProps<T>) {
  return <MantineSelect {...form.getInputProps(name)} {...rest} />;
}
