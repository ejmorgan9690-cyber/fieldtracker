import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { kml } from '@tmcw/togeojson';
import { Upload, FileUp, X, MapPin, Image as ImageIcon } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for staked points
const stakedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function StakingMap() {
  const { stakingPoints } = useAppContext();
  const [geoJsonData, setGeoJsonData] = useState(null);
  
  // Blueprint photo state
  const [blueprintImage, setBlueprintImage] = useState(null);

  const [mapCenter, setMapCenter] = useState([36.0, -96.0]);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef(null);

  // If there are staking points, center on the most recent one
  useEffect(() => {
    if (stakingPoints && stakingPoints.length > 0) {
      const latest = stakingPoints[stakingPoints.length - 1];
      setMapCenter([latest.lat, latest.lng]);
    }
  }, [stakingPoints]);

  const handleKmlUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const kmlText = event.target.result;
        const dom = new DOMParser().parseFromString(kmlText, 'text/xml');
        const converted = kml(dom);
        setGeoJsonData(converted);
        
        // Try to automatically center map on the newly loaded KML
        if (converted.features && converted.features.length > 0) {
          const firstFeature = converted.features[0];
          let coords = null;
          if (firstFeature.geometry.type === 'Point') {
            coords = [firstFeature.geometry.coordinates[1], firstFeature.geometry.coordinates[0]];
          } else if (firstFeature.geometry.type === 'LineString' || firstFeature.geometry.type === 'Polygon') {
            const firstCoord = firstFeature.geometry.coordinates[0];
            // Handle nested coordinates in polygons
            if (Array.isArray(firstCoord[0])) {
               coords = [firstCoord[0][1], firstCoord[0][0]];
            } else {
               coords = [firstCoord[1], firstCoord[0]];
            }
          }
          if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
            setMapCenter(coords);
          }
        }
      } catch (err) {
        console.error("Error parsing KML:", err);
        alert("Failed to parse KML file. Please ensure it is valid.");
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Image is too large. Please choose an image under 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBlueprintImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeKml = () => {
    setGeoJsonData(null);
  };

  const removeImage = () => {
    setBlueprintImage(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
              <MapPin className="h-5 w-5 text-indigo-600 mr-2" /> Staking Map & Blueprints
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-lg">
              Load an office KML to plot digital lines directly on the map, OR load a Hard Copy Photo to view the blueprint side-by-side with your live GPS location.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
             {!geoJsonData ? (
               <label className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-sm">
                 <FileUp className="h-4 w-4 mr-2" /> Upload KML
                 <input type="file" accept=".kml" className="hidden" onChange={handleKmlUpload} />
               </label>
             ) : (
               <div className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg w-full sm:w-auto justify-between sm:justify-center border border-slate-200">
                 <span className="truncate max-w-[150px] text-sm mr-3">KML Loaded</span>
                 <button onClick={removeKml} className="text-slate-400 hover:text-red-500 transition-colors" title="Remove KML">
                   <X className="h-4 w-4" />
                 </button>
               </div>
             )}

             {!blueprintImage ? (
               <label className="flex items-center px-4 py-2 bg-amber-50 text-amber-700 font-semibold rounded-lg hover:bg-amber-100 transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-sm">
                 <ImageIcon className="h-4 w-4 mr-2" /> Upload Hard Copy Map
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
             ) : (
               <div className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg w-full sm:w-auto justify-between sm:justify-center border border-slate-200">
                 <span className="truncate max-w-[150px] text-sm mr-3">Hard Copy Loaded</span>
                 <button onClick={removeImage} className="text-slate-400 hover:text-red-500 transition-colors" title="Remove Image">
                   <X className="h-4 w-4" />
                 </button>
               </div>
             )}
          </div>
        </div>

        <div className={`flex-1 w-full bg-slate-200 relative z-0 flex flex-col ${blueprintImage ? 'lg:flex-row' : ''}`}>
          
          {/* Leaflet Map Section */}
          <div className={`relative h-full ${blueprintImage ? 'lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-300' : 'w-full'}`} style={{ minHeight: '300px' }}>
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Render Office KML Blueprint */}
              {geoJsonData && (
                <GeoJSON 
                  key={JSON.stringify(geoJsonData)} 
                  data={geoJsonData} 
                  style={{
                    color: '#4f46e5', // indigo-600
                    weight: 3,
                    opacity: 0.7
                  }}
                />
              )}

              {/* Render Logged Staking Points */}
              {(stakingPoints || []).map((point) => (
                <Marker 
                  key={point.id} 
                  position={[point.lat, point.lng]}
                  icon={stakedIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-sm mb-1">Staking Point</h4>
                      <p className="text-xs mb-0.5"><b>RDT:</b> {point.rdt_section}</p>
                      <p className="text-xs mb-0.5"><b>Route:</b> {point.route}</p>
                      <p className="text-xs mb-2"><b>Loc:</b> {point.location}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Hard Copy Blueprint Section (Split Screen) */}
          {blueprintImage && (
            <div className="h-full lg:w-1/2 bg-slate-900 flex flex-col relative" style={{ minHeight: '300px' }}>
              <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1 rounded shadow text-sm font-semibold backdrop-blur-sm">
                Hard Copy Reference
              </div>
              <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center">
                <img 
                  src={blueprintImage} 
                  alt="Hard Copy Map" 
                  className="max-w-full max-h-full object-contain rounded shadow-lg border border-slate-700" 
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
