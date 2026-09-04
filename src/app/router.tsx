import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase/supabase'
import Login from './features/auth/components/Login'
import Signup from './features/auth/components/Signup'
import Dashboard from './features/dashboard/components/Dashboard'
import CourseForm from './features/courses/components/CourseForm'
import CourseListPage from './features/courses/components/CourseListPage'
import VerifyEmail from './features/auth/components/VerifyEmail'
import ConfirmedEmail from './features/auth/components/ConfirmedEmail'
import OnboardingChoice from './features/auth/components/OnboardingChoice'
import Terms from './features/auth/components/Terms'
import Privacy from './features/auth/components/Privacy'

import CredentialsPage   from './features/credentials/components/CredentialsPage'
import AddCredentialPage from './features/credentials/components/AddCredentialPage'
import EditCredentialPage from './features/credentials/components/EditCredentialPage'

import Settings from './features/settings/components/Settings'
import UserInfo from './features/settings/components/UserInfo'


import AppLayout from './shared/page-layout/AppLayout';
import LayoutPreview from './features/layout/components/LayoutPreview'


// Auth guard only — no layout knowledge. Renders <Outlet /> so it can
// wrap either a single route or, via AppLayout below, a whole nested
// group of routes that all share the app shell.
function ProtectedRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
    })
  }, [])

  if (session === undefined) return null
  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}

export default function AppRouter() {
  return (
    <BrowserRouter basename="/project-compass">
      <Routes>
        {/* Public routes share the app shell too (logo header, footer),
            just without side nav or the topbar-actions (avatar/notifications)
            since there's no authenticated user yet. */}
        <Route element={<AppLayout variant="public" />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/confirmed" element={<ConfirmedEmail />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />
        </Route>

        <Route element={<ProtectedRoute />}>

          {/* Onboarding runs before a user has a full account/settings
              to show — intentionally kept outside AppLayout, same as
              the standalone layout-preview route below. */}
          <Route path="/onboarding" element={<OnboardingChoice />} />
          <Route path="/layout-preview" element={<LayoutPreview />} />

          {/* Everything below shares the app shell (top nav, side nav,
              footer) via AppLayout + <Outlet />. Credentials routes are
              newly protected as of 2026-08-25 — they previously had no
              auth guard at all. */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/courses" element={<CourseListPage />} />
            <Route path="/courses/new" element={<CourseForm />} />
            <Route path="/courses/edit/:id" element={<CourseForm />} />

            <Route path="/credentials"          element={<CredentialsPage />} />
            <Route path="/credentials/new"      element={<AddCredentialPage />} />
            <Route path="/credentials/:id/edit" element={<EditCredentialPage />} />

            <Route path="/settings"            element={<Settings />} />
            <Route path="/settings/user-info"  element={<UserInfo />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
