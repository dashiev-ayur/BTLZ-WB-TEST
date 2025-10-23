/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    // Создаем таблицу
    await knex.schema.createTable("tariffs_box", (table) => {
        table.bigIncrements("id").primary();

        table.date("dt_update").notNullable();
        table.string("dt_next_box").notNullable().defaultTo("");
        table.string("dt_till_max").notNullable().defaultTo("");
        table.jsonb("warehouse_list").defaultTo([]);

        table.timestamps(true, true);

        table.index(["dt_update"]);
        table.unique(["dt_update", "dt_next_box", "dt_till_max"]);
    });

    // Создаем функцию и триггер для автоматического обновления updated_at
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_tariffs_box_updated_at 
        BEFORE UPDATE ON tariffs_box 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    // Удаляем триггер и функцию
    await knex.raw(`
        DROP TRIGGER IF EXISTS update_tariffs_box_updated_at ON tariffs_box;
        DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    return knex.schema.dropTable("tariffs_box");
}
