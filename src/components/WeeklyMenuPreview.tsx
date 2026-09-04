import { CalendarDays, Utensils } from 'lucide-react';
import { MenuItem } from '../store/foodStore';

const WEEK_DAYS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 0, label: 'Chủ nhật' },
];

const WeeklyMenuPreview = ({ menu, title = 'Thực đơn cả tuần' }: { menu: MenuItem[]; title?: string }) => {
  const mainMenu = menu.filter((item) => item.category === 'MAIN');

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
              <CalendarDays size={16} strokeWidth={2.5} />
            </span>
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Luôn hiển thị lịch món từ thứ 2 đến Chủ nhật.</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">7 ngày trong tuần</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {WEEK_DAYS.map((day) => {
          const dayMeals = mainMenu.filter((item) => item.dayOfWeek === day.value);
          const isWeekend = day.value === 0 || day.value === 6;
          return (
            <div
              key={day.value}
              className={`min-h-36 rounded-2xl border p-4 ${isWeekend ? 'border-amber-100 bg-amber-50/60' : 'border-slate-100 bg-slate-50'}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className={`text-sm font-black ${isWeekend ? 'text-amber-800' : 'text-slate-800'}`}>{day.label}</span>
                {isWeekend && <span className="text-[10px] font-bold uppercase text-amber-600">Cuối tuần</span>}
              </div>
              {dayMeals.length ? (
                <div className="space-y-3">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="space-y-1">
                      <p className="flex items-start gap-1.5 text-sm font-bold leading-snug text-slate-800">
                        <Utensils size={14} className="mt-0.5 shrink-0 text-slate-500" />
                        {meal.name}
                      </p>
                      {meal.mealDetails && (
                        <p className="text-[11px] leading-relaxed text-slate-500">
                          {meal.mealDetails.savory1}; {meal.mealDetails.vegetable}; {meal.mealDetails.soup}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-slate-400">
                  {isWeekend ? 'Chưa cập nhật món cuối tuần.' : 'Chưa cập nhật menu.'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WeeklyMenuPreview;
