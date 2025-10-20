const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const STATE_FILE_PATH = path.join(__dirname, '../../config/sync_state.json');

/**
 * Đọc trạng thái từ file sync_state.json
 * @returns {Promise<object>} Trạng thái hiện tại
 */
async function readSyncState() {
    try {
        const data = await fs.readFile(STATE_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Không thể đọc file trạng thái sync_state.json:', error);
        throw new Error('Lỗi đọc file trạng thái.');
    }
}

/**
 * Ghi trạng thái vào file sync_state.json
 * @param {object} state - Trạng thái mới cần ghi
 */
async function writeSyncState(state) {
    try {
        await fs.writeFile(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
        logger.info('Cập nhật file trạng thái sync_state.json thành công.');
    } catch (error) {
        logger.error('Không thể ghi file trạng thái sync_state.json:', error);
        throw new Error('Lỗi ghi file trạng thái.');
    }
}

/**
 * Làm mới access token bằng refresh token
 * @param {string} refreshToken - Refresh token hiện tại
 * @returns {Promise<object>} Cặp token mới { access_token, refresh_token }
 */
async function refreshAccessToken(refreshToken) {
    logger.info('Access token đã hết hạn hoặc không hợp lệ. Bắt đầu làm mới...');
    try {
        const response = await axios.post(process.env.TIKTOK_OAUTH_TOKEN_URL, null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_key: process.env.TIKTOK_APP_KEY,
                client_secret: process.env.TIKTOK_APP_SECRET,
            },
        });

        const { access_token, refresh_token } = response.data.data;
        if (!access_token || !refresh_token) {
            throw new Error('Phản hồi từ API không chứa token mới.');
        }

        logger.info('Làm mới token thành công.');
        return { access_token, refresh_token };
    } catch (error) {
        logger.error('Lỗi khi làm mới access token:', error.response ? error.response.data : error.message);
        throw new Error('Không thể làm mới access token.');
    }
}

/**
 * Lấy danh sách đơn hàng từ TikTok Shop
 * @param {string} accessToken - Access token hợp lệ
 * @param {number} startTime - Unix timestamp để lọc đơn hàng
 * @returns {Promise<Array<object>>} Danh sách đơn hàng
 */
async function getOrders(accessToken, startTime) {
    logger.info(`Bắt đầu lấy danh sách đơn hàng từ thời điểm: ${new Date(startTime * 1000).toISOString()}`);
    let allOrders = [];
    let cursor = '';
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await axios.post(
                process.env.TIKTOK_ORDER_LIST_URL,
                {
                    order_status: 'PAID', // Chỉ lấy đơn hàng đã thanh toán
                    create_time_from: startTime,
                    page_size: 100, // Lấy tối đa 100 đơn mỗi lần
                    cursor: cursor,
                },
                {
                    headers: {
                        'x-tts-access-token': accessToken,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        app_key: process.env.TIKTOK_APP_KEY,
                        shop_id: process.env.TIKTOK_SHOP_ID,
                        // Thêm các tham số signing cần thiết nếu API yêu cầu
                    },
                }
            );

            if (response.data.code !== 0) {
                // Kiểm tra lỗi token hết hạn
                if (response.data.code === 105) {
                    throw { isTokenError: true, data: response.data };
                }
                throw new Error(`API TikTok trả về lỗi: ${response.data.message} (code: ${response.data.code})`);
            }

            const { order_list, more, next_cursor } = response.data.data;
            if (order_list && order_list.length > 0) {
                allOrders = allOrders.concat(order_list);
            }

            hasMore = more;
            cursor = next_cursor;

            if (hasMore) {
                logger.info(`Còn đơn hàng, tiếp tục lấy với cursor: ${cursor}`);
            }

        } catch (error) {
            if (error.isTokenError) {
                logger.warn('Token hết hạn khi đang lấy đơn hàng.');
                throw error; // Ném lại lỗi để syncEngine xử lý refresh
            }
            logger.error('Lỗi khi gọi API lấy danh sách đơn hàng TikTok:', error.response ? error.response.data : error.message);
            throw new Error('Không thể lấy danh sách đơn hàng.');
        }
    }

    logger.info(`Lấy thành công tổng cộng ${allOrders.length} đơn hàng mới.`);
    return allOrders;
}


module.exports = {
    readSyncState,
    writeSyncState,
    refreshAccessToken,
    getOrders,
};
