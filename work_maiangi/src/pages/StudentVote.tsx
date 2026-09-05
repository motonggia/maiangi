import { useEffect, useMemo, useRef, useState } from 'react';
import { Gift, RotateCw, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFoodStore } from '../store/foodStore';
import ClassChat from '../components/ClassChat';

const prizes = [
  'Miễn phí nước 10k',
  'Giảm 10k suất cơm',
  'Thêm topping theo ngày',
  'Phiếu may mắn tuần',
  'Miễn phí nước 20k',
  'Ưu tiên nhận suất ăn',
  'Quà nhỏ từ căn tin',
  'Chúc bạn may mắn lần sau',
];

const prizeLabels = ['Nước 10k', 'Giảm 10k', 'Topping', 'Phiếu tuần', 'Nước 20k', 'Ưu tiên', 'Quà nhỏ', 'Lần sau'];
const segmentColors = ['#0a0a0a', '#f4f4f5', '#e4e4e7', '#ffffff', '#18181b', '#e4e4e7', '#f4f4f5', '#27272a'];

const StudentVote = () => {
  const { user } = useAuthStore();
  const { menu, votes, spinResults, addVote, addSpinResult } = useFoodStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [latestPrize, setLatestPrize] = useState<string | null>(null);
  const [pendingSpin, setPendingSpin] = useState(false);
  const wheelSectionRef = useRef<HTMLElement | null>(null);

  const meals = menu.filter((item) => item.category === 'MAIN');
  const safeSpinResults = spinResults ?? [];
  const myVoteToday = votes.find((vote) => vote.studentId === user?.id && vote.date === today);
  const mySpinToday = safeSpinResults.find((spin) => spin.studentId === user?.id && spin.date === today);
  const canSpin = pendingSpin && !mySpinToday;

  useEffect(() => {
    setPendingSpin(!!myVoteToday && !mySpinToday);
  }, [myVoteToday, mySpinToday]);

  const spinWheel = (studentId: string, baseRotation: number) => {
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentSize = 360 / prizes.length;
    const targetRotation = baseRotation + 360 * 10 + (360 - (prizeIndex * segmentSize + segmentSize / 2));

    setIsSpinning(true);
    setRotation(targetRotation);

    window.setTimeout(() => {
      const prize = prizes[prizeIndex];
      addSpinResult({
        id: `spin-${Date.now()}`,
        studentId,
        date: today,
        prize,
        createdAt: new Date().toISOString(),
      });
      setLatestPrize(prize);
      setPendingSpin(false);
      setIsSpinning(false);
    }, 10000);
  };

  const handleVote = (menuItemId: string) => {
    if (!user) return;
    if (myVoteToday) {
      alert('Hôm nay bạn đã bình chọn rồi.');
      return;
    }
    addVote({ id: `vote-${Date.now()}`, studentId: user.id, menuItemId, date: today });
    setPendingSpin(true);
    setLatestPrize(null);
    wheelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => spinWheel(user.id, rotation), 450);
  };

  const handleSpin = () => {
    if (!user || !canSpin || isSpinning) return;
    spinWheel(user.id, rotation);
  };

  const topMeals = meals
    .map((meal) => ({
      ...meal,
      count: votes.filter((vote) => vote.menuItemId === meal.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const wheelGradient = useMemo(() => {
    const segmentSize = 100 / prizes.length;
    return `conic-gradient(${prizes
      .map((_, index) => {
        const start = index * segmentSize;
        const end = (index + 1) * segmentSize;
        return `${segmentColors[index]} ${start}% ${end}%`;
      })
      .join(', ')})`;
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">BÌNH CHỌN</h1>
        <p className="text-slate-500">
          Mỗi học sinh bình chọn 1 lần mỗi ngày. Bình chọn thành công sẽ nhận 1 lượt quay may mắn.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {meals.map((meal) => {
          const voteCount = votes.filter((vote) => vote.menuItemId === meal.id).length;
          return (
            <motion.div
              key={meal.id}
              whileHover={{ y: -3 }}
              className="flex items-center justify-between gap-4 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200"
            >
              <div className="min-w-0">
                <h2 className="font-bold text-slate-800">{meal.name}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">{meal.mealDetails?.savory1}; {meal.mealDetails?.savory2}</p>
                <span className="mt-2 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  {voteCount} lượt
                </span>
              </div>
              <button
                onClick={() => handleVote(meal.id)}
                disabled={!!myVoteToday}
                className="shrink-0 rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 disabled:bg-slate-300"
              >
                {myVoteToday?.menuItemId === meal.id ? 'Đã bình chọn' : 'Bình chọn'}
              </button>
            </motion.div>
          );
        })}
      </div>

      <section ref={wheelSectionRef} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Trophy size={18} className="text-slate-900" />
            Top 5 món ngon nhất tuần
          </h2>
          <div className="space-y-3">
            {topMeals.map((meal, index) => (
              <div key={meal.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">{index + 1}. {meal.name}</span>
                <span className="font-bold text-slate-900">{meal.count} lượt</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 lg:order-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
                  <Gift size={16} strokeWidth={2.5} />
                </span>
                Vòng quay may mắn
              </h2>
              <p className="mt-1 text-sm text-slate-500">Có 1 lượt quay sau mỗi lần bình chọn thành công.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              Lượt quay: {canSpin ? 1 : 0}
            </span>
          </div>

          <div className="grid items-center gap-6">
            <div className="relative mx-auto h-72 w-72">
              <div className="absolute left-1/2 top-[-10px] z-20 flex -translate-x-1/2 flex-col items-center">
                <span className="mb-1 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Kim chỉ</span>
                <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-slate-900 drop-shadow" />
              </div>
              <motion.div
                animate={isSpinning ? { scale: [1, 1.04, 1], boxShadow: ['0 0 0 0 rgba(249,115,22,0)', '0 0 0 14px rgba(249,115,22,0.12)', '0 0 0 0 rgba(249,115,22,0)'] } : { scale: 1 }}
                transition={{ duration: 1.4, repeat: isSpinning ? Infinity : 0 }}
                className="absolute inset-3 rounded-full bg-slate-50"
              />
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 10, ease: [0.05, 0.9, 0.08, 1] }}
                className="absolute inset-3 rounded-full border-4 border-slate-900 shadow-sm"
                style={{ background: wheelGradient }}
              >
                <div className="absolute inset-0 rounded-full border-[10px] border-white/70" />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
                {prizeLabels.map((label, index) => {
                  const angle = index * (360 / prizeLabels.length) + 360 / prizeLabels.length / 2;
                  const isDarkSegment = index === 0 || index === 4;
                  return (
                    <span
                      key={label}
                      className={`absolute left-1/2 top-1/2 w-20 origin-center -translate-x-1/2 -translate-y-1/2 text-center text-[10px] font-black leading-tight ${isDarkSegment ? 'text-white' : 'text-slate-900'}`}
                      style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-86px) rotate(90deg)` }}
                    >
                      {label}
                    </span>
                  );
                })}
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleSpin}
                  disabled={!canSpin || isSpinning}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-white bg-slate-900 text-xs font-bold text-white shadow-xl transition hover:bg-slate-800 disabled:bg-slate-400"
                >
                  <RotateCw size={20} className={isSpinning ? 'animate-spin' : ''} />
                  Quay
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Trạng thái</p>
                <p className="mt-1 text-sm text-slate-500">
                  {!myVoteToday && 'Bạn cần bình chọn món trước để mở lượt quay.'}
                  {canSpin && 'Bạn đã có 1 lượt quay. Hãy bấm Quay để nhận thưởng.'}
                  {mySpinToday && `Hôm nay bạn đã quay: ${mySpinToday.prize}.`}
                </p>
              </div>
              {(latestPrize || mySpinToday) && (
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Kết quả trúng thưởng</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">{latestPrize || mySpinToday?.prize}</p>
                </div>
              )}
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="mb-3 text-sm font-bold text-slate-800">Danh sách giải thưởng mẫu</p>
                <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  {prizes.map((prize) => (
                    <span key={prize} className="rounded-xl bg-slate-50 px-3 py-2">{prize}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </aside>
      </section>

      <ClassChat />
    </div>
  );
};

export default StudentVote;