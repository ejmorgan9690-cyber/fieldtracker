import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Save, CheckCircle } from 'lucide-react';

export default function DailiesForm() {
  const { authUser, addDaily } = useAppContext();
  
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [workType, setWorkType] = useState('');
  const [contractor, setContractor] = useState('');
  const [description, setDescription] = useState('');
  const [resources, setResources] = useState('');
  const [production, setProduction] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    addDaily({
      inspector: authUser.name,
      date,
      workType,
      contractor,
      description,
      resources,
      production,
      remarks
    });

    setWorkType('');
    setContractor('');
    setDescription('');
    setResources('');
    setProduction('');
    setRemarks('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6">
      <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
        <div className="bg-indigo-50 p-3.5 rounded-xl mr-5 border border-indigo-100 shadow-sm">
          <FileText className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Progress Report</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Record your descriptive daily report. Logging as <span className="font-bold text-indigo-600">{authUser?.name}</span>.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Date, Work Type, Contractor Row */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Basic Information</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-3">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="workType" className="block text-sm font-semibold text-slate-700 mb-2">Type of Work</label>
              <input
                type="text"
                id="workType"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                placeholder="e.g. Mainline Splicing"
                required
              />
            </div>

            <div>
              <label htmlFor="contractor" className="block text-sm font-semibold text-slate-700 mb-2">Contractor</label>
              <input
                type="text"
                id="contractor"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
                placeholder="e.g. Acme Corp"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Report Details</h3>
          
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Daily Work Description</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              placeholder="Describe the work taking place today..."
              required
            />
          </div>

          <div>
            <label htmlFor="resources" className="block text-sm font-semibold text-slate-700 mb-2">Men, Equipment & Materials</label>
            <textarea
              id="resources"
              rows={3}
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              placeholder="List personnel on site, equipment used, and materials deployed..."
              required
            />
          </div>

          <div>
            <label htmlFor="production" className="block text-sm font-semibold text-slate-700 mb-2">Production Completed</label>
            <textarea
              id="production"
              rows={2}
              value={production}
              onChange={(e) => setProduction(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              placeholder="Summary of completed production for the day..."
              required
            />
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
            <textarea
              id="remarks"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
              placeholder="Any delays, weather conditions, or extra remarks..."
            />
          </div>
        </div>

        {/* Submit Button & Success */}
        <div className="pt-6 border-t border-slate-200 mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md transition-all duration-200 active:scale-95"
          >
            <FileText className="h-5 w-5 mr-2" />
            Submit Daily Report
          </button>
          
          {successMsg && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center transition-all">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm font-medium text-green-800">Daily report saved successfully to the master record!</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
