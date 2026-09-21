import { Autocomplete as MantineAutocomplete, type AutocompleteProps } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';

interface FormAutocompleteProps<TFormValues>
  extends Omit<AutocompleteProps, 'value' | 'onChange' | 'error' | 'form'> {
  form: UseFormReturnType<TFormValues>;
  name: keyof TFormValues & string;
}


export function FormAutocomplete<TFormValues>({
  form,
  name,
  ...rest
}: FormAutocompleteProps<TFormValues>) {
  return <MantineAutocomplete {...form.getInputProps(name)} {...rest} />;
}
