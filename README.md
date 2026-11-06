# HOTEL EMPIRE — Đế chế khách sạn

Game mô phỏng quản lý khách sạn theo phong cách kết hợp: điều hành kinh doanh, quản trị nhân sự, đầu tư cơ sở vật chất và lựa chọn trong các tình huống tương tác.

## Công nghệ
- HTML5, CSS3 và Vanilla JavaScript.
- Không framework, thư viện, CDN, API bên ngoài hoặc asset hình ảnh/âm thanh/font bên ngoài.
- PWA cài đặt được trên Android và máy tính; Service Worker hỗ trợ ngoại tuyến.
- Lưu tự động trên thiết bị bằng LocalStorage; hỗ trợ xuất/nhập bản sao lưu JSON.
- GitHub Actions kiểm tra mã nguồn và triển khai GitHub Pages.

## Gameplay
- Quản lý công suất phòng, giá thuê, khách lưu trú và chất lượng dịch vụ.
- Tuyển dụng, đào tạo và trả lương nhân viên.
- Nâng cấp phòng, nhà hàng, spa, hồ bơi, phòng hội nghị và tiện ích.
- Marketing, định giá, khuyến mãi, nghiên cứu thị trường và mở rộng thương hiệu.
- Theo dõi doanh thu, chi phí vận hành, lợi nhuận, dòng tiền và danh tiếng.
- Sự kiện ngẫu nhiên và lựa chọn tình huống có ảnh hưởng đến hoạt động kinh doanh.
- Mô phỏng theo ngày, có tạm dừng và điều chỉnh tốc độ.

## Chơi game
Mở trang GitHub Pages của repository hoặc chạy máy chủ tĩnh tại thư mục dự án. Tiến trình tự động lưu trên trình duyệt hiện tại.

## Kiểm tra
```sh
node --check game.js
node -e "JSON.parse(require('fs').readFileSync('manifest.webmanifest','utf8'))"
```

## Giấy phép
MIT