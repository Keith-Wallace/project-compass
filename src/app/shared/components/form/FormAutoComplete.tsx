import { Autocomplete as MantineAutocomplete, type AutocompleteProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { type FormFieldName } from './Form';

interface FormAutoCompleteProps<T>
  extends Omit<AutocompleteProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
}

export function FormAutoComplete<T>({ form, name, ...rest }: FormAutoCompleteProps<T>) {
  return <MantineAutocomplete {...form.getInputProps(name)} {...rest} />;
}
