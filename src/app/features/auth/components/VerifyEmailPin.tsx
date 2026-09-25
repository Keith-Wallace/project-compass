import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { TextInput } from '@mantine/core';
import { supabase } from '../../../supabase/supabase';
import { Button } from '../../../shared/components/button/Button';
import { Form } from '../../../shared/components/form/Form';
import { verifyEmailPinFormValidation, type VerifyEmailPinFormValues } from './VerifyEmailPin.validation';

import '../styles/login.css'

interface LocationState {
  email?: string;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // No email in state means the user landed here without an in-progress
  // signup (direct nav, stale bookmark, etc.) — bounce to login rather
  // than showing a code screen that can't succeed.
  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (values: VerifyEmailPinFormValues) => {
    setSubmitting(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: values.code,
      type: 'signup',
    });

    if (verifyError) {
      setError(verifyError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate('/');
  };

  return (
    <div className="login-root">
      <main className="login-body">
        <div className="login-card">
          <div className="login-eyebrow">Almost there</div>
          <h1 className="login-title">Check your inbox</h1>
          <p className="login-subtitle">
            We sent a 6-digit code to {email}.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <Form<VerifyEmailPinFormValues>
            initialValues={{ code: '' }}
            validation={verifyEmailPinFormValidation}
            onSubmit={handleSubmit}
          >
            {(form) => (
              <>
                <div className="field-group">
                  <TextInput
                    label="Verification code"
                    inputMode="numeric"
                    placeholder="123456"
                    autoFocus
                    {...form.getInputProps('code')}
                    onChange={(event) => {
                      const digitsOnly = event.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                      form.setFieldValue('code', digitsOnly);
                    }}
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Verifying...' : 'Verify email'}
                </Button>
              </>
            )}
          </Form>
        </div>
      </main>
    </div>
  );
}
