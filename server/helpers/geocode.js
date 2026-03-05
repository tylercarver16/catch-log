import axios from 'axios';

// turns coordinates into something readable like "Lake Fork, Texas"
export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon: lng, zoom: 14 },
      headers: { 'User-Agent': 'BassLog/2.0' },
      timeout: 5000,
    });
    const addr = data.address || {};
    const parts = [];
    for (const key of ['water', 'lake', 'reservoir', 'river', 'bay',
                        'natural', 'leisure', 'hamlet', 'village',
                        'suburb', 'town', 'city']) {
      if (addr[key]) {
        parts.push(addr[key]);
        if (parts.length === 2) break;
      }
    }
    if (addr.state) parts.push(addr.state);
    return parts.length ? parts.join(', ') : null;
  } catch (e) {
    console.debug('Reverse geocode failed:', e.message);
    return null;
  }
}
