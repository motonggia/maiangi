import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, UserRole } from '../store/authStore';
import { useFoodStore } from '../store/foodStore';
import { supabase, usernameEmail } from '../lib/supabase';
import { BookOpen, User, Lock, Phone, School, GraduationCap, UserCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { Link, useNavigate } from 'react-router-dom';

const studentSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên quá ngắn'),
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  phone1: z.string().regex(/^\d{10}$/, 'SĐT phải có 10 chữ số'),
  phone2: z.string().regex(/^\d{10}$/, 'SĐT phụ huynh phải có 10 chữ số'),
  schoolId: z.string().min(1, 'Vui lòng chọn trường'),
  classId: z.string().min(1, 'Vui lòng chọn lớp'),
});

const parentSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên quá ngắn'),
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  phone1: z.string().regex(/^\d{10}$/, 'SĐT phải có 10 chữ số'),
  phone2: z.string().regex(/^\d{10}$/, 'SĐT của con phải có 10 chữ số'),
  childName: z.string().min(2, 'Vui lòng nhập tên con'),
  schoolId: z.string().min(1, 'Vui lòng chọn trường'),
  classId: z.string().min(1, 'Vui lòng chọn lớp'),
});

const LoginRegister = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<'login' | 'register-student' | 'register-parent'>('login');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = React.useState(false);
  
  const { schools, users, addUser } = useFoodStore();

  const [selectedSchool, setSelectedSchool] = React.useState<string>('');

  const loginForm = useForm({
    defaultValues: { username: '', password: '' }
  });

  const studentForm = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { fullName: '', username: '', password: '', phone1: '', phone2: '', schoolId: '', classId: '' }
  });

  const parentForm = useForm({
    resolver: zodResolver(parentSchema),
    defaultValues: { fullName: '', username: '', password: '', phone1: '', phone2: '', childName: '', schoolId: '', classId: '' }
  });

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    if (supabase) {
      const loginEmail = data.username.trim().toLowerCase() === 'motonggia'
        ? 'motonggia@maiangi.local'
        : usernameEmail(data.username);
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: data.password,
      });
      if (error || !authData.user) {
        alert('Tên đăng nhập hoặc mật khẩu không đúng.');
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
      if (profileError || !profile) {
        alert('Không tìm thấy hồ sơ tài khoản.');
        setIsLoading(false);
        return;
      }
      if (profile.role !== 'ADMIN' && profile.approval_status !== 'APPROVED') {
        await supabase.auth.signOut();
        alert(profile.approval_status === 'REJECTED' ? 'Tài khoản không được duyệt.' : 'Tài khoản đang chờ Admin duyệt.');
        setIsLoading(false);
        return;
      }
      login({
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        phone1: profile.phone1,
        phone2: profile.phone2 ?? '',
        schoolId: profile.school_id,
        classId: profile.class_id,
        isApproved: profile.approval_status === 'APPROVED',
        studentId: profile.student_id ?? undefined,
        parentId: profile.parent_id ?? undefined,
      });
      setIsLoading(false);
      navigate('/');
      return;
    }
    // Mocking login logic
    setTimeout(() => {
      // Tài khoản demo để trải nghiệm nhanh: admin, student, parent.
      let mockUser: any;
      if (data.username === 'motonggia' && data.password === 'm0thaibA123') {
        mockUser = {
          id: 'u0',
          username: 'motonggia',
          fullName: 'Quản Trị Viên',
          role: 'ADMIN',
          phone1: '0123456789',
          phone2: '0987654321',
          schoolId: 's1',
          classId: 'c1',
          isApproved: true,
        };
      } else if (data.username === 'student') {
        mockUser = {
          id: 'u1',
          username: 'student',
          fullName: 'Nguyễn Văn A',
          role: 'STUDENT',
          phone1: '0900111222',
          phone2: '0900333444',
          schoolId: 's1',
          classId: 'c1',
          isApproved: true,
          parentId: 'u2',
        };
      } else if (data.username === 'parent') {
        mockUser = {
          id: 'u2',
          username: 'parent',
          fullName: 'Trần Thị B',
          role: 'PARENT',
          phone1: '0900333444',
          phone2: '0900111222',
          schoolId: 's1',
          classId: 'c1',
          isApproved: true,
          studentId: 'u1',
        };
      } else {
        const registeredUser = users.find(
          (user) => user.username?.toLowerCase() === data.username.trim().toLowerCase() && user.password === data.password,
        );
        if (registeredUser) {
          mockUser = registeredUser;
        } else {
          alert('Thông tin đăng nhập không đúng. Tài khoản quản trị là motonggia với mật khẩu đã cấu hình trong hệ thống.');
          setIsLoading(false);
          return;
        }
      }
      
      login(mockUser);
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  const handleRegister = async (data: any, role: UserRole) => {
    setIsLoading(true);
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email: usernameEmail(data.username),
        password: data.password,
        options: {
          data: {
            username: data.username.trim(), full_name: data.fullName.trim(), role,
            phone1: data.phone1, phone2: data.phone2, school_id: data.schoolId,
            class_id: data.classId, child_name: data.childName?.trim(),
          },
        },
      });
      if (error) {
        alert(error.message.includes('already registered') ? 'Tên đăng nhập đã tồn tại.' : `Đăng ký không thành công: ${error.message}`);
        setIsLoading(false);
        return;
      }
      const roleLabel = role === 'STUDENT' ? 'Học sinh' : 'Phụ huynh';
      alert(`Đăng ký thành công với vai trò ${roleLabel}!\n\nTài khoản đang chờ Admin duyệt.`);
      setIsLoading(false);
      setMode('login');
      return;
    }
    setTimeout(() => {
      const username = data.username.trim();
      const isDuplicate = users.some((user) => user.username?.toLowerCase() === username.toLowerCase());
      if (isDuplicate) {
        alert('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: `registered-${Date.now()}`,
        username,
        password: data.password,
        fullName: data.fullName.trim(),
        role,
        phone1: data.phone1,
        phone2: data.phone2,
        schoolId: data.schoolId,
        classId: data.classId,
        isApproved: false,
        approvalStatus: 'PENDING',
        ...(role === 'PARENT' ? { childName: data.childName.trim() } : {}),
      };
      addUser(newUser);
      const roleLabel = role === 'STUDENT' ? 'Học sinh' : 'Phụ huynh';
      alert(`Đăng ký thành công với vai trò ${roleLabel}! \n\nTài khoản của bạn đang chờ Admin duyệt. Vui lòng quay lại sau khi được phê duyệt.`);
      setIsLoading(false);
      setMode('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-gray-500 font-medium">Hệ thống đặt cơm trưa thông minh cho trường học</p>
          <Link
            to="/huong-dan"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            <BookOpen size={16} />
            Xem hướng dẫn sử dụng
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white p-8 rounded-[28px] border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Đăng Nhập
              </h2>
              
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      {...loginForm.register('username')} 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-200 outline-none transition-all"
                      placeholder="Nhập username..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...loginForm.register('password')} 
                      className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-200 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowLoginPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full tracking-wide transition-all duration-200 flex items-center justify-center gap-2 group"
                  type="submit"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Đăng Nhập
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm mb-4">Bạn chưa có tài khoản?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setMode('register-student')}
                    className="py-3 px-4 bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus size={16} />
                    Học Sinh
                  </button>
                  <button 
                    onClick={() => setMode('register-parent')}
                    className="py-3 px-4 bg-white border border-slate-200 text-slate-900 hover:border-slate-900 font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserCheck size={16} />
                    Phụ Huynh
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {(mode === 'register-student' || mode === 'register-parent') && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-[28px] border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'register-student' ? 'Đăng Ký Học Sinh' : 'Đăng Ký Phụ Huynh'}
                </h2>
                <button 
                  onClick={() => setMode('login')}
                  className="text-sm text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Quay lại Đăng nhập
                </button>
              </div>

              <form 
                onSubmit={mode === 'register-student' 
                  ? studentForm.handleSubmit((data) => handleRegister(data, 'STUDENT')) 
                  : parentForm.handleSubmit((data) => handleRegister(data, 'PARENT'))} 
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        {...mode === 'register-student' ? studentForm.register('fullName') : parentForm.register('fullName')} 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-200 outline-none transition-all"
                        placeholder="Nguyễn Văn A..."
                      />
                      {mode === 'register-student' ? studentForm.formState.errors.fullName?.message : parentForm.formState.errors.fullName?.message}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập</label>
                    <div className="relative">
                      <input 
                        {...mode === 'register-student' ? studentForm.register('username') : parentForm.register('username')} 
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-200 outline-none transition-all"
                        placeholder="username123..."
                      />
                      {mode === 'register-student' ? studentForm.formState.errors.username?.message : parentForm.formState.errors.username?.message}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...mode === 'register-student' ? studentForm.register('password') : parentForm.register('password')} 
                      className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                      placeholder="••••••••"
                      />
                    <button type="button" aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowRegisterPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700">
                      {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {mode === 'register-student' ? studentForm.formState.errors.password?.message : parentForm.formState.errors.password?.message}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {mode === 'register-student' ? 'SĐT 1 (Bản thân)' : 'SĐT 1 (Phụ huynh)'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        {...mode === 'register-student' ? studentForm.register('phone1') : parentForm.register('phone1')} 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        placeholder="09xxxxxxx"
                        />
                      {mode === 'register-student' ? studentForm.formState.errors.phone1?.message : parentForm.formState.errors.phone1?.message}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {mode === 'register-student' ? 'SĐT 2 (Phụ huynh)' : 'SĐT 2 (SĐT của con)'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        {...mode === 'register-student' ? studentForm.register('phone2') : parentForm.register('phone2')} 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        placeholder="09xxxxxxx"
                        />
                      {mode === 'register-student' ? studentForm.formState.errors.phone2?.message : parentForm.formState.errors.phone2?.message}
                    </div>
                  </div>
                </div>

                {mode === 'register-parent' && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên con</label>
                    <div className="relative">
                      <input 
                        {...parentForm.register('childName')} 
                        className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                        placeholder="Nhập tên con..."
                        />
                      {parentForm.formState.errors.childName?.message}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Trường</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      {...mode === 'register-student' 
                        ? studentForm.register('schoolId') 
                        : parentForm.register('schoolId')} 
                      onChange={(e) => {
                        setSelectedSchool(e.target.value);
                        if (mode === 'register-student') {
                          studentForm.setValue('schoolId', e.target.value);
                        } else {
                          parentForm.setValue('schoolId', e.target.value);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none"
                    >
                      <option value="">-- Chọn trường --</option>
                      {schools.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {mode === 'register-student' ? studentForm.formState.errors.schoolId?.message : parentForm.formState.errors.schoolId?.message}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Lớp</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      {...mode === 'register-student' 
                        ? studentForm.register('classId') 
                        : parentForm.register('classId')} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (mode === 'register-student') {
                          studentForm.setValue('classId', val);
                        } else {
                          parentForm.setValue('classId', val);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none"
                      >
                      <option value="">-- Chọn lớp --</option>
                      {selectedSchool && schools.find((s: any) => s.id === selectedSchool)?.classes.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {mode === 'register-student' ? studentForm.formState.errors.classId?.message : parentForm.formState.errors.classId?.message}
                  </div>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-6"
                  type="submit"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Đăng Ký
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  Đã có tài khoản? <span 
                    className="text-slate-900 font-bold cursor-pointer hover:underline"
                    onClick={() => setMode('login')}
                  >
                    Đăng nhập ngay
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginRegister;
