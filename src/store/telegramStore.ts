import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabledDaily: boolean;
  enabledWeekly: boolean;
  enabledBiweekly: boolean;
  autoSendDaily: boolean;
  autoSendWeekly: boolean;
  autoSendBiweekly: boolean;
  dailySendHour: number;
  weeklySendHour: number;
  biweeklySendHour: number;
  biweeklyAnchorDate: string;
  sentDailyDates: string[];
  sentWeeklyPeriods: string[];
  sentBiweeklyPeriods: string[];
  lastBiweeklySent: string;
  status: string;
}

interface TelegramState {
  config: TelegramConfig;
  setConfig: (config: Partial<TelegramConfig>) => void;
  markDailySent: (date: string) => void;
  markWeeklySent: (periodKey: string, periodLabel: string) => void;
  markBiweeklySent: (periodKey: string, periodLabel: string) => void;
  setStatus: (status: string) => void;
}

export const defaultTelegramConfig: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabledDaily: true,
  enabledWeekly: true,
  enabledBiweekly: true,
  autoSendDaily: true,
  autoSendWeekly: true,
  autoSendBiweekly: true,
  dailySendHour: 20,
  weeklySendHour: 20,
  biweeklySendHour: 20,
  biweeklyAnchorDate: '',
  sentDailyDates: [],
  sentWeeklyPeriods: [],
  sentBiweeklyPeriods: [],
  lastBiweeklySent: '',
  status: 'Chưa kích hoạt gửi tự động.',
};

export const useTelegramStore = create<TelegramState>()(
  persist(
    (set) => ({
      config: defaultTelegramConfig,
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      markDailySent: (date) =>
        set((state) => ({
          config: {
            ...state.config,
            sentDailyDates: [...new Set([...(state.config.sentDailyDates ?? []), date])].slice(-90),
            status: `Đã tự gửi báo cáo ngày ${date} lúc ${new Date().toLocaleTimeString('vi-VN')}.`,
          },
        })),
      markWeeklySent: (periodKey, periodLabel) =>
        set((state) => ({
          config: {
            ...state.config,
            sentWeeklyPeriods: [...new Set([...(state.config.sentWeeklyPeriods ?? []), periodKey])].slice(-52),
            status: `Đã tự gửi báo cáo tuần ${periodLabel} lúc ${new Date().toLocaleTimeString('vi-VN')}.`,
          },
        })),
      markBiweeklySent: (periodKey, periodLabel) =>
        set((state) => ({
          config: {
            ...state.config,
            sentBiweeklyPeriods: [...new Set([...(state.config.sentBiweeklyPeriods ?? []), periodKey])].slice(-26),
            lastBiweeklySent: periodLabel,
            status: `Đã tự gửi báo cáo 2 tuần ${periodLabel} lúc ${new Date().toLocaleTimeString('vi-VN')}.`,
          },
        })),
      setStatus: (status) => set((state) => ({ config: { ...state.config, status } })),
    }),
    {
      name: 'maiangi-telegram-config',
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<TelegramState>;
        return {
          ...current,
          ...persistedState,
          config: {
            ...current.config,
            ...(persistedState.config ?? {}),
          },
        };
      },
    },
  ),
);

export const sendTelegramMessage = async (botToken: string, chatId: string, text: string) => {
  if (!botToken || !chatId) {
    return { ok: false, error: 'Chưa cấu hình Bot Token hoặc Chat ID.' };
  }
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    const data = await response.json();
    return { ok: !!data.ok, error: data.ok ? undefined : data.description };
  } catch (error) {
    return { ok: false, error: 'Không kết nối được tới Telegram.' };
  }
};
