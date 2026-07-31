import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Spinner } from './components/ui';
import StudentSidebar from './components/layout/StudentSidebar';

// Lazy Pages
const LandingPage = React.lazy(() => import('./pages/public/LandingPage'));
const BatchesPage = React.lazy(() => import('./pages/public/BatchesPage'));
const BatchDetailPage = React.lazy(() => import('./pages/public/BatchDetailPage'));
const GalleryPage = React.lazy(() => import('./pages/public/GalleryPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const MyBatchesPage = React.lazy(() => import('./pages/student/MyBatchesPage'));
const StudentBatchPage = React.lazy(() => import('./pages/student/StudentBatchPage'));
const LiveClassesPage = React.lazy(() => import('./pages/student/LiveClassesPage'));
const StudyMaterialPage = React.lazy(() => import('./pages/student/StudyMaterialPage'));
const TestsPage = React.lazy(() => import('./pages/student/TestsPage'));
const NotificationsPage = React.lazy(() => import('./pages/student/NotificationsPage'));
const DoubtsPage = React.lazy(() => import('./pages/student/DoubtsPage'));
const ProfilePage = React.lazy(() => import('./pages/student/ProfilePage'));
const LecturePlayer = React.lazy(() => import('./pages/student/LecturePlayer'));
const AiStudyPlanPage = React.lazy(() => import('./pages/student/AiStudyPlanPage'));
const AiQuizPage = React.lazy(() => import('./pages/student/AiQuizPage'));
const AiNotesPage = React.lazy(() => import('./pages/student/AiNotesPage'));
const AiVivaPage = React.lazy(() => import('./pages/student/AiVivaPage'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBatchesPage = React.lazy(() => import('./pages/admin/AdminBatchesPage'));
const AdminGalleryPage = React.lazy(() => import('./pages/admin/AdminGalleryPage'));
const AdminContentManagerPage = React.lazy(() => import('./pages/admin/AdminContentManagerPage'));

const NotFoundPage = React.lazy(() => import('./pages/error/ErrorPages').then(m => ({ default: m.NotFoundPage })));
const ForbiddenPage = React.lazy(() => import('./pages/error/ErrorPages').then(m => ({ default: m.ForbiddenPage })));

// Loading fallback
const LoadingScreen: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
    <div style={{ textAlign: 'center' }}>
      <Spinner size={40} />
      <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 14 }}>Loading Ambition Academy...</p>
    </div>
  </div>
);

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== 'admin') return <ForbiddenPage />;
  return <>{children}</>;
};

// Student Layout Wrapper
const StudentLayout: React.FC<{ children: React.ReactNode; fullscreen?: boolean }> = ({ children, fullscreen }) => {
  if (fullscreen) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column' }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <StudentSidebar />
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/batches/:slug" element={<BatchDetailPage />} />
        <Route path="/courses" element={<BatchesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Area */}
        <Route path="/student" element={
          <ProtectedRoute>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/batches" element={
          <ProtectedRoute>
            <StudentLayout>
              <MyBatchesPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/batch/:batchId" element={
          <ProtectedRoute>
            <StudentLayout>
              <StudentBatchPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/classes" element={
          <ProtectedRoute>
            <StudentLayout>
              <LiveClassesPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/lectures" element={
          <ProtectedRoute>
            <StudentLayout>
              <LiveClassesPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/tests" element={
          <ProtectedRoute>
            <StudentLayout>
              <TestsPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/study-material" element={
          <ProtectedRoute>
            <StudentLayout>
              <StudyMaterialPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/dpp" element={
          <ProtectedRoute>
            <StudentLayout>
              <TestsPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/gallery" element={
          <ProtectedRoute>
            <StudentLayout>
              <GalleryPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/doubts" element={
          <ProtectedRoute>
            <StudentLayout>
              <DoubtsPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/notifications" element={
          <ProtectedRoute>
            <StudentLayout>
              <NotificationsPage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute>
            <StudentLayout>
              <ProfilePage />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/lecture/:lectureId" element={
          <ProtectedRoute>
            <StudentLayout fullscreen>
              <LecturePlayer />
            </StudentLayout>
          </ProtectedRoute>
        } />

        {/* AI Learning System */}
        <Route path="/student/ai" element={<ProtectedRoute><StudentLayout><AiStudyPlanPage /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/ai/study-plan" element={<ProtectedRoute><StudentLayout><AiStudyPlanPage /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/ai/quiz" element={<ProtectedRoute><StudentLayout><AiQuizPage /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/ai/notes" element={<ProtectedRoute><StudentLayout><AiNotesPage /></StudentLayout></ProtectedRoute>} />
        <Route path="/student/ai/viva" element={<ProtectedRoute><StudentLayout><AiVivaPage /></StudentLayout></ProtectedRoute>} />

        {/* Admin Area */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/batches" element={<ProtectedRoute requireAdmin><AdminBatchesPage /></ProtectedRoute>} />
        <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin><AdminGalleryPage /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="classes" /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="classes" /></ProtectedRoute>} />
        <Route path="/admin/lectures" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="lectures" /></ProtectedRoute>} />
        <Route path="/admin/study-material" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="notes" /></ProtectedRoute>} />
        <Route path="/admin/dpp" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="dpp" /></ProtectedRoute>} />
        <Route path="/admin/tests" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="dpp" /></ProtectedRoute>} />
        <Route path="/admin/doubts" element={<ProtectedRoute requireAdmin><DoubtsPage /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute requireAdmin><AdminContentManagerPage defaultTab="classes" /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
            error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
