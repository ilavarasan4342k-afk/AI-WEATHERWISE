const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler");

// Returns believable mock weather data when no API key is configured,
// so the rest of the app (and the AI insight step) still works end-to-end.
const getMockWeather = (city) => ({
  city,
  temperature: 28,
  feels_like: 30,
  humidity: 65,
  condition: "Partly Cloudy",
  wind_speed: 12,
  source: "fallback-mock",
});

// @route GET /api/weather/:city  (public — no login required)
const getWeather = asyncHandler(async (req, res) => {
  const { city } = req.params;
  if (!city) {
    return res.status(400).json({ success: false, message: "City is required" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Fallback mode: no key configured yet
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      message: "Weather fetched (fallback mode — set OPENWEATHER_API_KEY for live data)",
      data: getMockWeather(city),
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);
    const d = response.data;

    const weatherData = {
      city: d.name,
      temperature: d.main.temp,
      feels_like: d.main.feels_like,
      humidity: d.main.humidity,
      condition: d.weather[0].description,
      wind_speed: d.wind.speed,
      source: "openweathermap",
    };

    res.status(200).json({ success: true, message: "Weather fetched", data: weatherData });
  } catch (error) {
    // If the live API fails (bad key, city not found, network issue), fall back gracefully
    res.status(200).json({
      success: true,
      message: "Live weather API failed — returning fallback data",
      data: getMockWeather(city),
    });
  }
});

module.exports = { getWeather, getMockWeather };
