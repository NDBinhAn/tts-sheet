require('dotenv').config();
const cron = require('node-cron');
const logger = require('./utils/logger');
const { syncOrdersAndSaveToSheet } = require('./syncEngine');

function validateEnvVariables() {
    const requiredVars = [
        'TIKTOK_APP_KEY',
        'TIKTOK_APP_SECRET',
        'TIKTOK_SHOP_ID',
        'TIKTOK_OAUTH_TOKEN_URL',
        'TIKTOK_ORDER_LIST_URL',
        'GOOGLE_SHEET_ID',
        'GOOGLE_SHEET_RANGE',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        logger.error(`Các biến môi trường sau đây bị thiếu hoặc chưa được cấu hình trong file .env: ${missingVars.join(', ')}`);
        throw new Error('Thiếu biến môi trường quan trọng.');
    }
    logger.info('Tất cả các biến môi trường cần thiết đã được cấu hình.');
}


async function main() {
    logger.info('Khởi chạy ứng dụng TikTok-Sheet-Sync...');

    try {
        // 1. Kiểm tra các biến môi trường
        validateEnvVariables();

        // 2. Chạy đồng bộ ngay khi ứng dụng khởi động
        logger.info('Thực hiện đồng bộ lần đầu khi khởi chạy...');
        await syncOrdersAndSaveToSheet();

        // 3. Lên lịch chạy định kỳ mỗi 15 phút
        const cronSchedule = '*/15 * * * *';
        cron.schedule(cronSchedule, () => {
            logger.info(`Cron job được kích hoạt theo lịch: ${cronSchedule}`);
            syncOrdersAndSaveToSheet();
        });

        logger.info(`Đã lên lịch đồng bộ định kỳ mỗi 15 phút.`);
        logger.info('Ứng dụng đang chạy... (Nhấn CTRL+C để thoát)');

    } catch (error) {
        logger.error('Không thể khởi động ứng dụng do lỗi:', error.message);
        process.exit(1); // Thoát ứng dụng nếu có lỗi nghiêm trọng khi khởi động
    }
}

main();
