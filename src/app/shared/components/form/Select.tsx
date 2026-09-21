import { Select as MantineSelect, type SelectProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface FormSelectProps<T> extends Omit<SelectProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function Select<T>({ form, name, ...rest }: FormSelectProps<T>) {
  return <MantineSelect {...form.getInputProps(name)} {...rest} />;
}
