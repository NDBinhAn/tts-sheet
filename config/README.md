# Thư mục Cấu hình (`config`)

Thư mục này chứa tất cả các tệp cấu hình cần thiết để ứng dụng hoạt động.

## Chi tiết các tệp

-   **`.env`**: (Nằm ở thư mục gốc) Tệp này chứa các biến môi trường nhạy cảm như API keys, secrets, và ID của Google Sheet. Nó được `dotenv` tải để sử dụng trong ứng dụng. **Lưu ý:** Tệp này không nên được commit lên Git.
-   **`google_service_account.json`**: Tệp này chứa thông tin xác thực (credentials) cho Tài khoản Dịch vụ (Service Account) của Google Cloud. Nó được sử dụng bởi `googleapis` để cho phép ứng dụng truy cập và chỉnh sửa Google Sheets một cách an toàn mà không cần thông qua quy trình OAuth 2.0 của người dùng.
-   **`sync_state.json`**: Đây là tệp quan trọng nhất để duy trì trạng thái đồng bộ. Nó lưu trữ:
    -   `access_token`: Token truy cập hiện tại của TikTok Shop API.
    -   `refresh_token`: Token dùng để làm mới `access_token` khi nó hết hạn.
    -   `last_synced_timestamp`: Mốc thời gian (Unix timestamp) của đơn hàng cuối cùng đã được đồng bộ thành công. Điều này đảm bảo ứng dụng không bỏ lỡ bất kỳ đơn hàng nào, ngay cả khi bị tắt và khởi động lại.

## Hướng dẫn Cài đặt

1.  **Tạo tệp `.env`** ở thư mục gốc và điền các thông tin được yêu cầu trong `README.md` chính.
2.  **Tải tệp JSON của Service Account** từ Google Cloud Console và đặt tên là `google_service_account.json` trong thư mục này.
3.  **Khởi tạo `sync_state.json`** với một cặp token TikTok Shop hợp lệ ban đầu và `last_synced_timestamp` là `0`.
