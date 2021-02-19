import knex from "knexClient";

/**
 * Function that collects all relevant events  : opening and appointements
 * @param date
 * @return {Promise<*>}
 */
export async function collectEvents(date){
    return await knex
        .select("kind", "starts_at", "ends_at", "weekly_recurring")
        .from("events")
        .where(function() {
            this.where("weekly_recurring", true).orWhere("ends_at", ">", +date);
        });
}