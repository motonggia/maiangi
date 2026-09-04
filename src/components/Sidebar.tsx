import { LogOut } from 'lucide-react';
import { useAuthStore, type UserRole } from '../store/authStore';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';

const secondaryItems: Record<UserRole, { label: string; path: string }[]> = {
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

const SidebarItem = ({
  label,
  path,
  active,
  onClick,
}: {
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <Link
    to={path}
    onClick={onClick}
    className={cn(
      'flex items-center px-3 py-2.5 rounded-full transition-all duration-200',
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    )}
  >
    <span className={cn('text-[13px] font-semibold uppercase tracking-wide', active ? 'text-white' : 'text-slate-700')}>
      {label}
    </span>
  </Link>
);

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const items = secondaryItems[user.role as UserRole] ?? [];

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 flex-col border-r border-slate-100 bg-white lg:flex">
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em] mb-3">Chức năng</p>
        {items.map((item) => (
          <SidebarItem key={item.path} {...item} active={location.pathname === item.path} />
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-sm">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 py-2.5 text-slate-600 transition-all duration-200 text-sm font-medium hover:border-slate-900 hover:text-slate-900"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
