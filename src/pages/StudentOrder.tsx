import { 
  Calendar, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ShoppingBag,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFoodStore, Order } from '../store/foodStore';
import { format, addDays, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import ClassChat from '../components/ClassChat';
import WeeklyMenuPreview from '../components/WeeklyMenuPreview';

const StudentOrder = () => {
  const { user } = useAuthStore();
  const { menu, orders, addOrder, updateOrder } = useFoodStore();
  
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const tomorrowDayOfWeek = addDays(new Date(), 1).getDay();
  
  const tomorrowMenu = menu.filter(item => item.category === 'MAIN' && item.dayOfWeek === tomorrowDayOfWeek);
  const studentOrder = orders.find(o => o.studentId === user?.id && o.date === tomorrow && o.status === 'ORDERED');
  const [draftSelection, setDraftSelection] = useState<{ menuItemId: string; option: string } | null>(null);
  const activeMenuItemId = draftSelection?.menuItemId ?? studentOrder?.mainDishId;
  const activeOption = draftSelection?.option ?? studentOrder?.mainDishOption;
  const selectedMeal = tomorrowMenu.find(m => m.id === activeMenuItemId);

  const handleConfirmOrder = () => {
    if (!draftSelection) {
      alert('Vui lòng chọn lượng cơm trước khi đặt hàng.');
      return;
    }

    if (studentOrder) {
      updateOrder(studentOrder.id, { 
        mainDishId: draftSelection.menuItemId, 
        mainDishOption: draftSelection.option,
      });
    } else {
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        userId: user?.id || '',
        studentId: user?.id || '',
        date: tomorrow,
        mainDishId: draftSelection.menuItemId,
        mainDishOption: draftSelection.option,
        drinks: [],
        status: 'ORDERED',
        cancelledBy: 'USER',
        createdAt: new Date().toISOString(),
      };
      addOrder(newOrder);
    }
    setDraftSelection(null);
  };

  const handleCancelOrder = () => {
    if (!studentOrder) return;

    const now = new Date();
    if (now.getHours() >= 20) {
      alert('Đã sau 20h, bạn không thể tự hủy đơn hàng. Vui lòng liên hệ Admin để hủy.');
      return;
    }

    const confirmCancel = window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');
    if (!confirmCancel) return;
    updateOrder(studentOrder.id, { status: 'CANCELLED', cancelledBy: 'USER' });
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">MENU</h1>
          <p className="text-slate-500">Đặt suất cơm trưa cho ngày mai.</p>
        </div>
        <div className="flex items-center gap-3 bg-white text-slate-700 px-4 py-2 rounded-2xl font-semibold shadow-sm border-2 border-slate-200">
          <Calendar size={20} strokeWidth={2.5} className="text-slate-900" />
          <span>Ngày mai: {format(parseISO(tomorrow), 'dd/MM/yyyy')}</span>
        </div>
      </div>

      <WeeklyMenuPreview menu={menu} />

      {/* Warning & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-4 text-blue-800">
          <div className="w-10 h-10 bg-white border-2 border-blue-400 rounded-xl flex items-center justify-center shrink-0 text-blue-600 shadow-sm">
            <Info size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">Lưu ý đặt món</p>
            <p className="text-xs opacity-80 leading-relaxed">
              Bạn chỉ có thể đặt món cho ngày hôm sau. Hạn chốt đặt món là <b>20:00 tối nay</b>.
            </p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4 text-amber-800">
          <div className="w-10 h-10 bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-sm mb-1">Quy định hủy đơn</p>
            <p className="text-xs opacity-80 leading-relaxed">
              Sau 20:00 tối nay, bạn <b>KHÔNG THỂ</b> tự hủy đơn. Mọi yêu cầu hủy sau giờ này phải thông qua Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                  <Utensils size={16} strokeWidth={2.5} />
                </div>
                Đặt món ngày mai
              </h2>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Chọn lượng cơm trước khi đặt</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tomorrowMenu.length > 0 ? (
              tomorrowMenu.map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "group relative p-5 rounded-3xl border-2 transition-all duration-300",
                    activeMenuItemId === item.id 
                      ? "bg-slate-50 border-slate-200 shadow-lg shadow-slate-100" 
                      : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 group-hover:border-slate-200 group-hover:text-slate-900 transition-all duration-300">
                      <Utensils size={24} strokeWidth={2.5} />
                    </div>
                    {activeMenuItemId === item.id && (
                      <div className="bg-slate-900 text-white p-1 rounded-full shadow-sm">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">2 món mặn, 1 rau, cơm và canh.</p>

                  {item.mealDetails && (
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><span className="text-slate-500">Mặn 1</span><span className="font-semibold text-slate-800 text-right">{item.mealDetails.savory1}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-slate-500">Mặn 2</span><span className="font-semibold text-slate-800 text-right">{item.mealDetails.savory2}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-slate-500">Rau</span><span className="font-semibold text-slate-800 text-right">{item.mealDetails.vegetable}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-slate-500">Canh</span><span className="font-semibold text-slate-800 text-right">{item.mealDetails.soup}</span></div>
                      <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-slate-500">Cơm</span>
                          <p className="font-semibold text-slate-800">{item.mealDetails.rice}</p>
                        </div>
                        {item.options && (
                          <div className="grid grid-cols-3 gap-2 sm:min-w-56">
                            {item.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDraftSelection({ menuItemId: item.id, option: opt });
                                }}
                                className={cn(
                                  "rounded-lg border-2 px-2 py-2 text-xs font-bold transition-all",
                                  activeMenuItemId === item.id && activeOption === opt
                                    ? "border-slate-200 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-200",
                                )}
                              >
                                {opt.replace('Cơm ', '')}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bấm chọn lượng cơm rồi nhấn ĐẶT HÀNG</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <AlertCircle size={32} />
                </div>
                <p className="text-slate-500 font-medium">Chưa có món để đặt cho ngày mai.</p>
                <p className="text-xs text-slate-400 mt-1">Lịch menu cả tuần, kể cả cuối tuần, vẫn được hiển thị ở phía trên.</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                <ShoppingBag size={16} strokeWidth={2.5} />
              </div>
              Xác Nhận Đặt Món
            </h2>

            <div className="space-y-4">
              {selectedMeal ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suất ăn đã chọn</span>
                    <span className="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                      {draftSelection ? 'Chờ đặt hàng' : 'Đã đặt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{selectedMeal?.name || 'Không rõ món'}</p>
                      {activeOption && (
                        <p className="text-xs text-slate-500 italic">Lượng cơm: {activeOption}</p>
                      )}
                    </div>
                  </div>
                  {selectedMeal?.mealDetails && (
                    <div className="rounded-xl bg-white/70 p-3 text-xs text-slate-600 leading-5">
                      {selectedMeal.mealDetails.savory1}; {selectedMeal.mealDetails.savory2}; {selectedMeal.mealDetails.vegetable}; {selectedMeal.mealDetails.soup}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                <ShoppingBag size={32} strokeWidth={2} />
            </div>
                  <div>
                    <p className="text-slate-500 font-medium">Bạn chưa chọn lượng cơm.</p>
                    <p className="text-xs text-slate-400">Hãy chọn Cơm ít, Cơm vừa hoặc Cơm nhiều.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {draftSelection && (
                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-4 px-6 rounded-full bg-slate-900 text-white font-semibold uppercase tracking-[0.12em] hover:bg-slate-800 transition-all duration-200 shadow-sm"
                >
                  ĐẶT HÀNG
                </button>
              )}
              {studentOrder && (
                <button 
                  onClick={handleCancelOrder}
                  className="w-full py-3 px-6 rounded-full border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={17} />
                  Hủy đơn hàng
                </button>
              )}
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <b>Thanh toán ăn chính:</b> Tiền ăn chính được thanh toán sau với Admin hoặc nhà trường. Đồ uống có 2 mức giá: 10.000 VNĐ và 20.000 VNĐ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClassChat />
    </div>
  );
};

export default StudentOrder;
