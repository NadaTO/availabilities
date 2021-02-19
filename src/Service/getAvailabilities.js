import moment from "moment";
import { collectEvents} from "./../DAL/events";
import { DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from "./constants";

/**
 * Function that initializes availabilities in an Object
 * @param date
 * @param numberOfDays
 * @return {[]}
 */
function initializeAvailabilities(date, numberOfDays){
  let availabilities = [];
  for (let day = 0; day < numberOfDays; ++day) {
    let currDay = moment(date).add(day, "days").utc(2).format(DATE_FORMAT);
    availabilities.push({ date: new Date(currDay), slots: [] });
  }
  return availabilities;
}

/**
 * Function that calculates the the time slots (by 30 mins) intersection of two periods
 * @param TimeSlots   Slots of 30mins that represent time intersection between two periods
 * @param event_start  start date of the first period
 * @param event_end     end date of the first period
 * @param startDateCheck   start date of the second period
 * @param endDateCheck     end date of the first period
 */
function addTimes(TimeSlots, event_start, event_end, startDateCheck, endDateCheck) {
  let start = moment.max(event_start, startDateCheck);
  let end = moment.min(event_end, endDateCheck);
  let interval = end.diff(start, "minutes");
  for (let iter = 0; iter < interval; iter += 30) {
    let time = moment(start).add(iter, "minutes");
    TimeSlots[time.format(DATE_TIME_FORMAT)] = time;
  }
}

/**
 * Function that calculates time slot intersection between
 * events (opening xor appointment events) periods and Check availability period
 * @param events might be appointment events xor opening events
 * @param startDateCheck Date from which availability checks start
 * @param endDateCheck Date from which availability checks  stop
 * @return {{}}
 */
function calculateTimes(events, startDateCheck, endDateCheck) {
  let calculatedTimes = {};
  for (let i = 0; i < events.length; i++) {
    let startTime = moment(events[i].starts_at);
    let endTime = moment(events[i].ends_at);
    if (!events[i].weekly_recurring) {
      addTimes(calculatedTimes, startTime, endTime, startDateCheck, endDateCheck);
    } else {
      // if recurring, calculates start date
      if (endTime < startDateCheck) {
        //calculates week count for start
        let weekCount = startDateCheck.diff(endTime, "weeks") + 1;
        startTime.add(weekCount, "weeks");
        endTime.add(weekCount, "weeks");
      }
      // checking week by week
      while (startTime < endDateCheck) {
        addTimes(calculatedTimes, startTime, endTime, startDateCheck, endDateCheck);
        startTime.add(1, "weeks");
        endTime.add(1, "weeks");
      }
    }
  }
  return calculatedTimes;
}

/**
 * Function that calculates the difference between opening time slots and appointment time Slots
 * It shows opening time slots that do not existing in appointement time slots
 * opening time slots - appointement time slots
 * @param appointmentSlots
 * @param openingSlots
 * @param startDate Date from which availability checks start
 * @param availabilities
 */
function calculateAvailabilities(appointmentSlots, openingSlots, startDate, availabilities) {
  for (let time in openingSlots) {
      if (!appointmentSlots[time]) {
        let days = openingSlots[time].diff(startDate, "days");
        availabilities[days].slots.push(openingSlots[time].format(TIME_FORMAT));
    }
  }
}

/**
 * Function that gets availabilities of the next (numberOfDays, default=7) days
 * @param date
 * @param numberOfDays
 * @return {Promise<*[]>}
 */
export default async function getAvailabilities(date, numberOfDays =7) {
  let startDate = moment(date).startOf("day");
  let endDate = moment(date).add(numberOfDays, "days");
  let availabilities = initializeAvailabilities(startDate, numberOfDays);
  const events = await collectEvents(date);
  let appointmentEvents = events.filter((event) => event.kind === "appointment");
  let OpeningEvents = events.filter((event) => event.kind === "opening");
  let appointmentSlots = calculateTimes(appointmentEvents, startDate, endDate);
  let openingSlots = calculateTimes(OpeningEvents, startDate, endDate);

  calculateAvailabilities(appointmentSlots, openingSlots, startDate, availabilities);

  return availabilities;
}
