import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
const todayKey = toDateKey(new Date());
const yesterdayKey = toDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
const twoDaysAgoKey = toDateKey(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
const tomorrowKey = toDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));

export const SCHOOL_NAME = 'Trường THPT Chuyên Chu Văn An - Hà Nội';
export const DEFAULT_CLASS_NAME = '10 Tin';

export interface MenuItem {
  id: string;
  name: string;
  category: 'MAIN' | 'DRINK';
  price: number;
  options?: string[];
  availableDate?: string; // YYYY-MM-DD
  dayOfWeek?: number; // 1 = Monday, 5 = Friday
  mealDetails?: {
    savory1: string;
    savory2: string;
    vegetable: string;
    rice: string;
    soup: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  mainDishId: string | null;
  mainDishOption: string | null;
  drinks: {
    id: string;
    drinkId: string;
    quantity: number;
    price: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    qrExpiresAt: string;
  }[];
  status: 'ORDERED' | 'CANCELLED';
  cancelledBy: 'ADMIN' | 'USER';
  cancelReason?: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  studentId: string;
  menuItemId: string;
  date: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  classId: string;
  text: string;
  createdAt: string;
}

export interface SpinResult {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  prize: string;
  createdAt: string;
}

interface FoodStore {
  menu: MenuItem[];
  orders: Order[];
  votes: Vote[];
  messages: ChatMessage[];
  spinResults: SpinResult[];
  users: any[]; // Mock all users for Admin
  schools: { id: string; name: string; classes: { id: string; name: string }[] }[];
  
  setMenu: (menu: MenuItem[]) => void;
  setOrders: (orders: Order[]) => void;
  setVotes: (votes: Vote[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSpinResults: (spinResults: SpinResult[]) => void;
  setUsers: (users: any[]) => void;
  
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addVote: (vote: Vote) => void;
  addMessage: (message: ChatMessage) => void;
  addSpinResult: (spinResult: SpinResult) => void;
  addUser: (user: any) => void;
  deleteOrder: (orderId: string) => void;
  updateUser: (userId: string, updates: any) => void;
}

export const useFoodStore = create<FoodStore>()(
  persist(
    (set) => ({
      menu: [
        {
          id: 'rice-mon',
          name: 'Cơm gà sốt mật ong',
          category: 'MAIN',
          price: 50000,
          options: ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'],
          dayOfWeek: 1,
          mealDetails: {
            savory1: 'Gà sốt mật ong',
            savory2: 'Trứng chiên thịt bằm',
            vegetable: 'Bắp cải xào cà rốt',
            rice: 'Cơm trắng',
            soup: 'Canh bí đỏ thịt bằm',
          },
        },
        {
          id: 'rice-tue',
          name: 'Cơm thịt kho trứng cút',
          category: 'MAIN',
          price: 50000,
          options: ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'],
          dayOfWeek: 2,
          mealDetails: {
            savory1: 'Thịt kho trứng cút',
            savory2: 'Chả cá chiên',
            vegetable: 'Rau muống xào tỏi',
            rice: 'Cơm trắng',
            soup: 'Canh cải ngọt nấu tôm',
          },
        },
        {
          id: 'rice-wed',
          name: 'Cơm cá sốt cà chua',
          category: 'MAIN',
          price: 50000,
          options: ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'],
          dayOfWeek: 3,
          mealDetails: {
            savory1: 'Cá phi lê sốt cà chua',
            savory2: 'Đậu hũ nhồi thịt',
            vegetable: 'Đậu que xào cà rốt',
            rice: 'Cơm trắng',
            soup: 'Canh chua rau củ',
          },
        },
        {
          id: 'rice-thu',
          name: 'Cơm bò xào khoai tây',
          category: 'MAIN',
          price: 50000,
          options: ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'],
          dayOfWeek: 4,
          mealDetails: {
            savory1: 'Bò xào khoai tây',
            savory2: 'Xúc xích rim nước tương',
            vegetable: 'Su su xào trứng',
            rice: 'Cơm trắng',
            soup: 'Canh rong biển đậu hũ',
          },
        },
        {
          id: 'rice-fri',
          name: 'Cơm sườn rim mặn ngọt',
          category: 'MAIN',
          price: 50000,
          options: ['Cơm ít', 'Cơm vừa', 'Cơm nhiều'],
          dayOfWeek: 5,
          mealDetails: {
            savory1: 'Sườn rim mặn ngọt',
            savory2: 'Chả trứng hấp',
            vegetable: 'Cải thìa xào dầu hào',
            rice: 'Cơm trắng',
            soup: 'Canh khoai mỡ thịt bằm',
          },
        },
        { id: 'drink-10', name: 'Nước uống 10k', category: 'DRINK', price: 10000 },
        { id: 'drink-20', name: 'Nước uống 20k', category: 'DRINK', price: 20000 },
      ],
      orders: [
        {
          id: 'sample-order-1',
          userId: 'u1',
          studentId: 'u1',
          date: todayKey,
          mainDishId: 'rice-mon',
          mainDishOption: 'Cơm vừa',
          drinks: [
            { id: 'sample-drink-1', drinkId: 'drink-10', quantity: 2, price: 10000, status: 'PAID', qrExpiresAt: new Date().toISOString() },
          ],
          status: 'ORDERED',
          cancelledBy: 'USER',
          createdAt: todayKey,
        },
        {
          id: 'sample-order-2',
          userId: 'u3',
          studentId: 'u3',
          date: todayKey,
          mainDishId: 'rice-mon',
          mainDishOption: 'Cơm ít',
          drinks: [
            { id: 'sample-drink-2', drinkId: 'drink-20', quantity: 1, price: 20000, status: 'PAID', qrExpiresAt: new Date().toISOString() },
          ],
          status: 'ORDERED',
          cancelledBy: 'USER',
          createdAt: todayKey,
        },
        {
          id: 'sample-order-3',
          userId: 'u4',
          studentId: 'u4',
          date: todayKey,
          mainDishId: 'rice-mon',
          mainDishOption: 'Cơm nhiều',
          drinks: [
            { id: 'sample-drink-3', drinkId: 'drink-10', quantity: 1, price: 10000, status: 'CANCELLED', qrExpiresAt: new Date().toISOString() },
          ],
          status: 'CANCELLED',
          cancelledBy: 'ADMIN',
          cancelReason: 'Học sinh nghỉ ốm sau giờ chốt',
          createdAt: todayKey,
        },
        {
          id: 'sample-order-4',
          userId: 'u1',
          studentId: 'u1',
          date: yesterdayKey,
          mainDishId: 'rice-fri',
          mainDishOption: 'Cơm vừa',
          drinks: [
            { id: 'sample-drink-4', drinkId: 'drink-20', quantity: 2, price: 20000, status: 'PAID', qrExpiresAt: new Date().toISOString() },
          ],
          status: 'ORDERED',
          cancelledBy: 'USER',
          createdAt: yesterdayKey,
        },
        {
          id: 'sample-order-5',
          userId: 'u3',
          studentId: 'u3',
          date: twoDaysAgoKey,
          mainDishId: 'rice-thu',
          mainDishOption: 'Cơm nhiều',
          drinks: [],
          status: 'ORDERED',
          cancelledBy: 'USER',
          createdAt: twoDaysAgoKey,
        },
        {
          id: 'sample-order-6',
          userId: 'u1',
          studentId: 'u1',
          date: tomorrowKey,
          mainDishId: 'rice-tue',
          mainDishOption: 'Cơm vừa',
          drinks: [],
          status: 'ORDERED',
          cancelledBy: 'USER',
          createdAt: todayKey,
        },
      ],
      votes: [],
      messages: [
        {
          id: 'message-1',
          senderId: 'u0',
          senderName: 'Quản Trị Viên',
          classId: 'c1',
          text: 'Phụ huynh và học sinh vui lòng đặt suất cơm trước 20h.',
          createdAt: new Date().toISOString(),
        },
      ],
      spinResults: [],
      users: [
        { id: 'u1', fullName: 'Nguyễn Văn A', role: 'STUDENT', schoolId: 's1', classId: 'c1', isApproved: true, parentId: 'u2', createdAt: '2026-08-25T08:30:00+07:00' },
        { id: 'u3', fullName: 'Lê Minh C', role: 'STUDENT', schoolId: 's1', classId: 'c1', isApproved: true, createdAt: '2026-08-26T09:15:00+07:00' },
        { id: 'u4', fullName: 'Phạm Gia Hân', role: 'STUDENT', schoolId: 's1', classId: 'c1', isApproved: true, createdAt: '2026-08-27T10:00:00+07:00' },
        { id: 'u5', fullName: 'Đỗ Bảo Nam', role: 'STUDENT', schoolId: 's1', classId: 'c2', isApproved: true, createdAt: '2026-08-28T10:45:00+07:00' },
        { id: 'u6', fullName: 'Hoàng Mỹ An', role: 'STUDENT', schoolId: 's1', classId: 'c2', isApproved: false, createdAt: '2026-08-29T11:20:00+07:00' },
        { id: 'u2', fullName: 'Trần Thị B', role: 'PARENT', schoolId: 's1', classId: 'c1', isApproved: true, studentId: 'u1', createdAt: '2026-08-25T08:45:00+07:00' },
        { id: 'u7', fullName: 'Ngô Văn Hòa', role: 'PARENT', schoolId: 's1', classId: 'c2', isApproved: true, studentId: 'u5', createdAt: '2026-08-30T14:10:00+07:00' },
        { id: 'u8', fullName: 'Đào Thị Lan', role: 'PARENT', schoolId: 's1', classId: 'c2', isApproved: false, studentId: 'u6', createdAt: '2026-08-31T15:25:00+07:00' },
      ],
      schools: [
        { 
          id: 's1', 
          name: SCHOOL_NAME, 
          classes: [
            { id: 'c1', name: DEFAULT_CLASS_NAME }, { id: 'c2', name: '10 Anh' }, { id: 'c3', name: '10 Toán' } 
          ] 
        },
        { 
          id: 's2', 
          name: 'Trường THCS Nguyễn Du', 
          classes: [
            { id: 'c4', name: '6A' }, { id: 'c5', name: '6B' }, { id: 'c6', name: '7A' } 
          ] 
        },
      ],
      setMenu: (menu) => set({ menu }),
      setOrders: (orders) => set({ orders }),
      setVotes: (votes) => set({ votes }),
      setMessages: (messages) => set({ messages }),
      setSpinResults: (spinResults) => set({ spinResults }),
      setUsers: (users) => set({ users }),
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrder: (orderId, updates) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, ...updates } : o)
      })),
      addVote: (vote) => set((state) => ({ votes: [...state.votes, vote] })),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      addSpinResult: (spinResult) => set((state) => ({ spinResults: [...(state.spinResults ?? []), spinResult] })),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      deleteOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(o => o.id !== orderId)
      })),
      updateUser: (userId, updates) => set((state) => ({
        users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
      })),
    }),
    {
      name: 'maiangi-online-data-v3',
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<FoodStore>;
        const savedSchools = persistedState.schools ?? current.schools;
        const schools = savedSchools.map((school) => school.id === 's1'
          ? {
              ...school,
              name: SCHOOL_NAME,
              classes: school.classes.map((item) => item.id === 'c1' ? { ...item, name: DEFAULT_CLASS_NAME } : item),
            }
          : school);
        return {
          ...current,
          ...persistedState,
          schools,
        };
      },
    }
  )
);
