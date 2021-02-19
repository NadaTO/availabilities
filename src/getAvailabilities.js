import moment from "moment";
import knex from "knexClient";

/**
 * Function that initializes availabilities in a map according to weekdays
 * @param date
 * @return {Map<any, any>}
 */
function initializeAvailabilities(date){
  let availabilities = new Map();
  for (let i = 0; i < 7; ++i) {
    const tmpDate = moment(date).add(i, "days");
    availabilities.set(tmpDate.format("d"), {
      date: tmpDate.toDate(),
      slots: []
    });
  }
  return availabilities;
}

/**
 * Function that collects all relevant events  : opening and appointements
 * @param date
 * @return {Promise<*>}
 */
async function collectEvents(date){
  return await knex
      .select("kind", "starts_at", "ends_at", "weekly_recurring")
      .from("events")
      .where(function() {
        this.where("weekly_recurring", true).orWhere("ends_at", ">", +date);
      }).orderBy("kind", 'desc');
}

/**
 * Function that gets availabilities of the next 7 days
 * @param date
 * @return {Promise<*[]>}
 */
export default async function getAvailabilities(date) {
  const availabilities = initializeAvailabilities(date);
  const events = await collectEvents(date);

  for (const event of events) {
    for (
      let date = moment(event.starts_at);
      date.isBefore(event.ends_at);
      date.add(30, "minutes")
    ) {
      const day = availabilities.get(date.format("d"));
      if (event.kind === "opening" && date.diff(day.date,'days')<=0) {
        day.slots.push(date.format("H:mm"));
      } else if (event.kind === "appointment") {
        day.slots = day.slots.filter(
          slot => slot.indexOf(date.format("H:mm")) === -1
        );
      }
    }
  }

  return Array.from(availabilities.values())
}
