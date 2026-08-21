import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Mic, MapPin, Trash2, Calendar, User, FileText } from 'lucide-react';

export default function MasterNotes() {
  const { notes, authUser, deleteNote } = useAppContext();

  // Sort notes by newest first
  const sortedNotes = [...(notes || [])].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-6 py-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Master Notes Log</h2>
            <p className="text-slate-400 text-sm">All text and audio notes submitted by inspectors.</p>
          </div>
          <div className="bg-slate-700 rounded-lg px-4 py-2">
            <span className="text-xl font-bold text-white">{sortedNotes.length}</span>
            <span className="text-slate-300 ml-2 text-sm uppercase tracking-wider">Total Notes</span>
          </div>
        </div>

        {sortedNotes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No notes have been logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Town</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Inspector</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Note Content</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Audio Recording</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">GPS</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900 font-bold mb-1">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {note.service_date}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {note.town}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-slate-700">
                        <User className="h-4 w-4 mr-2 text-slate-400" />
                        {note.inspector_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 italic max-w-sm whitespace-pre-wrap">
                        {note.notes_text ? `"${note.notes_text}"` : <span className="text-slate-400 not-italic">No text provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {note.audio_data ? (
                        <div className="flex items-center">
                          <audio src={note.audio_data} controls className="h-8 w-48" />
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 flex items-center">
                          <Mic className="h-4 w-4 mr-1 opacity-50" /> No audio
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {note.gps_coordinates ? (
                        <div className="text-sm text-slate-600 flex items-center font-mono text-xs">
                          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
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
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(authUser?.role === 'Supervisor' || authUser?.name === note.inspector_name) && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this note?")) {
                              deleteNote(note.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete Note"
                        >
                          <Trash2 className="h-5 w-5" />
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
