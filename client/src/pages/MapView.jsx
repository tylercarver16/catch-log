import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api.js';
import { markerColor } from '../utils.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makePinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ catches }) {
  const map = useMap();
  useEffect(() => {
    if (!catches.length) return;
    if (catches.length === 1) {
      map.setView([catches[0].lat, catches[0].lng], 13);
    } else {
      const bounds = catches.map(c => [c.lat, c.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [catches, map]);
  return null;
}

function UserLocation() {
  const map = useMap();
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => {
      setPos([p.coords.latitude, p.coords.longitude]);
    });
  }, []);

  // add a locate button to the map so you can re-center on yourself
  useEffect(() => {
    const btn = L.control({ position: 'bottomright' });
    btn.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `<a href="#" title="My Location" style="font-size:11px;font-weight:600;line-height:30px;width:36px;height:30px;display:block;text-align:center;background:#fff;border-radius:4px;color:#333;text-decoration:none">loc</a>`;
      div.onclick = e => {
        e.preventDefault();
        navigator.geolocation.getCurrentPosition(p => {
          const latlng = [p.coords.latitude, p.coords.longitude];
          setPos(latlng);
          map.setView(latlng, 14);
        });
      };
      return div;
    };
    btn.addTo(map);
    return () => btn.remove();
  }, [map]);

  if (!pos) return null;
  const icon = L.circleMarker ? null : L.divIcon({
    className: '',
    html: '<div style="background:#2563eb;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  return <Marker position={pos} icon={icon || new L.Icon.Default()} />;
}

export default function MapView() {
  const [catches, setCatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMapCatches().then(setCatches);
  }, []);

  return (
    <div id="map-full">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        <FitBounds catches={catches} />
        <UserLocation />
        {catches.map(c => (
          <Marker key={c.id} position={[c.lat, c.lng]} icon={makePinIcon(c.color)}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                {c.thumb_url && <img src={c.thumb_url} alt="" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 4, marginBottom: 6 }} />}
                <div className="fw-semibold">{c.species || 'Unknown'}</div>
                <div className="text-muted small">{c.date}</div>
                {c.temp != null && <div className="text-muted small">{c.temp}°F</div>}
                <button
                  className="btn btn-sm btn-teal mt-2 w-100"
                  onClick={() => navigate(`/catch/${c.id}?ref=map`)}
                >
                  View
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
