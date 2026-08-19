import React, { useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { CheckCircle, Search, Image as ImageIcon } from 'lucide-react';

export default function AcceptedLogFeed() {
  const { entries, redlines } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');

  // Get accepted logs and match them with their redlines
  const acceptedLogs = entries.filter(e => {
    if (e.taskType === 'Drop' || e.status !== 'Accepted') return false;
    if (filterDate && e.date !== filterDate) return false;
    if (filterInspector && e.inspector !== filterInspector) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-8 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
              <CheckCircle className="h-6 w-6 mr-3 text-green-500" />
              Verified Logs Feed
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Complete history of all logs you have verified, including redline images.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Date</label>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="block w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Inspector</label>
              <select 
                value={filterInspector}
                onChange={(e) => setFilterInspector(e.target.value)}
                className="block w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="">All Inspectors</option>
                {[...new Set(entries.map(e => e.inspector))].filter(Boolean).sort().map(insp => (
                  <option key={insp} value={insp}>{insp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {acceptedLogs.length > 0 ? (
          <div className="space-y-8">
            {acceptedLogs.map(log => {
              const matchingRedlines = redlines.filter(r => r.psNumber === log.psNumber);
              
              return (
                <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col lg:flex-row">
                  {/* Log Details */}
                  <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800 border border-green-200 mb-2">
                          VERIFIED
                        </span>
                        <h3 className="text-lg font-bold text-indigo-700">{log.psNumber}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatDate(log.date)}</p>
                        <p className="text-xs text-slate-500">{log.inspector}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Task</p>
                        <p className="font-semibold text-slate-900">
                          {log.taskType} 
                          {log.unitCode ? ` - ${log.unitCode}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quantity</p>
                        <p className="font-bold text-slate-900 text-lg">
                          {log.footage} <span className="text-sm font-medium text-slate-500">{log.taskType === 'Hand Hole' ? 'qty' : 'ft'}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Location</p>
                        <p className="text-sm font-medium text-slate-700">{log.rdtSection} &gt; {log.route} &gt; {log.location}</p>
                      </div>
                      
                      {log.isAddedBore && (
                        <div className="bg-orange-100 border border-orange-200 p-2 rounded-lg mt-2">
                          <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Added Bore</p>
                          <p className="text-xs font-semibold text-orange-900">GPS: {log.gpsCoordinates}</p>
                        </div>
                      )}
                      
                      {log.taskType === 'Hand Hole' && (log.hasGroundRod || log.hasSign) && (
                        <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg mt-2">
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Accessories</p>
                          <ul className="text-xs font-semibold text-blue-900 list-disc list-inside">
                            {log.hasGroundRod && <li>Ground Rod (BM 2)</li>}
                            {log.hasSign && <li>Sign (BM 53)</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Redline Image */}
                  <div className="w-full lg:w-2/3 bg-slate-100 p-4 flex flex-col justify-center items-center min-h-[300px]">
                    {matchingRedlines.length > 0 ? (
                      <div className="w-full space-y-4">
                        {matchingRedlines.map((redline, i) => (
                          <div key={i} className="flex justify-center bg-slate-200/50 p-2 rounded-lg">
                            <img src={redline.imageData} alt={`Redline for ${log.psNumber}`} className="max-w-full max-h-[400px] object-contain rounded shadow-sm bg-white" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No Redline Attached</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
            <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Verified Logs</h3>
            <p className="text-slate-500 mt-1">Logs will appear here once you accept them in the Pending Review tab.</p>
          </div>
        )}
      </div>
    </div>
  );
}
