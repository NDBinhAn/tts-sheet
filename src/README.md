# Thư mục Nguồn (`src`)

Thư mục `src` (source) là nơi chứa toàn bộ mã nguồn chính của ứng dụng. Cấu trúc bên trong được tổ chức để tách biệt các mối quan tâm (separation of concerns), giúp mã nguồn trở nên dễ đọc, dễ bảo trì và mở rộng.

## Chi tiết các tệp và thư mục con

-   **`app.js`**:
    -   Đây là **điểm vào (entry point)** của ứng dụng.
    -   Chịu trách nhiệm khởi tạo các thành phần cần thiết như:
        -   Tải các biến môi trường từ tệp `.env` bằng `dotenv`.
        -   Cấu hình và khởi chạy **Cron Job** (`node-cron`) để thực hiện công việc đồng bộ theo lịch trình định sẵn (ví dụ: mỗi 15 phút).
        -   Gọi hàm đồng bộ chính (`syncOrdersAndSaveToSheet`) **một lần duy nhất** ngay khi ứng dụng vừa khởi động để đảm bảo dữ liệu được cập nhật ngay lập tức.

-   **`syncEngine.js`**:
    -   Đây là **bộ não** của ứng dụng, chứa logic điều phối chính.
    -   Hàm `syncOrdersAndSaveToSheet()` trong tệp này thực hiện toàn bộ quy trình đồng bộ:
        1.  Gọi `tiktokService` để kiểm tra và làm mới token nếu cần.
        2.  Gọi `tiktokService` để lấy danh sách các đơn hàng mới.
        3.  Xử lý, chuẩn hóa dữ liệu đơn hàng.
        4.  Gọi `googleSheetService` để ghi dữ liệu đã chuẩn hóa vào Google Sheets.
        5.  Cập nhật lại `last_synced_timestamp` vào tệp `sync_state.json` sau khi hoàn tất.

-   **`services/`**:
    -   Thư mục này chứa các module giao tiếp với các dịch vụ bên ngoài. Xem chi tiết trong `src/services/README.md`.

-   **`utils/`**:
    -   Thư mục này chứa các tiện ích phụ trợ được sử dụng trong toàn bộ ứng dụng. Xem chi tiết trong `src/utils/README.md`.
