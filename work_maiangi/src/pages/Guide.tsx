import { BookOpen, Clock, Coffee, Download, HelpCircle, MessageSquare, Star, UserPlus, Utensils } from 'lucide-react';
import ClassChat from '../components/ClassChat';

const hero = {
  title: 'maiangi.online',
  slogan: 'CHỌN ĐÚNG MÓN – NẤU ĐÚNG Ý',
  desc: 'Thực đơn trưa do học sinh bình chọn (chốt trước 20h), không cố định. Mỗi suất gồm: 2 mặn + 1 rau + cơm + canh. Cơm chọn ÍT / VỪA / NHIỀU để tránh lãng phí.',
};

const sections = [
  {
    icon: UserPlus,
    title: '1. Đăng ký',
    items: [
      'Đăng ký đúng vai trò: học sinh hoặc phụ huynh.',
      'Nhập đúng số điện thoại (SĐT 1 và SĐT 2).',
      'Tài khoản được Quản trị viên duyệt mới dùng được.',
    ],
  },
  {
    icon: Utensils,
    title: '2. Học sinh',
    items: [
      'MENU: chọn món trước 20h. Cơm chọn ÍT / VỪA / NHIỀU.',
      'Đặt suất ngày mai, chốt 20:00 hôm trước. 1 suất / học sinh / ngày.',
      'Sau 20h không thể huỷ đơn.',
      'Bình chọn món yêu thích → nhận 1 lượt quay may mắn.',
    ],
  },
  {
    icon: Coffee,
    title: 'Đồ uống',
    items: [
      'Giá 10k / 20k. Đặt đến 10:00 ngày ăn.',
      'Thanh toán ONLINE ngay.',
      'Sau 10 phút không thanh toán, hệ thống tự huỷ.',
    ],
  },
  {
    icon: MessageSquare,
    title: '3. Nhóm chat',
    items: [
      'Là nơi nhà cung cấp và học sinh lắng nghe về món ăn.',
      'Phụ huynh xem được nội dung, không bình luận.',
    ],
  },
  {
    icon: Star,
    title: '4. Vòng quay may mắn',
    items: [
      'Bình chọn món yêu thích sẽ được 1 lượt quay may mắn.',
      'Vòng quay tặng quà may mắn cho các con.',
    ],
  },
  {
    icon: BookOpen,
    title: '5. Báo cáo',
    items: [
      'Báo cáo Ngày – Tuần – Tháng tự động qua Telegram.',
      'Phụ huynh: xem báo cáo ngày / tuần / tháng.',
    ],
  },
];

const parent = [
  'Có thể đặt cơm và mua nước cho con.',
  'Xem báo cáo ngày / tuần / tháng.',
];

const Guide = () => {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-lg font-black lowercase text-slate-600">{hero.title}</p>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-wide text-slate-900">{hero.slogan}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{hero.desc}</p>
          </div>
          <a
            href="HUONG-DAN-SU-DUNG.txt"
            download
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Download size={16} />
            Tải file hướng dẫn (.txt)
          </a>
        </div>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
          <HelpCircle size={16} strokeWidth={2.5} />
        </span>
        Hướng dẫn sử dụng
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((step) => (
          <div key={step.title} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
                <step.icon size={18} strokeWidth={2.5} />
              </span>
              <h3 className="text-base font-black uppercase tracking-wide text-slate-800">{step.title}</h3>
            </div>
            <ul className="space-y-2">
              {step.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-black uppercase tracking-wide text-slate-900">
            <UserPlus size={18} strokeWidth={2.5} /> Phụ huynh
          </h3>
          <ul className="space-y-2">
            {parent.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 flex items-center gap-2 font-black uppercase tracking-wide text-slate-700">
            <Clock size={18} strokeWidth={2.5} /> Mốc thời gian
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• 20:00 hôm trước: chốt đặt suất ăn.</li>
            <li>• 10:00 ngày ăn: chốt đặt đồ uống.</li>
            <li>• 10 phút: hiệu lực mã thanh toán đồ uống.</li>
          </ul>
        </div>
      </div>

      <ClassChat />
    </div>
  );
};

export default Guide;
