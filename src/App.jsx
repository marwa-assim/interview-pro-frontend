import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider

// Import your components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import MockInterview from './components/MockInterview';
import CVBuilder from './components/CVBuilder';
import BusinessCardBuilder from './components/BusinessCardBuilder';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider> {/* Wrap your app with ThemeProvider */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/cv-builder" element={<CVBuilder />} />
            <Route path="/business-card-builder" element={<BusinessCardBuilder />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
