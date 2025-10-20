## 💻 PROMPT CHO AGENT LẬP TRÌNH NODE.JS

**Mục tiêu:** Xây dựng một ứng dụng Node.js để đồng bộ đơn hàng TikTok Shop sang Google Sheets, chạy theo cơ chế định kỳ (Cron Job) trên máy tính local.

### 1\. Yêu cầu Hệ thống và Công nghệ

  * **Ngôn ngữ/Nền tảng:** Node.js (phiên bản LTS).
  * **Thư viện đề xuất:**
      * **HTTP Requests:** `axios` (hoặc `node-fetch`).
      * **Lên lịch:** `node-cron` (hoặc thư viện tương đương).
      * **Google Sheets API:** `googleapis` (để tương tác với Sheets).
      * **Quản lý Cấu hình:** `dotenv`.
      * **Logging:** `winston` (để ghi log chi tiết).
  * **Cơ chế lưu trữ:** Sử dụng file **JSON cục bộ** để lưu trữ `access_token`, `refresh_token`, và `last_synced_order_timestamp` (hoặc `last_synced_cursor`).

### 2\. Luồng Logic Chính (Flow)

Ứng dụng phải thực hiện tuần tự các bước sau mỗi khi được kích hoạt:

1.  **Khởi tạo & Kiểm tra Token:**
      * Đọc thông tin `access_token`, `refresh_token`, và `last_synced_timestamp` từ file cấu hình/lưu trữ cục bộ.
      * Kiểm tra tính hợp lệ của `access_token`.
2.  **Làm mới Token (Nếu cần):**
      * Nếu `access_token` hết hạn hoặc không hợp lệ, sử dụng `refresh_token` để gọi API TikTok và nhận cặp `access_token`/`refresh_token` mới.
      * **Lưu ngay lập tức** cặp token mới vào file lưu trữ cục bộ (`sync_state.json`).
3.  **Đồng bộ Đơn hàng:**
      * Gọi API TikTok Shop (`/order/list`) để lấy danh sách đơn hàng. **Phạm vi lấy:** Lấy **tất cả đơn hàng** có trạng thái thanh toán là **Đã thanh toán** (`PAID`) **và** có thời gian tạo đơn hàng (`create_time`) **lớn hơn** `last_synced_timestamp` gần nhất.
      * Sử dụng **Pagination/Cursor** để lấy hết tất cả các đơn hàng mới (nếu có).
4.  **Xử lý và Ghi dữ liệu:**
      * Lọc bỏ các đơn hàng đã tồn tại (nếu cần thiết, dựa vào Order ID).
      * Chuẩn hóa dữ liệu đơn hàng (ID, Sản phẩm, Khách hàng, Trạng thái) thành định dạng hàng (row) cho Google Sheet.
      * Ghi các đơn hàng mới vào Google Sheet.
5.  **Cập nhật Last Synced Timestamp:**
      * Sau khi ghi thành công, cập nhật `last_synced_timestamp` trong file lưu trữ cục bộ (`sync_state.json`) bằng **thời gian tạo đơn hàng (create\_time) của đơn hàng mới nhất** được đồng bộ.

### 3\. Yêu cầu Chi tiết về Triển khai

| Yêu cầu | Chi tiết Triển khai |
| :--- | :--- |
| **Khởi chạy Cron Job** | Sử dụng thư viện `node-cron`. Lịch chạy đề xuất: **mỗi 15 phút** (`*/15 * * * *`). |
| **Chạy ngay khi Application Run** | Hàm đồng bộ chính (`syncOrdersAndSaveToSheet()`) phải được gọi **một lần duy nhất** ngay sau khi ứng dụng khởi động thành công (trong `app.js`). |
| **Quản lý Token** | Module `tiktokService.js` phải chứa logic `refreshAccessToken()` và logic tự động lưu token mới vào file `token.json` khi có sự thay đổi. |
| **Lưu trữ Trạng thái** | File **`config/sync_state.json`** được dùng để lưu trữ: `{ "access_token": "...", "refresh_token": "...", "last_synced_timestamp": 1678886400 }` (Timestamp là Unix Time - giây). |
| **Google Sheets** | Ứng dụng phải sử dụng **Service Account** để ủy quyền truy cập Google Sheets, không dùng Oauth2 flow của người dùng. |
| **Xử lý Đơn hàng đã Tắt Server** | Logic `syncOrdersAndSaveToSheet()` phải luôn sử dụng `last_synced_timestamp` để đảm bảo không bỏ sót bất kỳ đơn hàng nào phát sinh khi server tắt.

-----

## 📄 README.md (Hướng dẫn sử dụng và Quản lý Code)

Tên Project: **tiktok-sheet-sync**

### Mục lục

1.  [Giới thiệu](https://www.google.com/search?q=%231-gi%E1%BB%9Bi-thi%E1%BB%87u)
2.  [Cấu trúc Project](https://www.google.com/search?q=%232-c%E1%BA%A5u-tr%C3%BAc-project)
3.  [Cài đặt và Cấu hình](https://www.google.com/search?q=%233-c%C3%A0i-%C4%91%E1%BA%B7t-v%C3%A0-c%E1%BA%A5u-h%C3%ACnh)
4.  [Cách Vận hành](https://www.google.com/search?q=%234-c%C3%A1ch-v%E1%BA%ADn-h%C3%A0nh)
5.  [Logic Đồng bộ](https://www.google.com/search?q=%235-logic-%C4%91%E1%BB%93ng-b%E1%BB%99)

-----

### 1\. Giới thiệu

Project **tiktok-sheet-sync** là một ứng dụng Node.js được thiết kế để đồng bộ đơn hàng mới từ TikTok Shop sang Google Sheets theo chu kỳ định kỳ (Cron Job). Ứng dụng được tối ưu hóa để chạy trên môi trường local, đảm bảo không bỏ sót đơn hàng ngay cả khi server bị tắt.

**Phiên bản API sử dụng:** TikTok Shop Open API (Sử dụng phiên bản API mới nhất, ví dụ: $202403$).

-----

### 2\. Cấu trúc Project

```
tiktok-sheet-sync/
├── config/
│   ├── config.env              # Thông tin API key, Sheet ID
│   ├── google_service_account.json # Credentials Service Account Google
│   └── sync_state.json         # LƯU TRỮ TRẠNG THÁI: access_token, refresh_token, last_synced_timestamp
├── node_modules/
├── src/
│   ├── services/
│   │   ├── tiktokService.js    # Logic gọi API TikTok và làm mới token (Refresh Token)
│   │   └── googleSheetService.js # Logic ghi/đọc dữ liệu từ Google Sheets
│   ├── utils/
│   │   └── logger.js           # Cấu hình logging
│   ├── app.js                  # Điểm khởi chạy ứng dụng, khởi tạo Cron Job
│   └── syncEngine.js           # LOGIC CHÍNH: Chứa hàm đồng bộ (fetch -> process -> save)
├── .gitignore
├── package.json
└── README.md
```

-----

### 3\. Cài đặt và Cấu hình

#### 3.1. Cài đặt Phụ thuộc

```bash
npm install axios node-cron dotenv googleapis winston
```

#### 3.2. Cấu hình Tài khoản (config.env)

Tạo file `.env` (thay vì `config.env` để tương thích với `dotenv`) và điền thông tin:

```env
# TikTok Shop API Credentials
TIKTOK_APP_KEY=your_tiktok_app_key
TIKTOK_APP_SECRET=your_tiktok_app_secret
TIKTOK_SHOP_ID=your_tiktok_shop_id
# TikTok API Endpoint (Đảm bảo dùng API mới nhất)
TIKTOK_OAUTH_TOKEN_URL=https://auth-api.tiktok.com/oauth/token/
TIKTOK_ORDER_LIST_URL=https://api.tiktok.com/order/list/

# Google Sheets Config
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SHEET_RANGE=Sheet1!A:Z
```

#### 3.3. Cấu hình Google Sheets Service Account

1.  Tạo **Service Account** trên Google Cloud Console và tải file JSON.
2.  Lưu file JSON đó vào thư mục `config/` với tên là `google_service_account.json`.
3.  **Quan trọng:** Chia sẻ Google Sheet của bạn với **email** của Service Account này.

#### 3.4. Cấu hình Trạng thái (sync\_state.json)

Tạo file `config/sync_state.json` với cấu trúc khởi tạo ban đầu:

```json
{
  "access_token": "YOUR_INITIAL_ACCESS_TOKEN",
  "refresh_token": "YOUR_INITIAL_REFRESH_TOKEN",
  "last_synced_timestamp": 0
}
```

*Lưu ý: `access_token` và `refresh_token` ban đầu phải được lấy thủ công qua OAuth một lần.*

-----

### 4\. Cách Vận hành

1.  **Chạy ứng dụng:**
    ```bash
    node src/app.js
    ```
2.  **Khởi chạy (Run-on-Start):** Ứng dụng sẽ tự động gọi hàm đồng bộ chính (`syncOrdersAndSaveToSheet()`) ngay lập tức khi khởi động.
3.  **Lập lịch:** Sau khi khởi chạy, Cron Job sẽ chạy theo lịch $*/15 * * * *$ (mỗi $15$ phút) để duy trì đồng bộ.

-----

### 5\. Logic Đồng bộ

#### 5.1. Cơ chế Token

  * `tiktokService.js` kiểm tra nếu `access_token` hết hạn (hoặc lỗi $401$ khi gọi API).
  * Nếu hết hạn, nó gọi API làm mới (`refresh_token`) để lấy token mới.
  * Cặp token mới sẽ được **ghi đè ngay lập tức** vào `config/sync_state.json` để đảm bảo token luôn được cập nhật cho lần chạy tiếp theo (kể cả khi server bị tắt).

#### 5.2. Cơ chế Đồng bộ Đơn hàng (Anti-Loss)

  * **Filter Cơ sở:** Ứng dụng luôn gọi API đơn hàng với tham số `create_time` **lớn hơn** `last_synced_timestamp` đã lưu.
  * **Xử lý Pagination:** Ứng dụng phải lặp (loop) qua tất cả các trang/cursor cho đến khi hết dữ liệu, đảm bảo lấy toàn bộ đơn hàng mới phát sinh trong khoảng thời gian server tắt.
  * **Cập nhật Trạng thái:** Sau khi **tất cả** đơn hàng mới được ghi thành công lên Google Sheets, `last_synced_timestamp` sẽ được cập nhật bằng **thời gian tạo đơn hàng (create\_time)** mới nhất trong lô dữ liệu vừa đồng bộ.