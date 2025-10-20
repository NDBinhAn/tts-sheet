# Thư mục Tiện ích (`utils`)

Thư mục `utils` chứa các module phụ trợ, cung cấp các chức năng chung có thể được tái sử dụng trong toàn bộ ứng dụng. Mục đích của thư mục này là để tách biệt các logic không thuộc về nghiệp vụ chính (business logic) ra khỏi các services hoặc các thành phần cốt lõi.

## Chi tiết các tệp

-   **`logger.js`**: Tệp này chịu trách nhiệm cấu hình hệ thống ghi log (logging) cho ứng dụng bằng thư viện `winston`.
    -   **Chức năng:**
        -   Khởi tạo một logger instance.
        -   Định dạng cấu trúc của log (bao gồm timestamp, level, message).
        -   Thiết lập các "transports" - nơi mà log sẽ được xuất ra. Ví dụ:
            -   Xuất ra console trong môi trường phát triển (`development`) để dễ dàng gỡ lỗi.
            -   Ghi vào các tệp tin (`error.log`, `combined.log`) trong môi trường sản xuất (`production`) để tiện cho việc kiểm tra và giám sát sau này.
    -   **Mục đích:** Giúp theo dõi hoạt động của ứng dụng, phát hiện lỗi và các sự kiện quan trọng một cách có hệ thống.
