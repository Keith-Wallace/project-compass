import { Dropzone, type FileWithPath, type FileRejection } from '@mantine/dropzone';
import { type UseFormReturnType } from '@mantine/form';
import { type ReactNode } from 'react';
import { type FormFieldName } from './Form';

interface FormDropzoneProps<T> {
  form: UseFormReturnType<T>;
  name: FormFieldName<T>;
  // When true, dropped/selected files are appended to the field's existing
  // array (field type: File[]). When false (default), a drop replaces the
  // field's single value (field type: File | null).
  multiple?: boolean;
  accept?: string[];
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  // Called with a human-readable message when a file is rejected
  // (wrong type or too large) — hook this up to your own error state.
  onReject?: (message: string) => void;
  children: ReactNode;
}

export function FormDropZone<T>({
  form,
  name,
  multiple = false,
  accept,
  maxSize,
  disabled,
  className,
  onReject,
  children,
}: FormDropzoneProps<T>) {
  // `name` may be a path string, so TypeScript can't prove which value type
  // it maps to. A loosely typed view of the same form instance is the one
  // honest place to say "trust me" instead of casting every value.
  const looseForm = form as unknown as UseFormReturnType<Record<string, unknown>>;

  const handleDrop = (files: FileWithPath[]) => {
    if (multiple) {
      const current = (form.getInputProps(name).value as File[] | undefined) ?? [];
      looseForm.setFieldValue(name, [...current, ...files]);
    } else {
      looseForm.setFieldValue(name, files[0]);
    }
  };

  const handleReject = (rejections: FileRejection[]) => {
    const message = rejections[0]?.errors[0]?.message ?? 'File was rejected.';
    onReject?.(message);
  };

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      multiple={multiple}
      accept={accept}
      maxSize={maxSize}
      disabled={disabled}
      className={className}
      unstyled
    >
      {children}
    </Dropzone>
  );
}
