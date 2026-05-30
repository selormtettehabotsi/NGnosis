import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import NotesPage from "./pages/NotesPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/knowledge-base/:courseId" element={<KnowledgeBasePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
