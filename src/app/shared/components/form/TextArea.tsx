import { Textarea as MantineTextarea, type TextareaProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface TextareaFieldProps<T>
  extends Omit<TextareaProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function TextArea<T>({ form, name, ...rest }: TextareaFieldProps<T>) {
  return <MantineTextarea {...form.getInputProps(name)} {...rest} />;
}
