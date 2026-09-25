import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/supabase';
import { Button } from '../../../shared/components/button/Button';
import { Form } from '../../../shared/components/form/Form';
import { Input } from '../../../shared/components/form/Input';
import { loginFormValidation, type LoginFormValues } from './Login.validation';

import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    navigate('/');
  };

  return (
    <div className="login-root">

      <main className="login-body">
        <div className="login-card">
          <div className="login-eyebrow">Welcome back</div>
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">
            Track your continuing education credits.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <Form<LoginFormValues>
            initialValues={{ email: '', password: '' }}
            validation={loginFormValidation}
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

                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </>
            )}
          </Form>

          <p className="login-signup-link">
            Don&apos;t have an account?{' '}
            <a
              className="btn-link"
              onClick={() => navigate('/signup')}
            >
              Sign up now
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
