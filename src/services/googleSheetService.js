const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');

const KEY_FILE_PATH = path.join(__dirname, '../../config/google_service_account.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Ghi dữ liệu đơn hàng vào Google Sheet.
 * @param {Array<Array<string>>} data - Mảng 2 chiều chứa dữ liệu đơn hàng, mỗi mảng con là một hàng.
 */
async function writeOrdersToSheet(data) {
    if (!data || data.length === 0) {
        logger.info('Không có dữ liệu đơn hàng mới để ghi vào Google Sheet.');
        return;
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = process.env.GOOGLE_SHEET_RANGE;

    const resource = {
        values: data,
    };

    try {
        logger.info(`Bắt đầu ghi ${data.length} đơn hàng mới vào Google Sheet...`);
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource,
        });
        logger.info(`Ghi thành công ${result.data.updates.updatedRows} hàng vào Google Sheet.`);
        return result.data;
    } catch (err) {
        logger.error('Lỗi khi ghi dữ liệu vào Google Sheet:', err);
        throw new Error('Không thể ghi dữ liệu vào Google Sheet.');
    }
}

module.exports = {
    writeOrdersToSheet,
};
