import { useMemo, useState } from 'react';
import { CalendarDays, Coins, FileText, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useFoodStore } from '../store/foodStore';

const RICE_PRICE = 50000;
const money = (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`;

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const MyReport = () => {
  const { user } = useAuthStore();
  const { orders, users } = useFoodStore();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const studentId = user?.role === 'STUDENT' ? user.id : user?.studentId;
  const child = users.find((u) => u.id === studentId);

  const report = useMemo(() => {
    const myOrders = orders.filter((o) => o.studentId === studentId && o.date.startsWith(month));
    const activeMeals = myOrders.filter((o) => o.status === 'ORDERED' && o.mainDishId);
    const paidDrinks = myOrders.flatMap((o) => o.drinks).filter((d) => d.status === 'PAID');
    const totalMeals = activeMeals.length;
    const foodMoney = totalMeals * RICE_PRICE;
    const drinkCount = paidDrinks.reduce((sum, d) => sum + d.quantity, 0);
    const drinkMoney = paidDrinks.reduce((sum, d) => sum + d.price * d.quantity, 0);

    const dates = [...new Set(myOrders.map((o) => o.date))].sort();
    const rows = dates.map((date) => {
      const dayOrders = myOrders.filter((o) => o.date === date);
      const dayMeals = dayOrders.filter((o) => o.status === 'ORDERED' && o.mainDishId).length;
      const dayDrinks = dayOrders
        .flatMap((o) => o.drinks)
        .filter((d) => d.status === 'PAID')
        .reduce((sum, d) => sum + d.quantity, 0);
      return { date, meals: dayMeals, drinks: dayDrinks };
    });

    return {
      totalMeals,
      foodMoney,
      drinkCount,
      drinkMoney,
      totalMoney: foodMoney + drinkMoney,
      rows,
    };
  }, [orders, studentId, month]);

  if (!studentId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">BÁO CÁO</h1>
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
          {user?.role === 'PARENT'
            ? 'Tài khoản của bạn chưa được gán với học sinh. Liên hệ Admin để cấu hình.'
            : 'Chưa có dữ liệu đặt hàng.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">BÁO CÁO</h1>
          <p className="text-slate-500">
            {user?.role === 'PARENT'
              ? `Báo cáo cho con: ${child?.fullName ?? ''}`
              : 'Báo cáo đặt hàng của bạn'}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm">
          <CalendarDays size={20} strokeWidth={2.5} className="text-slate-900" />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="font-semibold text-slate-700 outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Số suất cơm" value={report.totalMeals} />
        <Stat label="Tiền cơm" value={money(report.foodMoney)} />
        <Stat label="Số đồ uống" value={report.drinkCount} />
        <Stat label="Tổng tiền" value={money(report.totalMoney)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <ShoppingCart size={18} className="text-slate-900" /> Suất cơm
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>Số suất cơm trong tháng</span><b>{report.totalMeals}</b></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>Đơn giá suất cơm</span><b>{money(RICE_PRICE)}</b></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>Thành tiền cơm</span><b className="text-slate-900">{money(report.foodMoney)}</b></div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <Coins size={18} className="text-green-600" /> Đồ uống
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>Số đồ uống đã thanh toán</span><b>{report.drinkCount}</b></div>
            <div className="flex justify-between rounded-2xl bg-green-50 px-4 py-3 text-sm"><span>Thành tiền đồ uống</span><b className="text-green-600">{money(report.drinkMoney)}</b></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span>Tiền cơm + đồ uống</span><b>{money(report.totalMoney)}</b></div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
          <FileText size={18} className="text-slate-900" /> Chi tiết theo ngày
        </h2>
        {report.rows.length ? (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="p-3">Ngày</th><th className="p-3">Suất cơm</th><th className="p-3">Đồ uống</th></tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.date} className="border-t border-slate-100">
                    <td className="p-3 font-semibold text-slate-700">{row.date}</td>
                    <td className="p-3">{row.meals}</td>
                    <td className="p-3">{row.drinks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chưa có đơn hàng trong tháng này.</p>
        )}
      </div>
    </div>
  );
};

export default MyReport;
