import { DatePickerInput as MantineDatePickerInput, type DatePickerInputProps } from '@mantine/dates';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface DatePickerInputFieldProps<T>
  extends Omit<DatePickerInputProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function DatePickerInput<T>({ form, name, ...rest }: DatePickerInputFieldProps<T>) {
  return <MantineDatePickerInput {...form.getInputProps(name)} {...rest} />;
}
