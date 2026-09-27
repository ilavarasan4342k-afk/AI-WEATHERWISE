# AI WeatherWise — Setup & Run Guide

## 1. Install Node.js and MongoDB
- Node.js v16+ : https://nodejs.org
- MongoDB Community (local) : https://www.mongodb.com/try/download/community
  OR use a free MongoDB Atlas cluster (cloud) — easier if local install gives trouble.

## 2. Install project dependencies
Open this folder in VS Code terminal and run:
```
npm install
```

## 3. Configure environment variables
Copy `.env.example` to `.env`:
```
cp .env.example .env
```
Then open `.env` and fill in:
- `MONGO_URI` — your local `mongodb://127.0.0.1:27017/ai-weatherwise` or your Atlas connection string
- `JWT_SECRET` — any random long string, e.g. `mysecretkey12345`
- `OPENWEATHER_API_KEY` — optional. Get a free key at https://openweathermap.org/api. **If you leave this empty, the app still works — it returns realistic fallback weather data.**
- `GEMINI_API_KEY` — optional. Get a free key at https://aistudio.google.com/app/apikey. **If you leave this empty, the app still works — it returns rule-based fallback recommendations instead of Gemini text.**

This is exactly the "resilient fallback mode" your project description mentions — so even if Gemini setup gives trouble before your deadline, the whole app still runs and demos correctly.

## 4. Start the server
```
npm start
```
or for auto-restart during development:
```
npm run dev
```
You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

## 5. Test with Postman (in this order)

### a) Health check
`GET http://localhost:5000/api/health`

### b) Register
`POST http://localhost:5000/api/auth/register`
Body (JSON):
```json
{ "name": "Alex", "email": "alex@example.com", "password": "test123" }
```
Copy the `token` from the response.

### c) Login
`POST http://localhost:5000/api/auth/login`
```json
{ "email": "alex@example.com", "password": "test123" }
```

### d) Add a favorite location (needs token)
`POST http://localhost:5000/api/locations`
Header: `Authorization: Bearer <your token>`
```json
{ "city": "Chennai", "country": "India" }
```

### e) Get your saved locations (needs token)
`GET http://localhost:5000/api/locations`
Header: `Authorization: Bearer <your token>`

### f) Get live weather (public, no token needed)
`GET http://localhost:5000/api/weather/Chennai`

### g) Get AI insight (needs token)
`GET http://localhost:5000/api/ai/insight/Chennai`
Header: `Authorization: Bearer <your token>`
→ Returns weather + a natural-language summary and activity/clothing recommendation.

## 6. If Gemini still won't connect before your deadline
Don't worry — leave `GEMINI_API_KEY` blank in `.env`. The `/api/ai/insight/:city` route
automatically switches to a rule-based fallback (see `getFallbackInsight` in
`controllers/aiController.js`) so your demo and Postman video still work end-to-end.
You can mention in your viva/demo: "the system has a resilient fallback mode so it
works even without external API keys" — which is literally a feature your own project
spec asks for.

## 7. Project structure
```
ai-weatherwise/
├── index.js                  # entry point
├── config/db.js              # MongoDB connection
├── models/
│   ├── User.js
│   └── Location.js
├── middleware/
│   ├── authMiddleware.js      # JWT protect + role authorize
│   └── errorHandler.js
├── controllers/
│   ├── authController.js      # register, login
│   ├── locationController.js  # CRUD favorite cities
│   ├── weatherController.js   # OpenWeatherMap + fallback
│   └── aiController.js        # Gemini + fallback
├── routes/
│   ├── authRoutes.js
│   ├── locationRoutes.js
│   ├── weatherRoutes.js
│   └── aiRoutes.js
└── utils/asyncHandler.js
```
