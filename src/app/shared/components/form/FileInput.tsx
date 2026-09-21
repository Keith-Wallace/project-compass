import { FileInput as MantineFileInput, type FileInputProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface FileInputFieldProps<T>
  extends Omit<FileInputProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function FileInput<T>({ form, name, ...rest }: FileInputFieldProps<T>) {
  return <MantineFileInput {...form.getInputProps(name)} {...rest} />;
}
