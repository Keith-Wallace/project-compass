import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import { Button } from '../../../shared/components/button/Button';
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { Checkbox } from '../../../shared/components/form/Checkbox';
import { signupFormValidation, type SignupFormValues } from './Signup.validation';
import { Group } from '@mantine/core';

import '../styles/signup.css'

// Bumped whenever the placeholder ToS/Privacy copy is replaced with
// reviewed legal language.
const TOS_VERSION = 'v1-placeholder';
const PRIVACY_VERSION = 'v1-placeholder';

export default function Signup() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: SignupFormValues) => {
    setError(null);
    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/project-compass/auth/confirmed`,
        data: {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          job_title: values.jobTitle.trim() || null,
          employer: values.employer.trim() || null,
          tos_accepted: values.tosAccepted,
          tos_version: TOS_VERSION,
          privacy_accepted: values.privacyAccepted,
          privacy_version: PRIVACY_VERSION,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    console.log('Signup.tsx > signUp() result', data);
    navigate('/verify-email', { state: { email: values.email.trim() } });
    setSubmitting(false);
  };

  return (
    <div className="login-root">
      <main className="login-body">
        <div className="login-card">
          <div className="login-eyebrow">Get started</div>
          <h1 className="login-title">Create your account</h1>
          <p className="login-subtitle">
            Track your continuing education credits.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <Form<SignupFormValues>
            initialValues={{
              email: '',
              password: '',
              confirmPassword: '',
              firstName: '',
              lastName: '',
              jobTitle: '',
              employer: '',
              tosAccepted: false,
              privacyAccepted: false,
            }}
            validation={signupFormValidation}
            onSubmit={handleSubmit}
          >
            {(form) => (
              <>
                <div className="field-group">
                  <Input
                    form={form}
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="confirmPassword"
                    type="password"
                    label="Confirm password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="firstName"
                    label="First name"
                    placeholder="Jane"
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="lastName"
                    label="Last name"
                    placeholder="Doe"
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="jobTitle"
                    label={
                      <>
                        Job title <span className="field-optional">(optional)</span>
                      </>
                    }
                    placeholder="Internal Auditor"
                  />
                </div>

                <div className="field-group">
                  <Input
                    form={form}
                    name="employer"
                    label={
                      <>
                        Employer <span className="field-optional">(optional)</span>
                      </>
                    }
                    placeholder="Acme Corp"
                  />
                </div>

                <Group className="field-group">
                  <Checkbox
                    form={form}
                    name="tosAccepted"
                    label={
                      <>
                        I agree to the{' '}
                        <a href="legal/terms" target="_blank" rel="noreferrer">Terms of Service</a>
                      </>
                    }
                  />

                  <Checkbox
                    form={form}
                    name="privacyAccepted"
                    label={
                      <>
                        I agree to the{' '}
                        <a href="legal/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
                      </>
                    }
                  />
                </Group>
                

                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating account...' : 'Continue'}
                </Button>
              </>
            )}
          </Form>
        </div>
      </main>
    </div>
  );
}
