const { nextNhoursWeather, allTimeZones } = require("@aadhithyasb1/time-zone/time-zone");
process.on("message", (param) => {
  process.send(
    nextNhoursWeather(param.city_Date_Time_Name, param.hours, allTimeZones())
  );
});
