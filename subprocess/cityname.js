const {
timeForOneCity
} = require("@aadhithyasb1/time-zone/time-zone");
process.on("message",(param)=>{
    process.send(timeForOneCity(param.cityName))
})