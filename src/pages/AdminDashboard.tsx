import { useMemo } from 'react';
import { CalendarCheck, Coins, ShoppingCart, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useFoodStore } from '../store/foodStore';

const money = (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`;

const AdminDashboard = () => {
  const { orders, users, menu, votes, spinResults } = useFoodStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const stats = useMemo(() => {
    const todayOrders = orders.filter((o) => o.date === today && o.status === 'ORDERED' && o.mainDishId);
    const tomorrowOrders = orders.filter((o) => o.date === tomorrow && o.status === 'ORDERED' && o.mainDishId);
    const totalMeals = orders.filter((o) => o.status === 'ORDERED' && o.mainDishId).length;
    const mealRevenue = totalMeals * 50000;
    const drinkRevenue = orders
      .flatMap((o) => o.drinks)
      .filter((d) => d.status === 'PAID')
      .reduce((sum, d) => sum + d.price * d.quantity, 0);
    const pendingUsers = users.filter((u) => !u.isApproved && u.role !== 'ADMIN');
    const activeDrinks = orders
      .flatMap((o) => o.drinks)
      .filter((d) => d.status === 'PAID')
      .reduce((sum, d) => sum + d.quantity, 0);

    return {
      todayMeals: todayOrders.length,
      tomorrowMeals: tomorrowOrders.length,
      totalMeals,
      mealRevenue,
      drinkRevenue,
      totalRevenue: mealRevenue + drinkRevenue,
      pendingUsers: pendingUsers.length,
      totalStudents: users.filter((u) => u.role === 'STUDENT' && u.isApproved).length,
      totalParents: users.filter((u) => u.role === 'PARENT' && u.isApproved).length,
      menuCount: menu.filter((m) => m.category === 'MAIN').length,
      voteCount: votes.length,
      spinCount: spinResults.length,
      activeDrinks,
    };
  }, [orders, users, menu, votes, spinResults, today, tomorrow]);

  const cards = [
    { label: 'Suất cơm hôm nay', value: stats.todayMeals, icon: CalendarCheck, color: 'text-slate-900 border-slate-200' },
    { label: 'Suất cơm ngày mai', value: stats.tomorrowMeals, icon: CalendarCheck, color: 'text-blue-600 border-blue-300' },
    { label: 'Tổng suất cơm', value: stats.totalMeals, icon: ShoppingCart, color: 'text-green-600 border-green-300' },
    { label: 'Doanh thu cơm', value: money(stats.mealRevenue), icon: Coins, color: 'text-slate-900 border-slate-200' },
    { label: 'Doanh thu đồ uống', value: money(stats.drinkRevenue), icon: Coins, color: 'text-blue-600 border-blue-300' },
    { label: 'Tổng doanh thu', value: money(stats.totalRevenue), icon: Coins, color: 'text-green-600 border-green-300' },
    { label: 'Số nước đã thanh toán', value: stats.activeDrinks, icon: Coins, color: 'text-blue-600 border-blue-300' },
    { label: 'Chờ duyệt tài khoản', value: stats.pendingUsers, icon: Users, color: 'text-amber-600 border-amber-300' },
    { label: 'Học sinh / Phụ huynh', value: `${stats.totalStudents} / ${stats.totalParents}`, icon: Users, color: 'text-slate-900 border-slate-200' },
    { label: 'Món chính trong menu', value: stats.menuCount, icon: ShoppingCart, color: 'text-slate-600 border-slate-300' },
    { label: 'Lượt bình chọn', value: stats.voteCount, icon: Users, color: 'text-purple-600 border-purple-300' },
    { label: 'Lượt quay may mắn', value: stats.spinCount, icon: CalendarCheck, color: 'text-pink-600 border-pink-300' },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">Tổng quan</h1>
        <p className="text-slate-500">Tình hình đặt suất ăn, đồ uống và doanh thu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border bg-white ${card.color}`}>
              <card.icon size={20} strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
