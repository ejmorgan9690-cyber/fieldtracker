import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { Map, Trash2, Maximize2, X } from 'lucide-react';

export default function MasterRedlines() {
  const { redlines, clearData } = useAppContext();
  const [filterInspector, setFilterInspector] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredRedlines = useMemo(() => {
    let result = redlines;
    if (filterInspector) {
      result = result.filter(r => r.inspector === filterInspector);
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [redlines, filterInspector]);

  const uniqueInspectors = useMemo(() => {
    const inspectors = new Set(redlines.map(r => r.inspector));
    return Array.from(inspectors).sort();
  }, [redlines]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3.5 rounded-xl mr-5 border border-purple-100 shadow-sm">
              <Map className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Master Redlines</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">Aggregate view of all uploaded hard-copy redlines.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <input type="text" list="inspector-options-MasterRedlines" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterRedlines">
              {uniqueInspectors.map(i => <option key={i} value={i} />)}
            </datalist>
            
            {filterInspector && (
               <button onClick={() => setFilterInspector('')} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">Clear</button>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 min-h-[500px]">
          {filteredRedlines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRedlines.map((redline) => (
                <div key={redline.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{redline.rdtSection}</p>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{redline.route} • {redline.location}</h3>
                      <p className="text-xs text-slate-500 mt-1">By {redline.inspector} on {formatDate(redline.date)}</p>
                    </div>
                  </div>
                  <div className="relative group cursor-pointer bg-slate-100 aspect-[4/3]" onClick={() => setSelectedImage(redline)}>
                    <img 
                      src={redline.imageData} 
                      alt={`Redline for ${redline.location}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-2 rounded-full shadow-sm transform scale-90 group-hover:scale-100 transition-all">
                        <Maximize2 className="h-5 w-5 text-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 font-medium">No redlines found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedImage.route} • {selectedImage.location}</h3>
                <p className="text-sm text-slate-500">{selectedImage.rdtSection} | Uploaded by {selectedImage.inspector} on {formatDate(selectedImage.date)}</p>
              </div>
              <button onClick={() => setSelectedImage(null)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-slate-100 flex justify-center items-center">
              <img src={selectedImage.imageData} alt="Full Redline" className="max-w-full h-auto shadow-md rounded-lg border border-slate-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
