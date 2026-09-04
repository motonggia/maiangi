import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Coffee, Minus, Plus, X } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Order, useFoodStore } from '../store/foodStore';
import ClassChat from '../components/ClassChat';

const QR_PAY_SIMULATION = true;

const StudentDrinks = () => {
  const { user } = useAuthStore();
  const { menu, orders, addOrder, updateOrder } = useFoodStore();
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const drinks = menu.filter((item) => item.category === 'DRINK');
  const studentOrder = orders.find(
    (order) => order.studentId === user?.id && order.date === tomorrow && order.status === 'ORDERED',
  );
  const canOrderDrink = new Date().getHours() < 10;
  const [activeDrinkId, setActiveDrinkId] = useState<string | null>(null);

  const activeDrink = useMemo(() => {
    const drink = studentOrder?.drinks.find((item) => item.id === activeDrinkId);
    if (!drink) return null;
    const menuItem = drinks.find((entry) => entry.id === drink.drinkId);
    const expires = new Date(drink.qrExpiresAt).getTime();
    const remaining = Math.max(0, expires - Date.now());
    return { drink, menuItem, expires, remaining };
  }, [activeDrinkId, drinks, studentOrder]);

  // Countdown ticker
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Tự hủy đồ uống khi hết hạn QR
  useEffect(() => {
    if (!studentOrder || !activeDrink) return;
    if (activeDrink.remaining <= 0 && activeDrink.drink.status === 'PENDING') {
      updateOrder(studentOrder.id, {
        drinks: studentOrder.drinks.map((d) =>
          d.id === activeDrink.drink.id ? { ...d, status: 'CANCELLED' as const } : d,
        ),
      });
      setActiveDrinkId(null);
    }
  }, [tick, activeDrink, studentOrder, updateOrder]);

  const handleAddDrink = (drinkId: string, price: number) => {
    if (!user) return;
    if (!canOrderDrink) {
      alert('Đã quá 10h sáng, hệ thống đã khóa đặt đồ uống.');
      return;
    }

    const existing = studentOrder?.drinks.find((d) => d.drinkId === drinkId && d.status === 'PENDING');
    if (existing) {
      // Tăng số lượng
      updateOrder(studentOrder!.id, {
        drinks: studentOrder!.drinks.map((d) =>
          d.id === existing.id ? { ...d, quantity: d.quantity + 1 } : d,
        ),
      });
      setActiveDrinkId(existing.id);
      return;
    }

    const drinkOrder = {
      id: `drink-${Date.now()}`,
      drinkId,
      quantity: 1,
      price,
      status: 'PENDING' as const,
      qrExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };

    if (studentOrder) {
      updateOrder(studentOrder.id, { drinks: [...studentOrder.drinks, drinkOrder] });
    } else {
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        userId: user.id,
        studentId: user.id,
        date: tomorrow,
        mainDishId: null,
        mainDishOption: null,
        drinks: [drinkOrder],
        status: 'ORDERED',
        cancelledBy: 'USER',
        createdAt: new Date().toISOString(),
      };
      addOrder(newOrder);
    }
    setActiveDrinkId(drinkOrder.id);
  };

  const handleChangeQuantity = (drinkId: string, delta: number) => {
    if (!studentOrder) return;
    updateOrder(studentOrder.id, {
      drinks: studentOrder.drinks
        .map((d) => (d.id === drinkId ? { ...d, quantity: Math.max(1, d.quantity + delta) } : d))
        .filter((d) => d.quantity > 0),
    });
  };

  const handlePay = () => {
    if (!studentOrder || !activeDrink) return;
    updateOrder(studentOrder.id, {
      drinks: studentOrder.drinks.map((d) =>
        d.id === activeDrink.drink.id ? { ...d, status: 'PAID' as const } : d,
      ),
    });
    setActiveDrinkId(null);
  };

  const remainingSeconds = activeDrink ? Math.floor(activeDrink.remaining / 1000) : 0;
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const ss = String(remainingSeconds % 60).padStart(2, '0');

  const pendingTotal = (studentOrder?.drinks ?? [])
    .filter((d) => d.status === 'PENDING')
    .reduce((sum, d) => sum + d.price * d.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">ĐỒ UỐNG</h1>
          <p className="text-slate-500">2 mức giá: 10.000 VNĐ và 20.000 VNĐ. Mã thanh toán có hiệu lực 10 phút.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm">
          <Clock size={20} strokeWidth={2.5} className="text-slate-900" />
          <span>{canOrderDrink ? 'Khóa đặt lúc 10h sáng' : 'Đã khóa đặt hàng (sau 10h)'}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {drinks.map((drink) => (
          <motion.div
            key={drink.id}
            whileHover={{ y: -3 }}
            className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-700">
                <Coffee size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-slate-900">{drink.price.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{drink.name}</h2>
            <p className="mt-2 text-sm text-slate-500">Đặt xong tạo mã thanh toán, tự hủy nếu không thanh toán trong 10 phút.</p>
            <button
              onClick={() => handleAddDrink(drink.id, drink.price)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
              disabled={!canOrderDrink}
            >
              Đặt
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-800">Đồ uống đã đặt cho {format(parseISO(tomorrow), 'dd/MM/yyyy')}</h2>
        <div className="mt-4 space-y-3">
          {studentOrder?.drinks.length ? (
            studentOrder.drinks.map((drink) => {
              const item = drinks.find((entry) => entry.id === drink.drinkId);
              return (
                <div key={drink.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-700">{item?.name}</span>
                  <div className="flex items-center gap-3">
                    {drink.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleChangeQuantity(drink.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-200"><Minus size={14} /></button>
                        <span className="w-6 text-center font-bold">{drink.quantity}</span>
                        <button onClick={() => handleChangeQuantity(drink.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-200"><Plus size={14} /></button>
                      </div>
                    )}
                    <span className="text-slate-500">
                      {drink.status === 'PENDING' && <span className="text-slate-900">Chờ thanh toán</span>}
                      {drink.status === 'PAID' && <span className="text-green-600">Đã thanh toán</span>}
                      {drink.status === 'CANCELLED' && <span className="text-slate-400">Đã hủy</span>}
                    </span>
                    <button
                      onClick={() => setActiveDrinkId(drink.id)}
                      className="text-xs font-bold text-slate-900 underline"
                    >
                      Xem mã
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">Chưa có đồ uống.</p>
          )}
        </div>
        {pendingTotal > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="font-bold text-slate-700">Tạm tính</span>
            <span className="font-bold text-slate-900">{pendingTotal.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        )}
      </div>

      {/* Modal QR */}
      {activeDrink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Thanh toán</h2>
              <button onClick={() => setActiveDrinkId(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-500">{activeDrink.menuItem?.name} × {activeDrink.drink.quantity}</p>
            <p className="mt-1 text-2xl font-black text-slate-800">
              {(activeDrink.drink.price * activeDrink.drink.quantity).toLocaleString('vi-VN')} VNĐ
            </p>

            {/* Mã thanh toán (mô phỏng QR) */}
            <div className="mx-auto my-5 flex h-48 w-48 flex-wrap items-center justify-center gap-1 rounded-2xl border-4 border-slate-900 bg-white p-3">
              {Array.from({ length: 12 }).map((_, r) =>
                Array.from({ length: 12 }).map((_, c) => (
                  <span
                    key={`${r}-${c}`}
                    className={`h-3.5 w-3.5 rounded-[3px] ${(r * 12 + c + (r + c)) % 5 < 2 || (r === 1 && c === 1) ? 'bg-slate-900' : 'bg-white'}`}
                  />
                )),
              )}
            </div>
            <div className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
              <Clock size={18} className="text-slate-900" />
              <span className="font-mono text-xl font-bold text-slate-800">{mm}:{ss}</span>
            </div>

            {QR_PAY_SIMULATION && activeDrink.drink.status === 'PENDING' && (
              <button
                onClick={handlePay}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <CheckCircle2 size={16} />
                Đã thanh toán (mô phỏng)
              </button>
            )}
            {activeDrink.drink.status !== 'PENDING' && (
              <p className="mb-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                {activeDrink.drink.status === 'PAID' ? '✓ Đơn này đã được thanh toán' : 'Đơn này đã bị hủy'}
              </p>
            )}
            <p className="text-xs text-slate-400">Mã có hiệu lực 10 phút. Quá hạn sẽ tự hủy phần đồ uống.</p>
          </div>
        </div>
      )}

      <ClassChat />
    </div>
  );
};

export default StudentDrinks;
