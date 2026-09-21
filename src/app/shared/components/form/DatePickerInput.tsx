import { DatePickerInput as MantineDatePickerInput, type DatePickerInputProps } from '@mantine/dates';
import { type UseFormReturnType } from '@mantine/form';

interface DatePickerInputFieldProps<T>
  extends Omit<DatePickerInputProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: keyof T & string;
}

export function DatePickerInput<T>({ form, name, ...rest }: DatePickerInputFieldProps<T>) {
  return <MantineDatePickerInput {...form.getInputProps(name)} {...rest} />;
}
