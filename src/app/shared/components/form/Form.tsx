import { type ReactNode } from 'react';
import { useForm, type UseFormReturnType, type UseFormInput } from '@mantine/form';
import './_form-styles.css';

export type FormValidation<TFormValues extends Record<string, any>> =
  UseFormInput<TFormValues>['validate'];

// Top-level keys still autocomplete, but any string is also accepted so
// fields inside arrays/nested objects can be bound by path
// (e.g. 'credits.0.category_id'). The `(string & {})` trick is what keeps
// the autocomplete suggestions from collapsing into plain `string`.
export type FormFieldName<TFormValues> = (keyof TFormValues & string) | (string & {});

interface FormProps<TFormValues extends Record<string, any>> {
  initialValues: TFormValues;
  validation?: FormValidation<TFormValues>;
  onSubmit: (values: TFormValues, form: UseFormReturnType<TFormValues>) => void;
  // Fires whenever any field value changes (typing, selecting, setFieldValue).
  onValuesChange?: (values: TFormValues) => void;
  className?: string;
  children: (form: UseFormReturnType<TFormValues>) => ReactNode;
}

export function Form<TFormValues extends Record<string, any>>({
  initialValues,
  validation,
  onSubmit,
  onValuesChange,
  className,
  children,
}: FormProps<TFormValues>) {
  const form = useForm<TFormValues>({
    initialValues,
    validate: validation,
    validateInputOnChange: true,
    onValuesChange,
  });

  return (
    <form
      className={className}
      onSubmit={form.onSubmit((values) => onSubmit(values, form))}
    >
      {children(form)}
    </form>
  );
}
