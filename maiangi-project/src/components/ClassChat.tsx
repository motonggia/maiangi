import { useMemo, useRef, useState } from 'react';
import { LifeBuoy, Lock, MessageSquare, Phone, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFoodStore } from '../store/foodStore';
import { cn } from '../utils/cn';

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// Câu hỏi thường gặp để bot trợ giúp trả lời trực tiếp trong chat
const faqKnowledge: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['giá', 'bao nhiêu', 'tiền', '50'],
    answer:
      'Suất cơm trưa đồng giá 50.000đ/suất. Đồ uống có 2 mức: 10.000đ và 20.000đ.',
  },
  {
    keywords: ['20h', '20 giờ', 'chốt', 'hạn', 'mấy giờ'],
    answer: 'Hạn chốt đặt suất ăn là 20:00 tối hôm trước. Sau 20h không hủy được đơn.',
  },
  {
    keywords: ['hủy', 'huỷ', 'xóa đơn'],
    answer:
      'Trước 20h bạn tự hủy được. Sau 20h phải liên hệ Admin để hủy (có ghi lý do).',
  },
  {
    keywords: ['nước', 'đồ uống', 'uống'],
    answer: 'Đồ uống 10k/20k, đặt đến 10:00 ngày ăn, thanh toán online. Quá 10 phút không thanh toán sẽ tự hủy.',
  },
  {
    keywords: ['10 phút', 'hết hạn', 'thanh toán'],
    answer: 'Mã thanh toán đồ uống có hiệu lực 10 phút. Quá hạn hệ thống tự hủy phần nước, suất ăn giữ nguyên.',
  },
  {
    keywords: ['bình chọn', 'bầu chọn', 'vote', 'quay', 'may mắn'],
    answer: 'Bình chọn món yêu thích mỗi ngày 1 lần (chỉ học sinh). Bình chọn xong nhận 1 lượt quay may mắn tặng quà.',
  },
  {
    keywords: ['cơm', 'ít', 'vừa', 'nhiều', 'rau', 'canh', 'món'],
    answer: 'Mỗi suất gồm 2 mặn + 1 rau + cơm + canh. Cơm chọn ÍT / VỪA / NHIỀU để tránh lãng phí.',
  },
  {
    keywords: ['duyệt', 'chờ', 'đăng ký', 'tài khoản', 'đăng nhập'],
    answer: 'Tài khoản cần được Admin duyệt mới dùng được. Đăng nhập 1 lần, mở lại không cần đăng nhập lại.',
  },
  {
    keywords: ['báo cáo', 'tháng', 'tuần', 'tiền ăn'],
    answer: 'Báo cáo Ngày – Tuần – Tháng được tự động gửi qua Telegram. Bạn cũng xem được trong mục BÁO CÁO.',
  },
  {
    keywords: ['nghỉ', 'ốm', 'không ăn'],
    answer: 'Nếu nghỉ/không ăn, chỉ cần không chọn món để không tính tiền suất đó.',
  },
];

const quickQuestions = [
  'Giá suất cơm bao nhiêu?',
  'Hạn chốt đặt suất ăn?',
  'Đồ uống thanh toán thế nào?',
  'Cách nhận lượt quay may mắn?',
  'Sau 20h hủy đơn?',
];

const ClassChat = () => {
  const { user } = useAuthStore();
  const { messages, addMessage, schools } = useFoodStore();
  const [text, setText] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const canView = user?.role === 'STUDENT' || user?.role === 'PARENT' || user?.role === 'ADMIN';
  const canSend = user?.role === 'STUDENT' || user?.role === 'ADMIN';
  const scrollRef = useRef<HTMLDivElement>(null);

  const classMessages = useMemo(
    () => messages.filter((message) => message.classId === user?.classId),
    [messages, user?.classId],
  );

  const className = useMemo(() => {
    for (const school of schools) {
      const foundClass = school.classes.find((item) => item.id === user?.classId);
      if (foundClass) return `${foundClass.name} - ${school.name}`;
    }
    return 'Lớp của bạn';
  }, [schools, user?.classId]);

  // Bot trả lời câu hỏi dựa trên từ khóa
  const answerFromBot = (question: string) => {
    const q = question.toLowerCase();
    let match = faqKnowledge.find((item) => item.keywords.some((k) => q.includes(k.toLowerCase())));
    if (!match) match = faqKnowledge[0];
    return match.answer;
  };

  const postMessage = (senderName: string, textMsg: string) => {
    addMessage({
      id: `message-${Date.now()}`,
      senderId: 'support-bot',
      senderName,
      classId: user?.classId || '',
      text: textMsg,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !user || !canSend) return;

    addMessage({
      id: `message-${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName,
      classId: user.classId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    });

    // Hỏi đáp hỗ trợ trực tiếp: bot trả lời ngay
    window.setTimeout(() => postMessage('Bot hỗ trợ', answerFromBot(trimmed)), 700);

    setText('');
  };

  const sendQuick = (question: string) => {
    if (!user) return;
    addMessage({
      id: `message-${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName,
      classId: user.classId,
      text: question,
      createdAt: new Date().toISOString(),
    });
    window.setTimeout(() => postMessage('Bot hỗ trợ', answerFromBot(question)), 700);
  };

  if (!user || !canView) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
              <MessageSquare size={16} strokeWidth={2.5} />
            </span>
            Chat lớp
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {className} · {canSend ? 'thành viên lớp + quản trị viên' : 'chế độ xem'} · hỏi đáp trong chat
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
          {classMessages.length} tin nhắn
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto p-4">
          {classMessages.length ? (
            classMessages.map((message) => {
              const isMine = message.senderId === user.id;
              const isBot = message.senderId === 'support-bot';
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      isMine
                        ? 'bg-slate-50 text-slate-800'
                        : isBot
                          ? 'border border-slate-200 bg-white text-slate-700'
                          : 'bg-slate-50 text-slate-700',
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{message.senderName}</span>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">Chưa có tin nhắn trong lớp.</div>
          )}
        </div>

        {canSend ? (
          <div className="space-y-3 border-t border-slate-100 p-4">
            {/* Hotline hỗ trợ - nút bấm */}
            <a
              href="tel:0962955189"
              className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-sm transition hover:bg-slate-800"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-900">
                <Phone size={18} />
              </span>
              <span className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-300">
                  Hỗ trợ
                </span>
                <span className="block text-lg font-black leading-tight tracking-wide">
                  0962.955.189
                </span>
                <span className="block text-[11px] font-medium text-slate-300">
                  Hỏi đáp trực tiếp trong nhóm chat
                </span>
              </span>
            </a>

            {/* Câu hỏi gợi ý */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowHelp((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-50"
              >
                <LifeBuoy size={13} /> Trợ giúp
              </button>
              {showHelp &&
                quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendQuick(q)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-200"
                  >
                    {q}
                  </button>
                ))}
            </div>

            <div className="flex gap-3">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend();
                }}
                placeholder="Nhập tin nhắn hoặc câu hỏi cần hỗ trợ..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-200 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
              <button
                onClick={handleSend}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Send size={16} />
                Gửi
              </button>
            </div>
            <p className="text-xs text-slate-400">Gõ câu hỏi để nhận hỗ trợ trực tiếp (Bot tự trả lời).</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Lock size={16} className="shrink-0 text-slate-400" />
            <span>Chế độ chỉ xem: Phụ huynh không có quyền bình luận trong nhóm lớp.</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClassChat;
