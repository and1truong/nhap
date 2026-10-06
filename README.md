# Nháp

Editor tiếng Việt Telex chạy offline, với Markdown preview, text replacement nhiều dòng, import/export cấu hình JSON, undo/redo và lưu nháp trong trình duyệt.

- Trang GitHub Pages: https://and1truong.github.io/nhap/
- Bản HTML tải về: https://and1truong.github.io/nhap/go-viet.html
- Source duy nhất của ứng dụng: index.html. Mở file này trực tiếp bằng trình duyệt trên máy tính; không cần Node.js, server, package hoặc mạng.

Chọn bàn phím hệ thống English/ABC để tránh chạy hai bộ gõ cùng lúc. Trên iPhone/iPad, dùng địa chỉ GitHub Pages; bản HTML local cần app hỗ trợ JavaScript, vì Files/Quick Look có thể chỉ hiển thị preview. Chưa kiểm thử trên thiết bị iOS thực.

## GitHub Pages

Sau lần push đầu tiên, vào Settings → Pages → Build and deployment → Source, chọn GitHub Actions. Sau đó chạy lại workflow Build and deploy GitHub Pages ở tab Actions.

Workflow kiểm tra mỗi pull request. Push lên main hoặc workflow_dispatch sẽ build, kiểm thử bằng Chromium, upload dist và deploy lên environment github-pages. Không cần thêm secret.

Build chỉ xuất dist/index.html, dist/go-viet.html và dist/.nojekyll. Không deploy tests, package, source-control metadata hoặc node_modules. Hai file HTML giống hệt nhau; bản tải về không cần assets đi kèm. Không dùng Jekyll, không cần base-path rewrite cho /nhap/.

## Phát triển

Dùng Node.js 22 trở lên. Cài dev dependencies bằng npm ci; chạy npm run build; cài Chromium cho test bằng npx playwright install chromium; chạy npm test.

Có thể build mà không cài dependencies bằng node scripts/build.mjs. Script kiểm tra cú pháp JavaScript nhúng, rồi sao chép source vào dist. Playwright chỉ là dependency phục vụ kiểm thử, không nằm trong ứng dụng.

## Lưu dữ liệu

Nội dung không được gửi qua mạng. Nháp và cấu hình nằm trong localStorage nếu trình duyệt cho phép. Không đồng bộ máy; tải .md/.txt và export JSON để giữ bản sao. Dữ liệu local-file và GitHub Pages có thể tách biệt, nên export trước khi chuyển nơi mở editor.

## Giấy phép

MIT. Các quy tắc Telex cơ bản tham khảo tài liệu UniKey; không sử dụng mã nguồn UniKey. Không có bộ kiểm tra chính tả hoặc tự đoán tiếng Anh.
