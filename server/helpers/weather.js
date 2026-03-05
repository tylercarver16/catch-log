import axios from 'axios';

// grabs weather from Open-Meteo for a given location + time, returns null on failure
export async function fetchWeather(lat, lng, dt) {
  if (!lat || !lng || !dt) return null;
  const dateStr = dt.toISOString().slice(0, 10);
  const daysDiff = Math.floor((Date.now() - dt.getTime()) / 86400000);
  const common = {
    latitude: lat,
    longitude: lng,
    hourly: 'temperature_2m,windspeed_10m,winddirection_10m,precipitation,cloudcover',
    temperature_unit: 'fahrenheit',
    windspeed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  };
  try {
    let url, params;
    if (daysDiff <= 6) {
      url = 'https://api.open-meteo.com/v1/forecast';
      params = { ...common, past_days: Math.max(daysDiff + 1, 1), forecast_days: 1 };
    } else {
      url = 'https://archive-api.open-meteo.com/v1/archive';
      params = { ...common, start_date: dateStr, end_date: dateStr };
    }
    const { data } = await axios.get(url, { params, timeout: 10000 });
    const times = data.hourly.time;
    const best = times.reduce((bi, t, i) =>
      Math.abs(new Date(t) - dt) < Math.abs(new Date(times[bi]) - dt) ? i : bi, 0);
    const h = data.hourly;
    return {
      temp:        h.temperature_2m[best],
      wind_speed:  h.windspeed_10m[best],
      wind_dir:    h.winddirection_10m[best],
      precip:      h.precipitation[best],
      cloud_cover: h.cloudcover[best],
    };
  } catch (e) {
    console.warn('Weather fetch failed:', e.message);
    return null;
  }
}
