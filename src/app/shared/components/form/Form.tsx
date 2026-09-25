/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode } from 'react';
import { useForm, type UseFormReturnType, type UseFormInput } from '@mantine/form';

import './_form-styles.css';

export type FormValidation<TFormValues extends Record<string, any>> =
  UseFormInput<TFormValues>['validate'];

interface FormProps<TFormValues extends Record<string, any>> {
  initialValues: TFormValues;
  validation?: FormValidation<TFormValues>;
  onSubmit: (values: TFormValues) => void;
  children: (form: UseFormReturnType<TFormValues>) => ReactNode;
}

export function Form<TFormValues extends Record<string, any>>({
  initialValues,
  validation,
  onSubmit,
  children,
}: FormProps<TFormValues>) {
  const form = useForm<TFormValues>({
    initialValues,
    validate: validation,
    validateInputOnChange: true,
  });

  return (
    <form
      onSubmit={form.onSubmit(onSubmit)}
    >
      {children(form)}
    </form>
  );
}
