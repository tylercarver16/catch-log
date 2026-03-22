import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api.js';
import { markerColor, fmtWeight } from '../utils.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makePinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.28))">
      <path d="M14 1C7.9 1 3 5.9 3 12c0 7.7 11 22 11 22s11-14.3 11-22c0-6.1-4.9-11-11-11z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="14" cy="12" r="4" fill="rgba(255,255,255,0.5)"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
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
  const icon = L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:22px;height:22px">
        <div style="position:absolute;inset:0;border-radius:50%;background:var(--bb-water);opacity:0.18"></div>
        <div style="position:absolute;inset:5px;border-radius:50%;background:var(--bb-water);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>
      </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  return <Marker position={pos} icon={icon} />;
}

export default function MapView() {
  const [catches, setCatches] = useState([]);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMapCatches(), api.getSettings()]).then(([data, s]) => {
      setCatches(data);
      setWeightUnit(s.weight_unit || 'lbs');
    });
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
              <div style={{ minWidth: 190 }}>
                {c.thumb_url && <img src={c.thumb_url} alt="" style={{ width: '100%', display: 'block', borderRadius: 4, marginBottom: 8 }} />}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{c.species || 'Unknown'}</div>
                  {c.weight != null && (
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.25rem', lineHeight: 1, color: '#2ECC71', whiteSpace: 'nowrap' }}>
                      {fmtWeight(c.weight, weightUnit)}
                    </div>
                  )}
                </div>
                <div className="text-muted small">{c.date}{c.temp != null ? ` · ${c.temp}°F` : ''}</div>
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
