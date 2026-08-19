import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, CheckCircle } from 'lucide-react';

export default function MasterUnitSheet() {
  const { entries } = useAppContext();
  const [filterDate, setFilterDate] = useState('');
  const [filterInspector, setFilterInspector] = useState('');

  // Group verified logs by unit code and sum them up
  const aggregatedUnits = useMemo(() => {
    // Only accepted logs, excluding drops (drops don't have unit codes)
    let filtered = entries.filter(e => e.taskType !== 'Drop' && e.status === 'Accepted' && e.unitCode);
    
    if (filterDate) {
      filtered = filtered.filter(e => e.date === filterDate);
    }
    if (filterInspector) {
      filtered = filtered.filter(e => e.inspector === filterInspector);
    }

    const grouped = {};

    filtered.forEach(entry => {
      const code = entry.unitCode;
      if (!grouped[code]) {
        grouped[code] = {
          unitCode: code,
          taskType: entry.taskType,
          totalFootage: 0,
          totalQty: 0,
        };
      }
      
      if (entry.taskType === 'Hand Hole') {
        grouped[code].totalQty += 1; // 1 handhole
      } else {
        grouped[code].totalFootage += Number(entry.footage) || 0;
      }
    });

    // Also need to sum up Ground Rods (BM 2) and Signs (BM 53) if they were checked
    let bm2Qty = 0;
    let bm53Qty = 0;

    filtered.forEach(entry => {
      if (entry.taskType === 'Hand Hole') {
        if (entry.hasGroundRod) bm2Qty += 1;
        if (entry.hasSign) bm53Qty += 1;
      }
    });

    if (bm2Qty > 0) {
      grouped['BM 2 (Ground Rod)'] = { unitCode: 'BM 2 (Ground Rod)', taskType: 'Accessory', totalQty: bm2Qty, totalFootage: 0 };
    }
    if (bm53Qty > 0) {
      grouped['BM 53 (Sign)'] = { unitCode: 'BM 53 (Sign)', taskType: 'Accessory', totalQty: bm53Qty, totalFootage: 0 };
    }

    // Convert to sorted array
    return Object.values(grouped).sort((a, b) => a.unitCode.localeCompare(b.unitCode));
  }, [entries, filterDate, filterInspector]);

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="mb-8 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-indigo-600" />
              Master Unit Sheet (Pay Sheet)
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium">Aggregated totals of all verified log entries for Excel export.</p>
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
                {[...new Set(entries.filter(e => e.taskType !== 'Drop').map(e => e.inspector))].filter(Boolean).sort().map(insp => (
                  <option key={insp} value={insp}>{insp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {aggregatedUnits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {aggregatedUnits.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                      {row.unitCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {row.taskType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900 text-lg">
                      {row.taskType === 'Hand Hole' || row.taskType === 'Accessory' || row.unitCode.includes('LOOP') 
                        ? `${row.taskType === 'Hand Hole' || row.taskType === 'Accessory' ? row.totalQty : row.totalFootage} ` 
                        : `${row.totalFootage.toLocaleString()} `}
                      <span className="text-sm font-medium text-slate-500">
                        {row.taskType === 'Hand Hole' || row.taskType === 'Accessory' ? 'each' : 'ft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Verified Units Found</h3>
            <p className="text-slate-500 mt-1">Accept some log entries in the Pending Review tab to see totals here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
