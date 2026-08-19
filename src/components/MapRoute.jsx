import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import L from 'leaflet';

export default function MapRoute() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fix Leaflet's default icon paths not working in React apps sometimes
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    fetch('/route.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load map data');
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading geojson:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getStyle = (feature) => {
    // Render lines as red lines as requested
    return {
      color: '#ef4444', // Red line for fiber route
      weight: 4,
      opacity: 0.9,
    };
  };

  const pointToLayer = (feature, latlng) => {
    const p = feature.properties || {};
    
    // Check if it is a Handhole (either by Loc__type or if the icon implies a square)
    const isHandhole = p.Loc__type === 'HH' || (p.name && p.name.match(/^[A-Z0-9]+-[0-9]+$/)) || (p.icon && p.icon.includes('square'));
    
    if (isHandhole) {
      // Create a small black square with the label next to it
      const html = `
        <div style="display: flex; align-items: center; transform: translate(-5px, -5px);">
          <div style="width: 10px; height: 10px; background-color: black; border: 1px solid white; flex-shrink: 0;"></div>
          <span style="margin-left: 4px; font-size: 11px; font-weight: 900; color: black; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; white-space: nowrap;">
            ${p.name || ''}
          </span>
        </div>
      `;
      
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'custom-hh-icon',
          html: html,
          iconSize: [0, 0], // The CSS handles the layout
          iconAnchor: [0, 0]
        })
      });
    } else {
      // Other generic points (make them small circle markers so they don't block the screen)
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: p['icon-color'] || '#3b82f6',
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.8
      });
    }
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      let popupContent = `<strong>${p.name || 'Feature'}</strong>`;
      if (p.Loc__type) popupContent += `<br/>Type: ${p.Loc__type}`;
      if (p.descriptio) popupContent += `<br/>${p.descriptio}`;
      layer.bindPopup(popupContent);
    }
  };

  // Component to automatically adjust bounds to fit the geojson data
  const FitBounds = ({ data }) => {
    const map = useMap();
    useEffect(() => {
      if (data) {
        const bounds = L.geoJSON(data).getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }, [data, map]);
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Layers className="h-8 w-8 mr-3 text-indigo-600" />
            Interactive Route Map
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Project design overlay mapped directly from KanOkla engineering files.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-indigo-600 font-bold">Loading optimized route data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-red-500 font-bold text-lg mb-2">Failed to load map</p>
              <p className="text-slate-500">{error}</p>
            </div>
          </div>
        )}

        <MapContainer 
          center={[36.737, -96.499]} // Fallback center
          zoom={12} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <>
              <GeoJSON data={geoData} style={getStyle} onEachFeature={onEachFeature} pointToLayer={pointToLayer} />
              <FitBounds data={geoData} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
