import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabledDaily: boolean;
  enabledBiweekly: boolean;
  autoSendDaily: boolean; // tự động gửi báo cáo ngày sau 20h
  autoSendBiweekly: boolean; // tự động gửi báo cáo 2 tuần
  sentDailyDates: string[]; // nhật ký ngày đã gửi để không gửi trùng
  lastBiweeklySent: string; // mốc lần gửi báo cáo 2 tuần
  status: string; // trạng thái tự động (nhật ký)
}

interface TelegramState {
  config: TelegramConfig;
  setConfig: (config: Partial<TelegramConfig>) => void;
  markDailySent: (date: string) => void;
  markBiweeklySent: (nowKey: string, period: string) => void;
  setStatus: (status: string) => void;
}

const defaultConfig: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabledDaily: true,
  enabledBiweekly: true,
  autoSendDaily: true,
  autoSendBiweekly: true,
  sentDailyDates: [],
  lastBiweeklySent: '',
  status: 'Chưa kích hoạt gửi tự động.',
};

export const useTelegramStore = create<TelegramState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      markDailySent: (date) =>
        set((state) => ({
          config: {
            ...state.config,
            sentDailyDates: [...new Set([...(state.config.sentDailyDates ?? []), date])],
            status: `Đã tự gửi báo cáo ngày ${date} lúc ${new Date().toLocaleTimeString('vi-VN')}.`,
          },
        })),
      markBiweeklySent: (nowKey, period) =>
        set((state) => ({
          config: {
            ...state.config,
            lastBiweeklySent: nowKey,
            status: `Đã tự gửi báo cáo 2 tuần (${period}) lúc ${new Date().toLocaleTimeString('vi-VN')}.`,
          },
        })),
      setStatus: (status) => set((state) => ({ config: { ...state.config, status } })),
    }),
    {
      name: 'maiangi-telegram-config',
    },
  ),
);

// Gửi tin nhắn qua Telegram Bot API. Trả về { ok, error? }.
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
