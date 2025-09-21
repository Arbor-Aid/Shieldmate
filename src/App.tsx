
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import IndexPage from './pages/IndexPage';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Questionnaire from './pages/Questionnaire';
import OrganizationDashboard from './pages/OrganizationDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Housing from './pages/resources/Housing';
import Employment from './pages/resources/Employment';
import Health from './pages/resources/Health';
import Benefits from './pages/resources/Benefits';
import NotFound from './pages/NotFound';
import MyConversationsPage from './pages/MyConversationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientRoute from './components/ClientRoute';
import OrganizationRoute from './components/OrganizationRoute';
import AdminRoute from './components/AdminRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<IndexPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
              
              {/* Client-specific routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <Profile />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              <Route path="/questionnaire" element={
                <ProtectedRoute>
                  <Questionnaire />
                </ProtectedRoute>
              } />
              <Route path="/my-conversations" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <MyConversationsPage />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              <Route path="/resources/housing" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <Housing />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              <Route path="/resources/employment" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <Employment />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              <Route path="/resources/health" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <Health />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              <Route path="/resources/benefits" element={
                <ProtectedRoute>
                  <ClientRoute>
                    <Benefits />
                  </ClientRoute>
                </ProtectedRoute>
              } />
              
              {/* Organization-specific routes */}
              <Route path="/organization" element={
                <ProtectedRoute>
                  <OrganizationRoute>
                    <OrganizationDashboard />
                  </OrganizationRoute>
                </ProtectedRoute>
              } />
              
              {/* Admin-specific routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/:section" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              } />
              
              {/* Analytics - accessible by both organizations and admins */}
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <OrganizationRoute>
                    <AnalyticsDashboard />
                  </OrganizationRoute>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
