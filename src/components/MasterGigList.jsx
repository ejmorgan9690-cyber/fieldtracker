import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { ClipboardList, ZoomIn, ZoomOut } from 'lucide-react';

export default function MasterGigList() {
  const { entries, gigs, authUser, clearData } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');
  const [compactView, setCompactView] = useState(false);

  // Combine legacy and new gigs
  const gigList = useMemo(() => {
    let legacy = entries
      .filter(e => e.taskType === 'Hand Hole' && e.handHoleStatus === 'Not Complete')
      .map(e => ({
        id: e.id,
        date: e.date,
        inspector: e.inspector,
        description: e.incompletionReason,
        isLegacy: true,
        sharedWithResident: true // Legacy production items are already shared
      }));

    let newGigs = gigs.map(g => ({ ...g, isLegacy: false }));

    if (authUser?.role === 'Resident') {
      newGigs = newGigs.filter(g => g.sharedWithResident);
    }

    let combined = [...legacy, ...newGigs];
    
    if (filterDate) {
      combined = combined.filter(e => e.date === filterDate);
    }
    if (filterInspector) {
      combined = combined.filter(e => e.inspector === filterInspector);
    }

    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, gigs, filterDate, filterInspector, authUser]);

  const uniqueInspectors = useMemo(() => {
    let baseGigs = gigs;
    if (authUser?.role === 'Resident') {
       baseGigs = gigs.filter(g => g.sharedWithResident);
    }
    const inspectors = new Set([
      ...baseGigs.map(e => e.inspector),
      ...entries.filter(e => e.taskType === 'Hand Hole' && e.handHoleStatus === 'Not Complete').map(e => e.inspector)
    ]);
    return Array.from(inspectors).sort();
  }, [entries, gigs, authUser]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="bg-red-50 p-3.5 rounded-xl mr-5 border border-red-100 shadow-sm">
              <ClipboardList className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Master Gig List</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">Aggregate view of all unresolved deficiencies.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            
            <input type="text" list="inspector-options-MasterGigList" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterGigList">
              {uniqueInspectors.map(i => <option key={i} value={i} />)}
            </datalist>
            
            {(filterDate || filterInspector) && (
               <button onClick={() => { setFilterDate(''); setFilterInspector(''); }} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Clear</button>
            )}

             <button
               onClick={() => setCompactView(!compactView)}
               className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg ml-2"
             >
               {compactView ? <ZoomIn className="h-4 w-4 mr-2" /> : <ZoomOut className="h-4 w-4 mr-2" />}
               {compactView ? 'Zoom In' : 'Zoom Out'}
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {gigList.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Date</th>
                    <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Inspector</th>
                    <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Description of Deficiency</th>
                    <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Audio Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {gigList.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className={`whitespace-nowrap font-medium text-slate-900 ${compactView ? 'px-2 py-2 text-[11px]' : 'px-8 py-4 text-sm'}`}>{formatDate(row.date)}</td>
                      <td className={`whitespace-nowrap font-bold text-indigo-600 ${compactView ? 'px-2 py-2 text-[11px]' : 'px-8 py-4 text-sm'}`}>{row.inspector}</td>
                      <td className={`font-medium text-slate-700 ${compactView ? 'px-2 py-2 text-[11px] leading-tight min-w-[120px]' : 'px-8 py-4 text-sm'}`}>
                        {row.description ? row.description : <span className="italic text-slate-400">No text provided</span>}
                      </td>
                      <td className={`whitespace-nowrap text-slate-700 ${compactView ? 'px-2 py-2' : 'px-8 py-4'}`}>
                        {row.audioData ? (
                           <audio src={row.audioData} controls className={compactView ? 'h-6 w-32 origin-left transform scale-75' : 'h-8 w-48'} />
                        ) : (
                           <span className={`italic text-slate-400 ${compactView ? 'text-[10px]' : 'text-xs'}`}>No audio</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium text-lg">No gig entries found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
