import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Public = React.lazy(() => import('./pages/Public'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const OrganizationDashboard = React.lazy(() => import('./pages/OrganizationDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Public />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/organization" element={<OrganizationDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
