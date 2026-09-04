import { useMemo, useState } from 'react';
import { Ban } from 'lucide-react';
import { format } from 'date-fns';
import { useFoodStore } from '../store/foodStore';
import { cn } from '../utils/cn';

const AdminOrders = () => {
  const { orders, menu, updateOrder } = useFoodStore();
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>('ALL');

  const filtered = useMemo(() => {
    let list = orders.filter((o) => o.date === tomorrow);
    if (activeFilter === 'ACTIVE') list = list.filter((o) => o.status === 'ORDERED');
    if (activeFilter === 'CANCELLED') list = list.filter((o) => o.status === 'CANCELLED');
    return list;
  }, [orders, tomorrow, activeFilter]);

  const getMealName = (id: string | null) => menu.find((m) => m.id === id)?.name ?? '-';

  const cancelOrder = (id: string) => {
    const reason = window.prompt('Nhập lý do hủy đơn (để đưa vào báo cáo):');
    if (reason === null) return;
    updateOrder(id, { status: 'CANCELLED', cancelledBy: 'ADMIN', cancelReason: reason });
  };

  const restoreOrder = (id: string) => updateOrder(id, { status: 'ORDERED', cancelledBy: 'USER', cancelReason: undefined });

  const total = filtered.filter((o) => o.status === 'ORDERED').length;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">Quản lý đơn hàng</h1>
        <p className="text-slate-500">Suất ăn cho ngày {format(new Date(Date.now() + 86400000), 'dd/MM/yyyy')}. Tổng: {total} suất.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {([['ALL', 'Tất cả'], ['ACTIVE', 'Đang hoạt động'], ['CANCELLED', 'Đã hủy']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition',
              activeFilter === key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">Không có đơn hàng.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{getMealName(order.mainDishId)}</p>
                <p className="text-xs text-slate-500">HS: {order.studentId} · Cơm: {order.mainDishOption ?? '-'}</p>
                {order.cancelReason && <p className="mt-1 text-xs font-medium text-red-500">Lý do hủy: {order.cancelReason}</p>}
              </div>
              {order.status === 'ORDERED' ? (
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  <Ban size={14} /> Hủy đơn
                </button>
              ) : (
                <button
                  onClick={() => restoreOrder(order.id)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Khôi phục
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
