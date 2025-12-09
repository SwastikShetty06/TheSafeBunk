import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

import Onboarding from './components/Onboarding';
import SettingsPage from './pages/SettingsPage';
import EditSchedulePage from './pages/EditSchedulePage';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup" element={<Onboarding />} />
        {/* New route for settings */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/edit-schedule" element={<EditSchedulePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
