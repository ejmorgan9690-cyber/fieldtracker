import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { FileText, Trash2, CalendarDays, User, HardHat, FileSignature, Ruler, MessageSquare } from 'lucide-react';

export default function MasterDailies() {
  const { dailies, clearDailies } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filteredDailies = useMemo(() => {
    let result = dailies.filter(d => d.workType !== 'DROP');
    if (filterDate) {
      result = result.filter(d => d.date === filterDate);
    }
    if (filterInspector) {
      result = result.filter(d => d.inspector === filterInspector);
    }
    return result.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
      return a.inspector.localeCompare(b.inspector);
    });
  }, [dailies, filterDate, filterInspector]);

  const uniqueInspectors = useMemo(() => {
    const inspectors = new Set(dailies.map(d => d.inspector));
    return Array.from(inspectors).sort();
  }, [dailies]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center">
            <div className="bg-indigo-50 p-3.5 rounded-xl mr-5 border border-indigo-100 shadow-sm">
               <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Master Daily Reports</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">Review all submitted daily progress reports across the project.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <input type="text" list="inspector-options-MasterDailies" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterDailies">
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
                if (window.confirm('Are you sure you want to clear all daily reports? This cannot be undone.')) {
                  clearDailies();
                }
              }}
              className="inline-flex items-center p-2 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 hover:border-red-300 focus:outline-none transition-all ml-auto sm:ml-0"
              title="Clear all daily reports"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-0">
          {filteredDailies.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {filteredDailies.map((daily) => (
                <div key={daily.id} className="bg-white hover:bg-indigo-50/80 transition-colors">
                  <div 
                    className="px-8 py-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between"
                    onClick={() => setExpandedId(expandedId === daily.id ? null : daily.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 mb-3 sm:mb-0">
                      <div className="flex items-center text-sm font-bold text-slate-900 w-32">
                        <CalendarDays className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                        {formatDate(daily.date)}
                      </div>
                      <div className="flex items-center text-sm font-medium text-indigo-700 w-40 mt-2 sm:mt-0">
                        <User className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
                        {daily.inspector}
                      </div>
                      <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {daily.workType}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {daily.contractor}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm font-medium text-indigo-600">
                      {expandedId === daily.id ? 'Collapse Details' : 'View Full Report'}
                    </div>
                  </div>
                  
                  {expandedId === daily.id && (
                    <div className="px-8 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                            <FileSignature className="h-4 w-4 mr-2" /> Daily Work Description
                          </h4>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{daily.description}</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                            <HardHat className="h-4 w-4 mr-2" /> Men, Equipment, & Materials
                          </h4>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{daily.resources}</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                            <Ruler className="h-4 w-4 mr-2" /> Production Completed
                          </h4>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{daily.production}</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" /> Remarks
                          </h4>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{daily.remarks || <span className="text-slate-400 italic">No remarks</span>}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50/50">
              <p className="text-slate-500 font-medium">No daily reports found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
