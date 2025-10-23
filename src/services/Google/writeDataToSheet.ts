import { google } from "googleapis";
import env from "../../config/env/env.js";

export type SheetValue = string | number;
export type SheetRow = SheetValue[];
export type SheetData = SheetRow[];

export class GoogleSheetsService {
    private sheets: any;
    private auth: any;

    constructor() {
        this.initializeAuth();
    }

    private async initializeAuth() {
        try {
            if (!env.GOOGLE_CREDENTIALS_PATH) {
                throw new Error("GOOGLE_CREDENTIALS_PATH is not configured");
            }

            // аутентификация через service account файл
            this.auth = new google.auth.GoogleAuth({
                keyFile: env.GOOGLE_CREDENTIALS_PATH, // Путь к JSON файлу с credentials
                scopes: ["https://www.googleapis.com/auth/spreadsheets"], // Права доступа к Google Sheets
            });

            // получаем клиент для работы с Google Sheets API
            this.sheets = google.sheets({ version: "v4", auth: this.auth });

            console.log("Google Sheets API initialized !");
        } catch (error) {
            console.error("Error initializing Google Sheets API:", error);
            throw error;
        }
    }

    /**
     * Записывает данные из массива в указанную Google Таблицу
     *
     * @param spreadsheetId - ID Google Таблицы (из URL)
     * @param range - Диапазон для записи (например: 'Sheet1!A1')
     * @param data - Массив данных для записи
     * @param clearSheet - Очистить ли лист перед записью (по умолчанию true)
     * @param freezeHeaders - Закрепить ли заголовки в первой строке (по умолчанию true)
     */
    async writeDataToSheet(spreadsheetId: string, range: string, data: SheetData, clearSheet: boolean = true, freezeHeaders: boolean = true): Promise<void> {
        try {
            // Очищаем лист если требуется
            if (clearSheet) {
                await this.clearSheet(spreadsheetId, range);
            }

            // Записываем данные в таблицу
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: "RAW", // RAW - данные записываются как есть, USER_ENTERED - как если бы пользователь ввел вручную
                resource: {
                    values: data,
                },
            });

            console.log(`Данные успешно записаны в таблицу ${spreadsheetId}, диапазон ${range}`);
            console.log(`Записано строк: ${response.data.updatedRows || data.length}`);

            // Закрепляем заголовки если требуется
            if (freezeHeaders && data.length > 0) {
                await this.freezeHeaderRow(spreadsheetId, range);
            }
        } catch (error) {
            console.error("Ошибка записи данных в Google Sheets:", error);
            throw error;
        }
    }

    /**
     * Закрепляет первую строку (заголовки) в указанном листе
     *
     * @param spreadsheetId - ID Google Таблицы
     * @param range - Диапазон для определения листа (например: 'Sheet1!A1')
     */
    async freezeHeaderRow(spreadsheetId: string, range: string): Promise<void> {
        try {
            // Извлекаем название листа из диапазона
            const sheetName = range.split("!")[0];

            // Получаем информацию о листе
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId,
            });

            const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
            if (!sheet) {
                throw new Error(`Лист "${sheetName}" не найден`);
            }

            const sheetId = sheet.properties?.sheetId;

            // Закрепляем первую строку
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [
                        {
                            updateSheetProperties: {
                                properties: {
                                    sheetId: sheetId,
                                    gridProperties: {
                                        frozenRowCount: 1,
                                    },
                                },
                                fields: "gridProperties.frozenRowCount",
                            },
                        },
                    ],
                },
            });

            console.log(`Заголовки закреплены в листе "${sheetName}" таблицы ${spreadsheetId}`);
        } catch (error) {
            console.error("Ошибка закрепления заголовков:", error);
            throw error;
        }
    }

    /**
     * Очищает указанный диапазон в таблице
     *
     * @param spreadsheetId - ID Google Таблицы
     * @param range - Диапазон для очистки
     */
    async clearSheet(spreadsheetId: string, range: string): Promise<void> {
        try {
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId,
                range,
            });
            console.log(`Диапазон ${range} очищен в таблице ${spreadsheetId}`);
        } catch (error) {
            console.error("Ошибка очистки листа:", error);
            throw error;
        }
    }

    /**
     * Читает данные из указанного диапазона таблицы
     *
     * @param spreadsheetId - ID Google Таблицы
     * @param range - Диапазон для чтения
     * @returns Массив данных из таблицы
     */
    async readDataFromSheet(spreadsheetId: string, range: string): Promise<SheetData> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });

            const data = response.data.values || [];
            console.log(`Прочитано ${data.length} строк из таблицы ${spreadsheetId}`);
            return data;
        } catch (error) {
            console.error("Ошибка чтения данных из Google Sheets:", error);
            throw error;
        }
    }

    /**
     * Закрепляет заголовки в указанном листе (отдельный метод)
     *
     * @param range - Диапазон для определения листа (например: 'Sheet1!A1')
     */
    async freezeHeaders(range: string): Promise<void> {
        const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;
        if (!spreadsheetId) {
            throw new Error("GOOGLE_SPREADSHEET_ID is not configured");
        }
        await this.freezeHeaderRow(spreadsheetId, range);
    }

    /**
     * Получает информацию о таблице (названия листов, метаданные)
     *
     * @param spreadsheetId - ID Google Таблицы
     */
    async getSpreadsheetInfo(spreadsheetId: string): Promise<void> {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId,
            });

            const spreadsheet = response.data;
            console.log(`Информация о таблице: ${spreadsheet.properties?.title}`);
            console.log("Листы в таблице:");

            spreadsheet.sheets?.forEach((sheet: any, index: number) => {
                console.log(`  ${index + 1}. ${sheet.properties?.title} (ID: ${sheet.properties?.sheetId})`);
            });
        } catch (error) {
            console.error("Ошибка получения информации о таблице:", error);
            throw error;
        }
    }
}

export async function writeDataToSheet(range: string, data: SheetData, freezeHeaders: boolean = true) {
    const googleSheets = new GoogleSheetsService();
    const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
        throw new Error("GOOGLE_SPREADSHEET_ID is not configured");
    }

    try {
        await googleSheets.writeDataToSheet(
            spreadsheetId,
            range, // Диапазон для записи (например: 'Sheet1!A:Z')
            data, // array[][] - массив данных для записи
            true, // Очистить лист перед записью
            freezeHeaders, // Закрепить заголовки
        );

        // Читаем данные обратно для проверки
        const readData = await googleSheets.readDataFromSheet(spreadsheetId, range);
        console.log("Прочитанные данные из таблицы:", readData.length, "строк");
        console.log("> ", readData[0]);
    } catch (error) {
        console.error("Ошибка в примере использования:", error);
    }
}
