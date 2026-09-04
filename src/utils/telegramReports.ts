import { MenuItem, Order } from '../store/foodStore';

export const RICE_PRICE = 50000;

export type ReportUser = {
  id: string;
  role?: string;
  isApproved?: boolean;
  fullName?: string;
};

export type ReportContext = {
  orders: Order[];
  menu: MenuItem[];
  users: ReportUser[];
};

export type ReportPeriod = {
  start: string;
  end: string;
  key: string;
};

const pad = (value: number) => String(value).padStart(2, '0');

export const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addLocalDays = (date: Date | string, amount: number) => {
  const result = typeof date === 'string' ? parseDateKey(date) : new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + amount);
  return result;
};

export const addDaysToKey = (value: string, amount: number) => dateKey(addLocalDays(value, amount));

export const compareDateKeys = (left: string, right: string) => left.localeCompare(right);

export const daysBetween = (from: string, to: string) =>
  Math.round((parseDateKey(to).getTime() - parseDateKey(from).getTime()) / 86400000);

export const startOfMondayWeek = (value: string) => {
  const date = parseDateKey(value);
  const day = date.getDay();
  const distance = day === 0 ? 6 : day - 1;
  return dateKey(addLocalDays(date, -distance));
};

export const latestCompletedWeeklyPeriod = (now: Date, sendHour = 20): ReportPeriod | null => {
  const today = dateKey(now);
  const todayDate = parseDateKey(today);
  const day = todayDate.getDay();
  if (day === 0 && now.getHours() < sendHour) return null;
  const end = day === 0 ? today : addDaysToKey(today, -day);
  const start = addDaysToKey(end, -6);
  return { start, end, key: `week:${start}:${end}` };
};

export const defaultBiweeklyAnchor = (now = new Date()) => startOfMondayWeek(dateKey(now));

export const latestCompletedBiweeklyPeriod = (
  now: Date,
  anchorDate: string,
  sendHour = 20,
): ReportPeriod | null => {
  const anchor = anchorDate || defaultBiweeklyAnchor(now);
  const today = dateKey(now);
  const elapsed = daysBetween(anchor, today);
  if (elapsed < 13) return null;

  const index = Math.floor((elapsed - 13) / 14);
  const start = addDaysToKey(anchor, index * 14);
  const end = addDaysToKey(start, 13);
  const isEndDate = today === end;
  if (isEndDate && now.getHours() < sendHour) return null;
  return { start, end, key: `biweekly:${start}:${end}` };
};

export const manualBiweeklyPeriod = (now = new Date()): ReportPeriod => {
  const end = dateKey(now);
  const start = addDaysToKey(end, -13);
  return { start, end, key: `biweekly:${start}:${end}` };
};

export const escapeTelegramHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

const ordersInRange = (orders: Order[], start: string, end: string) =>
  orders.filter((order) => order.date >= start && order.date <= end);

const summarizeOrders = (context: ReportContext, selectedOrders: Order[]) => {
  const active = selectedOrders.filter((order) => order.status === 'ORDERED' && order.mainDishId);
  const cancelled = selectedOrders.filter((order) => order.status === 'CANCELLED');
  const paidDrinks = selectedOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PAID');
  const pendingDrinks = selectedOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'PENDING');
  const cancelledDrinks = selectedOrders.flatMap((order) => order.drinks).filter((drink) => drink.status === 'CANCELLED');
  const foodTotal = active.length * RICE_PRICE;
  const drinkTotal = paidDrinks.reduce((sum, drink) => sum + drink.price * drink.quantity, 0);
  const topMeals = context.menu
    .filter((item) => item.category === 'MAIN')
    .map((item) => ({
      name: item.name,
      count: active.filter((order) => order.mainDishId === item.id).length,
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  return {
    selectedOrders,
    active,
    cancelled,
    paidDrinks,
    pendingDrinks,
    cancelledDrinks,
    foodTotal,
    drinkTotal,
    grandTotal: foodTotal + drinkTotal,
    topMeals,
  };
};

export const buildDailyReport = (context: ReportContext, targetDate: string) => {
  const summary = summarizeOrders(context, ordersInRange(context.orders, targetDate, targetDate));
  const students = context.users.filter((user) => user.role === 'STUDENT' && user.isApproved);
  const orderedStudentIds = new Set(summary.active.map((order) => order.studentId));
  const notOrdered = students.filter((student) => !orderedStudentIds.has(student.id));
  const riceCount = (option: string) => summary.active.filter((order) => order.mainDishOption === option).length;
  const d10 = summary.paidDrinks.filter((drink) => drink.price === 10000).reduce((sum, drink) => sum + drink.quantity, 0);
  const d20 = summary.paidDrinks.filter((drink) => drink.price === 20000).reduce((sum, drink) => sum + drink.quantity, 0);

  return [
    '<b>📊 BÁO CÁO NGÀY — maiangi.online</b>',
    `📅 Suất ăn ngày: <b>${targetDate}</b>`,
    '',
    '🍚 <b>SUẤT CƠM</b>',
    `• Tổng suất: <b>${summary.active.length}</b> · Cơm ít: ${riceCount('Cơm ít')} · Cơm vừa: ${riceCount('Cơm vừa')} · Cơm nhiều: ${riceCount('Cơm nhiều')}`,
    '',
    '🥤 <b>ĐỒ UỐNG</b>',
    `• Nước 10k: ${d10} (${money(d10 * 10000)}) · Nước 20k: ${d20} (${money(d20 * 20000)})`,
    `• Đã thanh toán: <b>${money(summary.drinkTotal)}</b> · Chờ thanh toán: ${summary.pendingDrinks.length}`,
    '',
    '💰 <b>DOANH THU</b>',
    `• Tiền cơm: ${money(summary.foodTotal)} · Tổng: <b>${money(summary.grandTotal)}</b>`,
    '',
    '⚠️ <b>GHI CHÚ</b>',
    `• Không đặt (${notOrdered.length}): ${notOrdered.map((student) => escapeTelegramHtml(student.fullName || student.id)).join(', ') || 'không có'}`,
    `• Hủy (${summary.cancelled.length}): ${summary.cancelled.map((order) => escapeTelegramHtml(order.cancelReason || 'không rõ')).join('; ') || 'không có'}`,
  ].join('\n');
};

export const buildPeriodReport = (
  context: ReportContext,
  period: ReportPeriod,
  type: 'weekly' | 'biweekly',
) => {
  const summary = summarizeOrders(context, ordersInRange(context.orders, period.start, period.end));
  const title = type === 'weekly' ? 'BÁO CÁO TUẦN' : 'BÁO CÁO 2 TUẦN — KỲ THANH TOÁN';
  const cancelledLines = summary.cancelled.length
    ? summary.cancelled.map((order) => `• ${escapeTelegramHtml(order.date)} — ${escapeTelegramHtml(order.cancelReason || 'không rõ')}`)
    : ['• Không có'];
  const topMealLines = summary.topMeals.length
    ? summary.topMeals.map((meal, index) => `${index + 1}. ${escapeTelegramHtml(meal.name)}: ${meal.count} suất`)
    : ['• Chưa có dữ liệu'];

  return [
    `<b>📈 ${title} — maiangi.online</b>`,
    `📅 Kỳ: <b>${period.start} → ${period.end}</b>`,
    '',
    '🍚 <b>SUẤT ĂN</b>',
    `• Tổng suất cơm: <b>${summary.active.length}</b>`,
    `• Tiền cơm: <b>${money(summary.foodTotal)}</b>`,
    '',
    '🥤 <b>ĐỒ UỐNG</b>',
    `• Đã thanh toán: ${summary.paidDrinks.reduce((sum, drink) => sum + drink.quantity, 0)} sản phẩm`,
    `• Chờ thanh toán: ${summary.pendingDrinks.length} sản phẩm · Đã hủy: ${summary.cancelledDrinks.length} sản phẩm`,
    `• Tiền đồ uống đã thu: <b>${money(summary.drinkTotal)}</b>`,
    '',
    '💰 <b>ĐỐI SOÁT</b>',
    `• Tổng cần thu: <b>${money(summary.grandTotal)}</b>`,
    type === 'biweekly' ? '• Kỳ này thanh toán một lần.' : '',
    '',
    '🏆 <b>TOP MÓN BÁN CHẠY</b>',
    ...topMealLines,
    '',
    '⚠️ <b>GHI CHÚ HỦY ĐƠN</b>',
    ...cancelledLines,
  ].filter((line) => line !== '').join('\n');
};
