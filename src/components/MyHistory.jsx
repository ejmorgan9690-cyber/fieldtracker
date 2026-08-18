import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { Trash2, Map } from 'lucide-react';

export default function MyHistory() {
  const { entries, dailies, redlines, authUser, deleteEntry, deleteDaily, deleteRedline } = useAppContext();
  const [view, setView] = useState('production'); // 'production' | 'dailies' | 'redlines'

  // Filter for only current user's entries
  const myEntries = useMemo(() => {
    return entries
      .filter(e => e.inspector === authUser?.name && !(e.taskType === 'Hand Holes' && e.handHoleStatus === 'Not Complete'))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, authUser]);

  // Filter for current user's dailies
  const myDailies = useMemo(() => {
    return dailies
      .filter(d => d.inspector === authUser?.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [dailies, authUser]);

  // Filter for current user's redlines
  const myRedlines = useMemo(() => {
    return redlines
      .filter(r => r.inspector === authUser?.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [redlines, authUser]);

  return (
    <div className="max-w-6xl mx-auto mt-6">
      
      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-200 p-1 rounded-xl inline-flex shadow-sm overflow-x-auto">
          <button
            onClick={() => setView('production')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              view === 'production' 
                ? 'bg-white text-indigo-700 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Production Logs
          </button>
          <button
            onClick={() => setView('dailies')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              view === 'dailies' 
                ? 'bg-white text-indigo-700 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Progress Reports
          </button>
          <button
            onClick={() => setView('redlines')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              view === 'redlines' 
                ? 'bg-white text-purple-700 shadow-md ring-1 ring-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Redlines
          </button>
        </div>
      </div>

      {view === 'production' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Production History</h2>
            <p className="mt-1 text-sm text-slate-500">Review or delete your previously submitted production logs.</p>
          </div>
          
          <div className="overflow-x-auto">
            {myEntries.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy</th>
                    <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Task Type</th>
                    <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Footage / Qty</th>
                    <th scope="col" className="px-8 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {myEntries.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                        {row.rdtSection} &gt; {row.route} &gt; {row.location}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                          ${row.taskType === 'Bore' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                            row.taskType === 'Fiber' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 
                            row.taskType === 'DROP' ? 'bg-pink-100 text-pink-800 border border-pink-200' :
                            'bg-green-100 text-green-800 border border-green-200'}`}>
                          {row.taskType} 
                          {row.boreNumber ? ` (#${row.boreNumber})` : ''}
                          {row.fiberCount ? ` (${row.fiberCount})` : ''}
                          {row.handHoleNumber !== '' && row.handHoleNumber != null ? ` (#${row.handHoleNumber})` : ''}
                          {row.dropNumber ? ` (#${row.dropNumber})` : ''}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                        {row.footage.toLocaleString()} <span className="text-slate-500 font-medium">{row.taskType === 'Hand Holes' || row.taskType === 'DROP' ? 'qty' : 'ft'}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this log?')) {
                              deleteEntry(row.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-5 w-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 bg-slate-50/50">
                <p className="text-slate-500 font-medium">You haven't submitted any production logs yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'dailies' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Daily Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Review or delete your previously submitted Daily Progress Reports.</p>
          </div>
          
          <div className="overflow-x-auto">
            {myDailies.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/6">Work Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/6">Contractor</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Description</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {myDailies.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.workType}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.contractor}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs" title={row.description}>{row.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this Daily Report?')) {
                              deleteDaily(row.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete daily report"
                        >
                          <Trash2 className="h-5 w-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 bg-slate-50/50">
                <p className="text-slate-500 font-medium">You haven't submitted any Daily Reports yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'redlines' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Redline Uploads</h2>
            <p className="mt-1 text-sm text-slate-500">Review or delete your previously uploaded redline images.</p>
          </div>
          
          <div className="p-8 bg-slate-50 min-h-[400px]">
            {myRedlines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRedlines.map((redline) => (
                  <div key={redline.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-white">
                      <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{redline.rdtSection}</p>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{redline.route} • {redline.location}</h3>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(redline.date)}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this redline image?')) {
                            deleteRedline(redline.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        title="Delete redline"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="aspect-[4/3] bg-slate-100 w-full overflow-hidden flex justify-center items-center">
                      <img src={redline.imageData} alt="Redline thumbnail" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/50">
                <Map className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">You haven't uploaded any redlines yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
