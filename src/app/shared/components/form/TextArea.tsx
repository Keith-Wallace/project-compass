import { Textarea as MantineTextarea, type TextareaProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface TextareaFieldProps<T>
  extends Omit<TextareaProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function TextArea<T>({ form, name, ...rest }: TextareaFieldProps<T>) {
  return <MantineTextarea {...form.getInputProps(name)} {...rest} />;
}
