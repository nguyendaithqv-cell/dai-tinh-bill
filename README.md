
# 🍻 Đại Tính Bill - Máy Tính Quán Nhậu Thông Minh

Chào anh Đại! Nếu giao diện GitHub trên máy báo lỗi "Something went wrong", đó là do lỗi kết nối giữa phần mềm và GitHub. Anh hãy làm theo cách **"Kéo thả thủ công"** dưới đây, đảm bảo thành công 100%.

## 🛠 Cách Up Code Thủ Công (Chắc chắn thành công)

### Bước 1: Tạo kho chứa trên GitHub
1. Vào [GitHub.com](https://github.com/) và đăng nhập.
2. Nhấn nút **New** (màu xanh) để tạo Repository.
3. Đặt tên là `dai-tinh-bill`. Để chế độ **Public**.
4. Nhấn **Create repository**.

### Bước 2: Tải code lên bằng cách kéo thả
1. Tại trang mới hiện ra, anh tìm dòng chữ: *"...or upload an existing file"*. Nhấn vào chữ **upload an existing file**.
2. Trên máy tính của anh, hãy chọn các file sau (Đừng chọn thư mục `node_modules` và `dist` nhé):
   - `App.tsx`
   - `index.html`
   - `index.tsx`
   - `package.json`
   - `vite.config.ts`
   - `types.ts`
   - `metadata.json`
   - `.gitignore`
   - Các thư mục `components`, `services`, `.github` (nếu có).
3. **Kéo và thả** tất cả chúng vào ô trống trên trình duyệt web GitHub.
4. Chờ nó tải xong, nhấn nút **Commit changes** (màu xanh ở dưới).

### Bước 3: Lấy link Web
1. Vào mục **Settings** (Cài đặt) trên thanh menu của Repo đó.
2. Chọn **Pages** ở bên trái.
3. Ở mục **Build and deployment** > **Source**, hãy chọn **GitHub Actions**.
4. Quay lại tab **Actions** ở trên cùng, anh sẽ thấy nó đang chạy (vòng tròn quay quay).
5. Chờ 1-2 phút khi nó hiện dấu tích xanh ✅, anh vào lại mục **Settings > Pages** sẽ thấy cái link web hiện ra.

## 🔑 Đừng quên API KEY (Để quét ảnh)
Để tính năng camera hoạt động:
1. Vào **Settings** > **Secrets and variables** > **Actions**.
2. Nhấn **New repository secret**.
3. Name: `API_KEY`.
4. Value: (Dán mã Gemini của anh vào).

---
*Lưu ý: Nếu anh dùng điện thoại để truy cập link, hãy lưu nó ra màn hình chính như một ứng dụng để mở cho nhanh mỗi khi khách gọi tính tiền!*
