import React, { useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { CheckCircle, X, Search, Image as ImageIcon } from 'lucide-react';

export default function PendingReview() {
  const { entries, redlines, verifyEntry } = useAppContext();
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Filter logs that are pending
  const pendingLogs = entries.filter(e => e.status !== 'Accepted');

  // Find matching redlines for the selected entry
  const matchingRedlines = selectedEntry 
    ? redlines.filter(r => r.psNumber === selectedEntry.psNumber)
    : [];

  const handleVerify = async () => {
    if (selectedEntry) {
      await verifyEntry(selectedEntry.id);
      setSelectedEntry(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pending Review Queue</h2>
            <p className="mt-1 text-sm text-slate-500">Click a log to review its details and verify against uploaded redlines.</p>
          </div>
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-bold">
            {pendingLogs.length} Pending
          </div>
        </div>

        <div className="overflow-x-auto">
          {pendingLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Inspector</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">P/S</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Task Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {pendingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-indigo-50/50 cursor-pointer transition-colors" onClick={() => setSelectedEntry(log)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.inspector}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{formatDate(log.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{log.psNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {log.taskType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {log.rdtSection} &gt; {log.route} &gt; {log.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 bg-slate-50/50 rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium text-lg">All caught up!</p>
              <p className="text-slate-500 text-sm mt-1">There are no pending logs to verify.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Verify Log Entry</h3>
                <p className="text-sm text-slate-500 mt-1">Cross-reference the log details with the uploaded redline.</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg shadow-sm">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
              
              {/* Log Details */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Log Details</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Inspector</p>
                      <p className="font-semibold text-slate-900">{selectedEntry.inspector}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Date</p>
                      <p className="font-semibold text-slate-900">{formatDate(selectedEntry.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">P/S</p>
                      <p className="text-lg font-bold text-indigo-700">{selectedEntry.psNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Hierarchy</p>
                      <p className="font-semibold text-slate-900">{selectedEntry.rdtSection} &gt; {selectedEntry.route} &gt; {selectedEntry.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Task / Quantity</p>
                      <p className="font-semibold text-slate-900">
                        {selectedEntry.taskType} 
                        {selectedEntry.unitCode ? ` - ${selectedEntry.unitCode}` : ''} 
                        {' - '} 
                        {selectedEntry.footage} {selectedEntry.taskType === 'Drop' || selectedEntry.taskType === 'Hand Hole' || (selectedEntry.unitCode && selectedEntry.unitCode.includes('LOOP')) ? 'qty' : 'ft'}
                      </p>
                    </div>
                    {selectedEntry.isAddedBore && (
                      <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg mt-4">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Added Bore</p>
                        <p className="text-sm font-semibold text-orange-900">GPS: {selectedEntry.gpsCoordinates}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Redlines Area */}
              <div className="w-full lg:w-2/3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Matching Redlines ({matchingRedlines.length})
                </h4>
                
                {matchingRedlines.length > 0 ? (
                  <div className="space-y-6">
                    {matchingRedlines.map(redline => (
                      <div key={redline.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                        <div className="p-3 border-b border-slate-200 bg-white flex justify-between text-sm">
                          <span className="font-semibold text-slate-700">Uploaded by: {redline.inspector}</span>
                          <span className="text-slate-500">{formatDate(redline.date)}</span>
                        </div>
                        <div className="flex justify-center bg-slate-200/50 p-4 min-h-[300px]">
                          <img src={redline.imageData} alt="Redline" className="max-w-full object-contain rounded shadow-sm bg-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50 flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Search className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-600 font-bold text-lg">No Matching Redlines Found</p>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm">
                      We couldn't find any redline images uploaded with PS Number <b>{selectedEntry.psNumber}</b>.
                    </p>
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end space-x-4">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerify}
                className="px-8 py-3 font-bold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg rounded-xl transition-all flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept & Verify Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
