searchButtons();

function geoCode(city, state) {
  let requestURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=4bcac4085f133666bc3803dc7ed2e35c`;
  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data) {
        let lon = data[0].lon;
        let lat = data[0].lat;
        weatherSearch(lon, lat, city);
        searchStore(city, state);
      }
    })
    // Catch error and trigger alert modal
    .catch(function () {
      alertModal();
    });
}

function weatherSearch(lon, lat, city) {
  let requestURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=4bcac4085f133666bc3803dc7ed2e35c`;

  fetch(requestURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayWeather(data, city);
    });
}

function displayWeather(data, city) {
  $("#today-weather").empty();
  $("#5day-forecast").empty();
  $("#weather-div").show();
  let date = moment.unix(data.current.dt).format("M/D/YYYY");
  let todayDiv = $("#today-weather");
  let cityDate = $("<h2>")
    .text(`${city} - ${date}`)
    .css("display", "inline-block")
    .addClass("mt-2");
  let iconLinkCurrent = `https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`;
  let currentImg = $("<img>")
    .attr("src", iconLinkCurrent)
    .css({ width: "auto", height: "auto" });
  let temp = $("<p>").text(`Temp: ${data.current.temp} \xB0F`);
  let wind = $("<p>").text(`Wind: ${data.current.wind_speed} MPH`);
  let humidity = $("<p>").text(`Humidity: ${data.current.humidity}%`);
  let UVI = data.current.uvi;
  let level;
  if (UVI < 3) {
    level = "low";
  } else if (UVI < 6) {
    level = "moderate";
  } else if (UVI < 8) {
    level = "high";
  } else if (UVI < 11) {
    level = "very-high";
  } else {
    level = "extreme";
  }
  let uvIndex = $(`<p>UV Index: <span data-uvi=${level}>${UVI}</span></p>`);
  todayDiv.append(cityDate, currentImg, temp, wind, humidity, uvIndex);

  let foreDiv = $("#5day-forecast");
  for (i = 1; i < 6; i++) {
    let foreCard = $("<div>").addClass("fore-card");
    let Date = moment.unix(data.daily[i].dt).format("M/D/YYYY");
    let foreDate = $("<h3>").text(`${Date}`);
    let iconLink = `https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`;
    let foreImg = $("<img>").attr("src", iconLink);
    let foreTempH = $("<p>").text(`High: ${data.daily[i].temp.max} \xB0F`);
    let foreTempL = $("<p>").text(`Low: ${data.daily[i].temp.min} \xB0F`);
    let foreWind = $("<p>").text(`Wind: ${data.daily[i].wind_speed} MPH`);
    let foreHumidity = $("<p>").text(`Humidity: ${data.daily[i].humidity}%`);
    foreCard.append(
      foreDate,
      foreImg,
      foreTempH,
      foreTempL,
      foreWind,
      foreHumidity
    );
    foreDiv.append(foreCard);
  }
}

$("#search-btn").on("click", function (event) {
  event.preventDefault();
  let city = $("#city-search").val().trim().split(" ");
  for (i = 0; i < city.length; i++) {
    city[i] = city[i][0].toUpperCase() + city[i].substr(1);
  }
  city = city.join(" ");
  let state = $("#state-select").val();
  $("#city-search").val("");
  geoCode(city, state);
});

function searchStore(city, state) {
  let citySearch = JSON.parse(localStorage.getItem("citySearch"));
  if (citySearch === null) {
    citySearch = [{ city: city, state: state }];
  } else {
    for (i = 0; i < citySearch.length; i++) {
      if (city === citySearch[i].city && state === citySearch[i].state) {
        return;
      }
    }

    citySearch.splice(0, 0, { city: city, state: state });
  }
  localStorage.setItem("citySearch", JSON.stringify(citySearch));
  searchButtons();
}

function searchButtons() {
  let searchArr = JSON.parse(localStorage.getItem("citySearch"));
  if (searchArr === null) {
    return;
  }
  $("#history-div").empty();
  for (i = 0; i < searchArr.length; i++) {
    let btnEl = $("<btn>")
      .addClass("btn btn-secondary w-100 my-2")
      .text(`${searchArr[i].city}, ${searchArr[i].state}`)
      .data("search", { city: searchArr[i].city, state: searchArr[i].state });
    $("#history-div").append(btnEl);
  }
}

$("#history-div").on("click", ".btn", function (event) {
  let btnEl = event.target;
  geoCode($(btnEl).data("search").city, $(btnEl).data("search").state);
});

function alertModal() {
  $("#alert-modal-title").html("Error");
  $("#alert-modal-body").html("Enter a real city!");
  $("#alert-modal").modal("show");
}
