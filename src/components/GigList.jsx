import React, { useMemo, useState, useRef } from 'react';
import { useAppContext, formatDate } from '../context/AppContext';
import { ClipboardList, Plus, X, Trash2, AlertCircle, Mic, Square, Send, CheckCircle2, ListChecks, ZoomIn, ZoomOut } from 'lucide-react';

export default function GigList() {
  const { entries, gigs, authUser, addGig, deleteGig, shareGig } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const compactView = true;
  
  // Multi-select state
  const [selectedGigs, setSelectedGigs] = useState(new Set());

  // Form State
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    chunksRef.current = [];
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAddGig = async (e) => {
    e.preventDefault();
    
    if (!description.trim() && !audioBlob) {
      alert("Please enter a description or record a voice note.");
      return;
    }

    let audioBase64 = null;
    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
    }

    addGig({
      inspector: authUser.name,
      date,
      rdtSection: 'N/A',
      route: 'N/A',
      location: 'N/A',
      description,
      audioData: audioBase64
    });
    
    setShowForm(false);
    setDescription('');
    deleteRecording();
  };

  const myGigList = useMemo(() => {
    const legacy = entries
      .filter(e => e.inspector === authUser?.name && e.taskType === 'Hand Hole' && e.handHoleStatus === 'Not Complete')
      .map(e => ({
        id: e.id,
        date: e.date,
        description: e.incompletionReason,
        isLegacy: true
      }));

    const newGigs = gigs
      .filter(g => g.inspector === authUser?.name)
      .map(g => ({ ...g, isLegacy: false }));

    return [...legacy, ...newGigs].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, gigs, authUser]);

  const toggleSelection = (id) => {
    const next = new Set(selectedGigs);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedGigs(next);
  };
  
  const handleBatchSend = () => {
    if (window.confirm(`Send ${selectedGigs.size} gigs to the resident?`)) {
      selectedGigs.forEach(id => shareGig(id));
      setSelectedGigs(new Set());
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6">
      
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
           {selectedGigs.size > 0 && (
             <div className="flex space-x-3 items-center animate-in fade-in zoom-in duration-200">
               <button 
                 onClick={handleBatchSend}
                 className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all"
               >
                 <Send className="h-4 w-4 mr-2" /> Send {selectedGigs.size} Selected
               </button>
               <button 
                 onClick={() => setSelectedGigs(new Set())}
                 className="text-slate-500 font-medium text-sm hover:text-slate-700 transition-colors"
               >
                 Cancel
               </button>
             </div>
           )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center px-5 py-2.5 rounded-lg font-bold shadow-md transition-all ${showForm ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'}`}
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">Deficiency Report</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="block w-full max-w-xs px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description of Deficiency</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="e.g. Bad cleanup at route 1 location 2, missing gravel..."
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Voice Recording (Optional)</label>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    {!audioBlob ? (
                      <>
                        {!isRecording ? (
                          <button type="button" onClick={startRecording} className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center">
                            <Mic className="h-5 w-5 mr-2" /> Start Recording
                          </button>
                        ) : (
                          <button type="button" onClick={stopRecording} className="flex items-center px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center animate-pulse">
                            <Square className="h-5 w-5 mr-2" /> Stop Recording
                          </button>
                        )}
                        <span className="text-sm text-slate-500">Record a voice note instead of typing</span>
                      </>
                    ) : (
                      <>
                        <audio src={audioUrl} controls className="w-full max-w-sm" />
                        <button type="button" onClick={deleteRecording} className="flex items-center px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 bg-white ${compactView ? 'p-4' : 'px-8 py-6'}`}>
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="bg-red-100 p-3 rounded-full mr-4">
               <ClipboardList className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Gig List</h2>
              <p className="mt-1 text-sm text-slate-500">Deficiencies logged by <span className="font-semibold text-indigo-600">{authUser?.name}</span>.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden sm:flex text-sm text-slate-400 items-center">
               <ListChecks className="h-4 w-4 mr-2" /> Batch send
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {myGigList.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200 select-none">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={`text-center font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px] w-8' : 'px-8 py-4 text-xs w-12'}`}></th>
                  <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-4 py-4 text-xs'}`}>Date</th>
                  <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Description of Deficiency</th>
                  <th scope="col" className={`text-left font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Audio</th>
                  <th scope="col" className={`text-center font-bold text-slate-500 uppercase tracking-wider ${compactView ? 'px-2 py-2 text-[10px]' : 'px-8 py-4 text-xs'}`}>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {myGigList.map((row, idx) => {
                  const isSelected = selectedGigs.has(row.id);
                  const isSent = row.sharedWithResident;
                  const canSelect = !row.isLegacy && !isSent;
                  
                  return (
                  <tr 
                    key={idx} 
                    onClick={() => { if(canSelect) toggleSelection(row.id); }}
                    className={`transition-colors duration-200 ${isSelected ? 'bg-indigo-50/80 cursor-pointer' : isSent ? 'bg-emerald-50/30' : canSelect ? (idx % 2 === 0 ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50/50 hover:bg-slate-100 cursor-pointer') : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}`}
                  >
                    <td className={`whitespace-nowrap text-center ${compactView ? 'px-2 py-2' : 'px-8 py-4'}`}>
                       {canSelect ? (
                         <div className={`rounded border flex items-center justify-center transition-colors mx-auto ${compactView ? 'w-4 h-4' : 'w-5 h-5'} ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <CheckCircle2 className={`text-white ${compactView ? 'h-3 w-3' : 'h-4 w-4'}`} />}
                         </div>
                       ) : isSent ? (
                         <CheckCircle2 className={`text-emerald-500 opacity-50 mx-auto ${compactView ? 'h-4 w-4' : 'h-5 w-5'}`} title="Already Sent" />
                       ) : null}
                    </td>
                    <td className={`whitespace-nowrap font-medium text-slate-900 ${compactView ? 'px-2 py-2 text-[11px]' : 'px-4 py-4 text-sm'}`}>{formatDate(row.date)}</td>
                    <td className={`font-medium text-slate-700 ${compactView ? 'px-2 py-2 text-[11px] leading-tight min-w-[120px]' : 'px-8 py-4 text-sm'}`}>
                      {row.description ? row.description : <span className="text-slate-400 italic">No text provided</span>}
                    </td>
                    <td className={`whitespace-nowrap ${compactView ? 'px-2 py-2' : 'px-8 py-4'}`} onClick={e => e.stopPropagation()}>
                      {row.audioData ? (
                        <audio src={row.audioData} controls className={compactView ? 'h-6 w-32 origin-left transform scale-75' : 'h-8 w-48'} />
                      ) : (
                        <span className={`text-slate-400 italic flex items-center ${compactView ? 'text-[10px]' : 'text-sm'}`}>
                          <Mic className={`opacity-50 mr-1 ${compactView ? 'h-2 w-2' : 'h-3 w-3'}`} /> No audio
                        </span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap text-center ${compactView ? 'px-2 py-2' : 'px-8 py-4'}`} onClick={e => e.stopPropagation()}>
                      {!row.isLegacy && (
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          {!isSent ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Send this gig to the resident? They will be able to see it.')) {
                                  shareGig(row.id);
                                }
                              }}
                              className={`text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors ${compactView ? 'p-1' : 'p-2'}`}
                              title="Send to Resident"
                            >
                              <Send className={`mx-auto ${compactView ? 'h-4 w-4' : 'h-5 w-5'}`} />
                            </button>
                          ) : (
                            <div className={`text-emerald-600 ${compactView ? 'p-1' : 'p-2'}`} title="Sent to Resident">
                              <CheckCircle2 className={`mx-auto ${compactView ? 'h-4 w-4' : 'h-5 w-5'}`} />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this gig?')) {
                                deleteGig(row.id);
                                if(isSelected) toggleSelection(row.id);
                              }
                            }}
                            className={`text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${compactView ? 'p-1' : 'p-2'}`}
                            title="Delete gig"
                          >
                            <Trash2 className={`mx-auto ${compactView ? 'h-4 w-4' : 'h-5 w-5'}`} />
                          </button>
                        </div>
                      )}
                      {row.isLegacy && <span className="text-xs text-slate-400 italic">Legacy Log</span>}
                    </td>
                  </tr>
                )})}
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
