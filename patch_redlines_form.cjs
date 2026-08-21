const fs = require('fs');

let content = fs.readFileSync('src/components/RedlinesForm.jsx', 'utf8');

// 1. Update imports
content = content.replace(/import { Map, Upload, Image as ImageIcon, X } from 'lucide-react';/, "import { Map, Upload, Image as ImageIcon, X, MapPin } from 'lucide-react';");

// 2. Add state variables
const stateBlockMatch = "  const [successMsg, setSuccessMsg] = useState(false);";
const stateBlockReplacement = \  const [successMsg, setSuccessMsg] = useState(false);
  
  // Route Change / Side Swap State
  const [notes, setNotes] = useState('');
  const [hasSideSwap, setHasSideSwap] = useState(false);
  const [swapStartLat, setSwapStartLat] = useState('');
  const [swapStartLng, setSwapStartLng] = useState('');
  const [swapEndLat, setSwapEndLat] = useState('');
  const [swapEndLng, setSwapEndLng] = useState('');
  
  const handleGetLocation = (type) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (type === 'start') {
          setSwapStartLat(position.coords.latitude.toFixed(6));
          setSwapStartLng(position.coords.longitude.toFixed(6));
        } else {
          setSwapEndLat(position.coords.latitude.toFixed(6));
          setSwapEndLng(position.coords.longitude.toFixed(6));
        }
      },
      () => {
        alert('Unable to retrieve your location');
      }
    );
  };\;

content = content.replace(stateBlockMatch, stateBlockReplacement);

// 3. Update handleSubmit
const submitBlockMatch = \      location,
      psNumber,
      imageData
    });\;
const submitBlockReplacement = \      location,
      psNumber,
      imageData,
      notes,
      swap_start_lat: hasSideSwap && swapStartLat ? parseFloat(swapStartLat) : null,
      swap_start_lng: hasSideSwap && swapStartLng ? parseFloat(swapStartLng) : null,
      swap_end_lat: hasSideSwap && swapEndLat ? parseFloat(swapEndLat) : null,
      swap_end_lng: hasSideSwap && swapEndLng ? parseFloat(swapEndLng) : null
    });\;

content = content.replace(submitBlockMatch, submitBlockReplacement);

// 4. Reset form fields
const resetBlockMatch = \    if (fileInputRef.current) fileInputRef.current.value = '';\;
const resetBlockReplacement = \    if (fileInputRef.current) fileInputRef.current.value = '';
    setNotes('');
    setHasSideSwap(false);
    setSwapStartLat('');
    setSwapStartLng('');
    setSwapEndLat('');
    setSwapEndLng('');\;

content = content.replace(resetBlockMatch, resetBlockReplacement);

// 5. Add UI Section
const uiBlockMatch = \        {/* Image Upload Area */}\;
const uiBlockReplacement = \        {/* Route Change / Side Swap Details */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Route Change & Side Swaps</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Change Notes / Description</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Swapped to the other side of the road due to rock."
                rows="2"
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="hasSideSwap"
                type="checkbox"
                checked={hasSideSwap}
                onChange={(e) => setHasSideSwap(e.target.checked)}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
              />
              <label htmlFor="hasSideSwap" className="ml-3 block text-sm font-semibold text-slate-700">
                Map this Side Swap with GPS Coordinates
              </label>
            </div>
            
            {hasSideSwap && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-white rounded-lg border border-slate-200">
                {/* Start GPS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-700">Start Swap GPS</label>
                    <button 
                      type="button" 
                      onClick={() => handleGetLocation('start')}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Get Location
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input type="number" step="any" placeholder="Lat" value={swapStartLat} onChange={e => setSwapStartLat(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-purple-500" />
                    <input type="number" step="any" placeholder="Lng" value={swapStartLng} onChange={e => setSwapStartLng(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-purple-500" />
                  </div>
                </div>

                {/* End GPS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-700">End Swap GPS</label>
                    <button 
                      type="button" 
                      onClick={() => handleGetLocation('end')}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Get Location
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input type="number" step="any" placeholder="Lat" value={swapEndLat} onChange={e => setSwapEndLat(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-purple-500" />
                    <input type="number" step="any" placeholder="Lng" value={swapEndLng} onChange={e => setSwapEndLng(e.target.value)} className="w-full px-3 py-2 text-sm rounded border border-slate-300 focus:ring-1 focus:ring-purple-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload Area */}\;

content = content.replace(uiBlockMatch, uiBlockReplacement);

fs.writeFileSync('src/components/RedlinesForm.jsx', content);
