import { MultiSelect as MantineMultiSelect, type MultiSelectProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface FormMultiSelectProps<TFormValues>
  extends Omit<MultiSelectProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<TFormValues>;
  name: keyof TFormValues & string;
}

export function MultiSelect<TFormValues>({
  form,
  name,
  ...rest
}: FormMultiSelectProps<TFormValues>) {
  return <MantineMultiSelect {...form.getInputProps(name)} {...rest} />;
}
