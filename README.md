# Hotel Empire: Underworld

Game mô phỏng quản lý khách sạn phong cách noir, kết hợp vận hành kinh doanh hợp pháp với các lựa chọn cốt truyện về những mối quan hệ bí mật hoàn toàn hư cấu.

## Công nghệ
- HTML5, CSS3 và JavaScript thuần (Vanilla JS).
- Không framework, Bootstrap, game engine, thư viện ngoài, CDN, API bên thứ ba hoặc asset hình ảnh/âm thanh/font bên ngoài.
- PWA cài đặt được trên trình duyệt Android và desktop.
- Lưu tiến trình bằng LocalStorage, 3 khe lưu, xuất/nhập JSON.
- GitHub Pages deploy tự động bằng GitHub Actions.

## Gameplay
- Quản lý danh mục phòng, giá, khách lưu trú và công suất.
- Tuyển dụng lễ tân, buồng phòng, an ninh và quản lý.
- Điều hành vệ sinh, bảo trì, chất lượng dịch vụ, quảng bá và kiểm tra nội bộ.
- Theo dõi tiền mặt, khoản vay, lương, chi phí và báo cáo ngày.
- Tương tác với các phe phái hư cấu; mỗi thỏa thuận làm thay đổi phần thưởng và áp lực điều tra.
- Nhiều kết cục tùy theo dòng tiền, danh tiếng và mức rủi ro.

## Chơi game
Mở GitHub Pages, bắt đầu tại Nocturne Hotel. Dùng thanh điều hướng để quản lý từng bộ phận. Thời gian tự chạy; có thể tạm dừng, đổi tốc độ hoặc kết thúc ngày để chốt sổ.

## Chạy cục bộ
Mở index.html trong trình duyệt để chơi. PWA và service worker cần HTTPS hoặc localhost.

## Kiểm tra
- node --check game.js
- Đọc và parse manifest.webmanifest bằng JSON.parse.

## Nội dung
Tên phe phái, giao kèo và các diễn biến điều tra là yếu tố hư cấu trong trò chơi; không mô phỏng hay hướng dẫn hoạt động phạm pháp ngoài đời.

## License
MIT
