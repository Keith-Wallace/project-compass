import { type FormValidation } from '../../../shared/components/form/Form';

export interface CreditRow {
  id: string;
  category_id: string;
  total_credits: string;
  // credentials.credential_id values picked in the Credential Focus
  // MultiSelect. Empty is valid (line not applied to any credential).
  credential_ids: string[];
}

export interface CourseFormValues {
  title: string;
  provider_id: string;
  startDate: string;
  endDate: string;
  notes: string;
  certFile: File | null;
  otherDocs: File[];
  credits: CreditRow[];
}

export const blankCreditRow = (): CreditRow => ({
  id: crypto.randomUUID(),
  category_id: '',
  total_credits: '',
  credential_ids: [],
});

export const courseFormValidation: FormValidation<CourseFormValues> = {
  title: (value) => (value.trim().length === 0 ? 'Course title is required.' : null),
  provider_id: (value) => (value ? null : 'Please select a provider.'),
  endDate: (value, values) => {
    if (!value) return 'Completion date is required.';
    if (values.startDate && values.startDate > value) {
      return 'Completion date must be on or after start date.';
    }
    return null;
  },
  // Validating an array field: a nested object of per-item rules. Mantine
  // applies each rule to every item in `credits`, and writes errors to
  // paths like 'credits.0.category_id', which is exactly what
  // form.getInputProps(`credits.${i}.category_id`) reads back per row.
  credits: {
    category_id: (value) => (value ? null : 'Select a subject.'),
    total_credits: (value) => {
      const numericValue = parseFloat(value);
      return !value || isNaN(numericValue) || numericValue <= 0 || Math.round(numericValue * 10) / 10 !== numericValue
        ? 'Enter credits in 0.1 increments.'
        : null;
    },
  },
};
