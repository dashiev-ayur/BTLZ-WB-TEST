import { toNumber } from "#common/toNumber.js";
import env from "#config/env/env.js";
import { getLatestTariffsBox, updateTariffs } from "#services/DB/tarrifs.js";
import { writeDataToSheet } from "#services/Google/writeDataToSheet.js";
import { getTariffsBox } from "#services/WB/getTarrifsBox.js";
import { Command } from "commander";

const program = new Command();

program.command("wbFetchTariffs").action(async () => {
    console.log("Let's update tariffs..");

    // 1. Получаем данных
    // 1.1 данные о тарифах комиссии
    // ...

    // 1.2 данные о тарифах коробов
    console.log("fetching tariffs box data..");
    console.log("================================================");
    const tariffsBoxData = await getTariffsBox("2025-10-22");
    console.log("dtNextBox:", tariffsBoxData.dtNextBox);
    console.log("dtTillMax:", tariffsBoxData.dtTillMax);
    console.log("warehouseList[0]:", tariffsBoxData.warehouseList[0]);

    // 1.3 данные о тарифах паллет
    // ...
    // 1.4 данные о тарифах возврата
    // ...

    // 2. TODO: Записываем данные в БД
    console.log("Updating DB..");
    console.log("================================================");
    await updateTariffs({
        commission: null,
        box: {
            dtUpdate: new Date(),
            dtNextBox: tariffsBoxData.dtNextBox,
            dtTillMax: tariffsBoxData.dtTillMax,
            warehouseList: tariffsBoxData.warehouseList,
        },
        pallet: null,
        return: null,
    });
    process.exit(0);
});

program.command("wbUpdateTariffs").action(async () => {
    console.log("Let's update tariffs in Google Sheets..");
    console.log("================================================");

    // обновляем данные в Google Sheets

    // 1. Получаем данные из БД
    console.log("fetching tariffs box data from DB..");
    console.log("================================================");
    const tariffsBoxData = await getLatestTariffsBox().catch((err) => {
        console.error("Error: ", err.message);
        process.exit(1);
    });
    if (!tariffsBoxData) {
        console.error("Empty tariffs box data in DB");
        process.exit(1);
    }
    console.log("dtUpdate:", tariffsBoxData.dtUpdate);
    console.log("dtNextBox:", tariffsBoxData.dtNextBox);
    console.log("dtTillMax:", tariffsBoxData.dtTillMax);
    console.log("warehouseList:", tariffsBoxData.warehouseList.length);
    console.log("warehouseList[0]:", tariffsBoxData.warehouseList[0]);

    // 2. Обновляем данные в Google Sheets
    const list = tariffsBoxData.warehouseList
        .map((el) => ({
            dtNextBox: tariffsBoxData.dtNextBox,
            dtTillMax: tariffsBoxData.dtTillMax,
            geoName: el.geoName,
            warehouseName: el.warehouseName,
            boxDeliveryBase: toNumber(el.boxDeliveryBase),
            boxDeliveryCoefExpr: toNumber(el.boxDeliveryCoefExpr),
            boxDeliveryLiter: toNumber(el.boxDeliveryLiter),
            boxDeliveryMarketplaceBase: toNumber(el.boxDeliveryMarketplaceBase),
            boxDeliveryMarketplaceCoefExpr: toNumber(el.boxDeliveryMarketplaceCoefExpr),
            boxDeliveryMarketplaceLiter: toNumber(el.boxDeliveryMarketplaceLiter),
            boxStorageBase: toNumber(el.boxStorageBase),
            boxStorageCoefExpr: toNumber(el.boxStorageCoefExpr),
            boxStorageLiter: toNumber(el.boxStorageLiter),
        }))
        .sort((a, b) => a.boxDeliveryCoefExpr - b.boxDeliveryCoefExpr);

    const titles: string[] = [];
    if (list[0]) {
        for (const key in list[0]) {
            titles.push(key);
        }
    }

    const sheetName = env.GOOGLE_SHEET_NAME || "Sheet1";
    await writeDataToSheet(`${sheetName}!A:Z`, [titles, ...list.map((el) => Object.values(el))], true);
    process.exit(0);
});

program.command("default", { isDefault: true }).action(() => {
    console.error("No command");
    process.exit(1);
});
program.parse();
