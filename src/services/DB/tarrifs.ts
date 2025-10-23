import { IUpdateTariffs, ITariffsBox, ITariffsBoxWarehouse } from "#types/tariffs.js";
import knex from "#postgres/knex.js";

/**
 * Обновление в БД тарифов для коробов
 *
 * @param data - IUpdateTariffsBox
 * @returns Void
 */
async function updateTarrifsBox(data: ITariffsBox): Promise<void> {
    const { dtUpdate, dtNextBox, dtTillMax, warehouseList } = data;
    await knex("tariffs_box")
        .insert({
            dt_update: dtUpdate,
            dt_next_box: dtNextBox,
            dt_till_max: dtTillMax,
            warehouse_list: JSON.stringify(warehouseList),
        })
        .onConflict(["dt_update", "dt_next_box", "dt_till_max"])
        .merge({
            warehouse_list: knex.raw('EXCLUDED."warehouse_list"'),
        });
    console.log("updateTarrifsBox: success");
}

/**
 * Обновление в БД тарифов
 *
 * @param data - IUpdateTariffs
 * @returns Void
 */
export async function updateTariffs(data: IUpdateTariffs): Promise<void> {
    const { commission, box, pallet, return: returnTariffs } = data;
    const promises = [];
    // if (commission) ...;
    if (box) promises.push(updateTarrifsBox(box));
    // if (pallet) ...;
    // if (returnTariffs) ...;

    if (promises.length > 0) {
        await Promise.all(promises);
        console.log("updateTariffs: success");
    } else {
        console.log("updateTariffs: no data to update");
    }
}

/**
 * Получение данных из БД тарифов для коробов
 *
 * @returns ITariffsBox
 */
export async function getLatestTariffsBox(): Promise<ITariffsBox> {
    const data = await knex("tariffs_box")
        .select("dt_update", "dt_next_box", "dt_till_max", "warehouse_list")
        .orderBy("dt_update", "desc")
        .limit(1)
        .first();
    if (!data) {
        throw new Error("Нет данных о тарифах для коробов в базе данных!");
    }
    return {
        dtUpdate: data.dt_update,
        dtNextBox: data.dt_next_box,
        dtTillMax: data.dt_till_max,
        warehouseList: data.warehouse_list as ITariffsBoxWarehouse[],
    };
}
