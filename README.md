# Hotel Empire

Game mô phỏng quản lý khách sạn quy mô lớn, thuần văn bản, chạy trên trình duyệt và hỗ trợ cài đặt dạng PWA.

## Đặc điểm

- Dashboard điều hành bằng số liệu, bảng biểu, trạng thái và nhật ký; không dùng hình ảnh, sprite, âm thanh, font ngoài, asset ngoài hoặc framework.
- HTML5 + CSS3 + Vanilla JavaScript.
- Mô phỏng kết hợp: thời gian trong game tự chạy, có thể tạm dừng, tăng tốc và chốt ngày thủ công.
- Quản lý danh mục phòng, giá phòng, khách lưu trú, công suất, đặt chỗ và doanh thu.
- Quản lý vận hành: dịch vụ, vệ sinh, bảo trì, năng lượng, vật tư và tiện ích.
- Quản trị nhân sự: lễ tân, buồng phòng, bếp, kỹ thuật và quản lý; lương, tinh thần và đào tạo.
- Thị trường: nhu cầu theo mùa, danh tiếng, hạng sao, marketing và hợp đồng doanh nghiệp.
- Tài chính: dòng tiền, chi phí, lợi nhuận, tài sản, khoản vay và lãi vay.
- Nghiên cứu: Revenue Management, Service Excellence, Smart Operations, Loyalty Program và Green Hotel.
- Sự kiện ngẫu nhiên, báo cáo theo ngày, thăng cấp và mở rộng khách sạn.
- Tự động lưu bằng LocalStorage; mô phỏng tiến trình offline tối đa 8 giờ.
- Giao diện responsive cho desktop và điện thoại.

## Chơi game

Mở GitHub Pages của repository. Bắt đầu với khách sạn The First Stay, 20 phòng, vốn ban đầu $120,000 và khoản vay $30,000.

1. Theo dõi bảng Tổng quan và nhật ký hoạt động.
2. Điều chỉnh giá, xây thêm phòng và tuyển nhân sự phù hợp.
3. Duy trì vệ sinh, chất lượng dịch vụ, năng lượng và tình trạng cơ sở.
4. Đầu tư tiện ích, marketing và nghiên cứu khi dòng tiền cho phép.
5. Theo dõi khoản vay, chốt ngày và mở rộng quy mô.

## Điều khiển

- **Tạm dừng / Tiếp tục:** dừng hoặc chạy mô phỏng.
- **Tốc độ:** chuyển giữa 1×, 2× và 4×.
- **Chốt ngày:** kết sổ và chuyển sang ngày kế tiếp.
- **Lưu tiến trình ngay:** ghi trạng thái vào LocalStorage.

## Triển khai

GitHub Actions kiểm tra JavaScript, manifest và các tệp PWA trước khi deploy thư mục gốc lên GitHub Pages mỗi khi push vào nhánh `main`.

## Lưu ý dữ liệu

Tiến trình lưu trên thiết bị và trình duyệt hiện tại; xóa dữ liệu trình duyệt sẽ xóa save. Offline progress được giới hạn tối đa 8 giờ mỗi lần quay lại. Không có backend, tài khoản hoặc đồng bộ đám mây.

## License

MIT.