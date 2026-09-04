import { useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { useFoodStore } from '../store/foodStore';
import { sendTelegramMessage, useTelegramStore } from '../store/telegramStore';

const RICE_PRICE = 50000;
const dateKey = (d: Date) => format(d, 'yyyy-MM-dd');

// Gửi báo cáo tự động 100%: mỗi 60 giây kiểm tra. Đến 20h -> gửi báo cáo ngày.
// Mỗi 14 ngày -> gửi báo cáo 2 tuần. Chỉ gửi 1 lần/ngày (không gửi trùng).
const TelegramAutoSender = () => {
  useEffect(() => {
    const run = async () => {
      const { config, markDailySent, markBiweeklySent, setStatus } = useTelegramStore.getState();
      const { orders, users, menu } = useFoodStore.getState();

      const now = new Date();
      const hour = now.getHours();
      const today = dateKey(now);
      const tomorrow = dateKey(addDays(now, 1));
      const sentDates = config.sentDailyDates ?? [];

      // ---- BÁO CÁO NGÀY (gửi sau 20h về suất ăn ngày mai) ----
      if (config.autoSendDaily && config.enabledDaily && hour >= 20 && !sentDates.includes(today)) {
        if (!config.botToken || !config.chatId) {
          setStatus('Chưa có Bot Token / Chat ID nên chưa thể gửi tự động.');
          return;
        }

        const dayOrders = orders.filter((o) => o.date === tomorrow);
        const active = dayOrders.filter((o) => o.status === 'ORDERED' && o.mainDishId);
        const riceCount = (opt: string) => active.filter((o) => o.mainDishOption === opt).length;
        const paidDrinks = dayOrders.flatMap((o) => o.drinks).filter((d) => d.status === 'PAID');
        const d10 = paidDrinks.filter((d) => d.price === 10000).reduce((s, d) => s + d.quantity, 0);
        const d20 = paidDrinks.filter((d) => d.price === 20000).reduce((s, d) => s + d.quantity, 0);
        const drinkTotal = paidDrinks.reduce((s, d) => s + d.price * d.quantity, 0);
        const foodTotal = active.length * RICE_PRICE;
        const students = users.filter((u) => u.role === 'STUDENT' && u.isApproved);
        const notOrdered = students.filter((s) => !active.some((o) => o.studentId === s.id));
        const cancelled = dayOrders.filter((o) => o.status === 'CANCELLED');

        const text = [
          '<b>📊 BÁO CÁO NGÀY — maiangi.online</b>',
          `📅 Suất ăn ngày: <b>${tomorrow}</b>`,
          '',
          '🍚 <b>SUẤT CƠM</b>',
          `• Tổng suất: <b>${active.length}</b> · Cơm ít: ${riceCount('Cơm ít')} · Cơm vừa: ${riceCount('Cơm vừa')} · Cơm nhiều: ${riceCount('Cơm nhiều')}`,
          '',
          '🥤 <b>ĐỒ UỐNG</b>',
          `• Nước 10k: ${d10} (${(d10 * 10000).toLocaleString('vi-VN')}đ) · Nước 20k: ${d20} (${(d20 * 20000).toLocaleString('vi-VN')}đ)`,
          `• Tổng tiền nước: <b>${drinkTotal.toLocaleString('vi-VN')}đ</b>`,
          '',
          '💰 <b>DOANH THU</b>',
          `• Tiền cơm: ${foodTotal.toLocaleString('vi-VN')}đ · Tổng: <b>${(foodTotal + drinkTotal).toLocaleString('vi-VN')}đ</b>`,
          '',
          '⚠️ <b>GHI CHÚ</b>',
          `• Không đặt (${notOrdered.length}): ${notOrdered.map((s) => s.fullName).join(', ') || 'không có'}`,
          `• Hủy (${cancelled.length}): ${cancelled.map((o) => o.cancelReason || 'không rõ').join('; ') || 'không có'}`,
        ].join('\n');

        const result = await sendTelegramMessage(config.botToken, config.chatId, text);
        if (result.ok) markDailySent(today);
        else setStatus(`Gửi báo cáo ngày thất bại: ${result.error}`);
        return;
      }

      // ---- BÁO CÁO 2 TUẦN (tự động gửi khi đủ 14 ngày kể từ lần gửi trước) ----
      if (config.autoSendBiweekly && config.enabledBiweekly) {
        const last = config.lastBiweeklySent;
        const due = !last || dateKey(addDays(new Date(last), 14)) <= today;
        if (due) {
          if (!config.botToken || !config.chatId) {
            setStatus('Chưa có Bot Token / Chat ID nên chưa thể gửi tự động.');
            return;
          }
          const month = today.slice(0, 7);
          const monthOrders = orders.filter((o) => o.date.startsWith(month));
          const active = monthOrders.filter((o) => o.status === 'ORDERED' && o.mainDishId);
          const paidDrinks = monthOrders.flatMap((o) => o.drinks).filter((d) => d.status === 'PAID');
          const foodTotal = active.length * RICE_PRICE;
          const drinkTotal = paidDrinks.reduce((s, d) => s + d.price * d.quantity, 0);
          const cancelled = monthOrders.filter((o) => o.status === 'CANCELLED');
          const topMeals = menu
            .filter((m) => m.category === 'MAIN')
            .map((m) => ({ name: m.name, count: active.filter((o) => o.mainDishId === m.id).length }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          const text = [
            '<b>📈 BÁO CÁO 2 TUẦN — maiangi.online</b>',
            `📅 Kỳ: ${month}`,
            '',
            `🍚 Tổng suất cơm: <b>${active.length}</b> · Tiền cơm: <b>${foodTotal.toLocaleString('vi-VN')}đ</b>`,
            `🥤 Tổng tiền đồ uống: <b>${drinkTotal.toLocaleString('vi-VN')}đ</b>`,
            `💰 Tổng thu: <b>${(foodTotal + drinkTotal).toLocaleString('vi-VN')}đ</b>`,
            '',
            '🏆 TOP MÓN',
            ...topMeals.map((m, i) => `${i + 1}. ${m.name}: ${m.count} suất`),
            '',
            '⚠️ GHI CHÚ HỦY',
            ...(cancelled.length ? cancelled.map((o) => `• ${o.cancelReason || 'không rõ'}`) : ['• Không có']),
          ].join('\n');

          const result = await sendTelegramMessage(config.botToken, config.chatId, text);
          if (result.ok) markBiweeklySent(today, month);
          else setStatus(`Gửi báo cáo 2 tuần thất bại: ${result.error}`);
        }
      }
    };

    // Chạy ngay khi mở app và lặp mỗi 60 giây
    run();
    const interval = window.setInterval(run, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
};

export default TelegramAutoSender;
