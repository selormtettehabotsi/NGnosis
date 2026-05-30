import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import PageWrapper from './components/layout/PageWrapper';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import MCPStatusPage from './pages/MCPStatusPage';
import SupportPage from './pages/SupportPage';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
