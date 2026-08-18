import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { ClipboardList, Trash2 } from 'lucide-react';

export default function MasterGigList() {
  const { entries, gigs, clearData } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');

  // Combine legacy and new gigs
  const gigList = useMemo(() => {
    const legacy = entries
      .filter(e => e.taskType === 'Hand Hole' && e.handHoleStatus === 'Not Complete')
      .map(e => ({
        id: e.id,
        date: e.date,
        inspector: e.inspector,
        rdtSection: e.rdtSection,
        route: e.route,
        location: e.location,
        description: e.incompletionReason,
        isLegacy: true
      }));

    const newGigs = gigs.map(g => ({ ...g, isLegacy: false }));
    let combined = [...legacy, ...newGigs];
    
    if (filterDate) {
      combined = combined.filter(e => e.date === filterDate);
    }
    if (filterInspector) {
      combined = combined.filter(e => e.inspector === filterInspector);
    }

    return combined.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
      return (a.inspector || '').localeCompare(b.inspector || '');
    });
  }, [entries, gigs, filterDate, filterInspector]);

  const uniqueInspectors = useMemo(() => {
    const legacyInspectors = entries.filter(e => e.taskType === 'Hand Hole' && e.handHoleStatus === 'Not Complete').map(e => e.inspector);
    const newInspectors = gigs.map(g => g.inspector);
    const inspectors = new Set([...legacyInspectors, ...newInspectors]);
    return Array.from(inspectors).filter(Boolean).sort();
  }, [entries, gigs]);

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
              <p className="mt-1 text-sm text-slate-500 font-medium">Aggregate view of all reported deficiencies across the project.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <input type="text" list="inspector-options-MasterGigList" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterGigList">
              {uniqueInspectors.map(i => <option key={i} value={i} />)}
            </datalist>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            />
            
            {(filterDate || filterInspector) && (
               <button onClick={() => { setFilterDate(''); setFilterInspector(''); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Clear</button>
            )}
            
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  clearData();
                }
              }}
              className="inline-flex items-center p-2 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 hover:border-red-300 focus:outline-none transition-all ml-auto sm:ml-0"
              title="Clear all data"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {gigList.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description of Deficiency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {gigList.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{row.inspector}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {row.rdtSection} &gt; {row.route} &gt; {row.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {row.description}
                      {row.isLegacy && <span className="ml-3 text-xs text-slate-400 italic font-normal">(Legacy Log)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 bg-slate-50/50">
              <p className="text-slate-500 font-medium">No deficiencies found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
