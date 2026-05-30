import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import PageWrapper from './components/layout/PageWrapper';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import MCPStatusPage from './pages/MCPStatusPage';
import SupportPage from './pages/SupportPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <PageWrapper>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/mcp-status" element={<MCPStatusPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </PageWrapper>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes — no sidebar */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />

          {/* All other routes require authentication + verified email */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
