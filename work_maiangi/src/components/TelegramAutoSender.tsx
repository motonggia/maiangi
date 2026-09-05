import { useEffect, useRef } from 'react';
import { useFoodStore } from '../store/foodStore';
import { sendTelegramMessage, useTelegramStore } from '../store/telegramStore';
import {
  addDaysToKey,
  buildDailyReport,
  buildPeriodReport,
  dateKey,
  latestCompletedBiweeklyPeriod,
  latestCompletedWeeklyPeriod,
} from '../utils/telegramReports';

const TelegramAutoSender = () => {
  const runningRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (runningRef.current) return;
      runningRef.current = true;

      try {
        const { config, markDailySent, markWeeklySent, markBiweeklySent, setStatus } = useTelegramStore.getState();
        const { orders, users, menu } = useFoodStore.getState();
        const now = new Date();
        const today = dateKey(now);
        const context = { orders, users, menu };
        const hasCredentials = Boolean(config.botToken && config.chatId);

        if (!hasCredentials) {
          setStatus('Chưa có Bot Token / Chat ID nên chưa thể gửi tự động.');
          return;
        }

        const send = async (text: string) => sendTelegramMessage(config.botToken, config.chatId, text);
        const sentDailyDates = config.sentDailyDates ?? [];
        const sentWeeklyPeriods = config.sentWeeklyPeriods ?? [];
        const sentBiweeklyPeriods = config.sentBiweeklyPeriods ?? [];

        // Báo cáo ngày: sau 20h, tổng hợp suất ăn của ngày kế tiếp.
        if (
          config.autoSendDaily &&
          config.enabledDaily &&
          now.getHours() >= (config.dailySendHour ?? 20)
        ) {
          const targetDate = addDaysToKey(today, 1);
          if (!sentDailyDates.includes(targetDate)) {
            const result = await send(buildDailyReport(context, targetDate));
            if (result.ok) markDailySent(targetDate);
            else setStatus(`Gửi báo cáo ngày thất bại: ${result.error}`);
          }
        }

        // Báo cáo tuần: kỳ hoàn tất từ thứ Hai đến Chủ nhật gần nhất.
        if (config.autoSendWeekly && config.enabledWeekly) {
          const period = latestCompletedWeeklyPeriod(now, config.weeklySendHour ?? 20);
          if (period && !sentWeeklyPeriods.includes(period.key)) {
            const result = await send(buildPeriodReport(context, period, 'weekly'));
            if (result.ok) markWeeklySent(period.key, `${period.start} → ${period.end}`);
            else setStatus(`Gửi báo cáo tuần thất bại: ${result.error}`);
          }
        }

        // Báo cáo 2 tuần: kỳ cố định 14 ngày, dùng để thanh toán một lần.
        if (config.autoSendBiweekly && config.enabledBiweekly) {
          const period = latestCompletedBiweeklyPeriod(
            now,
            config.biweeklyAnchorDate,
            config.biweeklySendHour ?? 20,
          );
          if (period && !sentBiweeklyPeriods.includes(period.key)) {
            const result = await send(buildPeriodReport(context, period, 'biweekly'));
            if (result.ok) markBiweeklySent(period.key, `${period.start} → ${period.end}`);
            else setStatus(`Gửi báo cáo 2 tuần thất bại: ${result.error}`);
          }
        }
      } finally {
        runningRef.current = false;
      }
    };

    run();
    const interval = window.setInterval(run, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
};

export default TelegramAutoSender;
