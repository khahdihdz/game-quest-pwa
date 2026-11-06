# VOID SURVIVOR 3D

Game sinh tồn hành động Roguelite chạy trên Web và Android PWA. Toàn bộ hình ảnh trong game được dựng procedural bằng hình học Three.js, vật liệu, ánh sáng và particle; không chứa ảnh, model, texture, âm thanh hay asset tải ngoài.

## Chơi game
- Mở GitHub Pages của repository.
- PC: WASD hoặc phím mũi tên để di chuyển. Nhân vật tự động nhắm và bắn kẻ địch gần nhất.
- Android: cài PWA từ trình duyệt, dùng joystick ảo.
- Chọn Campaign (10 wave) hoặc Endless.
- Tiêu diệt quái, thu XP, lên cấp và chọn 1 trong 3 nâng cấp ngẫu nhiên.
- Boss xuất hiện sau 5 phút. Điểm cao và tín dụng được lưu cục bộ.

## Công nghệ
- Three.js 0.161 qua CDN (thư viện render, không phải asset game).
- JavaScript ES modules, WebGL, CSS, Web App Manifest, Service Worker.
- Không backend, không tài khoản, không gửi dữ liệu người chơi lên máy chủ.

## Offline
PWA cache mã nguồn và giao diện. Lần đầu cần Internet để tải thư viện Three.js từ CDN; sau khi thư viện đã được tải và cache bởi trình duyệt, khả năng chơi offline tùy chính sách cache của trình duyệt. Không tuyên bố offline tuyệt đối khi chưa có thư viện Three.js đóng gói nội bộ.

## GitHub Pages
Workflow `.github/workflows/pages.yml` tự kiểm tra cấu trúc và triển khai thư mục gốc lên GitHub Pages khi push vào `main`.

## Controls
- Desktop: WASD / Arrow keys, Escape để tạm dừng.
- Mobile: joystick góc dưới trái, tự động tấn công.

## License
MIT.
