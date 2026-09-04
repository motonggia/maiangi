import { HashRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginRegister from './pages/LoginRegister';
import StudentOrder from './pages/StudentOrder';
import StudentDrinks from './pages/StudentDrinks';
import StudentVote from './pages/StudentVote';
import AdminReports from './pages/AdminReports';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import ParentOrder from './pages/ParentOrder';
import Faq from './pages/Faq';
import MyReport from './pages/MyReport';
import Guide from './pages/Guide';
import TelegramAutoSender from './components/TelegramAutoSender';

type Role = 'STUDENT' | 'PARENT' | 'ADMIN';

const PagePlaceholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <p className="text-slate-500 mt-2">Trang này đang được phát triển.</p>
  </div>
);

const ProtectedRoute = ({ children, role }: { children: ReactNode; role?: Role }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isApproved && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 border border-slate-100">
          <div className="w-20 h-20 bg-white border border-slate-200 text-slate-800 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold">...</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Đang chờ duyệt tài khoản</h2>
          <p className="text-slate-500">
            Tài khoản của bạn đang được Admin xem xét. Vui lòng quay lại sau khi được phê duyệt.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Làm mới trang
          </button>
        </div>
      </div>
    );
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-white">
    <TopBar />
    <div className="flex">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  </div>
);

const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={
        user?.role === 'ADMIN'
          ? '/admin/dashboard'
          : user?.role === 'STUDENT'
            ? '/student/order'
            : '/parent/order'
      }
      replace
    />
  );
};

function App() {
  return (
    <Router>
      <TelegramAutoSender />
      <Routes>
        <Route path="/login" element={<LoginRegister />} />

        {/* Hướng dẫn sử dụng - công khai, nằm ngoài menu */}
        <Route path="/huong-dan" element={<Guide />} />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="STUDENT">
              <Layout>
                <Routes>
                  <Route path="order" element={<StudentOrder />} />
                  <Route path="drinks" element={<StudentDrinks />} />
                  <Route path="vote" element={<StudentVote />} />
                  <Route path="faq" element={<Faq />} />
                  <Route path="report" element={<MyReport />} />
                  <Route path="chat" element={<PagePlaceholder title="Chat lớp" />} />
                  <Route path="profile" element={<PagePlaceholder title="Hồ sơ cá nhân" />} />
                  <Route path="*" element={<Navigate to="order" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/*"
          element={
            <ProtectedRoute role="PARENT">
              <Layout>
                <Routes>
                  <Route path="order" element={<ParentOrder />} />
                  <Route path="drinks" element={<PagePlaceholder title="ĐỒ UỐNG" />} />
                  <Route path="faq" element={<Faq />} />
                  <Route path="report" element={<MyReport />} />
                  <Route path="chat" element={<PagePlaceholder title="Chat lớp của con" />} />
                  <Route path="profile" element={<PagePlaceholder title="Hồ sơ phụ huynh" />} />
                  <Route path="*" element={<Navigate to="order" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="ADMIN">
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="settings" element={<AdminReports />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;