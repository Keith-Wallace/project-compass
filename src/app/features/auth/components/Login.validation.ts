import { type FormValidation } from "../../../shared/components/form/Form";

export interface LoginFormValues {
  email: string;
  password: string;
}

export const loginFormValidation: FormValidation<LoginFormValues> = {
  email: (value) => (value.trim().length === 0 ? 'Email is required' : null),
  password: (value) => (value.length === 0 ? 'Password is required' : null),
};
