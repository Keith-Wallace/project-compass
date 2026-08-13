import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
    })
  }, [])

  if (session === undefined) return null
  if (!session) return <Navigate to="/login" replace />

  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter basename="/project-compass">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/confirmed" element={<ConfirmedEmail />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingChoice /></ProtectedRoute>} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route path="/courses/new" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
        <Route path="/courses/edit/:id" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />

        <Route path="/credentials"          element={<CredentialsPage />} />
        <Route path="/credentials/new"      element={<AddCredentialPage />} />
        <Route path="/credentials/:id/edit" element={<EditCredentialPage />} />

        <Route path="*" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
