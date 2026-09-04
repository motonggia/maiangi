import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useFoodStore } from '../store/foodStore';

const dayNames = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];

const AdminMenu = () => {
  const { menu, setMenu } = useFoodStore();
  const meals = menu.filter((m) => m.category === 'MAIN');

  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [savory1, setSavory1] = useState('');
  const [savory2, setSavory2] = useState('');
  const [vegetable, setVegetable] = useState('');
  const [soup, setSoup] = useState('');

  const startEdit = (id: string) => {
    const meal = meals.find((m) => m.id === id);
    if (!meal) return;
    setEditing(id);
    setName(meal.name);
    setSavory1(meal.mealDetails?.savory1 ?? '');
    setSavory2(meal.mealDetails?.savory2 ?? '');
    setVegetable(meal.mealDetails?.vegetable ?? '');
    setSoup(meal.mealDetails?.soup ?? '');
  };

  const save = (id: string) => {
    setMenu(menu.map((m) => (m.id === id ? {
      ...m,
      name,
      mealDetails: { savory1, savory2, vegetable, rice: 'Cơm trắng', soup },
    } : m)));
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide text-slate-800">Quản lý menu</h1>
        <p className="text-slate-500">Thực đơn cơm từ thứ 2 đến thứ 6, đồng giá 50.000 VNĐ.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {meals.map((meal) => {
          const isEditing = editing === meal.id;
          return (
            <div key={meal.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900">
                  {dayNames[meal.dayOfWeek ?? 0]}
                </span>
                <button onClick={() => startEdit(meal.id)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Pencil size={13} /> Sửa
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Tên món" />
                  <input value={savory1} onChange={(e) => setSavory1(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Món mặn 1" />
                  <input value={savory2} onChange={(e) => setSavory2(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Món mặn 2" />
                  <input value={vegetable} onChange={(e) => setVegetable(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Món rau" />
                  <input value={soup} onChange={(e) => setSoup(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Canh" />
                  <div className="flex gap-2">
                    <button onClick={() => save(meal.id)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Lưu</button>
                    <button onClick={() => setEditing(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-slate-800">{meal.name}</h2>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Mặn 1: {meal.mealDetails?.savory1}</p>
                    <p>Mặn 2: {meal.mealDetails?.savory2}</p>
                    <p>Rau: {meal.mealDetails?.vegetable}</p>
                    <p>Canh: {meal.mealDetails?.soup}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMenu;
