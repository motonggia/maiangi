# maiangi.online — Hệ thống đặt cơm trưa học đường

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/maiangi)

> **CHỌN ĐÚNG MÓN – NẤU ĐÚNG Ý**
> Website đặt suất cơm trưa & đồ uống, bình chọn món ngon, vòng quay may mắn, chat lớp, báo cáo tự động qua Telegram.

## 🛠️ Công nghệ

- **React 19 + Vite 7 + TypeScript**
- **Tailwind CSS 4** (font Montserrat)
- **Zustand** (lưu trữ local — đăng nhập & dữ liệu)
- **React Router** (`HashRouter`)
- **Framer Motion**, **date-fns**, **Lucide Icons**
- **vite-plugin-singlefile** (build ra 1 file dist/index.html)

## 🚀 Chạy local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tạo thư mục dist/
```

## 📦 Cấu trúc

```
public/
  HUONG-DAN-SU-DUNG.txt      # file hướng dẫn tải về
  MAIANGI-TINH-NANG.md       # tài liệu tính năng
src/
  components/  TopBar, Sidebar, Logo, ClassChat, TelegramAutoSender
  pages/       Login/Register, StudentOrder, StudentDrinks, StudentVote,
               Faq, Guide, MyReport, ParentOrder, Admin*
  store/       authStore, foodStore, telegramStore
vercel.json                  # cấu hình deploy Vercel
.github/workflows/deploy.yml # CI tự build GitHub Pages
```

## ☁️ Deploy lên Vercel (khuyên dùng) + gắn tên miền

1. **Đăng ký Vercel** tại https://vercel.com (đăng nhập bằng GitHub).
2. Bấm **Add New → Project** → chọn repo này → **Import**.
3. Vercel tự nhận Vite: Build `npm run build`, Output `dist`. Bấm **Deploy**.
4. Sau ~1 phút site chạy tại `https://<ten>.vercel.app`.
5. **Gắn tên miền:**
   - Vào **Settings → Domains → Add Domain** → nhập `maiangi.online`.
   - Vercel đưa ra DNS (A record `76.76.21.21` hoặc NS).
   - Tại nơi mua tên miền, cập nhật DNS theo hướng dẫn Vercel.
   - Vercel tự cấp **HTTPS**.

> Mẹo: bấm nút **Deploy to Vercel** trong README để deploy nhanh bằng tài khoản GitHub.

## 🐙 Deploy lên GitHub Pages + tên miền

Dự án đã có sẵn workflow `.github/workflows/deploy.yml`. Cách dùng:

1. Tạo repo trên GitHub (Public) và push code:
   ```bash
   git init
   git add .
   git commit -m "maiangi online"
   git branch -M main
   git remote add origin https://github.com/<USER>/<REPO>.git
   git push -u origin main
   ```
2. Vào **Settings → Pages → Source: GitHub Actions**. Workflow sẽ tự build & deploy.
3. Site chạy tại `https://<USER>.github.io/<REPO>/`.
4. **Gắn tên miền:** Settings → Pages → **Custom domain** → nhập `maiangi.online`.
   GitHub tạo file `CNAME`. Tạo DNS tại nhà cung cấp tên miền:
   - 4 bản ghi **A**: `185.199.108.153`, `.109`, `.110`, `.111`
   - 1 bản ghi **CNAME** `www` → `<USER>.github.io`
5. **Bật HTTPS** trong Settings → Pages.

> ⚠️ Vì app dùng `HashRouter`, URL dạng `maiangi.online/#/login` — hoạt động ổn định
> trên mọi hosting tĩnh, không bị lỗi 404 khi truy cập trực tiếp vào đường dẫn con.

## 📄 File hướng dẫn cho người dùng

- `HUONG-DAN-SU-DUNG.txt` — tải từ trang `/huong-dan` hoặc đường dẫn `/HUONG-DAN-SU-DUNG.txt`.
- `MAIANGI-TINH-NANG.md` — tài liệu đầy đủ tính năng.

## 🔑 Cấu hình Telegram (Admin → Báo cáo Telegram)

- Nhập **Bot Token** (tạo từ @BotFather) và **Chat ID**.
- Bật hoặc tắt từng loại báo cáo: **ngày**, **tuần** và **2 tuần**.
- Chọn giờ gửi. Mặc định: báo cáo ngày sau 20:00, báo cáo tuần vào Chủ nhật sau 20:00, báo cáo 2 tuần sau 20:00 vào ngày kết thúc kỳ.
- Chọn **ngày bắt đầu chu kỳ 14 ngày**. Kỳ thanh toán gồm ngày bắt đầu và 13 ngày tiếp theo.
- Xem trước nội dung và gửi thủ công để kiểm tra.

### Cách vận hành trên VPS

Phương án hiện tại chạy ở trình duyệt. VPS cần duy trì Chrome/Chromium mở website, đăng nhập tài khoản quản trị và để trang hoạt động liên tục. Bộ gửi kiểm tra mỗi 60 giây, lưu nhật ký kỳ đã gửi trong trình duyệt và có thể gửi bù khi trang được mở lại sau giờ dự kiến.

Nếu trình duyệt bị đóng, bị đăng xuất, mất dữ liệu localStorage hoặc VPS khởi động lại mà chưa mở lại trang, lần gửi tương ứng có thể bị bỏ lỡ. Bot Token hiện được lưu trong cấu hình trình duyệt; không dùng chung trình duyệt này cho người không được phép.

---

© maiangi.online — Ăn ngon, khỏe mạnh mỗi ngày.
