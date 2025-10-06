import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarNavigation from './components/layout/SidebarNavigation';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DataEntry from './pages/DataEntry';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Team from './pages/Team';
import PlanManagement from './pages/PlanManagement';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import ErrorBoundary from './components/ui/ErrorBoundary';
import NotificationCenter from './components/ui/NotificationCenter';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';
import ScheduleRequests from './pages/ScheduleRequests';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Dashboard3D from './components/Dashboard3D';
import WorkProfile from './pages/WorkProfile';
import Reports from './pages/Reports';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Основной компонент приложения после аутентификации
const AppContent = () => {
  const { isAuthenticated, userData } = useAuth();

  // Если пользователь не аутентифицирован, показываем страницу логина
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      <div className="app-container">
        <Header />
        
        <div className="main-layout" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
          <SidebarNavigation userData={userData} />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ErrorBoundary>
                  <Dashboard userData={userData} />
                </ErrorBoundary>
              } />
              
              <Route path="/3d-dashboard" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Dashboard3D userData={userData} />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/advanced-analytics" element={
                <ProtectedRoute>
                  <AdvancedAnalytics userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/data-entry" element={
                <ProtectedRoute>
                  <DataEntry userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/schedule" element={
                <ProtectedRoute>
                  <Schedule userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/team" element={
                <ProtectedRoute>
                  <Team userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/work-profile" element={
                <ProtectedRoute>
                  <WorkProfile userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/plans" element={
                <ProtectedRoute>
                  <PlanManagement userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin userData={userData} />
                </ProtectedRoute>
              } />
              
              <Route path="/requests" element={
                <ProtectedRoute>
                  <ScheduleRequests userData={userData} />
                </ProtectedRoute>
              } />
              
              {/* Резервный маршрут для ненайденных страниц */}
              <Route path="*" element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-gray-400">Страница не найдена</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
        
        <NotificationCenter />
      </div>
    </Router>
  );
};

// Главный компонент приложения
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;