// Requiring express modules
const express = require("express");
// Requiring child process
const { fork } = require("child_process");
// Initialising express module
const app = express();
// storing port address
const port=5001;
// Fetching the static files present inside public folder
app.use(express.static("./Public"));

// json type conversion
app.use(express.json());

// Obtaining the weatherdata data by calling the function "allTimeZones" when client requests it.
app.get("/weatherdata", (req, res) => {
  let child = fork("./subprocess/all-time-zones.js");
  child.on("message", function (msg) {
    res.send(msg);
    child.kill();
  });
});

// Obtaining the cityNames data by calling the function "timeForOneCity" when client requests it.
app.get("/cityNames/:id", (req, res) => {
  let child = fork("./subprocess/cityname.js");
  let cityName = req.params.id;
  child.send({ cityName });
  child.on("message", function (msg) {
    res.send(msg);
    child.kill();
  });
});

// Obtaining the nextfivehours data by calling the function "nextNhoursWeather" when client request it.
app.post("/nextfivehrs", (req, res) => {
  let child = fork("./subprocess/nextfivehrs");
  let cityData = req.body;
  child.send(cityData);
  child.on("message", function (msg) {
    res.send(msg);
    child.kill();
  });
});

// Listening to server & checking for connected or error status
app.listen(port, (error) => {
  if (error) {
    throw error;
  } else {
    console.log("connected");
  }
});
