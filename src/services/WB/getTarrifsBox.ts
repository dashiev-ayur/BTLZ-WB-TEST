import { IResponseTariffsBox } from "#types/tariffs.js";
import { wbGet } from "#common/wbFetch.js";

// Sample data from WB API:
// https://dev.wildberries.ru/openapi/wb-tariffs#tag/Koefficienty-skladov/paths/~1api~1v1~1tariffs~1box/get
// https://common-api.wildberries.ru/api/v1/tariffs/box?date=2025-10-22
// {
//     "dtNextBox": "",
//     "dtTillMax": "2025-10-23",
//     "warehouseList": [
//       {
//         "boxDeliveryBase": "46",
//         "boxDeliveryCoefExpr": "100",
//         "boxDeliveryLiter": "14",
//         "boxDeliveryMarketplaceBase": "-",
//         "boxDeliveryMarketplaceCoefExpr": "-",
//         "boxDeliveryMarketplaceLiter": "-",
//         "boxStorageBase": "0,07",
//         "boxStorageCoefExpr": "100",
//         "boxStorageLiter": "0,07",
//         "geoName": "",
//         "warehouseName": "Цифровой склад"
//       },
//       ...more warehouses
//     ]
// }

/**
 * Get tariffs box data from WB API
 * @param date - date in format YYYY-MM-DD
 * @returns IResponseTariffsBox
 */
export async function getTariffsBox(date: string): Promise<IResponseTariffsBox> {
    const response = await wbGet<IResponseTariffsBox>(`/api/v1/tariffs/box?date=${date}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch tariffs box: ${response.status} ${response.statusText}`);
    }
    return response.data;
}