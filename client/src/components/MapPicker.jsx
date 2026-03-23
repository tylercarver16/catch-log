import { useRef, useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPicker({ lat, lng, onChange }) {
  const [markerPos, setMarkerPos] = useState(
    lat && lng && !(lat === 0 && lng === 0) ? [lat, lng] : null
  );
  const markerRef = useRef();

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const pos = [e.latlng.lat, e.latlng.lng];
        setMarkerPos(pos);
        onChange(pos[0], pos[1]);
      },
    });
    return null;
  }

  return (
    <>
      <ClickHandler />
      {markerPos && (
        <Marker
          position={markerPos}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend() {
              const pos = markerRef.current.getLatLng();
              setMarkerPos([pos.lat, pos.lng]);
              onChange(pos.lat, pos.lng);
            },
          }}
        />
      )}
    </>
  );
}
