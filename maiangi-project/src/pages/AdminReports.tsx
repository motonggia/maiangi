import { useMemo, useState } from 'react';
import { BarChart3, CalendarDays, FileText, Send, Settings2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useFoodStore } from '../store/foodStore';
import { sendTelegramMessage, useTelegramStore } from '../store/telegramStore';
import {
  buildPeriodReport,
  defaultBiweeklyAnchor,
  latestCompletedWeeklyPeriod,
  manualBiweeklyPeriod,
} from '../utils/telegramReports';

const money = (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`;

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

const AdminReports = () => {
  const { orders, menu, users, spinResults } = useFoodStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const students = users.filter((user) => user.role === 'STUDENT' && user.isApproved);

  const daily = useMemo(() => {
    const dayOrders = orders.filter((order) => order.date === selectedDate);
    const activeOrders = dayOrders.filter((order) => order.status === 'ORDERED' && order.mainDishId);
    const cancelledOrders = dayOrders.filter((order) => order.status === 'CANCELLED');
    const orderedStudentIds = new Set(activeOrders.map((order) => order.studentId));
    const notOrderedStudents = students.filter((student) => !orderedStudentIds.has(student.id));
    const paidDrinks = dayOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PAID');
    const pendingDrinks = dayOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PENDING');
    const cancelledDrinks = dayOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'CANCELLED');

    const riceCounts = ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'].map((option) => ({
      option,
      count: activeOrders.filter((order) => order.mainDishOption === option).length,
    }));

    const mealCounts = menu
      .filter((item) => item.category === 'MAIN')
      .map((item) => ({
        name: item.name,
        count: activeOrders.filter((order) => order.mainDishId === item.id).length,
      }))
      .filter((item) => item.count > 0);

    const drink10 = paidDrinks.filter((drink) => drink.price === 10000).reduce((sum, drink) => sum + drink.quantity, 0);
    const drink20 = paidDrinks.filter((drink) => drink.price === 20000).reduce((sum, drink) => sum + drink.quantity, 0);
    const foodTotal = activeOrders.length * 50000;
    const drinkTotal = paidDrinks.reduce((sum, drink) => sum + drink.price * drink.quantity, 0);

    const daySpins = spinResults.filter((spin) => spin.date === selectedDate);

    return {
      dayOrders,
      activeOrders,
      cancelledOrders,
      notOrderedStudents,
      paidDrinks,
      pendingDrinks,
      cancelledDrinks,
      riceCounts,
      mealCounts,
      drink10,
      drink20,
      foodTotal,
      drinkTotal,
      grandTotal: foodTotal + drinkTotal,
      daySpins,
    };
  }, [menu, orders, selectedDate, spinResults, students]);

  const monthly = useMemo(() => {
    const monthOrders = orders.filter((order) => order.date.startsWith(selectedMonth));
    const activeOrders = monthOrders.filter((order) => order.status === 'ORDERED' && order.mainDishId);
    const paidDrinks = monthOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PAID');
    const cancelledOrders = monthOrders.filter((order) => order.status === 'CANCELLED');
    const dates = [...new Set(monthOrders.map((order) => order.date))].sort();
    const foodTotal = activeOrders.length * 50000;
    const drinkTotal = paidDrinks.reduce((sum, drink) => sum + drink.price * drink.quantity, 0);

    const topMeals = menu
      .filter((item) => item.category === 'MAIN')
      .map((item) => ({
        name: item.name,
        count: activeOrders.filter((order) => order.mainDishId === item.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const rows = dates.map((date) => {
      const dayOrders = monthOrders.filter((order) => order.date === date);
      const dayActive = dayOrders.filter((order) => order.status === 'ORDERED' && order.mainDishId);
      const dayPaidDrinks = dayOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PAID');
      const dayDrinkTotal = dayPaidDrinks.reduce((sum, drink) => sum + drink.price * drink.quantity, 0);
      return {
        date,
        meals: dayActive.length,
        drinks: dayPaidDrinks.reduce((sum, drink) => sum + drink.quantity, 0),
        total: dayActive.length * 50000 + dayDrinkTotal,
      };
    });

    const monthSpins = spinResults.filter((spin) => spin.date.startsWith(selectedMonth));

    return {
      activeOrders,
      paidDrinks,
      cancelledOrders,
      foodTotal,
      drinkTotal,
      grandTotal: foodTotal + drinkTotal,
      topMeals,
      rows,
      averageMeals: dates.length ? Math.round(activeOrders.length / dates.length) : 0,
      monthSpins,
    };
  }, [menu, orders, selectedMonth, spinResults]);

  const { config, setConfig } = useTelegramStore();
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendMessage, setSendMessage] = useState('');

  const dailyReportText = useMemo(() => {
    const riceTotal = daily.riceCounts.reduce((sum, item) => sum + item.count, 0);
    return [
      '<b>📊 BÁO CÁO NGÀY — maiangi.online</b>',
      `📅 Ngày: <b>${selectedDate}</b>`,
      '',
      '🍚 <b>SUẤT CƠM NGÀY MAI</b>',
      `• Tổng suất: <b>${daily.activeOrders.length}</b>`,
      `• Cơm ít: ${daily.riceCounts.find((r) => r.option === 'Cơm ít')?.count ?? 0}`,
      `• Cơm vừa: ${daily.riceCounts.find((r) => r.option === 'Cơm vừa')?.count ?? 0}`,
      `• Cơm nhiều: ${daily.riceCounts.find((r) => r.option === 'Cơm nhiều')?.count ?? 0}`,
      '',
      '🥤 <b>ĐỒ UỐNG</b>',
      `• Nước 10k: ${daily.drink10} (${(daily.drink10 * 10000).toLocaleString('vi-VN')}đ)`,
      `• Nước 20k: ${daily.drink20} (${(daily.drink20 * 20000).toLocaleString('vi-VN')}đ)`,
      `• Tổng tiền nước: <b>${daily.drinkTotal.toLocaleString('vi-VN')}đ</b>`,
      '',
      '💰 <b>DOANH THU</b>',
      `• Tiền cơm: ${daily.foodTotal.toLocaleString('vi-VN')}đ`,
      `• Tổng cộng: <b>${daily.grandTotal.toLocaleString('vi-VN')}đ</b>`,
      '',
      '⚠️ <b>GHI CHÚ</b>',
      `• Không đặt (${daily.notOrderedStudents.length}): ${daily.notOrderedStudents.map((s) => s.fullName).join(', ') || 'không có'}`,
      `• Đơn hủy (${daily.cancelledOrders.length}): ${daily.cancelledOrders.map((o) => o.cancelReason || 'không rõ').join('; ') || 'không có'}`,
      `• Lượt quay: ${daily.daySpins.length} · Giá cơm ${riceTotal} suất × 50.000đ`,
    ].join('\n');
  }, [daily, selectedDate]);

  const weeklyReportText = useMemo(() => {
    const period = latestCompletedWeeklyPeriod(new Date(), config.weeklySendHour ?? 20) ?? {
      start: selectedDate,
      end: selectedDate,
      key: `week:${selectedDate}:${selectedDate}`,
    };
    return buildPeriodReport({ orders, menu, users }, period, 'weekly');
  }, [config.weeklySendHour, menu, orders, selectedDate, users]);

  const biweeklyReportText = useMemo(() => {
    const period = manualBiweeklyPeriod(new Date());
    return buildPeriodReport({ orders, menu, users }, period, 'biweekly');
  }, [menu, orders, users]);

  const doSend = async (text: string) => {
    setSendState('sending');
    setSendMessage('');
    const result = await sendTelegramMessage(config.botToken, config.chatId, text);
    if (result.ok) {
      setSendState('sent');
      setSendMessage('Đã gửi báo cáo thành công tới Telegram.');
    } else {
      setSendState('error');
      setSendMessage(result.error ?? 'Gửi thất bại.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Báo cáo món ăn và doanh thu</h1>
          <p className="text-slate-500">Theo dõi tổng suất cơm, đồ uống, tiền cần thu và các trường hợp hủy.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm">
          <BarChart3 size={20} strokeWidth={2.5} className="text-slate-900" />
          <span>maiangi.online</span>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
              <CalendarDays size={16} strokeWidth={2.5} />
            </span>
            Báo cáo theo ngày
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-200 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Tổng suất cơm" value={daily.activeOrders.length} />
          <Stat label="Tiền cơm" value={money(daily.foodTotal)} />
          <Stat label="Tiền đồ uống đã thanh toán" value={money(daily.drinkTotal)} />
          <Stat label="Tổng tiền" value={money(daily.grandTotal)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Số lượng cơm</h3>
            <div className="space-y-3">
              {daily.riceCounts.map((item) => (
                <div key={item.option} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-slate-700">{item.option}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Đồ uống</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Nước 10k đã thanh toán</span><b>{daily.drink10}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Nước 20k đã thanh toán</span><b>{daily.drink20}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Chờ thanh toán</span><b>{daily.pendingDrinks.length}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Đồ uống đã hủy</span><b>{daily.cancelledDrinks.length}</b></div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Thông số khác</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Học sinh đã duyệt</span><b>{students.length}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Không đặt cơm</span><b>{daily.notOrderedStudents.length}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Đơn bị hủy</span><b>{daily.cancelledOrders.length}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Lượt quay may mắn</span><b>{daily.daySpins.length}</b></div>
              <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Giá cơm</span><b>{money(50000)}</b></div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Món trong ngày</h3>
            {daily.mealCounts.length ? daily.mealCounts.map((item) => (
              <div key={item.name} className="mb-3 flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">{item.name}</span>
                <span className="font-bold text-slate-900">{item.count} suất</span>
              </div>
            )) : <p className="text-sm text-slate-500">Chưa có suất cơm trong ngày này.</p>}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Danh sách không đặt và ghi chú hủy</h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Học sinh không đặt</p>
                <p className="text-slate-500">{daily.notOrderedStudents.map((student) => student.fullName).join(', ') || 'Không có'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Lý do hủy</p>
                <p className="text-slate-500">{daily.cancelledOrders.map((order) => order.cancelReason || 'Không ghi lý do').join('; ') || 'Không có'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Giải thưởng đã quay</p>
                <p className="text-slate-500">{daily.daySpins.map((spin) => spin.prize).join('; ') || 'Chưa có'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
              <TrendingUp size={16} strokeWidth={2.5} />
            </span>
            Báo cáo theo tháng
          </h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-200 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Stat label="Tổng suất cơm" value={monthly.activeOrders.length} />
          <Stat label="Tiền cơm" value={money(monthly.foodTotal)} />
          <Stat label="Tiền đồ uống" value={money(monthly.drinkTotal)} />
          <Stat label="Tổng tiền tháng" value={money(monthly.grandTotal)} />
          <Stat label="Lượt quay" value={monthly.monthSpins.length} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Tổng hợp từng ngày trong tháng</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="p-3">Ngày</th><th className="p-3">Cơm</th><th className="p-3">Nước</th><th className="p-3 text-right">Tổng tiền</th></tr>
                </thead>
                <tbody>
                  {monthly.rows.map((row) => (
                    <tr key={row.date} className="border-t border-slate-100">
                      <td className="p-3 font-semibold text-slate-700">{row.date}</td>
                      <td className="p-3">{row.meals}</td>
                      <td className="p-3">{row.drinks}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{money(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800"><FileText size={18} /> Thông số tháng</h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Top món bán chạy</p>
                <p className="text-slate-500">{monthly.topMeals.map((item, index) => `${index + 1}. ${item.name}: ${item.count} suất`).join('; ') || 'Chưa có dữ liệu'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Hủy đơn trong tháng</p>
                <p className="text-slate-500">{monthly.cancelledOrders.map((order) => order.cancelReason || 'Không ghi lý do').join('; ') || 'Không có'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="mb-2 font-semibold text-slate-700">Gợi ý báo cáo Telegram</p>
                <p className="text-slate-500">Gửi sau 20h: tổng suất cơm, cơm ít/vừa/nhiều, danh sách không đặt, đồ uống 10k/20k và tổng tiền.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telegram */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
            <Send size={16} strokeWidth={2.5} />
          </span>
          Báo cáo tự động gửi Telegram
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Gửi báo cáo ngày, cuối tuần và cuối kỳ 2 tuần. Kỳ 2 tuần được dùng để đối soát và thanh toán một lần.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Bot Token</label>
              <input
                value={config.botToken}
                onChange={(e) => setConfig({ botToken: e.target.value })}
                placeholder="123456:ABC-DEF... (mã từ @BotFather)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Chat ID</label>
              <input
                value={config.chatId}
                onChange={(e) => setConfig({ chatId: e.target.value })}
                placeholder="-100123456789 hoặc @yourchannel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-200"
              />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={config.autoSendDaily} onChange={(e) => setConfig({ autoSendDaily: e.target.checked })} className="h-4 w-4 accent-slate-900" />
                Tự động gửi báo cáo ngày
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={config.autoSendWeekly} onChange={(e) => setConfig({ autoSendWeekly: e.target.checked })} className="h-4 w-4 accent-slate-900" />
                Tự động gửi báo cáo tuần
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={config.autoSendBiweekly} onChange={(e) => setConfig({ autoSendBiweekly: e.target.checked })} className="h-4 w-4 accent-slate-900" />
                Tự động gửi báo cáo 2 tuần
              </label>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <label className="text-xs font-semibold text-slate-500">
                Giờ gửi ngày
                <select value={config.dailySendHour ?? 20} onChange={(e) => setConfig({ dailySendHour: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {[18, 19, 20, 21, 22].map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Giờ gửi tuần
                <select value={config.weeklySendHour ?? 20} onChange={(e) => setConfig({ weeklySendHour: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {[18, 19, 20, 21, 22].map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00 Chủ nhật</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500">
                Giờ gửi 2 tuần
                <select value={config.biweeklySendHour ?? 20} onChange={(e) => setConfig({ biweeklySendHour: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {[18, 19, 20, 21, 22].map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00 ngày kết thúc kỳ</option>)}
                </select>
              </label>
            </div>
            <label className="block pt-1 text-xs font-semibold text-slate-500">
              Ngày bắt đầu chu kỳ 14 ngày
              <input
                type="date"
                value={config.biweeklyAnchorDate || defaultBiweeklyAnchor(new Date())}
                onChange={(e) => setConfig({ biweeklyAnchorDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700"
              />
              <span className="mt-1 block font-normal text-slate-400">Kỳ thanh toán gồm ngày bắt đầu và 13 ngày tiếp theo.</span>
            </label>

            <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Trạng thái tự động</p>
              <p className="mt-1 text-xs">{config.status || 'Đang chờ kích hoạt.'}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <Settings2 size={14} /> Xem trước nội dung Telegram
            </p>
            <p className="mb-1 text-[11px] font-bold text-slate-500">Báo cáo ngày</p>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{dailyReportText}</pre>
            <p className="mb-1 mt-3 text-[11px] font-bold text-slate-500">Báo cáo tuần</p>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{weeklyReportText}</pre>
            <p className="mb-1 mt-3 text-[11px] font-bold text-slate-500">Báo cáo 2 tuần / thanh toán</p>
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{biweeklyReportText}</pre>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => doSend(dailyReportText)}
            disabled={sendState === 'sending'}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          >
            <Send size={15} /> Gửi báo cáo ngày
          </button>
          <button
            onClick={() => doSend(weeklyReportText)}
            disabled={sendState === 'sending'}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:bg-slate-300"
          >
            <Send size={15} /> Gửi báo cáo tuần
          </button>
          <button
            onClick={() => doSend(biweeklyReportText)}
            disabled={sendState === 'sending'}
            className="flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:bg-slate-300"
          >
            <Send size={15} /> Gửi báo cáo 2 tuần
          </button>
          {sendState === 'sending' && <span className="flex items-center gap-2 text-sm text-slate-500">Đang gửi...</span>}
          {sendMessage && (
            <span className={`text-sm font-semibold ${sendState === 'sent' ? 'text-green-600' : 'text-red-500'}`}>
              {sendMessage}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminReports;