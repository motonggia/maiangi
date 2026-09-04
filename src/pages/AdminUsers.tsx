import { useMemo, useState } from 'react';
import { Check, Link2, UserCheck, UserX, XCircle } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';
import { cn } from '../utils/cn';

const AdminUsers = () => {
  const { users, schools, updateUser } = useFoodStore();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REJECTED' | 'STUDENT' | 'PARENT'>('PENDING');

  const filtered = useMemo(() => {
    let list = users;
    if (filter === 'PENDING') list = users.filter((u) => !u.isApproved && u.approvalStatus !== 'REJECTED' && u.role !== 'ADMIN');
    if (filter === 'REJECTED') list = users.filter((u) => u.approvalStatus === 'REJECTED' && u.role !== 'ADMIN');
    if (filter === 'STUDENT') list = users.filter((u) => u.role === 'STUDENT');
    if (filter === 'PARENT') list = users.filter((u) => u.role === 'PARENT');
    return list;
  }, [users, filter]);

  const getSchoolName = (schoolId: string) => schools.find((s) => s.id === schoolId)?.name ?? '-';
  const getClassName = (schoolId: string, classId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.classes.find((c) => c.id === classId)?.name ?? '-';
  };

  const setApproval = (id: string, approved: boolean) => {
    if (approved) {
      updateUser(id, { isApproved: true, approvalStatus: 'APPROVED', rejectionReason: undefined });
      return;
    }

    const reason = window.prompt('Lý do không duyệt tài khoản (không bắt buộc):')?.trim() ?? '';
    updateUser(id, { isApproved: false, approvalStatus: 'REJECTED', rejectionReason: reason || undefined });
  };

  const linkStudent = (parentId: string) => {
    const student = window.prompt('Nhập ID học sinh muốn gán cho phụ huynh này (ví dụ u1):');
    if (!student) return;
    updateUser(parentId, { studentId: student });
    updateUser(student, { parentId });
  };

  const tabs = [
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'REJECTED', label: 'Không duyệt' },
    { key: 'ALL', label: 'Tất cả' },
    { key: 'STUDENT', label: 'Học sinh' },
    { key: 'PARENT', label: 'Phụ huynh' },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">Quản lý tài khoản</h1>
        <p className="text-slate-500">Duyệt đăng ký, gán học sinh – phụ huynh.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
              filter === tab.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          Không có tài khoản nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-900">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{user.fullName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user.role === 'STUDENT' ? 'Học sinh' : 'Phụ huynh'} · {getClassName(user.schoolId, user.classId)} · {getSchoolName(user.schoolId)}
                  </p>
                  {user.studentId && <p className="text-xs text-slate-400">Gắn với HS: {user.studentId}</p>}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!user.isApproved && user.approvalStatus !== 'REJECTED' && (
                  <button
                    onClick={() => setApproval(user.id, true)}
                    className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                  >
                    <UserCheck size={14} /> Duyệt
                  </button>
                )}
                {!user.isApproved && user.approvalStatus !== 'REJECTED' && (
                  <button
                    onClick={() => setApproval(user.id, false)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <XCircle size={14} /> Không duyệt
                  </button>
                )}
                {user.isApproved && user.role !== 'ADMIN' && (
                  <button
                    onClick={() => setApproval(user.id, false)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <UserX size={14} /> Hủy duyệt
                  </button>
                )}
                {user.approvalStatus === 'REJECTED' && (
                  <button
                    onClick={() => setApproval(user.id, true)}
                    className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                  >
                    <UserCheck size={14} /> Duyệt lại
                  </button>
                )}
                {user.role === 'PARENT' && (
                  <button
                    onClick={() => linkStudent(user.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:bg-slate-50"
                  >
                    <Link2 size={14} /> Gán HS
                  </button>
                )}
                {user.isApproved ? (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                    <Check size={14} className="inline" /> Đã duyệt
                  </span>
                ) : user.approvalStatus === 'REJECTED' ? (
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                    <XCircle size={14} className="inline" /> Không duyệt
                    {user.rejectionReason && <span className="ml-1 font-normal">· {user.rejectionReason}</span>}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">Chờ duyệt</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
