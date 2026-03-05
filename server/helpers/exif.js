import exifr from 'exifr';

// pulls datetime and GPS out of image EXIF, returns { dt, lat, lng, estimated }
export async function extractExif(filepath) {
  try {
    // using pick alongside gps:true breaks GPS processing, so just parse everything
    const data = await exifr.parse(filepath, { gps: true });

    if (!data) return { dt: new Date(), lat: null, lng: null, estimated: true };

    // timestamp
    let dt = data.DateTimeOriginal || data.DateTimeDigitized || data.DateTime || null;
    const estimated = !dt;
    if (!dt) dt = new Date();
    else if (!(dt instanceof Date)) dt = new Date(dt);

    // gps:true makes exifr put decimal coords in data.latitude / data.longitude
    let lat = null, lng = null;
    if (data.latitude != null && data.longitude != null) {
      lat = Number(data.latitude.toFixed(6));
      lng = Number(data.longitude.toFixed(6));
    }

    return { dt, lat, lng, estimated };
  } catch {
    return { dt: new Date(), lat: null, lng: null, estimated: true };
  }
}
