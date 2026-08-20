import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, CheckCircle, Search, X, Info } from 'lucide-react';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import * as turf from '@turf/turf';

const getTownKey = (feature) => {
  const p = feature.properties || {};
  const exchangeInfo = p.Exchange || p.path || p.layer || '';
  if (!exchangeInfo) return 'Unknown';
  
  const ex = exchangeInfo.toLowerCase();
  if (ex.includes('shid') || ex.includes('tel')) return 'Shidler';
  if (ex.includes('wyn')) return 'Wynona';
  
  return 'Unknown';
};

const normalizeRdt = (val) => {
  if (!val) return '';
  return val.replace(/^Node\s+/i, '').trim();
};

export default function MapRoute() {
  const { entries } = useAppContext();
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(true);

  // Pre-calculate indexes and completed segments for fast rendering
  const { completedHandholes, completedSegments } = useMemo(() => {
    const completedHH = new Set();
    const segments = [];
    if (!entries || !geoData) return { completedHandholes: completedHH, completedSegments: segments };

    // 1. Build indexes of the GeoJSON data for quick lookup
    const pointsMap = new Map(); // key: "Town_Csa_Route_Loc"
    const linesMap = new Map();  // key: "Town_Csa_Route", value: Array of LineStrings

    geoData.features.forEach(f => {
      const p = f.properties || {};
      const town = getTownKey(f);
      
      if (f.geometry && f.geometry.type === 'Point' && p.Csa && p.Rt__no_ && p.Loc__no_) {
        const normCsa = normalizeRdt(p.Csa);
        pointsMap.set(`${town}_${normCsa}_${p.Rt__no_}_${p.Loc__no_}`, f);
      }
      if (f.geometry && f.geometry.type === 'LineString' && p.CSA && p.Route) {
        const normCsa = normalizeRdt(p.CSA);
        const key = `${town}_${normCsa}_${p.Route}`;
        if (!linesMap.has(key)) linesMap.set(key, []);
        linesMap.get(key).push(f);
      }
    });

    // 2. Process Accepted entries
    const segmentFootage = new Map(); // key: hhKey, value: cumulative footage

    entries.forEach(entry => {
      if (entry.status === 'Accepted' && entry.taskType !== 'Drop') {
        const town = entry.town || 'Shidler'; // Default to Shidler for older logs
        const rdt = normalizeRdt(entry.rdtSection);
        const route = entry.route ? entry.route.replace('Route ', '') : '';
        const loc = entry.location;
        const hhKey = `${town}_${rdt}_${route}_${loc}`;
        
        if (entry.taskType === 'Hand Hole') {
          // ONLY highlight the handhole icon if they specifically logged a Hand Hole
          completedHH.add(hhKey);
        } else {
          // For routes (Bore, Plow, Fiber), calculate cumulative footage
          const ft = parseFloat(entry.footage) || 0;
          if (ft > 0) {
            const currentFt = segmentFootage.get(hhKey) || 0;
            segmentFootage.set(hhKey, currentFt + ft);
          }
        }
      }
    });
    
    // 3. Render Route Lines dynamically based on cumulative footage
    for (const [hhKey, totalFt] of segmentFootage.entries()) {
      const [town, rdt, route, loc] = hhKey.split('_');
      const routeLines = linesMap.get(`${town}_${rdt}_${route}`);
      const endPoint = pointsMap.get(hhKey);
      
      if (routeLines && routeLines.length > 0 && endPoint) {
        // Find the specific line segment that this handhole sits on
        let routeLine = routeLines[0];
        if (routeLines.length > 1) {
          let minD = Infinity;
          routeLines.forEach(l => {
            const d = turf.pointToLineDistance(endPoint, l);
            if (d < minD) {
              minD = d;
              routeLine = l;
            }
          });
        }

        // Find the Start Point (previous location, or start of the line if Loc 1)
        let startPoint = null;
        const prevLocStr = String(parseInt(loc, 10) - 1);
        if (pointsMap.has(`${town}_${rdt}_${route}_${prevLocStr}`)) {
          startPoint = pointsMap.get(`${town}_${rdt}_${route}_${prevLocStr}`);
        } else {
          startPoint = turf.point(routeLine.geometry.coordinates[0]);
        }
        
        try {
          // Slice the full physical line segment between the two locations
          const fullSegment = turf.lineSlice(startPoint, endPoint, routeLine);
          const fullLengthFt = turf.length(fullSegment, {units: 'feet'});
          
          let renderSegment = fullSegment;
          
          // Partial Route Highlighting!
          // If the logged footage is less than the physical length, cut it short.
          // Buffer of 15 feet prevents tiny visually missing gaps if measurements slightly mismatch.
          if (totalFt < (fullLengthFt - 15)) {
            renderSegment = turf.lineSliceAlong(fullSegment, 0, totalFt, {units: 'feet'});
          }
          
          const latLngs = renderSegment.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          segments.push({ key: hhKey, positions: latLngs });
        } catch (err) {
          console.warn("Could not slice line segment for", hhKey, err);
          const startCoords = startPoint.geometry.coordinates;
          const endCoords = endPoint.geometry.coordinates;
          segments.push({ key: hhKey, positions: [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]] });
        }
      }
    }
    
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
      const town = getTownKey(feature);
      const csa = normalizeRdt(p.Csa);
      const rts = p.Rt__no_ ? String(p.Rt__no_).split(/[\/,&]/).map(s => s.trim()) : [''];
      const loc = p.Loc__no_ || '';
      
      // If the handhole is shared (e.g., Rt__no_ is "1/3"), check if any of the routes are completed
      const isCompleted = rts.some(rt => completedHandholes.has(`${town}_${csa}_${rt}_${loc}`));
      
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

  // Component for searching and flying the map to a specific location
  const MapSearch = ({ geoData, entries }) => {
    const map = useMap();
    const [isMinimized, setIsMinimized] = useState(false);
    const [searchTown, setSearchTown] = useState('Shidler');
    const [searchRdt, setSearchRdt] = useState('');
    const [searchRoute, setSearchRoute] = useState('');
    const [searchLoc, setSearchLoc] = useState('');

    const options = useMemo(() => {
      if (!geoData) return { rdts: [], routes: [], locs: [] };
      const rdts = new Set();
      const routes = new Set();
      const locs = new Set();
      
      geoData.features.forEach(f => {
        const p = f.properties || {};
        if (getTownKey(f) !== searchTown) return;

        const csaPoint = p.Csa ? p.Csa.replace(/^Node\s+/i, '').trim() : '';
        const csaLine = p.CSA ? p.CSA.replace(/^Node\s+/i, '').trim() : '';

        if (csaPoint) rdts.add(csaPoint);
        if (csaLine) rdts.add(csaLine);

        if (searchRdt && (csaPoint === searchRdt || csaLine === searchRdt)) {
          if (p.Rt__no_) routes.add(p.Rt__no_);
          if (p.Route) routes.add(p.Route);
          
          if (searchRoute && (p.Rt__no_ === searchRoute || p.Route === searchRoute)) {
            if (p.Loc__no_) locs.add(p.Loc__no_);
          }
        }
      });
      return { 
        rdts: Array.from(rdts).sort(), 
        routes: Array.from(routes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), 
        locs: Array.from(locs).sort((a, b) => parseInt(a) - parseInt(b)) 
      };
    }, [geoData, searchTown, searchRdt, searchRoute]);

    const handleJumpToLatest = (e) => {
      e.preventDefault();
      if (!entries || !geoData) return;
      
      // Find the most recently accepted log
      const latestAccepted = [...entries]
        .filter(entry => entry.status === 'Accepted')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        
      if (!latestAccepted) {
        alert("No accepted logs found yet.");
        return;
      }
      
      const tTown = latestAccepted.town || 'Shidler';
      const tRdt = normalizeRdt(latestAccepted.rdtSection);
      const tRoute = latestAccepted.route ? latestAccepted.route.replace('Route ', '') : '';
      const tLoc = latestAccepted.location;
      
      // Auto-fill the search form to match the latest
      setSearchTown(tTown);
      setSearchRdt(tRdt);
      setSearchRoute(tRoute);
      setSearchLoc(tLoc || '');
      
      const matchedFeatures = geoData.features.filter(f => {
        const p = f.properties || {};
        if (getTownKey(f) !== tTown) return false;
        
        const csaPoint = p.Csa ? p.Csa.replace(/^Node\s+/i, '').trim() : '';
        const csaLine = p.CSA ? p.CSA.replace(/^Node\s+/i, '').trim() : '';

        if (tRdt && csaPoint !== tRdt && csaLine !== tRdt) return false;
        if (tRoute && p.Rt__no_ !== tRoute && p.Route !== tRoute) return false;
        if (tLoc && p.Loc__no_ !== tLoc) return false;
        
        if (!tRdt && !tRoute && !tLoc) return false;
        return true;
      });

      if (matchedFeatures.length > 0) {
        const group = L.geoJSON({ type: 'FeatureCollection', features: matchedFeatures });
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, duration: 1.5 });
        }
      }
    };

    const handleSearch = (e) => {
      e.preventDefault();
      if (!geoData) return;

      const matchedFeatures = geoData.features.filter(f => {
        const p = f.properties || {};
        if (getTownKey(f) !== searchTown) return false;
        
        const csaPoint = p.Csa ? p.Csa.replace(/^Node\s+/i, '').trim() : '';
        const csaLine = p.CSA ? p.CSA.replace(/^Node\s+/i, '').trim() : '';

        if (searchRdt && csaPoint !== searchRdt && csaLine !== searchRdt) return false;
        if (searchRoute && p.Rt__no_ !== searchRoute && p.Route !== searchRoute) return false;
        if (searchLoc && p.Loc__no_ !== searchLoc) return false;

        // If they didn't select anything beyond town, don't just match all
        if (!searchRdt && !searchRoute && !searchLoc) return false;

        return true;
      });

      if (matchedFeatures.length > 0) {
        const group = L.geoJSON({ type: 'FeatureCollection', features: matchedFeatures });
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, duration: 1.5 });
        }
      } else {
        alert('No exact location match found on map.');
      }
    };

    if (isMinimized) {
      return (
        <button 
          onClick={() => setIsMinimized(false)}
          className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-all"
          title="Open Map Search"
        >
          <Search className="w-5 h-5" />
        </button>
      );
    }

    return (
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center">
            <Search className="w-4 h-4 mr-1.5 text-indigo-600" />
            Location Jump
          </h4>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleJumpToLatest}
              title="Jump to Latest Log"
              className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-1 px-2 rounded transition-colors flex items-center"
            >
              Latest
            </button>
            <button 
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Town</label>
            <select 
              value={searchTown} 
              onChange={(e) => { setSearchTown(e.target.value); setSearchRdt(''); setSearchRoute(''); setSearchLoc(''); }}
              className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="Shidler">Shidler</option>
              <option value="Wynona">Wynona</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Node / RDT Section</label>
            <select 
              value={searchRdt} 
              onChange={(e) => { setSearchRdt(e.target.value); setSearchRoute(''); setSearchLoc(''); }}
              className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="">-- Select Node --</option>
              {options.rdts.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Route</label>
            <select 
              value={searchRoute} 
              onChange={(e) => { setSearchRoute(e.target.value); setSearchLoc(''); }}
              disabled={!searchRdt}
              className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Select Route --</option>
              {options.routes.map(r => <option key={r} value={r}>Route {r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location (Handhole) <span className="font-normal text-slate-400">- Optional</span></label>
            <select 
              value={searchLoc} 
              onChange={(e) => setSearchLoc(e.target.value)}
              disabled={!searchRoute}
              className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1.5 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- All Locations --</option>
              {options.locs.map(l => <option key={l} value={l}>Location {l}</option>)}
            </select>
          </div>

          <button 
            type="submit"
            disabled={!searchRdt}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Jump to Location
          </button>
        </form>
      </div>
    );
  };

  // Component to automatically adjust bounds to fit the geojson data on initial load
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
              <MapSearch geoData={geoData} entries={entries} />
            </>
          )}
        </MapContainer>

        {/* Legend Overlay */}
        {!showLegend ? (
          <button 
            onClick={() => setShowLegend(true)}
            className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            title="Open Legend"
          >
            <Info className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 max-w-[calc(100vw-2rem)]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center">
                <Info className="w-4 h-4 mr-1.5 text-indigo-600" />
                Status Legend
              </h4>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1 ml-4"
                title="Close Legend"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
        )}
      </div>
    </div>
  );
}
