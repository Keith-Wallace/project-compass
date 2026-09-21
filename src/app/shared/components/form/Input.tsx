import { TextInput as MantineTextInput, type TextInputProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface InputProps<T> extends Omit<TextInputProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function Input<T>({ form, name, ...rest }: InputProps<T>) {
  return <MantineTextInput {...form.getInputProps(name)} {...rest} />;
}
