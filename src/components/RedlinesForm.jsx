import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Map, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function RedlinesForm() {
  const { authUser, addRedline } = useAppContext();
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [rdtSection, setRdtSection] = useState('RDT1');
  const [route, setRoute] = useState('Route 1');
  const [location, setLocation] = useState('1');
  const [psNumber, setPsNumber] = useState('');
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const fileInputRef = useRef(null);

  const [successMsg, setSuccessMsg] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageData) {
      alert('Please select a redline image to upload.');
      return;
    }
    
    addRedline({
      inspector: authUser.name,
      date,
      rdtSection,
      route: rdtSection === 'Toll N' || rdtSection === 'Toll S' ? '-' : route,
      location,
      psNumber,
      imageData
    });
    
    // Reset form
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6">
      <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
        <div className="bg-purple-50 p-3.5 rounded-xl mr-5 border border-purple-100 shadow-sm">
          <Map className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Upload Redlines</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Submit a hard-copy redline print for <span className="font-bold text-purple-600">{authUser?.name}</span>.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Hierarchy Selection */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Node</label>
              <input
                type="text"
                list="redline-rdt-options"
                value={rdtSection}
                onChange={(e) => setRdtSection(e.target.value)}
                onClick={(e) => e.target.select()}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <datalist id="redline-rdt-options">
                {[...Array.from({ length: 10 }, (_, i) => `RDT${i + 1}`), 'Toll N', 'Toll S'].map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            {rdtSection !== 'Toll N' && rdtSection !== 'Toll S' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Route</label>
                <input
                  type="text"
                  list="redline-route-options"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  onClick={(e) => e.target.select()}
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <datalist id="redline-route-options">
                  {Array.from({ length: 20 }, (_, i) => `Route ${i + 1}`).map(r => <option key={r} value={r} />)}
                </datalist>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input
                type="text"
                list="redline-location-options"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onClick={(e) => e.target.select()}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. 1"
              />
              <datalist id="redline-location-options">
                {(rdtSection === 'Toll N' || rdtSection === 'Toll S' 
                  ? Array.from({ length: 301 }, (_, i) => `${i}`)
                  : Array.from({ length: 20 }, (_, i) => `${i + 1}`)
                ).map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">PS Number</label>
              <input
                type="text"
                value={psNumber}
                onChange={(e) => setPsNumber(e.target.value)}
                required
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. PS-101"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Redline Image Upload</h3>
          
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-colors">
            {imagePreview ? (
              <div className="relative w-full max-w-sm">
                <img src={imagePreview} alt="Redline Preview" className="rounded-lg shadow-sm border border-slate-200" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageData(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow-sm transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-center py-8 w-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mx-auto h-10 w-10 text-purple-400" />
                <div className="flex justify-center text-sm text-slate-600">
                  <span className="relative cursor-pointer bg-white rounded-md font-semibold text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                    <span>Upload a file</span>
                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit */}
        <div className="pt-6 border-t border-slate-200 mt-8">
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 active:scale-95"
          >
            Upload Redline
          </button>
          
          {successMsg && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-green-700 flex items-center animate-in fade-in slide-in-from-bottom-2">
              <ImageIcon className="h-5 w-5 mr-2 text-green-500" />
              <p className="font-semibold text-sm">Redline successfully uploaded to master file!</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
