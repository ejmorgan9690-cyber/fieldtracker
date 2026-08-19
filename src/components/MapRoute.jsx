import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, CheckCircle } from 'lucide-react';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import * as turf from '@turf/turf';

const getTownKey = (exchange) => {
  if (!exchange) return 'Unknown';
  const ex = exchange.toLowerCase();
  if (ex.includes('shid') || ex.includes('tel')) return 'Shidler';
  if (ex.includes('wyn')) return 'Wynona';
  return exchange;
};

export default function MapRoute() {
  const { entries } = useAppContext();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pre-calculate indexes and completed segments for fast rendering
  const { completedHandholes, completedSegments } = useMemo(() => {
    const completedHH = new Set();
    const segments = [];
    if (!entries || !geoData) return { completedHandholes: completedHH, completedSegments: segments };

    // 1. Build indexes of the GeoJSON data for quick lookup
    const pointsMap = new Map(); // key: "Town_Csa_Route_Loc"
    const linesMap = new Map();  // key: "Town_Csa_Route"

    geoData.features.forEach(f => {
      const p = f.properties || {};
      const town = getTownKey(p.Exchange);
      
      if (f.geometry && f.geometry.type === 'Point' && p.Csa && p.Rt__no_ && p.Loc__no_) {
        pointsMap.set(`${town}_${p.Csa}_${p.Rt__no_}_${p.Loc__no_}`, f);
      }
      if (f.geometry && f.geometry.type === 'LineString' && p.CSA && p.Route) {
        linesMap.set(`${town}_${p.CSA}_${p.Route}`, f);
      }
    });

    // 2. Process Accepted entries
    entries.forEach(entry => {
      if (entry.status === 'Accepted' && entry.taskType !== 'Drop') {
        const town = entry.town || 'Shidler'; // Default to Shidler for older logs
        const rdt = entry.rdtSection;
        const route = entry.route ? entry.route.replace('Route ', '') : '';
        const loc = entry.location;
        
        if (rdt && route && loc) {
          const hhKey = `${town}_${rdt}_${route}_${loc}`;
          completedHH.add(hhKey);

          // Find the Route Line and the End Point (this location)
          const routeLine = linesMap.get(`${town}_${rdt}_${route}`);
          const endPoint = pointsMap.get(hhKey);
          
          if (routeLine && endPoint) {
            // Find the Start Point (previous location, or start of the line if Loc 1)
            let startPoint = null;
            const prevLocStr = String(parseInt(loc, 10) - 1);
            if (pointsMap.has(`${town}_${rdt}_${route}_${prevLocStr}`)) {
              startPoint = pointsMap.get(`${town}_${rdt}_${route}_${prevLocStr}`);
            } else {
              // If no previous handhole, start from the very beginning of the Route Line
              startPoint = turf.point(routeLine.geometry.coordinates[0]);
            }
            
            try {
              // Slice the line along the actual road curves using Turf!
              const sliced = turf.lineSlice(startPoint, endPoint, routeLine);
              const latLngs = sliced.geometry.coordinates.map(coord => [coord[1], coord[0]]);
              segments.push({ key: hhKey, positions: latLngs });
            } catch (err) {
              console.warn("Could not slice line segment for", hhKey, err);
              const startCoords = startPoint.geometry.coordinates;
              const endCoords = endPoint.geometry.coordinates;
              segments.push({ key: hhKey, positions: [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]] });
            }
          }
        }
      }
    });
    
    return { completedHandholes: completedHH, completedSegments: segments };
  }, [entries, geoData]);

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
      // Check if this specific handhole is completed
      // The KML properties: Csa (e.g. 'RDT1'), Rt__no_ (e.g. '3C'), Loc__no_ (e.g. '1')
      const town = getTownKey(p.Exchange);
      const csa = p.Csa || '';
      const rt = p.Rt__no_ || '';
      const loc = p.Loc__no_ || '';
      const isCompleted = completedHandholes.has(`${town}_${csa}_${rt}_${loc}`);
      
      const bgColor = isCompleted ? '#22c55e' : 'black'; // Green if completed, black if pending
      const borderColor = isCompleted ? '#16a34a' : 'white';
      
      // Create a small box with the label next to it
      const html = `
        <div style="display: flex; align-items: center; transform: translate(-5px, -5px);">
          <div style="width: 12px; height: 12px; background-color: ${bgColor}; border: 1.5px solid ${borderColor}; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>
          <span style="margin-left: 5px; font-size: 11px; font-weight: 900; color: ${isCompleted ? '#16a34a' : 'black'}; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; white-space: nowrap;">
            ${p.name || ''}
          </span>
        </div>
      `;
      
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'custom-hh-icon',
          html: html,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      });
    } else {
      // Other generic points (make them small circle markers so they don't block the screen)
      return L.circleMarker(latlng, {
        radius: 3.5,
        fillColor: p['icon-color'] || '#3b82f6',
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.7
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
          preferCanvas={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoData && (
            <>
              <GeoJSON data={geoData} style={getStyle} onEachFeature={onEachFeature} pointToLayer={pointToLayer} />
              
              {/* Highlighted Completed Route Segments */}
              {completedSegments.map(seg => (
                <Polyline 
                  key={`highlight-${seg.key}`}
                  positions={seg.positions} 
                  pathOptions={{ color: '#22c55e', weight: 8, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }} 
                />
              ))}

              <FitBounds data={geoData} />
            </>
          )}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Status Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-black border border-white shadow-sm mr-2"></div>
              <span className="text-xs font-semibold text-slate-600">Pending / Unlogged</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 border border-green-600 shadow-sm mr-2"></div>
              <span className="text-xs font-semibold text-slate-600">Resident Accepted</span>
            </div>
            <div className="flex items-center mt-2 pt-2 border-t border-slate-100">
              <div className="w-4 h-1 bg-red-500 mr-2 rounded-full"></div>
              <span className="text-xs font-semibold text-slate-600">Fiber Route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
