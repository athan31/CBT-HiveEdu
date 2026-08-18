import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CentralQuestionBank from './pages/admin/CentralQuestionBank';
import ExamManager from './pages/admin/ExamManager';
import QuestionManager from './pages/admin/QuestionManager';
import Leaderboard from './pages/admin/Leaderboard';
import UserList from './pages/admin/UserList';
import MonitorPage from './pages/admin/MonitorPage';

// Route guard: redirect to /login if not authenticated
function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('catalyst_token');
  const user = JSON.parse(localStorage.getItem('catalyst_user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !['ADMIN', 'TUTOR'].includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Peserta */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/exam/:examId" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
        <Route path="/result/:sessionId" element={<PrivateRoute><ResultPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="bank-soal" element={<CentralQuestionBank />} />
          <Route path="exams" element={<ExamManager />} />
          <Route path="exams/:examId/questions" element={<QuestionManager />} />
          <Route path="exams/:examId/leaderboard" element={<Leaderboard />} />
          <Route path="users" element={<UserList />} />
        </Route>

        {/* Monitor — fullscreen, no sidebar */}
        <Route path="/admin/monitor/:examId" element={
          <PrivateRoute adminOnly><MonitorPage /></PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
