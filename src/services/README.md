# Thư mục Dịch vụ (`services`)

Thư mục `services` chứa các module chịu trách nhiệm tương tác với các API bên ngoài hoặc các logic nghiệp vụ phức tạp. Mỗi tệp trong thư mục này đóng gói một tập hợp các chức năng liên quan đến một nguồn dữ liệu hoặc một dịch vụ cụ thể.

## Chi tiết các tệp

-   **`tiktokService.js`**: Module này quản lý tất cả các tương tác với TikTok Shop Open API.
    -   **Chức năng:**
        -   `readSyncState()` / `writeSyncState()`: Đọc và ghi trạng thái đồng bộ (tokens, timestamp) từ/vào tệp `config/sync_state.json`.
        -   `refreshAccessToken()`: Xử lý logic làm mới `access_token` khi nó hết hạn bằng cách sử dụng `refresh_token`. Tự động cập nhật trạng thái sau khi làm mới thành công.
        -   `getOrders()`: Gọi API `/order/list` của TikTok Shop để lấy danh sách các đơn hàng mới dựa trên `last_synced_timestamp`. Module này cũng phải xử lý logic **pagination/cursor** để đảm bảo lấy về tất cả các đơn hàng mới.
    -   **Mục đích:** Trừu tượng hóa việc giao tiếp với TikTok API, giúp cho `syncEngine` chỉ cần gọi các hàm đơn giản mà không cần quan tâm đến chi tiết triển khai của API.

-   **`googleSheetService.js`**: Module này chịu trách nhiệm cho việc giao tiếp với Google Sheets API.
    -   **Chức năng:**
        -   `writeOrdersToSheet()`: Nhận một mảng dữ liệu đơn hàng đã được xử lý và ghi chúng vào Google Sheet đã được cấu hình.
        -   Sử dụng **Service Account** để xác thực với Google API, đảm bảo ứng dụng có thể chạy tự động mà không cần sự can thiệp của người dùng.
    -   **Mục đích:** Đóng gói logic phức tạp của việc xác thực và ghi dữ liệu vào Google Sheets, giúp các phần khác của ứng dụng dễ dàng gửi dữ liệu lên bảng tính.
