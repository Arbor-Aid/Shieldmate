import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleCheck from './components/RoleCheck';

const Public = React.lazy(() => import('./pages/Public'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const OrganizationDashboard = React.lazy(() => import('./pages/OrganizationDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Login = React.lazy(() => import('./pages/Login'));
const Questionnaire = React.lazy(() => import('./pages/Questionnaire'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Conversations = React.lazy(() => import('./pages/MyConversationsPage'));
const OrgLanding = React.lazy(() => import('./pages/OrgLanding'));
const OrgAdmin = React.lazy(() => import('./pages/OrgAdmin'));
const AdminRbac = React.lazy(() => import('./pages/AdminRbac'));
const AdminApprovals = React.lazy(() => import('./pages/AdminApprovals'));
const AdminApprovalNew = React.lazy(() => import('./pages/AdminApprovalNew'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Public />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org"
          element={
            <ProtectedRoute>
              <OrgLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org/admin"
          element={
            <ProtectedRoute>
              <OrgAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac"
          element={
            <ProtectedRoute>
              <RoleCheck allowedRoles={["super_admin"]} fallback={<NotFound />}>
                <AdminRbac />
              </RoleCheck>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals/new"
          element={
            <ProtectedRoute>
              <AdminApprovalNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
