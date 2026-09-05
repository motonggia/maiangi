import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import ClassChat from '../components/ClassChat';

const faqs = [
  {
    q: 'Làm sao để đặt suất ăn trưa?',
    a: 'Đăng nhập vào tài khoản, vào mục MENU, chọn lượng cơm ÍT / VỪA / NHIỀU rồi bấm nút ĐẶT HÀNG. Suất ăn sẽ được ghi nhận cho ngày hôm sau.',
  },
  {
    q: 'Hạn chốt đặt suất ăn là khi nào?',
    a: 'Bạn cần đặt trước 20:00 tối hôm trước (T-1). Sau giờ này hệ thống sẽ khóa đặt hàng cho ngày mai.',
  },
  {
    q: 'Có thể hủy suất ăn sau 20h không?',
    a: 'Không. Sau 20:00 bạn không tự hủy được. Nếu cần hủy, hãy liên hệ Admin để hỗ trợ, lý do hủy sẽ được ghi lại trong báo cáo.',
  },
  {
    q: 'Giá suất cơm là bao nhiêu?',
    a: 'Thanh toán:\n\n- Đồ ăn chính học sinh không phải thanh toán.\n- Đồ uống phụ học sinh thanh toán online. Mức giá: 10.000 VNĐ và 20.000 VNĐ',
  },
  {
    q: 'Học sinh nghỉ ốm thì sao?',
    a: 'Nếu học sinh nghỉ ốm hoặc không ăn, bạn chỉ cần không chọn món. Không chọn món nghĩa là không có suất ăn và không tính tiền.',
  },
  {
    q: 'Đặt đồ uống như thế nào?',
    a: 'Vào mục ĐỒ UỐNG, chọn loại nước bạn muốn, bấm Đặt. Hệ thống sẽ tạo mã thanh toán (QR) để bạn thanh toán online.',
  },
  {
    q: 'Mã thanh toán đồ uống có hiệu lực bao lâu?',
    a: 'Mã có hiệu lực 10 phút. Nếu không thanh toán kịp, phần đồ uống sẽ tự động bị hủy, riêng suất ăn chính vẫn được giữ nguyên.',
  },
  {
    q: 'Đồ uống có những mức giá nào?',
    a: 'Đồ uống có 2 mức giá: 10.000 VNĐ và 20.000 VNĐ. Số lượng đặt không giới hạn.',
  },
  {
    q: 'Khi nào khóa đặt đồ uống?',
    a: 'Hệ thống khóa đặt đồ uống lúc 10:00 sáng của ngày ăn. Trước giờ đó bạn vẫn có thể đặt thêm.',
  },
  {
    q: 'Bình chọn món ngon có ích lợi gì?',
    a: 'Mỗi ngày bạn bình chọn 1 lần cho món yêu thích. Món có nhiều lượt chọn sẽ xếp hạng cao. Bình chọn xong bạn nhận 1 lượt quay may mắn để nhận quà.',
  },
];

const FaqItem = ({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) => {
  return (
    <div className={cn('rounded-2xl border bg-white shadow-sm transition-colors', open ? 'border-slate-200' : 'border-slate-100')}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-800">{q}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180 text-slate-900')}
        />
      </button>
      {open && (
        <div className="whitespace-pre-line border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600">{a}</div>
      )}
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const column1 = faqs.slice(0, 5);
  const column2 = faqs.slice(5);
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-wide text-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
            <HelpCircle size={20} strokeWidth={2.5} />
          </span>
          HỎI ĐÁP
        </h1>
        <p className="mt-2 text-slate-500">Những câu hỏi thường gặp về đặt suất ăn, đồ uống và bình chọn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {column1.map((item, index) => (
            <FaqItem
              key={item.q}
              {...item}
              open={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
        <div className="space-y-3">
          {column2.map((item, index) => (
            <FaqItem
              key={item.q}
              {...item}
              open={openIndex === index + 5}
              onToggle={() => toggle(index + 5)}
            />
          ))}
        </div>
      </div>

      <ClassChat />
    </div>
  );
};

export default Faq;
