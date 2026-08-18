import React, { useMemo, useState } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { ClipboardList, Plus, X, Trash2, AlertCircle } from 'lucide-react';

export default function GigList() {
  const { entries, gigs, authUser, addGig, deleteGig } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [rdtSection, setRdtSection] = useState('RDT1');
  const [route, setRoute] = useState('Route 1');
  const [location, setLocation] = useState('1');
  const [description, setDescription] = useState('');

  const handleAddGig = (e) => {
    e.preventDefault();
    addGig({
      inspector: authUser.name,
      date,
      rdtSection,
      route: rdtSection === 'Toll N' || rdtSection === 'Toll S' ? '-' : route,
      location,
      description
    });
    setShowForm(false);
    setDescription('');
  };

  // Combine legacy hand holes with new gig entries
  const myGigList = useMemo(() => {
    const legacy = entries
      .filter(e => e.inspector === authUser?.name && e.taskType === 'Hand Holes' && e.handHoleStatus === 'Not Complete')
      .map(e => ({
        id: e.id,
        date: e.date,
        rdtSection: e.rdtSection,
        route: e.route,
        location: e.location,
        description: e.incompletionReason,
        isLegacy: true
      }));

    const newGigs = gigs
      .filter(g => g.inspector === authUser?.name)
      .map(g => ({ ...g, isLegacy: false }));

    return [...legacy, ...newGigs].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, gigs, authUser]);

  return (
    <div className="max-w-5xl mx-auto mt-6">
      
      {/* Action Bar */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center px-5 py-2.5 rounded-lg font-bold shadow-md transition-all ${
            showForm 
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
          }`}
        >
          {showForm ? (
            <><X className="h-5 w-5 mr-2" /> Cancel</>
          ) : (
            <><Plus className="h-5 w-5 mr-2" /> Add New Gig Entry</>
          )}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
            <div className="bg-red-50 p-3.5 rounded-xl mr-5 border border-red-100 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Report a Deficiency</h3>
              <p className="mt-1 text-sm text-slate-500 font-medium">Log a new gig or issue that needs to be addressed.</p>
            </div>
          </div>
          <form onSubmit={handleAddGig} className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Node</label>
                  <input
                    type="text"
                    list="gig-rdt-options"
                    value={rdtSection}
                    onChange={(e) => setRdtSection(e.target.value)}
                    onClick={(e) => e.target.select()}
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <datalist id="gig-rdt-options">
                    {[...Array.from({ length: 10 }, (_, i) => `RDT${i + 1}`), 'Toll N', 'Toll S'].map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
                {rdtSection !== 'Toll N' && rdtSection !== 'Toll S' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Route</label>
                    <input
                      type="text"
                      list="gig-route-options"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      onClick={(e) => e.target.select()}
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <datalist id="gig-route-options">
                      {Array.from({ length: 20 }, (_, i) => `Route ${i + 1}`).map(r => <option key={r} value={r} />)}
                    </datalist>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    list="gig-location-options"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onClick={(e) => e.target.select()}
                    required
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. 1"
                  />
                  <datalist id="gig-location-options">
                    {(rdtSection === 'Toll N' || rdtSection === 'Toll S' 
                      ? Array.from({ length: 301 }, (_, i) => `${i}`)
                      : Array.from({ length: 20 }, (_, i) => `${i + 1}`)
                    ).map(l => <option key={l} value={l} />)}
                  </datalist>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Deficiency Report</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description of Deficiency</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Bad cleanup at mile marker 2, missing gravel..."
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors">
                Submit Gig Entry
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
             <ClipboardList className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Gig List</h2>
            <p className="mt-1 text-sm text-slate-500">Deficiencies logged by <span className="font-semibold text-indigo-600">{authUser?.name}</span>.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {myGigList.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description of Deficiency</th>
                  <th scope="col" className="px-8 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {myGigList.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatDate(row.date)}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                      {row.rdtSection} &gt; {row.route} &gt; {row.location}
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-700 font-medium">
                      {row.description}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-center">
                      {!row.isLegacy && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this gig?')) {
                              deleteGig(row.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete gig"
                        >
                          <Trash2 className="h-5 w-5 mx-auto" />
                        </button>
                      )}
                      {row.isLegacy && <span className="text-xs text-slate-400 italic">Legacy Log</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 bg-slate-50/50">
              <p className="text-slate-500 font-medium">You have no reported deficiencies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
