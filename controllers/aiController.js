const { GoogleGenAI } = require("@google/genai");
const asyncHandler = require("../utils/asyncHandler");
const { getMockWeather } = require("./weatherController");
const axios = require("axios");

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Simple rule-based fallback so the endpoint still works with no Gemini key
const getFallbackInsight = (weather) => {
  const { temperature, condition, humidity } = weather;
  let activity = "It's a good day for a walk.";
  let clothing = "Wear light, comfortable clothing.";

  if (temperature >= 30) {
    activity = "It's quite hot — prefer indoor activities or swimming.";
    clothing = "Wear light cotton clothes and stay hydrated.";
  } else if (temperature <= 15) {
    activity = "It's cool — a good day for a brisk walk or jog.";
    clothing = "Carry a light jacket or sweater.";
  }

  if (/rain/i.test(condition)) {
    activity = "Rain expected — carry an umbrella and avoid outdoor plans.";
  }

  return {
    summary: `Currently ${temperature}°C with ${condition} and ${humidity}% humidity in ${weather.city}.`,
    activity_recommendation: activity,
    clothing_recommendation: clothing,
    source: "fallback-rule-based",
  };
};

// @route GET /api/ai/insight/:city
const getAIInsight = asyncHandler(async (req, res) => {
  const { city } = req.params;
  if (!city) {
    return res.status(400).json({ success: false, message: "City is required" });
  }

  // Step 1: get weather data (reuses the same OpenWeatherMap-or-mock logic)
  let weather;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    weather = getMockWeather(city);
  } else {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;
      const response = await axios.get(url);
      const d = response.data;
      weather = {
        city: d.name,
        temperature: d.main.temp,
        feels_like: d.main.feels_like,
        humidity: d.main.humidity,
        condition: d.weather[0].description,
        wind_speed: d.wind.speed,
      };
    } catch (err) {
      weather = getMockWeather(city);
    }
  }

  // Step 2: no Gemini key configured -> return rule-based fallback insight
  if (!ai) {
    return res.status(200).json({
      success: true,
      message: "AI insight generated (fallback mode — set GEMINI_API_KEY for real AI insights)",
      weather,
      insight: getFallbackInsight(weather),
    });
  }

  // Step 3: call Gemini for a natural-language summary + recommendations
  try {
    const prompt = `You are a helpful weather assistant. Given this weather data for ${weather.city}:
Temperature: ${weather.temperature}°C, Feels like: ${weather.feels_like}°C, Condition: ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.wind_speed} m/s.

Respond ONLY with a JSON object (no markdown, no backticks) in this exact shape:
{"summary": "one friendly sentence describing the weather", "activity_recommendation": "one sentence suggesting an activity", "clothing_recommendation": "one sentence suggesting what to wear"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const rawText = response.text.trim();
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const parsedInsight = JSON.parse(cleanText);

    res.status(200).json({
      success: true,
      message: "AI insight generated",
      weather,
      insight: { ...parsedInsight, source: "gemini" },
    });
  } catch (error) {
    // Gemini call or JSON parsing failed -> fall back so the endpoint never breaks
    console.error("Gemini error:", error.message);
    res.status(200).json({
      success: true,
      message: "Gemini call failed — returning fallback insight",
      weather,
      insight: getFallbackInsight(weather),
    });
  }
});

module.exports = { getAIInsight };
