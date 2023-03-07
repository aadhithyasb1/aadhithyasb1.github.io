// JS T2001

//fetching data.json

fetch("http://localhost:5001/weatherdata")
  .then((data) => data.text())
  .then((data) => data.replace(/�/g, "°"))
  .then((store) => JSON.parse(store))
  .then((result) => {
    let objCity = {};
    for (let key of result) {
      objCity[key.cityName] = key;
    }
    let weatherObj = new Globalvar(objCity);
    weatherObj.weather();
    weatherObj.selectingDefault();
    weatherObj.selectedIconSun();
    weatherObj.bottomSectionVariables();
    setInterval(weatherObj.updateTime.bind(weatherObj), 1000);
  });

// Global variables

class Globalvar {
  constructor(data) {
    this.weatherData = data;
    this.timerId;
    this.dataKeys;
    this.sortedCityValues = [];
    this.displayValue;
    this.count = 0;
    this.storeClimate;
    this.nextFiveHrs;
  }
  // Function for storing city names in datalist

  weather() {
    this.dataKeys = Object.keys(this.weatherData);
    let cityList = ``;
    for (let index = 0; index < this.dataKeys.length; index++) {
      cityList += `<option value=${this.dataKeys[index]}>${this.dataKeys[index]}</option>`;
    }
    document.getElementById("datalist_city_name").innerHTML = cityList;
  }

  // Function for including default city name & other values for cities

  async selectingDefault() {
    document.getElementById("data_input").value = "Kolkata";
    let selectedCityName = "Kolkata";
    let celcius = this.weatherData[selectedCityName].temperature;
    let fahrenhiet = parseInt(celcius) * (9 / 5) + 32;
    document.getElementById("tempCjs").innerHTML = celcius;
    let fahrenhietRoundOff = Math.round(fahrenhiet);
    document.getElementById("tempFjs").innerHTML = fahrenhietRoundOff + "F";
    document.getElementById("humjs").innerHTML =
      this.weatherData[selectedCityName].humidity;
    document.getElementById("precijs").innerHTML =
      this.weatherData[selectedCityName].precipitation;
    document.getElementById("idcityicon").src =
      "./Images/HTML_&_CSS/cities/" + selectedCityName + ".svg";
    let fetchedCityDetails = await fetch(
      "http://localhost:5001/cityNames/Kolkata"
    ).then((data) => data.json());
    let fetchedCityNxtFiveHrs = await fetch(
      "http://localhost:5001/nextfivehrs",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          ...fetchedCityDetails,
          hours: 5,
        }),
      }
    )
      .then((data) => data.text())
      .then((data) => data.replace(/�/g, "°"));
    fetchedCityNxtFiveHrs = await JSON.parse(fetchedCityNxtFiveHrs);
    this.nextFiveHrs = fetchedCityNxtFiveHrs.temperature;
    for (let index = 0; index < 5; index++) {
      let individualTempNxtFiveHrs = this.nextFiveHrs[index];
      document.getElementById("idrow4" + index).innerHTML =
        individualTempNxtFiveHrs;
      let parseIndividualTempNxtFiveHrs = parseInt(individualTempNxtFiveHrs);
      this.nxtFiveHrsClimateIcon(parseIndividualTempNxtFiveHrs, index);
    }
    let selectedCityTimeZone = this.weatherData[selectedCityName].timeZone;
    this.displayNxtFiveHrs(selectedCityTimeZone);
    this.displayDate(
      this.weatherData[selectedCityName].dateAndTime.split(",")[0].split("/")
    );
    document
      .getElementById("idcityname")
      .addEventListener("change", this.selecting.bind(this));
    document
      .getElementById("displaysunicon")
      .addEventListener("click", this.selectedIconSun.bind(this));
    document
      .getElementById("displaysnowicon")
      .addEventListener("click", this.selectedIconSnow.bind(this));
    document
      .getElementById("displayrainyicon")
      .addEventListener("click", this.selectedIconRain.bind(this));
    document
      .getElementById("displayname")
      .addEventListener("click", this.disTop.bind(this));
    document
      .getElementById("idarrowleft")
      .addEventListener("click", this.scrollLeft.bind(this));
    document
      .getElementById("idarrowright")
      .addEventListener("click", this.scrollRight.bind(this));
  }

  // Function for including timeZone based on selected city

  displayNxtFiveHrs(cityTimeZone) {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      let time;
      let pmAm;
      let storePm = "PM";
      time = this.getTime(cityTimeZone).split(":");
      document.getElementById("idtime").innerHTML = time[0] + ":" + time[1];
      pmAm = time[2];
      if (pmAm.split(" ")[1] == storePm) {
        document.getElementById("idam").src =
          "./Images/HTML_&_CSS/General_Images_&_Icons/pmState.svg";
      } else {
        document.getElementById("idam").src =
          "./Images/HTML_&_CSS/General_Images_&_Icons/amState.svg";
      }
      document.querySelector(".id.sec").innerHTML =
        ":" + time[2].split(" ")[0] + "&nbsp&nbsp";
      let realTimeNxtFiveHours = ``;
      realTimeNxtFiveHours += `<span>NOW</span>`;
      let hour = parseInt(time[0]);
      let cityAmPm = time[2].split(" ")[1];
      for (let index = 0; index < 4; index++) {
        if (hour + 1 < 12 && cityAmPm == "PM") {
          hour = hour + 1;
          realTimeNxtFiveHours += `<span>${hour} PM</span>`;
        } else if (hour + 1 > 12 && cityAmPm == "PM") {
          hour = 1;
          cityAmPm = "AM";
          realTimeNxtFiveHours += `<span>${hour} AM</span>`;
        } else if (hour + 1 < 12 && cityAmPm == "AM") {
          hour = hour + 1;
          realTimeNxtFiveHours += `<span>${hour} AM</span>`;
        } else if (hour + 1 == 12 && cityAmPm == "PM") {
          hour = 12;
          cityAmPm = "AM";
          realTimeNxtFiveHours += `<span>${hour} AM</span>`;
        } else {
          hour = 12;
          cityAmPm = "PM";
          realTimeNxtFiveHours += `<span>${hour} PM</span>`;
          hour = 0;
        }
        console.log(realTimeNxtFiveHours);
      }
      document.querySelector(".row1").innerHTML = realTimeNxtFiveHours;
    }, 1000);
  }

  // Function for including date based on selected city

  displayDate(selectedCityDate) {
    let month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var modifiedCityDate =
      selectedCityDate[1] +
      "-" +
      month[selectedCityDate[0] - 1] +
      "-" +
      selectedCityDate[2];
    document.getElementById("iddate").innerHTML = modifiedCityDate;
  }

  // This function is called from the function cityTimeZone

  getTime(cityTimeZone) {
    return new Date().toLocaleString("en-US", {
      timeZone: cityTimeZone,
      timeStyle: "medium",
      hourCycle: "h12",
    });
  }

  // This function is called when a city is selected & it displays the values such as temperature, humidity,
  // precipitation, date & time with respect to the selected city

  async selecting() {
    let selectedCityName = document.getElementById("data_input").value;
    let boolValue = false;
    for (let key in this.dataKeys) {
      // This loop checks whether given input is valid or not
      if (this.dataKeys[key] == selectedCityName) {
        document.getElementById("display_invalid").style.display = "none";
        document.getElementById("data_input").style.backgroundColor =
          "rgb(128, 128, 128)";
        boolValue = true;
        let celcius = this.weatherData[selectedCityName].temperature;
        let fahrenhiet = parseInt(celcius) * (9 / 5) + 32;
        document.getElementById("tempCjs").innerHTML = celcius;
        let fahrenhietRoundOff = Math.round(fahrenhiet);
        document.getElementById("tempFjs").innerHTML = fahrenhietRoundOff + "F";
        document.getElementById("humjs").innerHTML =
          this.weatherData[selectedCityName].humidity;
        document.getElementById("precijs").innerHTML =
          this.weatherData[selectedCityName].precipitation;
        document.getElementById("idcityicon").src =
          "./Images/HTML_&_CSS/cities/" + selectedCityName + ".svg";
        let fetchedCityDetails = await fetch(
          `http://localhost:5001/cityNames/${selectedCityName}`
        ).then((data) => data.json());
        let fetchedCityNxtFiveHrs = await fetch(
          "http://localhost:5001/nextfivehrs",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              ...fetchedCityDetails,
              hours: 5,
            }),
          }
        )
          .then((data) => data.text())
          .then((data) => data.replace(/�/g, "°"));
        fetchedCityNxtFiveHrs = await JSON.parse(fetchedCityNxtFiveHrs);
        this.nextFiveHrs = fetchedCityNxtFiveHrs.temperature;
        for (let index = 0; index < 5; index++) {
          let individualTempNxtFiveHrs = this.nextFiveHrs[index];

          document.getElementById("idrow4" + index).innerHTML =
            individualTempNxtFiveHrs;
          let parseIndividualTempNxtFiveHrs = parseInt(
            individualTempNxtFiveHrs
          );
          this.nxtFiveHrsClimateIcon(parseIndividualTempNxtFiveHrs, index);
        }
        for (let index = 0; index < 5; index++) {
          let individualTempNxtFiveHrs = this.nextFiveHrs[index];
          document.getElementById("idrow4" + index).innerHTML =
            individualTempNxtFiveHrs;
          let parseIndividualTempNxtFiveHrs = parseInt(
            individualTempNxtFiveHrs
          );
          this.nxtFiveHrsClimateIcon(parseIndividualTempNxtFiveHrs, index);
        }
        let selectedCityTimeZone = this.weatherData[selectedCityName].timeZone;
        this.displayNxtFiveHrs(selectedCityTimeZone);
        this.displayDate(
          this.weatherData[selectedCityName].dateAndTime
            .split(",")[0]
            .split("/")
        );
      }
    }

    // if invalid input is given this loop runs

    if (!boolValue) {
      document.getElementById("display_invalid").style.display = "block";
      let storeErrorImgIcon = document.getElementById("idcityicon");
      storeErrorImgIcon.src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/erroricon.png";
      document.getElementById("tempCjs").innerHTML = "NIL";
      document.getElementById("tempFjs").innerHTML = "NIL";
      document.getElementById("humjs").innerHTML = "NIL";
      document.getElementById("precijs").innerHTML = "NIL";
      document.getElementById("idtime").innerHTML = "Nil:Nil:";
      document.getElementById("idsec").innerHTML = "Nil";
      document.getElementById("iddate").innerHTML = "Nil-Nil-Nil";
      document.getElementById("idtime").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/erroricon.png";
      document.getElementById("data_input").style.backgroundColor = "red";
      for (let index = 0; index < 5; index++) {
        document.getElementById("idrow4" + index).innerHTML = "NIL";
        document.getElementById("idrow3" + index).src =
          "./Images/HTML_&_CSS/General_Images_&_Icons/erroricon.png";
      }
      if (this.timerId) {
        clearInterval(this.timerId);
      }
      document.getElementById("idam").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/erroricon.png";
    }
  }

  // This function is used for varying the this.weather icons with respect to time intervals & temperature. This function is called by
  //selecting() function

  nxtFiveHrsClimateIcon(NxtFiveHrsValue, index) {
    if (NxtFiveHrsValue > 0 && NxtFiveHrsValue < 18) {
      document.getElementById("idrow3" + index).src =
        "./Images/HTML_&_CSS/Weather_Icons/rainyIcon.svg";
      document.getElementById("idrow3" + index).title = "rainy";
    } else if (NxtFiveHrsValue >= 18 && NxtFiveHrsValue <= 22) {
      document.getElementById("idrow3" + index).src =
        "./Images/HTML_&_CSS/Weather_Icons/windyIcon.svg";
      document.getElementById("idrow3" + index).title = "windy";
    } else if (NxtFiveHrsValue >= 23 && NxtFiveHrsValue <= 29) {
      document.getElementById("idrow3" + index).src =
        "./Images/HTML_&_CSS/Weather_Icons/cloudyIcon.svg";
      document.getElementById("idrow3" + index).title = "cloudy";
    } else if (NxtFiveHrsValue > 29) {
      document.getElementById("idrow3" + index).src =
        "./Images/HTML_&_CSS/Weather_Icons/sunnyIcon.svg";
      document.getElementById("idrow3" + index).title = "sunny";
    } else if (NxtFiveHrsValue < 0) {
      document.getElementById("idrow3" + index).src =
        "./Images/HTML_&_CSS/Weather_Icons/snowflakeIcon.svg";
      document.getElementById("idrow3" + index).title = "snow";
    }
  }

  //Middle section-T2002
  //Function for selecting weather icon
  // Function for applying border & calling the function "callfuncthis.weather" with respect to the selected climate icon
  // For sun icon

  selectedIconSun() {
    document.getElementById("displaysunicon").style = "null";
    document.getElementById("displayrainyicon").style = "null";
    document.getElementById("displaysnowicon").style = "null";
    document.getElementById("displaysunicon").style.borderBottom =
      "thin solid blue";
    this.storeClimate = "sun";
    this.sortCityValues(this.storeClimate);
    document.getElementById("idcards").innerHTML = "";
    document.getElementById("displayname").value = 3;
    this.count = 0;
    this.displayCards();
  }

  //For snow icon

  selectedIconSnow() {
    document.getElementById("displaysunicon").style = "null";
    document.getElementById("displayrainyicon").style = "null";
    document.getElementById("displaysnowicon").style.borderBottom =
      "thin solid blue";
    this.storeClimate = "snow";
    this.sortCityValues(this.storeClimate);
    document.getElementById("idcards").innerHTML = "";
    document.getElementById("displayname").value = 3;
    this.count = 0;
    this.displayCards();
  }

  // For rainy icon

  selectedIconRain() {
    document.getElementById("displaysunicon").style = "null";
    document.getElementById("displaysnowicon").style = "null";
    document.getElementById("displayrainyicon").style.borderBottom =
      "thin solid blue";
    this.storeClimate = "rainy";
    this.sortCityValues(this.storeClimate);
    document.getElementById("idcards").innerHTML = "";
    document.getElementById("displayname").value = 3;
    this.count = 0;
    this.displayCards();
  }

  //Function to sort & store the city names which satisfies the given condition

  sortCityValues() {
    let storeSortedCityValues = [];
    for (let key in this.dataKeys) {
      this.sortedCityValues = [];
      let sortCityDetails = this.weatherData[this.dataKeys[key]];
      let sortCityDetailsTemp = parseInt(sortCityDetails.temperature);
      let sortCityDetailsPreci = parseInt(sortCityDetails.precipitation);
      let sortCityDetailsHum = parseInt(sortCityDetails.humidity);
      if (this.storeClimate == "sun") {
        if (
          sortCityDetailsTemp > 29 &&
          sortCityDetailsHum < 50 &&
          sortCityDetailsPreci >= 50
        ) {
          storeSortedCityValues.push(sortCityDetails);
        }
      }
      if (this.storeClimate == "snow") {
        if (
          sortCityDetailsTemp > 20 &&
          sortCityDetailsTemp < 28 &&
          sortCityDetailsHum > 50 &&
          sortCityDetailsPreci < 50
        ) {
          storeSortedCityValues.push(sortCityDetails);
        }
      }
      if (this.storeClimate == "rainy") {
        if (sortCityDetailsTemp < 20 && sortCityDetailsHum >= 50) {
          storeSortedCityValues.push(sortCityDetails);
        }
      }
    }
    if (this.storeClimate == "sun")
      storeSortedCityValues.sort((a, b) => {
        return parseInt(b.temperature) - parseInt(a.temperature);
      });
    if (this.storeClimate == "snow")
      storeSortedCityValues.sort((a, b) => {
        return parseInt(b.precipitation) - parseInt(a.precipitation);
      });
    if (this.storeClimate == "rainy")
      storeSortedCityValues.sort((a, b) => {
        return parseInt(b.humidity) - parseInt(a.humidity);
      });
    storeSortedCityValues.forEach((e) => {
      this.sortedCityValues.push(e);
    });
  }

  // Function called when user input is given
  
  disTop() {
    this.count = this.displayValue;
    this.displayCards();
  }

  // Function to display number of cards with various values with respect to the user input

  displayCards() {
    let cityTime;
    let cityDate;
    this.displayValue = parseInt(document.getElementById("displayname").value);
    document.getElementById("idcards").innerHTML = ``;
    for (
      let index = 0;
      index < this.sortedCityValues.length && index < this.displayValue;
      index++
    ) {
      if (index >= 3) {
        document.getElementById("idarrowleft").style.display = "block";
        document.getElementById("idarrowright").style.display = "block";
      } else {
        document.getElementById("idarrowleft").style.display = "none";
        document.getElementById("idarrowright").style.display = "none";
      }
      let divCity = document.createElement("div");
      divCity.className = "city";
      document.getElementById("idcards").append(divCity);
      let divCityTop = document.createElement("div");
      divCityTop.className = "cardscitytop";
      divCity.append(divCityTop);
      let divCityName = document.createElement("div");
      divCityName.className = "cardscityname";
      divCityName.innerHTML = this.sortedCityValues[index].cityName;
      divCityTop.append(divCityName);
      let divSideIcon = document.createElement("div");
      divSideIcon.className = "sideicon";
      divCityTop.append(divSideIcon);
      let divClimateIcon = document.createElement("img");
      if (this.storeClimate == "sun") {
        divClimateIcon.setAttribute(
          "src",
          "./Images/HTML_&_CSS/Weather_Icons/sunnyIcon.svg"
        );
      }
      if (this.storeClimate == "snow") {
        divClimateIcon.setAttribute(
          "src",
          "./Images/HTML_&_CSS/Weather_Icons/snowflakeIcon.svg"
        );
      }
      if (this.storeClimate == "rainy") {
        divClimateIcon.setAttribute(
          "src",
          "./Images/HTML_&_CSS/Weather_Icons/rainyIcon.svg"
        );
      }
      divSideIcon.append(divClimateIcon);
      let divCityTemp = document.createElement("div");
      divCityTemp.className = "ctemp";
      divCityTop.append(divCityTemp);
      divCityTemp.innerHTML = this.sortedCityValues[index].temperature;
      let divCityTimeZone = this.sortedCityValues[index].timeZone;
      let divCityTime = document.createElement("p");
      divCityTime.className = "ctime";
      divCity.append(divCityTime);
      divCityTime.style.fontSize = "23px";
      let cTimerId = setInterval(() => {
        cityTime = this.getTime(divCityTimeZone).split(":");
        let divAmPm = cityTime[2];
        let divSortAmPm = divAmPm.split(" ")[1];
        divCityTime.innerHTML =
          cityTime[0] + ":" + cityTime[1] + " " + divSortAmPm;
      }, 1000);
      let divCityDate = document.createElement("p");
      divCityDate.className = "cdate";
      divCity.append(divCityDate);
      divCityDate.style.fontSize = "23px";
      cityDate = this.sortedCityValues[index].dateAndTime
        .split(",")[0]
        .split("/");
      let divCityMonth = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let modifiedCityDate =
        cityDate[1] + "-" + divCityMonth[cityDate[0] - 1] + "-" + cityDate[2];
      divCityDate.innerHTML = modifiedCityDate;
      let divCityHum = document.createElement("p");
      divCity.append(divCityHum);
      divCityHum.style.fontSize = "20px";
      let pchumimg = document.createElement("img");
      divCityHum.appendChild(pchumimg);
      pchumimg.setAttribute(
        "src",
        "./Images/HTML_&_CSS/Weather_Icons/humidityIcon.svg"
      );
      divCityHum.innerHTML +=
        "&nbsp&nbsp" + this.sortedCityValues[index].humidity;
      let divCityPreci = document.createElement("p");
      divCity.append(divCityPreci);
      divCityPreci.style.fontSize = "20px";
      let divCityPreciIcon = document.createElement("img");
      divCityPreci.appendChild(divCityPreciIcon);
      divCityPreciIcon.setAttribute(
        "src",
        "./Images/HTML_&_CSS/Weather_Icons/precipitationIcon.svg"
      );
      divCityPreci.innerHTML +=
        "&nbsp&nbsp" + this.sortedCityValues[index].precipitation;
      let divBackgroundImg = document.createElement("img");
      divBackgroundImg.className = "bimg";
      divCity.append(divBackgroundImg);
      divBackgroundImg.src =
        "./Images/HTML_&_CSS/cities/" +
        this.sortedCityValues[index].cityName +
        ".svg";
    }
  }

  // function for scroll left

  scrollLeft() {
    document.querySelector(".cards").scrollLeft -= 100;
  }

  // function for scroll right

  scrollRight() {
    document.querySelector(".cards").scrollLeft += 100;
  }

  // Bottom Section-T2003

  bottomSectionVariables() {
    this.contArrowPosition = 0;
    this.contObj = [];
    this.contDataKey = [];
    this.tempArrowPosition = 1;
    this.contTimeZone = [];
    this.contCards;
    this.contTime = [];
    this.divSortAmPm;
    document
      .getElementById("idcontarrow")
      .addEventListener("click", this.contChangeArrowPosition.bind(this));
    document
      .getElementById("idtemparrow")
      .addEventListener("click", this.tempChangeArrowPosition.bind(this));

    // calling the sorting function

    this.sortCont();
  }

  // According to the user selected option for continents sorting, it changes the arrow direction.

  contChangeArrowPosition() {
    if (this.contArrowPosition == 0) {
      this.contArrowPosition = 1;
      document.getElementById("idcontarrow").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/arrowUp.svg";
      this.contSortTemp();
    } else {
      this.contArrowPosition = 0;
      document.getElementById("idcontarrow").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/arrowDown.svg";
      this.contSortTemp();
    }
  }

  // According to the user selected option for temperature sorting, it changes the arrow direction.

  tempChangeArrowPosition() {
    if (this.tempArrowPosition == 1) {
      this.tempArrowPosition = 0;
      document.getElementById("idtemparrow").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/arrowDown.svg";
      this.contSortTemp();
    } else {
      this.tempArrowPosition = 1;
      document.getElementById("idtemparrow").src =
        "./Images/HTML_&_CSS/General_Images_&_Icons/arrowUp.svg";
      this.contSortTemp();
    }
  }

  // According to the user selected option this function will sort the continents & it sort temperature of the cities of the sorted
  //continents by calling the function "contSortTemp"

  sortCont() {
    document.querySelector(".fcardcont").innerHTML = "";
    for (const data of Object.entries(this.weatherData)) {
      this.contDataKey.push(data[1]);
    }
    if (this.contArrowPosition == 0) {
      this.contObj = [];
      let contPos = -1;
      this.contObj = this.contDataKey.sort(
        (a, b) =>
          contPos *
            a.timeZone.split("/")[0].localeCompare(b.timeZone.split("/")[0]) ||
          a.temperature - b.temperature
      );
    } else {
      this.contObj = this.contDataKey.sort((a, b) =>
        b.timeZone.split("/")[0].localeCompare(a.timeZone.split("/")[0])
      );
    }
    this.contCardsDisplay();
    this.contSortTemp();
  }

  // This function will sort the temperature

  contSortTemp() {
    this.contDataKey = [];
    let contPos, tempPos;
    this.contArrowPosition == 0 ? (contPos = -1) : (contPos = 1);
    this.tempArrowPosition == 0 ? (tempPos = -1) : (tempPos = 1);

    document.querySelector(".fcardcont").innerHTML = "";

    for (const data of Object.entries(this.weatherData)) {
      this.contDataKey.push(data[1]);
    }
    this.contObj = [];

    this.contObj = this.contDataKey.sort(
      (a, b) =>
        contPos *
          a.timeZone.split("/")[0].localeCompare(b.timeZone.split("/")[0]) ||
        tempPos * (parseInt(a.temperature) - parseInt(b.temperature))
    );
    this.contCardsDisplay(this.contObj);
  }

  // Thi function will display the cards with sorted continents & temperature

  contCardsDisplay() {
    this.contTimeZone = [];
    for (let index = 0; index < 12; index++) {
      this.contTimeZone.push(this.contObj[index].timeZone);
      this.contCards = `
  <div class="fcardcity">
    <div class="fcontname">
      <p>${this.contObj[index].timeZone.split("/")[0]}</p>
    </div>
    <div class="fcitytemp">
      <p>${this.contObj[index].temperature}</p>
    </div>
    <div class="fcityname" id="idfcityname" style="font-size:23px;">${
      this.contObj[index].cityName
    }, <span class="box_time" style="font-size:20px;"></span>
      </div>
    <div class="fcityhumidity">
      <p>
        <img
          src="./Images/HTML_&_CSS/Weather_Icons/humidityIcon.svg"
          alt="humidity"
        />${this.contObj[index].humidity}
      </p>
    </div>
  </div>`;
      document.querySelector(".fcardcont").innerHTML += this.contCards;
    }
  }

  //This function will update the time

  updateTime() {
    for (let index = 0; index < 12; index++) {
      let val = this.getTime(this.contTimeZone[index]);
      let valsplit = val.split(":");
      document.querySelectorAll(".box_time")[index].innerText =
        valsplit[0] + ":" + valsplit[1] + " " + valsplit[2].split(" ")[1];
    }
  }
}
