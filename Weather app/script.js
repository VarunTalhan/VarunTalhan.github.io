// script.js

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  if (city) {
    getWeather(city);
  }
});

async function getWeather(city) {
  const keyResponse = await fetch("/api/getKey");
  const keyData = await keyResponse.json();
  const apiKey = keyData.apiKey;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod !== 200) throw new Error(data.message);

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `🌡️ Temperature: ${data.main.temp}°C`;
    description.textContent = `📌 Condition: ${data.weather[0].description}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  } catch (error) {
    cityName.textContent = "City not found ❌";
    temperature.textContent = "";
    description.textContent = "";
    weatherIcon.src = "";
  }
}
