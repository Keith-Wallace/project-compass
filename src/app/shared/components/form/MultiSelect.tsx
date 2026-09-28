import { MultiSelect as MantineMultiSelect, type MultiSelectProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface FormMultiSelectProps<T>
  extends Omit<MultiSelectProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function MultiSelect<T>({ form, name, ...rest }: FormMultiSelectProps<T>) {
  return <MantineMultiSelect {...form.getInputProps(name)} {...rest} />;
}
