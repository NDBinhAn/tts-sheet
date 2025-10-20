# Hướng Dẫn Cài Đặt và Sử Dụng Ứng Dụng Đồng Bộ Đơn Hàng TikTok-Sheet

Chào mừng bạn! Đây là ứng dụng giúp tự động sao chép đơn hàng mới từ TikTok Shop của bạn vào một trang Google Sheets. Ứng dụng được thiết kế để chạy trên máy tính cá nhân của bạn (Windows, macOS, Linux) và sẽ kiểm tra đơn hàng mới mỗi 15 phút.

Tài liệu này sẽ hướng dẫn bạn từng bước, kể cả khi bạn không phải là người am hiểu về lập trình.

## Mục lục

1.  [Yêu cầu Hệ thống](#1-yêu-cầu-hệ-thống)
2.  [Hướng dẫn Cài đặt Chi tiết](#2-hướng-dẫn-cài-đặt-chi-tiết)
    *   [Bước 1: Cài đặt Node.js](#bước-1-cài-đặt-nodejs)
    *   [Bước 2: Tải ứng dụng về máy tính](#bước-2-tải-ứng-dụng-về-máy-tính)
3.  [Hướng dẫn Cấu hình](#3-hướng-dẫn-cấu-hình)
    *   [Bước 3: Cấu hình Google Sheets](#bước-3-cấu-hình-google-sheets)
    *   [Bước 4: Cấu hình TikTok Shop](#bước-4-cấu-hình-tiktok-shop)
    *   [Bước 5: Điền thông tin vào tệp cấu hình](#bước-5-điền-thông-tin-vào-tệp-cấu-hình)
4.  [Vận hành Ứng dụng](#4-vận-hành-ứng-dụng)
5.  [Câu hỏi Thường gặp (FAQ)](#5-câu-hỏi-thường-gặp-faq)

---

### 1. Yêu cầu Hệ thống

Để ứng dụng hoạt động, máy tính của bạn chỉ cần cài đặt một phần mềm duy nhất là **Node.js**.

-   **Node.js là gì?** Hiểu đơn giản, đây là môi trường cần thiết để chạy mã nguồn của ứng dụng này, giống như bạn cần Microsoft Word để mở tệp `.docx`.

---

### 2. Hướng dẫn Cài đặt Chi tiết

#### Bước 1: Cài đặt Node.js

1.  Truy cập trang web chính thức của Node.js: [https://nodejs.org/](https://nodejs.org/)
2.  Bạn sẽ thấy hai phiên bản để tải. Hãy chọn phiên bản **LTS** (Recommended For Most Users).
    ![Download Node.js](https://i.imgur.com/a0dJeda.png)
3.  Sau khi tải về, mở tệp và tiến hành cài đặt. Bạn chỉ cần nhấn **Next** liên tục cho đến khi hoàn tất.
4.  **Kiểm tra cài đặt thành công:**
    *   **Windows:** Mở **Command Prompt** bằng cách nhấn phím `Windows` + `R`, gõ `cmd` và nhấn Enter.
    *   **macOS:** Mở **Terminal** bằng cách nhấn `Cmd` + `Space`, gõ `Terminal` và nhấn Enter.
    *   Trong cửa sổ vừa mở, gõ lệnh sau và nhấn Enter:
        ```bash
        node -v
        ```
    *   Nếu bạn thấy một dòng chữ hiện ra phiên bản (ví dụ: `v20.11.1`), bạn đã cài đặt thành công!

#### Bước 2: Tải ứng dụng về máy tính

1.  Tải mã nguồn của ứng dụng dưới dạng tệp ZIP.
2.  Giải nén tệp ZIP này vào một thư mục dễ nhớ (ví dụ: `Desktop/tiktok-app`).
3.  **Cài đặt các thư viện cần thiết:**
    *   Mở lại Command Prompt (Windows) hoặc Terminal (macOS).
    *   Sử dụng lệnh `cd` để di chuyển vào thư mục bạn vừa giải nén. Ví dụ:
        ```bash
        # Nếu bạn lưu ở Desktop
        cd Desktop/tiktok-sheet-sync
        ```
    *   Sau khi đã ở đúng thư mục, gõ lệnh sau và nhấn Enter:
        ```bash
        npm install
        ```
    *   Lệnh này sẽ tự động tải các thư viện cần thiết cho ứng dụng. Quá trình này có thể mất vài phút.

---

### 3. Hướng dẫn Cấu hình

Đây là bước quan trọng nhất. Bạn cần lấy một vài thông tin từ Google và TikTok để ứng dụng có thể kết nối.

#### Bước 3: Cấu hình Google Sheets

Ứng dụng sẽ dùng một "tài khoản robot" (Service Account) để tự động ghi dữ liệu vào Google Sheet của bạn.

1.  **Tạo một trang Google Sheet mới:**
    *   Truy cập [https://sheets.new](https://sheets.new).
    *   Đặt tên cho trang tính và tạo các cột tiêu đề, ví dụ: `Order ID`, `Create Time`, `Payment Method`, `Total Amount`, `Buyer Username`.

2.  **Tạo Tài khoản Dịch vụ (Service Account):**
    *   Truy cập [Google Cloud Console](https://console.cloud.google.com/).
    *   Tạo một dự án mới (nếu bạn chưa có).
    *   Trên thanh tìm kiếm ở trên cùng, gõ **"Google Sheets API"** và bật nó lên (Enable).
    *   Vào menu bên trái, chọn **IAM & Admin** -> **Service Accounts**.
    *   Nhấn **+ CREATE SERVICE ACCOUNT**, đặt tên (ví dụ: `tiktok-sync-bot`) và nhấn **Create and Continue**, sau đó nhấn **Done**.
    *   Bạn sẽ thấy tài khoản vừa tạo trong danh sách. Nhấn vào email của tài khoản đó.
    *   Chuyển qua tab **KEYS**, chọn **ADD KEY** -> **Create new key**.
    *   Chọn định dạng là **JSON** và nhấn **CREATE**. Một tệp `.json` sẽ tự động được tải về.

3.  **Hoàn tất cấu hình Google:**
    *   Đổi tên tệp `.json` vừa tải về thành `google_service_account.json`.
    *   Di chuyển tệp này vào thư mục `config` bên trong thư mục ứng dụng của bạn.
    *   Mở tệp `google_service_account.json` bằng một trình soạn thảo văn bản (Notepad, TextEdit), tìm và sao chép địa chỉ email trong dòng `"client_email"`.
    *   Quay lại trang Google Sheet của bạn, nhấn nút **Share** (Chia sẻ) ở góc trên bên phải.
    *   Dán địa chỉ email robot vào và cấp cho nó quyền **Editor**.

#### Bước 4: Cấu hình TikTok Shop

1.  Truy cập [TikTok Shop Seller Center](https://seller-vn.tiktok.com/).
2.  Đi đến mục **App & Service Store** -> **Developer Center**.
3.  Tạo một ứng dụng mới (Create New App).
4.  Sau khi tạo, bạn sẽ nhận được **App Key** và **App Secret**. Hãy sao chép chúng lại.
5.  Bạn cũng cần **Shop ID** của cửa hàng mình.
6.  **Quan trọng:** Ứng dụng cần một cặp `access_token` và `refresh_token` ban đầu. Cặp token này phải được lấy thông qua quy trình ủy quyền của TikTok. Bước này hơi phức tạp và nằm ngoài phạm vi của ứng dụng. Bạn có thể cần nhờ một người có kinh nghiệm kỹ thuật để lấy cặp token này lần đầu tiên.

#### Bước 5: Điền thông tin vào tệp cấu hình

Bây giờ, hãy điền tất cả thông tin bạn đã thu thập vào các tệp cấu hình.

1.  **Cấu hình tệp `.env`:**
    *   Trong thư mục gốc của ứng dụng, tìm và mở tệp `.env` bằng Notepad hoặc TextEdit.
    *   Điền các thông tin bạn đã lấy:
        ```env
        TIKTOK_APP_KEY=dán_app_key_của_bạn_vào_đây
        TIKTOK_APP_SECRET=dán_app_secret_của_bạn_vào_đây
        TIKTOK_SHOP_ID=dán_shop_id_của_bạn_vào_đây

        # Lấy từ URL của trang Google Sheet
        # Ví dụ: https://docs.google.com/spreadsheets/d/ABCDEFG12345/edit
        # ID chính là "ABCDEFG12345"
        GOOGLE_SHEET_ID=dán_id_của_sheet_vào_đây

        # Tên trang tính và dải ô bạn muốn ghi
        GOOGLE_SHEET_RANGE=Sheet1!A:Z
        ```
    *   Lưu tệp lại.

2.  **Cấu hình tệp `sync_state.json`:**
    *   Mở tệp `config/sync_state.json`.
    *   Thay thế `YOUR_INITIAL_ACCESS_TOKEN` và `YOUR_INITIAL_REFRESH_TOKEN` bằng cặp token bạn đã lấy ở Bước 4.
    *   Lưu tệp lại.

---

### 4. Vận hành Ứng dụng

Sau khi đã hoàn tất cài đặt và cấu hình, bạn đã sẵn sàng để chạy ứng dụng!

1.  Mở Command Prompt (Windows) hoặc Terminal (macOS).
2.  Di chuyển vào thư mục của ứng dụng bằng lệnh `cd`.
3.  Chạy lệnh sau:
    ```bash
    node src/app.js
    ```
4.  Ứng dụng sẽ chạy lần đầu tiên để đồng bộ các đơn hàng cũ (nếu có). Sau đó, nó sẽ tự động lên lịch để chạy lại sau mỗi 15 phút.

**Lưu ý quan trọng:** Cửa sổ Command Prompt/Terminal **phải được giữ mở** để ứng dụng tiếp tục chạy. Nếu bạn đóng cửa sổ này, quá trình tự động đồng bộ sẽ dừng lại.

---

### 5. Câu hỏi Thường gặp (FAQ)

*   **Tôi đóng cửa sổ dòng lệnh thì sao?**
    *   Ứng dụng sẽ ngừng hoạt động. Bạn cần mở lại và chạy lệnh `node src/app.js` để nó tiếp tục.

*   **Làm sao để biết ứng dụng có đang chạy đúng không?**
    *   Kiểm tra Google Sheet của bạn, các đơn hàng mới sẽ xuất hiện sau một vài phút.
    *   Bạn cũng có thể xem các tệp `combined.log` và `error.log` trong thư mục ứng dụng để xem nhật ký hoạt động chi tiết.

*   **Ứng dụng báo lỗi "Thiếu biến môi trường"?**
    *   Hãy kiểm tra lại tệp `.env` và đảm bảo bạn đã điền đầy đủ và lưu lại tệp.

*   **Dữ liệu không được ghi vào Google Sheet?**
    *   Hãy chắc chắn rằng bạn đã chia sẻ Sheet với email của robot và cấp quyền **Editor**.
    *   Kiểm tra lại `GOOGLE_SHEET_ID` trong tệp `.env`.
