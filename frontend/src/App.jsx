import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import ProtectedRoute from './components/ProtectedRoute'; 
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DocumentsPage from './pages/DoucmentsPage';
import ProfilePage from './pages/profile';
import SummaryPage from './pages/SummaryPage';

const App = () => {
  return (
    <Routes>
      {/* Public Routes with Main Header/Footer */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Standalone Login/Signup Routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/documents" element={<DocumentsPage />} />
        <Route path="/dashboard/documents/:fileId" element={<SummaryPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default App;