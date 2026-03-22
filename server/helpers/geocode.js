import axios from 'axios';

// simple in-memory cache keyed by ~1km grid cell (2 decimal places ≈ 1.1km)
const cache = new Map();
function cacheKey(lat, lng) {
  return `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
}

// query Overpass for any named water body within ~1500m of the coordinates
async function nearbyWaterBody(lat, lng) {
  const query = `
    [out:json][timeout:8];
    (
      way["natural"="water"]["name"](around:1500,${lat},${lng});
      relation["natural"="water"]["name"](around:1500,${lat},${lng});
      way["water"]["name"](around:1500,${lat},${lng});
      relation["water"]["name"](around:1500,${lat},${lng});
      way["waterway"]["name"](around:500,${lat},${lng});
    );
    out tags;
  `;
  const { data } = await axios.post(
    'https://overpass-api.de/api/interpreter',
    query,
    { headers: { 'Content-Type': 'text/plain' }, timeout: 9000 }
  );
  if (!data.elements?.length) return null;
  // prefer larger features (relations > ways), then just take the first named one
  const sorted = data.elements.sort((a, b) => (a.type === 'relation' ? -1 : 1));
  return sorted[0].tags?.name || null;
}

// turns coordinates into something readable like "Lake Fork, Quitman, Texas"
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;

  const key = cacheKey(lat, lng);
  if (cache.has(key)) return cache.get(key);

  try {
    const [nominatim, waterName] = await Promise.allSettled([
      axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { format: 'json', lat, lon: lng, zoom: 14 },
        headers: { 'User-Agent': 'BiteBook/2.0' },
        timeout: 5000,
      }),
      nearbyWaterBody(lat, lng),
    ]);

    const addr = nominatim.status === 'fulfilled' ? (nominatim.value.data.address || {}) : {};
    const water = waterName.status === 'fulfilled' ? waterName.value : null;

    const parts = [];
    if (water) {
      // water body found — name is enough, skip city/county/state
      parts.push(water);
    } else {
      // fallback: check address fields for water body name
      for (const key of ['water', 'lake', 'reservoir', 'river', 'bay', 'natural']) {
        if (addr[key]) { parts.push(addr[key]); break; }
      }
      // or land place name if not on water
      if (!parts.length) {
        for (const key of ['hamlet', 'village', 'town', 'city']) {
          if (addr[key]) { parts.push(addr[key]); break; }
        }
      }
      // only append city/county + state when we have no water body name
      const place = addr.city || addr.town || addr.village || addr.county;
      if (place && !parts.includes(place)) parts.push(place);
      if (addr.state) parts.push(addr.state);
    }

    const result = parts.length ? parts.join(', ') : null;
    cache.set(key, result);
    return result;
  } catch (e) {
    console.debug('Reverse geocode failed:', e.message);
    return null;
  }
}
