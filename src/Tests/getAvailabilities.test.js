import knex from "knexClient";
import getAvailabilities from "../Service/getAvailabilities";

describe("getAvailabilities", () => {
  beforeEach(() => knex("events").truncate());

  describe("Should get number of days to check availability", () => {
    it("It takes 7 as Default number of availability Checks", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      for (let i = 0; i < 7; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });
    it("It can extend availabilities to a customized number of days", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"),17);
      expect(availabilities.length).toBe(17);
    });
  });

  describe("Should deal with recuring events", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("It takes into consideration weekly recuring openings that occured before the date", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("Should deal with weekly recuring openings that occurs after the date\"", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[6].slots).toEqual([]);
    });
  });


  describe("Should deal with non recuring openings", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 14:30"),
          ends_at: new Date("2014-08-04 15:30"),
          weekly_recurring: false
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-13 14:30"),
          ends_at: new Date("2014-08-13 15:30"),
          weekly_recurring: false
        }
      ]);
    });

    it("It should not take into consideration non recuring opening occuring before the date", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
          String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
          String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(availabilities[3].slots).toEqual([
        "14:30",
        "15:00"
      ]);

    });
  });
  describe("Should handle appointments and openings lasting for more than a day", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 22:30"),
          ends_at: new Date("2014-08-12 01:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 21:30"),
          ends_at: new Date("2014-08-05 02:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("It should get time of each day correctly", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
          String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
          String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "21:30",
        "22:00"
      ]);
      expect(availabilities[2].slots).toEqual([
        "1:30",
        "2:00"
      ]);
    });
  });

  describe("Should deal with multiple appointments occuring on the same day", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 12:00"),
          ends_at: new Date("2014-08-11 12:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 13:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("It takes into consideration all apointements occuring in the same day", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(availabilities[0].slots).toEqual([]);

      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:30",
        "13:00"
      ]);

      });
    });
  describe("Should deal with appointments absence booked", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 13:00"),
          weekly_recurring: true
        }
      ]);
    });

    it("It should display openings if they match the date", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(availabilities[0].slots).toEqual([]);

      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30"
      ]);
    });
  });

  describe("Should deal with a huge number of Days to treat", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2021-02-01 10:30"),
          ends_at: new Date("2021-02-01 12:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2021-01-04 09:30"),
          ends_at: new Date("2021-01-04 13:00"),
          weekly_recurring: true
        }
      ]);
    });

    it("It should take recuring openings into consideration", async () => {
      const availabilities = await getAvailabilities(new Date("2021-01-07"),30);
      expect(availabilities.length).toBe(30);

      expect(String(availabilities[0].date)).toBe(
          String(new Date("2021-01-07"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[4].date)).toBe(
          String(new Date("2021-01-11"))
      );
      expect(availabilities[4].slots).toEqual([
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30"
      ]);

      expect(String(availabilities[25].date)).toBe(
          String(new Date("2021-02-01"))
      );

      expect(availabilities[25].slots).toEqual([
        "9:30",
        "10:00",
        "12:30"
      ]);

    });
  });


});
