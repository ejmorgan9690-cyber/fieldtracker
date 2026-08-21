import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Mic, MapPin, Trash2, Calendar, User, FileText, Search } from 'lucide-react';

export default function MasterNotes() {
  const { notes, authUser, deleteNote } = useAppContext();
  const [compactView, setCompactView] = useState(false);

  // Sort and filter notes by newest first, strictly locked to the current inspector
  const sortedNotes = [...(notes || [])]
    .filter(n => authUser?.role === 'Supervisor' || n.inspector_name === authUser?.name)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Notes Feed</h2>
            <p className="text-slate-400 text-sm">Your private field notes and audio recordings.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setCompactView(!compactView)}
              className={`hidden sm:hidden md:hidden lg:hidden xl:hidden min-[300px]:flex px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors items-center ${compactView ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}
              title="Toggle Zoom Out"
            >
              <Search className="w-3 h-3 mr-1.5" />
              {compactView ? 'Zoomed Out' : 'Zoom Out'}
            </button>
            <div className="bg-slate-700 rounded-lg px-4 py-2 flex items-center">
              <span className="text-xl font-bold text-white">{sortedNotes.length}</span>
              <span className="text-slate-300 ml-2 text-sm uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

        {sortedNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No notes have been logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y divide-slate-200 ${compactView ? 'text-xs' : ''}`}>
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap`}>Date</th>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap`}>Inspector</th>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap`}>Note Content</th>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap`}>Audio Recording</th>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap`}>GPS</th>
                  <th scope="col" className={`${compactView ? 'px-2 py-2 text-[10px]' : 'px-6 py-3 text-xs'} relative`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'} whitespace-nowrap`}>
                      <div className={`flex items-center font-bold mb-1 text-slate-900 ${compactView ? 'text-[10px]' : 'text-sm'}`}>
                        <Calendar className={`${compactView ? 'h-3 w-3' : 'h-4 w-4'} mr-2 text-slate-400`} />
                        {note.service_date}
                      </div>
                      {note.town && note.town !== 'N/A' && (
                        <span className={`inline-flex items-center rounded-full font-medium bg-indigo-100 text-indigo-800 mt-1 ${compactView ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-xs'}`}>
                          {note.town}
                        </span>
                      )}
                    </td>
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'} whitespace-nowrap`}>
                      <div className={`flex items-center font-semibold text-slate-700 ${compactView ? 'text-[10px]' : 'text-sm'}`}>
                        <User className={`${compactView ? 'h-3 w-3' : 'h-4 w-4'} mr-2 text-slate-400`} />
                        {note.inspector_name}
                      </div>
                    </td>
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'}`}>
                      <div className={`text-slate-700 italic max-w-sm whitespace-pre-wrap ${compactView ? 'text-[10px] leading-tight' : 'text-sm'}`}>
                        {note.notes_text ? `"${note.notes_text}"` : <span className="text-slate-400 not-italic">No text provided</span>}
                      </div>
                    </td>
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'} whitespace-nowrap`}>
                      {note.audio_data ? (
                        <div className="flex items-center">
                          <audio src={note.audio_data} controls className={`${compactView ? 'h-6 w-32 scale-90 origin-left' : 'h-8 w-48'}`} />
                        </div>
                      ) : (
                        <span className={`text-slate-400 flex items-center ${compactView ? 'text-[10px]' : 'text-sm'}`}>
                          <Mic className={`${compactView ? 'h-3 w-3' : 'h-4 w-4'} mr-1 opacity-50`} /> No audio
                        </span>
                      )}
                    </td>
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'} whitespace-nowrap`}>
                      {note.gps_coordinates ? (
                        <div className={`text-slate-600 flex items-center font-mono ${compactView ? 'text-[9px]' : 'text-xs'}`}>
                          <MapPin className={`${compactView ? 'h-3 w-3' : 'h-4 w-4'} mr-1 text-slate-400`} />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(note.gps_coordinates)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {note.gps_coordinates}
                          </a>
                        </div>
                      ) : (
                        <span className={`text-slate-400 ${compactView ? 'text-[10px]' : 'text-sm'}`}>-</span>
                      )}
                    </td>
                    <td className={`${compactView ? 'px-2 py-2' : 'px-6 py-4'} whitespace-nowrap text-right text-sm font-medium`}>
                      {(authUser?.role === 'Supervisor' || authUser?.name === note.inspector_name) && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this note?")) {
                              deleteNote(note.id);
                            }
                          }}
                          className={`text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors ${compactView ? 'p-1' : 'p-2'}`}
                          title="Delete Note"
                        >
                          <Trash2 className={`${compactView ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
