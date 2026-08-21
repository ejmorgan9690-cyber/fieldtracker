import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { Map, Maximize2, X, Send, CheckCircle2, Trash2 } from 'lucide-react';

export default function MasterRedlines() {
  const { redlines, authUser, shareRedline, deleteRedline } = useAppContext();
  const [filterInspector, setFilterInspector] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredRedlines = useMemo(() => {
    let result = redlines;
    
    // Role-based visibility
    if (authUser?.role === 'Resident') {
      // Residents ONLY see explicitly shared redlines
      result = result.filter(r => r.sharedWithResident);
    } else if (authUser?.role === 'Inspector') {
      // Inspectors ONLY see their own redlines
      result = result.filter(r => r.inspector === authUser.name);
    }

    if (filterInspector) {
      result = result.filter(r => r.inspector === filterInspector);
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [redlines, filterInspector, authUser]);

  const uniqueInspectors = useMemo(() => {
    let visibleRedlines = redlines;
    if (authUser?.role === 'Resident') {
      visibleRedlines = redlines.filter(r => r.sharedWithResident);
    } else if (authUser?.role === 'Inspector') {
      visibleRedlines = redlines.filter(r => r.inspector === authUser.name);
    }
    const inspectors = new Set(visibleRedlines.map(r => r.inspector));
    return Array.from(inspectors).sort();
  }, [redlines, authUser]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3.5 rounded-xl mr-5 border border-purple-100 shadow-sm">
              <Map className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Redlines Feed</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                {authUser?.role === 'Resident' 
                  ? 'Aggregate view of redline prints shared by inspectors.' 
                  : 'Your private uploaded redline prints.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {authUser?.role !== 'Inspector' && (
              <>
                <input type="text" list="inspector-options-MasterRedlines" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
                <datalist id="inspector-options-MasterRedlines">
                  {uniqueInspectors.map(i => <option key={i} value={i} />)}
                </datalist>
                
                {filterInspector && (
                   <button onClick={() => setFilterInspector('')} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">Clear</button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-slate-50 min-h-[500px] rounded-xl">
          {filteredRedlines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRedlines.map((redline) => (
                <div key={redline.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">Uploaded {formatDate(redline.date)}</h3>
                      {authUser?.role !== 'Inspector' && <p className="text-xs text-slate-500 mt-1">By {redline.inspector}</p>}
                    </div>
                    {(authUser?.role === 'Supervisor' || authUser?.name === redline.inspector) && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this redline?")) {
                            deleteRedline(redline.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Redline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="relative group cursor-pointer bg-slate-100 aspect-[4/3]" onClick={() => setSelectedImage(redline)}>
                    <img 
                      src={redline.imageData} 
                      alt={`Redline from ${redline.date}`} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-2 rounded-full shadow-sm transform scale-90 group-hover:scale-100 transition-all">
                        <Maximize2 className="h-5 w-5 text-slate-700" />
                      </div>
                    </div>
                  </div>

                  {(authUser?.role === 'Inspector' || authUser?.role === 'Supervisor') && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center mt-auto">
                      {!redline.sharedWithResident ? (
                        <button
                          onClick={() => {
                            if(window.confirm("Send this redline to the resident? They will be able to see it on their end.")) {
                              shareRedline(redline.id);
                            }
                          }}
                          className="flex items-center text-sm font-bold px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors w-full justify-center"
                        >
                          <Send className="h-4 w-4 mr-2" /> Send to Resident
                        </button>
                      ) : (
                        <div className="flex items-center text-sm font-bold px-4 py-2 text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100 w-full justify-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Sent to Resident
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 font-medium">No redlines found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-7xl w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4">
              <div className="text-white">
                <h3 className="font-bold text-lg">Uploaded {formatDate(selectedImage.date)}</h3>
                <p className="text-slate-300 text-sm">By {selectedImage.inspector}</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
              <img 
                src={selectedImage.imageData} 
                alt="Enlarged Redline" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
