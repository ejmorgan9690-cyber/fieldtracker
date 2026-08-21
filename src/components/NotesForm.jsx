import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Mic, Square, Trash2, Send, CheckCircle } from 'lucide-react';

export default function NotesForm() {
  const { authUser, addNote } = useAppContext();
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [dateManuallyChanged, setDateManuallyChanged] = useState(false);
  const [town, setTown] = useState(() => localStorage.getItem('fieldTrackerTown') || '');
  
  const [notesText, setNotesText] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Auto-Update Date to Today (unless manually overridden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !dateManuallyChanged) {
        setDate(getLocalDateString());
      }
    };
    
    const interval = setInterval(() => {
      if (!dateManuallyChanged) setDate(getLocalDateString());
    }, 60000);

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [dateManuallyChanged]);

  useEffect(() => {
    localStorage.setItem('fieldTrackerTown', town);
  }, [town]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setGpsCoordinates(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      setIsLocating(false);
    }, () => {
      alert('Unable to retrieve your location');
      setIsLocating(false);
    }, { enableHighAccuracy: true });
  };

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
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Could not access microphone. Please check permissions.");
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

  // Convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!town) {
      alert("Please select a Town / Exchange.");
      return;
    }
    if (!notesText.trim() && !audioBlob) {
      alert("Please enter some text or record a voice note.");
      return;
    }

    let audioBase64 = null;
    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob);
    }

    const payload = {
      inspector: authUser.name,
      date: date,
      town: town,
      notesText: notesText,
      gpsCoordinates: gpsCoordinates,
      audioData: audioBase64
    };

    await addNote(payload);

    setNotesText('');
    setGpsCoordinates('');
    deleteRecording();
    
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 border-b border-indigo-700">
          <h2 className="text-xl font-bold text-white">Inspector Notes</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Service Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => { setDate(e.target.value); setDateManuallyChanged(true); }} 
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Town / Exchange</label>
              <select 
                id="town" 
                value={town} 
                onChange={(e) => setTown(e.target.value)} 
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required 
              >
                <option value="">Select a town...</option>
                <option value="Shidler">Shidler</option>
                <option value="Wynona">Wynona</option>
              </select>
            </div>
          </div>

          {/* Note Text */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Note Details</label>
            <textarea 
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[120px]"
              placeholder="e.g. Contractor hit a water line on route 1 location 2..."
            />
          </div>

          {/* Audio Recording */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Voice Recording (Optional)</label>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              {!audioBlob ? (
                <>
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="flex items-center px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center">
                      <Mic className="h-5 w-5 mr-2" /> Start Recording
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="flex items-center px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-semibold transition-colors w-full sm:w-auto justify-center animate-pulse">
                      <Square className="h-5 w-5 mr-2" /> Stop Recording
                    </button>
                  )}
                  {isRecording && <span className="text-sm text-slate-500 animate-pulse font-medium">Listening...</span>}
                </>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <audio src={audioUrl} controls className="w-full max-w-sm" />
                  <button type="button" onClick={deleteRecording} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GPS Coordinates */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Exact GPS Coordinates (Optional)</label>
            <div className="flex rounded-md shadow-sm">
              <input 
                type="text" 
                value={gpsCoordinates} 
                onChange={e => setGpsCoordinates(e.target.value)} 
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-slate-300 bg-white"
                placeholder="Latitude, Longitude"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-slate-300 rounded-r-md bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium"
              >
                <MapPin className={`h-4 w-4 mr-2 ${isLocating ? 'animate-bounce text-indigo-500' : 'text-slate-400'}`} />
                {isLocating ? 'Locating...' : 'Get GPS'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            {successMsg ? (
              <div className="w-full sm:w-auto p-4 rounded-xl bg-green-50 border border-green-200 flex items-center shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <p className="text-sm font-bold text-green-800">Note successfully saved!</p>
              </div>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}
            
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all"
            >
              <Send className="h-5 w-5 mr-2" /> Submit Note
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
