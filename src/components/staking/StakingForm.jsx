import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MapPin, Image as ImageIcon, Send, X, AlertCircle } from 'lucide-react';

export default function StakingForm() {
  const { authUser, addStakingPoint } = useAppContext();
  
  const [rdtSection, setRdtSection] = useState('');
  const [route, setRoute] = useState('');
  const [location, setLocation] = useState('');
  
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [referenceImage, setReferenceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        alert(`Error getting location: ${error.message}. Please ensure location services are enabled.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please choose an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setReferenceImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rdtSection || !route || !location) {
      alert("Please fill in RDT Section, Route, and Location.");
      return;
    }
    
    if (!lat || !lng) {
      alert("Please capture GPS coordinates.");
      return;
    }

    addStakingPoint({
      inspector: authUser.name,
      rdtSection,
      route,
      location,
      lat,
      lng,
      referenceImage
    });

    // Reset form for next entry
    setLat(null);
    setLng(null);
    setReferenceImage(null);
    setImagePreview(null);
    // Keep hierarchy selections to make it easy to log the next point nearby
    alert("Staking point logged successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
          <div className="bg-emerald-50 p-3.5 rounded-xl mr-5 border border-emerald-100 shadow-sm">
            <MapPin className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Log Staking Point</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Capture exact GPS coordinates for hand hole placement.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">RDT / Section</label>
              <select
                value={rdtSection}
                onChange={(e) => setRdtSection(e.target.value)}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select RDT</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i} value={String(i + 1)}>RDT {i + 1}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Route</option>
                {[...Array(50)].map((_, i) => (
                  <option key={i} value={String(i + 1)}>Route {i + 1}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Location</option>
                {[...Array(50)].map((_, i) => (
                  <option key={i} value={String(i + 1)}>Location {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Reference Map Image (Optional)</h4>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Upload hard copy map photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative inline-block w-full">
                <img src={imagePreview} alt="Reference map" className="w-full max-h-64 object-contain rounded-lg border border-slate-200" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Upload a picture of the paper map for this specific route. You can view this later when searching for the drop point.
            </p>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                type="button"
                onClick={getGPSLocation}
                disabled={isGettingLocation}
                className={`w-full max-w-sm py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${
                  lat ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                } ${isGettingLocation ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isGettingLocation ? 'Acquiring GPS...' : lat ? 'Update GPS Coordinates' : 'Get Current GPS Coordinates'}
              </button>
              
              {lat && lng && (
                <div className="text-center">
                  <span className="inline-block bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 font-bold shadow-sm">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
            >
              <Send className="h-5 w-5 mr-2" /> Log Staking Point
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
