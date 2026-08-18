import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { BarChart3, Activity, Target, Trash2, Search } from 'lucide-react';

export default function MasterDashboard() {
  const { entries, clearData } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Group by Date -> Inspector -> RDTSection -> Route -> Location -> TaskType -> BoreNumber -> FiberCount -> Total Footage
  const aggregatedData = useMemo(() => {
    let filtered = entries.filter(e => !(e.taskType === 'Hand Holes' && e.handHoleStatus === 'Not Complete') && e.taskType !== 'Drop');
    if (filterDate) {
      filtered = filtered.filter(e => e.date === filterDate);
    }
    if (filterInspector) {
      filtered = filtered.filter(e => e.inspector === filterInspector);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      filtered = filtered.filter(e => {
        const str = `${e.rdtSection || ''} ${e.route || ''} ${e.location || ''}`.toLowerCase();
        return terms.every(term => str.includes(term));
      });
    }

    const grouped = {};

    filtered.forEach(entry => {
      const { date, inspector, rdtSection, route, location, taskType, boreNumber, fiberCount, handHoleNumber, footage } = entry;
      const key = `${date}|${inspector}|${rdtSection || ''}|${route}|${location}|${taskType}|${boreNumber || ''}|${fiberCount || ''}|${handHoleNumber || ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          date,
          inspector,
          rdtSection: rdtSection || '-',
          route,
          location,
          taskType,
          boreNumber: boreNumber || '',
          fiberCount: fiberCount || '',
          handHoleNumber: handHoleNumber || '',
          totalFootage: 0,
          entriesCount: 0
        };
      }
      grouped[key].totalFootage += footage;
      grouped[key].entriesCount += 1;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.inspector !== b.inspector) return (a.inspector || '').localeCompare(b.inspector || '');
      if (a.rdtSection !== b.rdtSection) return (a.rdtSection || '').localeCompare(b.rdtSection || '', undefined, { numeric: true });
      if (a.route !== b.route) return a.route.localeCompare(b.route, undefined, { numeric: true });
      if (a.location !== b.location) return a.location.localeCompare(b.location, undefined, { numeric: true });
      if (a.taskType !== b.taskType) return a.taskType.localeCompare(b.taskType);
      if (a.boreNumber !== b.boreNumber) return (a.boreNumber || '').localeCompare(b.boreNumber || '', undefined, { numeric: true });
      return (a.fiberCount || '').localeCompare(b.fiberCount || '', undefined, { numeric: true });
    });
  }, [entries, filterDate, filterInspector]);

  // Overall totals (excluding incomplete Hand Holes and DROPs)
  const validEntries = useMemo(() => entries.filter(e => !(e.taskType === 'Hand Holes' && e.handHoleStatus === 'Not Complete') && e.taskType !== 'Drop'), [entries]);
  const totalBore = useMemo(() => validEntries.filter(e => e.taskType === 'Bore').reduce((sum, e) => sum + e.footage, 0), [validEntries]);
  const totalPlow = useMemo(() => validEntries.filter(e => e.taskType === 'Plow Duct').reduce((sum, e) => sum + e.footage, 0), [validEntries]);
  const totalFiber = useMemo(() => validEntries.filter(e => e.taskType === 'Fiber').reduce((sum, e) => sum + e.footage, 0), [validEntries]);
  const totalHandHoles = useMemo(() => validEntries.filter(e => e.taskType === 'Hand Holes').reduce((sum, e) => sum + e.footage, 0), [validEntries]);

  const uniqueInspectors = useMemo(() => {
    const inspectors = new Set(validEntries.map(e => e.inspector));
    return Array.from(inspectors).filter(Boolean).sort();
  }, [validEntries]);

  return (
    <div className="space-y-6 mt-6 max-w-7xl mx-auto">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <div className="bg-orange-100 p-4 rounded-full mr-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Bore</p>
            <p className="text-3xl font-bold text-slate-900">{totalBore.toLocaleString()} <span className="text-lg text-slate-500 font-medium">ft</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <div className="bg-green-100 p-4 rounded-full mr-4">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Plow Duct</p>
            <p className="text-3xl font-bold text-slate-900">{totalPlow.toLocaleString()} <span className="text-lg text-slate-500 font-medium">ft</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <div className="bg-indigo-100 p-4 rounded-full mr-4">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Fiber</p>
            <p className="text-3xl font-bold text-slate-900">{totalFiber.toLocaleString()} <span className="text-lg text-slate-500 font-medium">ft</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
          <div className="bg-purple-100 p-4 rounded-full mr-4">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Hand Holes</p>
            <p className="text-3xl font-bold text-slate-900">{totalHandHoles.toLocaleString()} <span className="text-lg text-slate-500 font-medium">qty</span></p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Master Production Logs</h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Aggregated daily footages across all inspectors, sections, and routes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search location (e.g. Route 1)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full sm:w-56 px-4 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <input type="text" list="inspector-options-MasterDashboard" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder="All Inspectors" className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all" />
            <datalist id="inspector-options-MasterDashboard">
              {uniqueInspectors.map(i => <option key={i} value={i} />)}
            </datalist>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            />
            
            {(filterDate || filterInspector || searchQuery) && (
               <button onClick={() => { setFilterDate(''); setFilterInspector(''); setSearchQuery(''); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Clear</button>
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
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Node</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Task Type</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Footage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {aggregatedData.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{row.inspector}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{row.rdtSection}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.route}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                        ${row.taskType === 'Bore' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                          row.taskType === 'Fiber' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 
                          row.taskType === 'Drop' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                          'bg-green-100 text-green-800 border border-green-200'}`}>
                        {row.taskType} 
                        {row.boreNumber ? ` (#${row.boreNumber})` : ''}
                        {row.fiberCount ? ` (${row.fiberCount})` : ''}
                        {row.handHoleNumber !== '' && row.handHoleNumber != null ? ` (#${row.handHoleNumber})` : ''}
                        {row.dropNumber ? ` (#${row.dropNumber})` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                      {row.totalFootage.toLocaleString()} <span className="text-slate-500 font-medium">{row.taskType === 'Hand Holes' || row.taskType === 'Drop' ? 'qty' : 'ft'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 bg-slate-50/50">
              <p className="text-slate-500 font-medium">No production entries found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
