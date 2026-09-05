# MAIANGI.ONLINE — TÀI LIỆU TÍNH NĂNG ĐẦY ĐỦ

> **Hệ thống đặt cơm trưa & đồ uống cho trường học**
> Slogan: **CHỌN ĐÚNG MÓN – NẤU ĐÚNG Ý**

---

## 1. GIỚI THIỆU TỔNG QUAN

Website **maiangi.online** giúp học sinh và phụ huynh đặt suất cơm trưa,
đồ uống, bình chọn món ngon, tham gia vòng quay may mắn, chat lớp và theo dõi
báo cáo. Hệ thống có **3 vai trò**: Học sinh (STUDENT), Phụ huynh (PARENT),
Quản trị viên (ADMIN).

- **Thiết kế:** đơn giản, sang trọng, font **Montserrat**, tông đen/trắng.
- **Logo:** `m` đỏ trong hình tròn + `aiangi` + `.online`.
- **Responsive:** hoạt động tốt trên điện thoại, tablet, máy tính.

---

## 2. TÀI KHOẢN & PHÂN QUYỀN

### 2.1. Đăng ký
- Tạo nick bằng **username + mật khẩu** (không dùng Gmail).
- **2 vai trò riêng** khi đăng ký:
  - **Đăng ký Học sinh** → form học sinh, vai trò cố định.
  - **Đăng ký Phụ huynh** → form phụ huynh, vai trò cố định.
- Trang chủ có 2 nút đăng ký riêng biệt.

### 2.2. Form đăng ký

**Học sinh:**
| Trường | Mô tả |
|---|---|
| Họ và tên | Bắt buộc |
| Tên đăng nhập | Duy nhất |
| Mật khẩu | Tối thiểu 6 ký tự |
| SĐT 1 | Của học sinh, hoặc của phụ huynh nếu không có |
| SĐT 2 | Của phụ huynh |
| Trường | Chọn từ danh sách |
| Lớp | Chọn lớp thuộc trường đã chọn |
| Vai trò | Cố định: Học sinh |

**Phụ huynh:**
| Trường | Mô tả |
|---|---|
| Họ và tên | Bắt buộc |
| Tên đăng nhập | Duy nhất |
| Mật khẩu | Tối thiểu 6 ký tự |
| SĐT 1 | Của phụ huynh |
| SĐT 2 | Của con (hoặc phụ huynh nếu con không có) |
| Tên con | Bắt buộc |
| Trường của con | Chọn từ danh sách |
| Lớp của con | Chọn lớp thuộc trường đã chọn |
| Vai trò | Cố định: Phụ huynh |

### 2.3. Duyệt tài khoản
- **Admin duyệt tay từng tài khoản.**
- Chưa duyệt thì **không dùng được chức năng** (hiện màn hình "Đang chờ duyệt").

### 2.4. Ghi nhớ đăng nhập
- Sau khi đăng nhập/đăng ký: **luôn lưu đăng nhập**, mở lại không cần đăng nhập lại.

---

## 3. LIÊN KẾT HỌC SINH – PHỤ HUYNH

- Khi phụ huynh đăng ký, hệ thống dùng **SĐT của con** để tìm học sinh tương ứng.
- Tìm thấy → **tự gợi ý liên kết** cho Admin.
- Không tìm thấy → **Admin gán thủ công** khi duyệt.
- Mỗi tài khoản phụ huynh chỉ gắn **1 con**.

---

## 4. ĐẶT MÓN CHÍNH (SUẤT ĂN TRƯA)

- Thực đơn do **học sinh bình chọn** (chốt trước 20h), **không cố định**.
- Mỗi suất: **2 món mặn + 1 rau + cơm + canh**.
- **Cơm chọn ÍT / VỪA / NHIỀU** (tránh lãng phí).
- Chỉ **đặt cho ngày hôm sau (T-1)**. Hạn chốt: **20h tối hôm trước**.
- Mỗi học sinh **tối đa 1 suất/ngày**.
- **Không đặt hộ người khác**.
- Menu ngày nào có món gì thì hiển thị món đó (thứ 2 → thứ 6; cuối tuần nghỉ).

### Quy định hủy
- **Trước 20h:** tự hủy được (có hộp thoại xác nhận HUỶ / KHÔNG).
- **Sau 20h:** không thể tự hủy → **Admin hủy**, có ghi **lý do** đưa vào báo cáo.

### Nghỉ ốm / không ăn
- Không chọn món → không có suất ăn → **không tính tiền**.

### Giá & thanh toán
- **Đồng giá 50.000đ/suất.**
- **Không thanh toán online** — tính tiền trên số lượng đặt thực tế,
  thanh toán sau với Admin / nhà trường.

---

## 5. ĐỒ UỐNG

- Có thể **đặt trước đến 10h sáng** ngày ăn.
- **Không giới hạn số lượng**, có thể tăng/giảm số lượng.
- Giá: **10.000đ** hoặc **20.000đ**.
- Khi đặt, hệ thống tạo **mã thanh toán online**.
- Mã có **hiệu lực 10 phút**. Quá 10 phút chưa thanh toán → **đơn đồ uống tự hủy**.
- Ví dụ: đặt lúc 9h55 vẫn đặt được, mã có hiệu lực đến 10h05.
- **10h sáng: khóa đặt hàng** (món chính và đồ uống).

### Lưu ý
- Đồ uống đặt mà **không thanh toán kịp** → chỉ hủy phần đồ uống.
- **Suất ăn chính đã chọn sau 20h vẫn giữ nguyên**, không bị hủy.

---

## 6. BÌNH CHỌN MÓN NGON

- Chỉ **học sinh** được bình chọn.
- Mỗi ngày mỗi học sinh **chọn 1 lần**.
- Bình chọn **bất cứ lúc nào**.
- Hệ thống tổng hợp số lượt: món nhiều lượt xếp **thứ nhất**.
- **Tuần tổng kết 5 món ngon nhất** (Top 5).

---

## 7. VÒNG QUAY MAY MẮN

- Khi bình chọn thành công → nhận **1 lượt quay may mắn**.
- Mục đích: kích thích bình chọn, tạo niềm vui.
- **Vòng quay** có:
  - Chuyển động sinh động (hiệu ứng pulse khi quay).
  - **Phần thưởng nằm trong từng ô** của vòng quay.
  - **Kim chỉ** vào kết quả trúng thưởng.
  - Quay **chậm dần ≈ 10 giây** rồi dừng hẳn.
- Giải thưởng (mẫu, có thể chỉnh sửa): Miễn phí nước 10k, Giảm 10k suất cơm,
  Thêm topping, Phiếu may mắn tuần, Miễn phí nước 20k, Ưu tiên nhận suất ăn,
  Quà nhỏ từ căn tin, Chúc may mắn lần sau.

---

## 8. CHAT LỚP

- **Chat chung theo từng lớp** của trường.
- Học sinh lớp nào vào chat **lớp đó**.
- **Phụ huynh vào chat lớp của con** nhưng **chỉ xem** (không bình luận).
- Nick đã được Admin duyệt → **tự động vào chat**, không cần duyệt thêm.
- **Đăng nhập mới xem được nội dung.**
- **Hỏi đáp – hỗ trợ trực tiếp trong nhóm chat:**
  - Bot hỗ trợ tự động trả lời câu hỏi theo từ khóa.
  - Nút "Trợ giúp" + 5 câu hỏi gợi ý.
  - **HOTLINE 0962.955.189** (nút bấm gọi ngay).

---

## 9. BÁO CÁO

### 9.1. Báo cáo cá nhân (Học sinh & Phụ huynh)
- Theo tháng, hiển thị:
  - **Số lượng suất cơm**.
  - **Số tiền** (tiền cơm, tiền đồ uống, tổng tiền).
  - Bảng chi tiết theo ngày.
- **Học sinh:** xem báo cáo của mình.
- **Phụ huynh:** xem báo cáo của **con**.

### 9.2. Báo cáo Admin (ngày & tháng)
Báo cáo ngày:
- Tổng suất cơm, tiền cơm, tiền đồ uống, tổng tiền.
- Số lượng **Cơm ít / vừa / nhiều**.
- Số nước **10k / 20k**, QR chờ thanh toán, đồ uống hủy.
- Học sinh đã duyệt, **danh sách học sinh không đặt**.
- Đơn bị hủy và **lý do hủy**, lượt quay may mắn.

Báo cáo tháng:
- Tổng suất cơm, tiền cơm, tiền đồ uống, tổng tiền.
- Trung bình suất/ngày, bảng tổng hợp từng ngày.
- **Top món bán chạy**, ghi chú hủy trong tháng.

### 9.3. Báo cáo tự động qua Telegram
- Cấu hình **Bot Token + Chat ID** (lưu lại).
- Bật/tắt **tự động gửi báo cáo ngày** và **2 tuần**.
- **Tự động gửi 100%**: kiểm tra mỗi 60 giây.
  - **Đến 20h** → tự gửi báo cáo ngày.
  - **Mỗi 14 ngày** → tự gửi báo cáo 2 tuần.
- Có nhật ký chống gửi trùng, xem trước nội dung (HTML), nút gửi tay.

Nội dung báo cáo ngày: tổng suất cơm, cơm ít/vừa/nhiều, đồ uống 10k/20k + tiền,
doanh thu, danh sách học sinh không đặt, đơn hủy + lý do.

Nội dung báo cáo 2 tuần: tổng suất cơm, tiền cơm cần thu, tiền đồ uống, tổng thu,
top món bán chạy, ghi chú hủy đơn.

---

## 10. QUẢN TRỊ (ADMIN)

### 10.1. Tổng quan (Dashboard)
Thẻ số liệu: suất cơm hôm nay/ngày mai, tổng suất cơm, doanh thu cơm,
doanh thu đồ uống, tổng doanh thu, số nước đã thanh toán, tài khoản chờ duyệt,
số học sinh/phụ huynh, món trong menu, lượt bình chọn, lượt quay.

### 10.2. Quản lý tài khoản
- Lọc: chờ duyệt / tất cả / học sinh / phụ huynh.
- Nút **Duyệt / Hủy duyệt**.
- Nút **Gán học sinh** cho phụ huynh.

### 10.3. Quản lý menu
- Thực đơn 5 ngày (thứ 2 → thứ 6), đồng giá 50.000đ.
- Chỉnh sửa tên món, 2 món mặn, rau, canh.

### 10.4. Quản lý đơn hàng
- Xem suất ăn ngày mai (có lọc đang hoạt động / đã hủy).
- **Hủy đơn + nhập lý do**, khôi phục đơn.

### 10.5. Báo cáo Telegram
- Cấu hình bot, bật tự động, xem trước và gửi báo cáo.

---

## 11. HỎI ĐÁP & HƯỚNG DẪN

- **HỎI ĐÁP:** 10 câu hỏi thường gặp, chia 2 cột × 5 câu, chỉ mở 1 câu/lần.
- **HƯỚNG DẪN:** trang hướng dẫn đầy đủ + nút tải file `.txt`.
- **File tải về:** `HUONG-DAN-SU-DUNG.txt`.

---

## 12. DANH SÁCH FILE & CÔNG NGHỆ

Công nghệ: React + Vite + TypeScript + Tailwind CSS + Zustand (persist) +
React Router + Framer Motion + date-fns + Lucide Icons.

File chính:
- `src/App.tsx` — định tuyến & bảo vệ vai trò.
- `src/store/authStore.ts` — đăng nhập, vai trò.
- `src/store/foodStore.ts` — menu, đơn hàng, bình chọn, chat, vòng quay, người dùng.
- `src/store/telegramStore.ts` — cấu hình + gửi Telegram tự động.
- `src/components/` — TopBar, Sidebar, Logo, ClassChat, TelegramAutoSender.
- `src/pages/` — Login/Register, StudentOrder, StudentDrinks, StudentVote,
  Faq, Guide, MyReport, ParentOrder, và các trang Admin.

---

*Tài liệu được tổng hợp theo phiên bản hiện tại của maiangi.online.*
