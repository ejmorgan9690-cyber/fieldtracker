import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { Activity, Trash2 } from 'lucide-react';

export default function MasterDrops() {
  const { entries, clearData } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');

  // Group by Date -> Inspector -> DropNumber
  const aggregatedData = useMemo(() => {
    let filtered = entries.filter(e => e.taskType === 'Drop');
    if (filterDate) {
      filtered = filtered.filter(e => e.date === filterDate);
    }
    if (filterInspector) {
      filtered = filtered.filter(e => e.inspector === filterInspector);
    }

    const grouped = {};

    filtered.forEach(entry => {
      const { date, inspector, dropNumber, footage } = entry;
      const key = `${date}|${inspector}|${dropNumber || ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          date,
          inspector,
          taskType: 'Drop',
          dropNumber: dropNumber || '',
          totalFootage: 0,
        };
      }
      grouped[key].totalFootage += footage;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.inspector !== b.inspector) return (a.inspector || '').localeCompare(b.inspector || '');
      return (a.dropNumber || '').localeCompare(b.dropNumber || '', undefined, { numeric: true });
    });
  }, [entries, filterDate, filterInspector]);

  const totalDrops = useMemo(() => entries.filter(e => e.taskType === 'Drop').reduce((sum, e) => sum + e.footage, 0), [entries]);

  const uniqueInspectors = useMemo(() => {
    const inspectors = new Set(entries.filter(e => e.taskType === 'Drop').map(e => e.inspector));
    return Array.from(inspectors).filter(Boolean).sort();
  }, [entries]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <div className="bg-pink-100 p-4 rounded-full mr-4">
            <Activity className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Drops Completed</p>
            <p className="text-3xl font-bold text-slate-900">{totalDrops.toLocaleString()} <span className="text-lg text-slate-500 font-medium">qty</span></p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Master Drops Log</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Aggregated daily drop installations across all inspectors.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <input type="text" list="inspector-options-MasterDrops" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterDrops">
              {uniqueInspectors.map(i => <option key={i} value={i} />)}
            </datalist>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 sm:text-sm transition-all"
            />
            
            {(filterDate || filterInspector) && (
               <button onClick={() => { setFilterDate(''); setFilterInspector(''); }} className="text-sm font-medium text-pink-600 hover:text-pink-800 transition-colors">Clear</button>
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
          {aggregatedData.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Task Type</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {aggregatedData.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{row.inspector}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                        {row.taskType} 
                        {row.dropNumber ? ` (${row.dropNumber})` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                      {row.totalFootage.toLocaleString()} <span className="text-slate-500 font-medium">qty</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 bg-slate-50/50">
              <p className="text-slate-500 font-medium">No drop entries found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
