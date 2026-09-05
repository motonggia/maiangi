import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore, type UserRole } from '../store/authStore';
import { cn } from '../utils/cn';
import Logo from './Logo';

const primaryTabs: Record<UserRole, { label: string; path: string }[]> = {
  STUDENT: [
    { label: 'MENU', path: '/student/order' },
    { label: 'ĐỒ UỐNG', path: '/student/drinks' },
    { label: 'HỎI ĐÁP', path: '/student/faq' },
    { label: 'BÌNH CHỌN', path: '/student/vote' },
    { label: 'BÁO CÁO', path: '/student/report' },
  ],
  PARENT: [
    { label: 'MENU', path: '/parent/order' },
    { label: 'ĐỒ UỐNG', path: '/parent/drinks' },
    { label: 'HỎI ĐÁP', path: '/parent/faq' },
    { label: 'BÁO CÁO', path: '/parent/report' },
  ],
  ADMIN: [],
};

const secondaryTabs: Record<UserRole, { label: string; path: string }[]> = {
  STUDENT: [
    { label: 'CHAT LỚP', path: '/student/chat' },
    { label: 'HỒ SƠ', path: '/student/profile' },
  ],
  PARENT: [
    { label: 'CHAT LỚP CON', path: '/parent/chat' },
    { label: 'HỒ SƠ', path: '/parent/profile' },
  ],
  ADMIN: [
    { label: 'TỔNG QUAN', path: '/admin/dashboard' },
    { label: 'QUẢN LÝ TÀI KHOẢN', path: '/admin/users' },
    { label: 'QUẢN LÝ MENU', path: '/admin/menu' },
    { label: 'QUẢN LÝ ĐƠN HÀNG', path: '/admin/orders' },
    { label: 'CẤU HÌNH', path: '/admin/settings' },
    { label: 'BÁO CÁO TELEGRAM', path: '/admin/reports' },
  ],
};

const TopBar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const role = user.role as UserRole;
  const tabs = primaryTabs[role] ?? [];
  const secondary = secondaryTabs[role] ?? [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>

        {/* Inline menu - tối giản, chữ đen đậm */}
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-4 md:gap-7">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] transition-all md:text-sm',
                location.pathname === tab.path ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <Logo size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors',
                      location.pathname === tab.path
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              <p className="mt-6 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Chức năng</p>
              <div className="mt-2 space-y-1">
                {secondary.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wide transition-colors',
                      location.pathname === tab.path
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-900">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{user.fullName}</p>
                  <p className="truncate text-[11px] capitalize text-slate-500">{user.role.toLowerCase()}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
