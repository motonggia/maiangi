# Tài liệu bàn giao dự án Mai Angi – Supabase

**Thời điểm bàn giao:** 05/09/2026 04:30 (GMT+7)  
**Mục đích:** Tài liệu này giúp một AI khác tiếp tục kiểm tra, sửa lỗi hoặc phát triển website Mai Angi mà không cần đọc lại toàn bộ lịch sử trao đổi.

> **Lưu ý bảo mật:** File này chứa thông tin cấu hình và tài khoản dùng cho môi trường dự án. Không đưa file này lên GitHub public, không gửi công khai và không đưa `service_role key` vào frontend.

## 1. Thông tin dự án Supabase

| Hạng mục | Giá trị |
|---|---|
| Project name | `motonggia's Project` |
| Project ref | `dnupvnjyfuxvuklciure` |
| Project URL | `https://dnupvnjyfuxvuklciure.supabase.co` |
| Dashboard | `https://supabase.com/dashboard/project/dnupvnjyfuxvuklciure` |
| Repository | `https://github.com/motonggia/maiangi` |
| Website Vercel | `https://maiangi.vercel.app` |
| Supabase plan | Free / Nano |

### Publishable key đang dùng

Key này được dùng trong frontend qua biến `VITE_SUPABASE_PUBLISHABLE_KEY` hoặc fallback trong `src/lib/supabase.ts`:

```text
sb_publishable_d4PB_lKPb5cweK_FyZYqQQ_dwBZhlAG
```

Đây là **publishable key**, không phải `service_role key`. Tuyệt đối không đặt service role key trong React frontend hoặc commit service role key lên GitHub.

## 2. Mã nguồn hiện tại

Mã nguồn làm việc trong sandbox:

```text
/tmp/website_request
```

Bản ZIP mới nhất đã build và kiểm tra:

```text
/home/ubuntu/maiangi-online-delete-account.zip
```

Bản ZIP này bao gồm:

- React + Vite + TypeScript.
- Kết nối Supabase Auth và Database.
- Đăng ký học sinh/phụ huynh.
- Duyệt / không duyệt tài khoản.
- Gán học sinh cho phụ huynh.
- Icon hiện mật khẩu.
- Nút xóa tài khoản có xác nhận.
- Schema SQL cập nhật RPC xóa tài khoản.

Build đã chạy thành công bằng:

```bash
npm ci --foreground-scripts --no-audit --no-fund
npm run build
```

## 3. Cấu hình đăng nhập và đăng ký

Website giữ giao diện đăng nhập bằng username, nhưng ánh xạ username thành email nội bộ để dùng Supabase Auth.

### Tài khoản mới

Tài khoản mới dùng email nội bộ có domain hợp lệ:

```text
<username>@maiangi.online
```

Ví dụ:

```text
tuanhoang2@maiangi.online
```

Hàm ánh xạ nằm trong:

```text
src/lib/supabase.ts
```

```ts
export const usernameEmail = (username: string) =>
  `${username.trim().toLowerCase()}@maiangi.online`;
```

### Tài khoản Admin hiện tại

Admin cũ được tạo bằng domain `.local`, nên code có xử lý riêng khi đăng nhập username `motonggia`:

```text
Username: motonggia
Password: m0thaibA123
Auth email: motonggia@maiangi.local
```

Không đổi hoặc xóa tài khoản này nếu chưa tạo Admin thay thế.

## 4. Cấu hình Supabase Auth hiện tại

Trong Supabase vào:

```text
Authentication → Sign In / Providers
```

Trạng thái hiện tại:

| Thiết lập | Trạng thái |
|---|---|
| Allow new users to sign up | Bật |
| Email provider | Bật |
| Confirm email | **Đã tắt** |
| Phone provider | Tắt |
| OAuth providers | Tắt |

Tắt `Confirm email` là chủ ý vì website không dùng email thật để xác minh. Nhờ vậy đăng ký liên tục không gọi dịch vụ gửi email mặc định của Supabase và không gặp lỗi `email rate limit exceeded` do giới hạn email Free.

Supabase Free có giới hạn email mặc định khoảng 2 email/giờ. Vì vậy không được bật lại Confirm email nếu website vẫn dùng email nội bộ không có hộp thư thật.

## 5. Database schema

File schema trong mã nguồn:

```text
supabase/schema.sql
```

Các enum:

```sql
create type public.user_role as enum ('STUDENT', 'PARENT', 'ADMIN');
create type public.approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');
```

Bảng chính:

```text
public.profiles
```

Các cột quan trọng:

| Cột | Ý nghĩa |
|---|---|
| `id` | UUID, liên kết `auth.users(id)` |
| `username` | Tên đăng nhập, unique |
| `full_name` | Họ tên |
| `role` | `STUDENT`, `PARENT`, `ADMIN` |
| `phone1`, `phone2` | Số điện thoại |
| `school_id` | ID trường |
| `class_id` | ID lớp |
| `child_name` | Tên con của phụ huynh |
| `student_id` | Liên kết học sinh |
| `parent_id` | Liên kết phụ huynh |
| `approval_status` | `PENDING`, `APPROVED`, `REJECTED` |
| `rejection_reason` | Lý do không duyệt |
| `created_at`, `updated_at` | Thời gian |

## 6. Trigger đăng ký tài khoản

Trigger đang có:

```text
on_auth_user_created
```

Trigger gọi hàm:

```text
public.handle_new_user()
```

Khi người dùng đăng ký qua Supabase Auth, trigger tự tạo dòng tương ứng trong `public.profiles` với:

```text
approval_status = PENDING
```

Tài khoản đăng ký mới sẽ xuất hiện trong Admin ở tab:

```text
Quản lý tài khoản → Chờ duyệt
```

## 7. RLS và quyền Admin

Bảng `public.profiles` đã bật RLS.

Hàm kiểm tra quyền:

```text
public.is_admin()
```

Hàm này kiểm tra người dùng hiện tại có:

```text
role = 'ADMIN'
approval_status = 'APPROVED'
```

Các policy chính:

- Admin được đọc danh sách hồ sơ.
- Người dùng được đọc hồ sơ của chính mình.
- Admin được cập nhật trạng thái duyệt.
- Người dùng đã đăng nhập được tạo hồ sơ của chính mình.

Nếu gặp lại lỗi **“Không tìm thấy hồ sơ tài khoản”**, cần kiểm tra theo thứ tự:

1. Người dùng có tồn tại trong `Authentication → Users` không.
2. Người dùng có dòng tương ứng trong `Table Editor → profiles` không.
3. `profiles.id` có đúng bằng `auth.users.id` không.
4. `approval_status` có đúng giá trị không.
5. RLS policy và hàm `is_admin()` có còn tồn tại không.

## 8. Chức năng xóa tài khoản mới nhất

Đã thêm vào:

```text
src/pages/AdminUsers.tsx
```

Nút hiển thị là:

```text
Xóa
```

Nút này chỉ hiển thị cho tài khoản không phải Admin.

Khi bấm nút, website hiện xác nhận trình duyệt:

```text
Bạn có chắc muốn XÓA tài khoản này không?

Tài khoản Auth và hồ sơ sẽ bị xóa vĩnh viễn.

[Xóa] [Không xóa]
```

Nếu chọn Xóa, frontend gọi:

```ts
supabase.rpc('delete_user_account', {
  target_user_id: user.id,
});
```

### RPC đã tạo trực tiếp trên Supabase

```text
public.delete_user_account(target_user_id uuid)
```

RPC này:

- Chỉ cho Admin đã được duyệt gọi.
- Không cho Admin tự xóa tài khoản đang đăng nhập.
- Xóa khỏi `auth.users`.
- Do foreign key `on delete cascade`, hồ sơ trong `public.profiles` cũng bị xóa.
- Đã cấp quyền execute cho role `authenticated`.
- Đã thu hồi quyền execute khỏi `public`.

SQL đã chạy thành công:

```sql
create or replace function public.delete_user_account(target_user_id uuid)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Chi quan tri vien da duoc duyet moi co quyen xoa tai khoan';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Khong the tu xoa tai khoan quan tri vien dang dang nhap';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated;
```

## 9. Cách thêm Admin mới

1. Vào:
   ```text
   Authentication → Users
   ```
2. Tạo user mới bằng email hợp lệ, ví dụ:
   ```text
   admin2@maiangi.online
   ```
3. Sao chép UUID của user mới.
4. Vào SQL Editor, chạy:

```sql
update public.profiles
set
  username = 'admin2',
  full_name = 'Quan Tri Vien Moi',
  role = 'ADMIN',
  approval_status = 'APPROVED'
where id = 'UUID_CUA_USER_MOI';
```

5. Kiểm tra:

```sql
select id, username, full_name, role, approval_status
from public.profiles
where username = 'admin2';
```

Không cho người dùng tự chọn role `ADMIN` từ form đăng ký. Việc gán Admin phải làm trong Supabase Dashboard hoặc SQL Editor.

## 10. Cách kiểm tra tài khoản học sinh mới

Trong Supabase:

```text
Authentication → Users
```

Kiểm tra email dạng:

```text
username@maiangi.online
```

Sau đó vào:

```text
Table Editor → profiles
```

Cần thấy:

```text
role = STUDENT
approval_status = PENDING
```

Nếu học sinh không xuất hiện trong tab Chờ duyệt, kiểm tra trigger `on_auth_user_created` và metadata gửi từ `LoginRegister.tsx`.

## 11. Việc cần làm tiếp theo nếu AI khác tiếp tục

- Không tạo lại bảng hoặc enum nếu chúng đã tồn tại.
- Không chạy lại lệnh insert Admin cố định vì sẽ gặp lỗi `duplicate key`.
- Trước khi sửa schema, kiểm tra các object hiện có trong Supabase.
- Trước khi sửa code, đọc `src/lib/supabase.ts`, `src/pages/LoginRegister.tsx`, `src/pages/AdminUsers.tsx`, `supabase/schema.sql`.
- Nếu thay đổi frontend, build bằng `npm run build`.
- Khi đóng gói upload GitHub, không đưa `node_modules` vào ZIP.
- Nếu cập nhật schema, chạy SQL trực tiếp trên Supabase và đồng thời cập nhật `supabase/schema.sql` trong repository.
- Sau khi upload GitHub, chờ Vercel deploy từ branch `main`.
- Khi test website sau deploy, dùng `Ctrl + Shift + R` để tránh cache frontend.

## 12. Các lỗi đã gặp và cách xử lý

### `Failed to resolve /src/main.tsx`

Nguyên nhân là repository GitHub thiếu source đầy đủ hoặc upload sai cấu trúc thư mục. ZIP phải giải nén sao cho `package.json`, `index.html`, `src/` nằm ngay thư mục gốc repository.

### `Email address ... .local is invalid`

Không dùng `.local` cho user mới. Code hiện đã đổi sang `@maiangi.online`. Admin cũ vẫn dùng riêng `motonggia@maiangi.local`.

### `email rate limit exceeded`

Do Supabase email mặc định giới hạn thấp. Đã tắt `Confirm email` trong Auth Providers.

### `Không tìm thấy hồ sơ tài khoản`

Thường do thiếu profile hoặc RLS policy chặn đọc. Kiểm tra `auth.users`, `profiles`, UUID liên kết và policy.

### `duplicate key value violates unique constraint profiles_pkey`

Nghĩa là profile đã tồn tại. Không phải lỗi cần tạo lại; hãy dùng `select` hoặc `update`.

## 13. Thông tin đăng nhập hiện tại

```text
Website: https://maiangi.vercel.app
Username Admin: motonggia
Password Admin: m0thaibA123
Auth email Admin: motonggia@maiangi.local
```

Tài khoản Admin này không được xóa từ giao diện. RPC cũng chặn Admin tự xóa mình.

## 14. Bản bàn giao hiện tại

File ZIP source mới nhất:

```text
/home/ubuntu/maiangi-online-delete-account.zip
```

Tên file khi upload GitHub không quan trọng; quan trọng là giải nén đúng cấu trúc ở thư mục gốc repository.

---

**Tóm tắt một câu:** Website Mai Angi hiện dùng React/Vite trên Vercel, Supabase Auth + `public.profiles`, đã tắt xác nhận email, đã có duyệt tài khoản và đã thêm xóa tài khoản an toàn qua RPC chỉ dành cho Admin.
