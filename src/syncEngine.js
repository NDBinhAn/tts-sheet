const tiktokService = require('./services/tiktokService');
const googleSheetService = require('./services/googleSheetService');
const logger = require('./utils/logger');

/**
 * Chuẩn hóa dữ liệu đơn hàng thành định dạng hàng cho Google Sheet.
 * @param {Array<object>} orders - Danh sách đơn hàng từ API TikTok.
 * @returns {Array<Array<string>>} Dữ liệu đã được chuẩn hóa.
 */
function normalizeOrderData(orders) {
    // Tạm thời chỉ lấy các trường cơ bản, có thể mở rộng sau
    // Cần xác định các cột trong Google Sheet để ánh xạ chính xác
    const headers = ['Order ID', 'Create Time', 'Payment Method', 'Total Amount', 'Buyer Username'];
    const rows = orders.map(order => [
        order.order_id,
        new Date(order.create_time * 1000).toLocaleString('vi-VN'),
        order.payment_info.payment_method_name,
        order.payment_info.total_amount,
        order.buyer_info.username,
        // Thêm các trường khác nếu cần
    ]);
    // Nếu cần thêm header, hãy kiểm tra logic để chỉ ghi header một lần
    return rows;
}


/**
 * Hàm đồng bộ chính: lấy đơn hàng từ TikTok và lưu vào Google Sheet.
 */
async function syncOrdersAndSaveToSheet() {
    logger.info('============================================================');
    logger.info('Bắt đầu phiên đồng bộ mới...');

    try {
        // 1. Đọc trạng thái hiện tại
        let state = await tiktokService.readSyncState();
        let accessToken = state.access_token;

        // 2. Lấy đơn hàng
        let orders = [];
        try {
            orders = await tiktokService.getOrders(accessToken, state.last_synced_timestamp);
        } catch (error) {
            // 3. Nếu token hết hạn, làm mới và thử lại
            if (error.isTokenError) {
                logger.warn('Token hết hạn. Đang tiến hành làm mới...');
                const newTokens = await tiktokService.refreshAccessToken(state.refresh_token);
                state.access_token = newTokens.access_token;
                state.refresh_token = newTokens.refresh_token;
                await tiktokService.writeSyncState(state); // Lưu token mới ngay lập tức
                logger.info('Token đã được làm mới. Thử lại việc lấy đơn hàng...');
                orders = await tiktokService.getOrders(state.access_token, state.last_synced_timestamp);
            } else {
                throw error; // Ném lại các lỗi không phải do token
            }
        }

        // 4. Nếu không có đơn hàng mới, kết thúc
        if (orders.length === 0) {
            logger.info('Không có đơn hàng mới nào cần đồng bộ.');
            logger.info('Kết thúc phiên đồng bộ.');
            logger.info('============================================================\n');
            return;
        }

        // 5. Chuẩn hóa và ghi dữ liệu vào Google Sheet
        const normalizedData = normalizeOrderData(orders);
        await googleSheetService.writeOrdersToSheet(normalizedData);

        // 6. Cập nhật last_synced_timestamp
        // Sắp xếp đơn hàng theo create_time giảm dần để lấy đơn hàng mới nhất
        orders.sort((a, b) => b.create_time - a.create_time);
        const latestOrderTimestamp = orders[0].create_time;

        // Chỉ cập nhật nếu timestamp mới lớn hơn timestamp cũ
        if (latestOrderTimestamp > state.last_synced_timestamp) {
            state.last_synced_timestamp = latestOrderTimestamp;
            await tiktokService.writeSyncState(state);
            logger.info(`Cập nhật last_synced_timestamp thành: ${new Date(latestOrderTimestamp * 1000).toISOString()}`);
        }

        logger.info('Hoàn tất phiên đồng bộ thành công!');

    } catch (error) {
        logger.error('Đã xảy ra lỗi nghiêm trọng trong quá trình đồng bộ:', error.message);
    } finally {
        logger.info('Kết thúc phiên đồng bộ.');
        logger.info('============================================================\n');
    }
}

module.exports = {
    syncOrdersAndSaveToSheet,
};
