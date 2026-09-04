import { useState } from 'react';
import { Calendar, CheckCircle2, Info, ShoppingBag, Utensils, XCircle } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Order, useFoodStore } from '../store/foodStore';
import { cn } from '../utils/cn';
import ClassChat from '../components/ClassChat';
import WeeklyMenuPreview from '../components/WeeklyMenuPreview';

const ParentOrder = () => {
  const { user } = useAuthStore();
  const { menu, orders, users, addOrder, updateOrder } = useFoodStore();

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowDayOfWeek = addDays(new Date(), 1).getDay();
  const tomorrowMenu = menu.filter((item) => item.category === 'MAIN' && item.dayOfWeek === tomorrowDayOfWeek);

  const childId = user?.studentId;
  const child = users.find((u) => u.id === childId);

  const [draftSelection, setDraftSelection] = useState<{ menuItemId: string; option: string } | null>(null);
  const parentOrder = orders.find((o) => o.studentId === childId && o.date === tomorrow && o.status === 'ORDERED');
  const activeMenuItemId = draftSelection?.menuItemId ?? parentOrder?.mainDishId;
  const activeOption = draftSelection?.option ?? parentOrder?.mainDishOption;
  const selectedMeal = tomorrowMenu.find((m) => m.id === activeMenuItemId);

  const handleConfirm = () => {
    if (!draftSelection) {
      alert('Vui lòng chọn lượng cơm trước khi đặt hàng.');
      return;
    }
    if (parentOrder) {
      updateOrder(parentOrder.id, { mainDishId: draftSelection.menuItemId, mainDishOption: draftSelection.option });
    } else {
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        userId: user?.id || '',
        studentId: childId || '',
        date: tomorrow,
        mainDishId: draftSelection.menuItemId,
        mainDishOption: draftSelection.option,
        drinks: [],
        status: 'ORDERED',
        cancelledBy: 'USER',
        createdAt: new Date().toISOString(),
      };
      addOrder(newOrder);
    }
    setDraftSelection(null);
  };

  const handleCancel = () => {
    if (!parentOrder) return;
    if (new Date().getHours() >= 20) {
      alert('Đã sau 20h, bạn không thể tự hủy đơn hàng.');
      return;
    }
    const confirm = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirm) return;
    updateOrder(parentOrder.id, { status: 'CANCELLED', cancelledBy: 'USER' });
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">MENU cho con</h1>
          <p className="text-slate-500">Đặt suất cơm cho: <b>{child?.fullName ?? 'Chưa gán học sinh'}</b></p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm border-2 border-slate-200">
          <Calendar size={20} strokeWidth={2.5} className="text-slate-900" />
          <span>Ngày mai: {format(parseISO(tomorrow), 'dd/MM/yyyy')}</span>
        </div>
      </div>

      {!child && (
        <div className="flex items-center gap-4 rounded-2xl bg-amber-50 p-4 text-amber-800">
          <Info size={20} />
          <p className="text-sm">Tài khoản của bạn chưa được gán với học sinh. Liên hệ Admin để được cấu hình.</p>
        </div>
      )}

      <WeeklyMenuPreview menu={menu} title="Thực đơn cả tuần cho con" />

      <div className="grid gap-4 md:grid-cols-2">
        {tomorrowMenu.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3 }}
            className={cn(
              'rounded-3xl border-2 bg-white p-5 transition',
              activeMenuItemId === item.id ? 'border-slate-200 bg-slate-50' : 'border-slate-100',
            )}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600">
                <Utensils size={24} strokeWidth={2.5} />
              </div>
              {activeMenuItemId === item.id && <CheckCircle2 size={20} className="text-slate-900" />}
            </div>
            <h2 className="font-bold text-slate-800">{item.name}</h2>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>Mặn: {item.mealDetails?.savory1}; {item.mealDetails?.savory2}</p>
              <p>Rau: {item.mealDetails?.vegetable} · Canh: {item.mealDetails?.soup}</p>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase text-slate-500">Chọn lượng cơm</p>
              <div className="grid grid-cols-3 gap-2">
                {item.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDraftSelection({ menuItemId: item.id, option: opt })}
                    className={cn(
                      'rounded-lg border-2 px-2 py-2 text-xs font-bold transition',
                      activeMenuItemId === item.id && activeOption === opt
                        ? 'border-slate-200 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-200',
                    )}
                  >
                    {opt.replace('Cơm ', '')}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
          <ShoppingBag size={18} className="text-slate-900" /> Xác nhận
        </h2>
        {selectedMeal ? (
          <div className="space-y-3">
            <p className="font-bold text-slate-800">{selectedMeal.name} · {activeOption}</p>
            {draftSelection && (
              <button onClick={handleConfirm} className="w-full rounded-2xl bg-slate-900 py-3 font-black uppercase text-white hover:bg-slate-800">
                ĐẶT HÀNG
              </button>
            )}
            {parentOrder && !draftSelection && (
              <button onClick={handleCancel} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50">
                <XCircle size={18} /> Hủy đơn
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chọn lượng cơm để đặt cho con.</p>
        )}
      </div>

      <ClassChat />
    </div>
  );
};

export default ParentOrder;
