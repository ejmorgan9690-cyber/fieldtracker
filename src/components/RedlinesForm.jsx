import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Map, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function RedlinesForm() {
  const { authUser, addRedline } = useAppContext();
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `--`;
  };

  const [date, setDate] = useState(getLocalDateString());
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
    
    // Pass default "N/A" values for stripped fields so we don't break Supabase constraints,
    // and default to NOT shared with resident
    addRedline({
      inspector: authUser.name,
      date,
      rdtSection: 'N/A',
      route: 'N/A',
      location: 'N/A',
      psNumber: 'N/A',
      imageData,
      notes: '',
      sharedWithResident: false,
      swap_start_lat: null,
      swap_start_lng: null,
      swap_end_lat: null,
      swap_end_lng: null
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
          <p className="mt-1 text-sm text-slate-500 font-medium">Submit a hard-copy redline print for <span className="font-bold text-purple-600">{authUser?.name}</span>. Redlines will remain private to you unless explicitly sent to the resident.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Date */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <div className="w-full sm:max-w-xs">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Redline Image Upload</h3>
          
          {!imagePreview ? (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <div className="text-sm font-medium text-slate-700 mb-1">
                Click to upload or take a picture
              </div>
              <p className="text-xs text-slate-500">
                Supports JPG, PNG (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl border-2 border-purple-200 overflow-hidden bg-white">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageData(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:text-red-600 hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <img src={imagePreview} alt="Redline Preview" className="w-full h-auto max-h-[600px] object-contain" />
              <div className="bg-purple-50 p-3 border-t border-purple-100 flex items-center justify-center text-sm font-medium text-purple-700">
                <ImageIcon className="h-4 w-4 mr-2" /> Image Attached Successfully
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium flex items-center">
            Redline uploaded successfully!
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow hover:bg-purple-700 transition-colors">
            Upload Redline
          </button>
        </div>
      </form>
    </div>
  );
}
