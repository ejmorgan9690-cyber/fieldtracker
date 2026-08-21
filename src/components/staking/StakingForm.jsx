import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MapPin, Send, Mic, MicOff, X, AlertCircle } from 'lucide-react';

const RDT_SECTIONS = [...Array.from({ length: 20 }, (_, i) => `RDT ${i + 1}`), 'Toll N', 'Toll S'];
const ROUTES = Array.from({ length: 50 }, (_, i) => String(i + 1));

// Custom Combobox to allow typing OR selecting
const Combobox = ({ id, label, value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTyping(false);
        onChange(search);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search, onChange]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <input
        type="text"
        id={id}
        value={isTyping ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsTyping(true);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          setIsTyping(false);
        }}
        className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all font-medium"
        placeholder={placeholder || `Select or type...`}
        required={required}
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <li
                key={index}
                className="cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-emerald-50 text-slate-900 font-medium border-b border-slate-50 last:border-0"
                onClick={() => {
                  onChange(opt);
                  setSearch(opt);
                  setIsOpen(false);
                  setIsTyping(false);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="text-slate-500 py-3 pl-4 italic">No matching options...</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function StakingForm() {
  const { authUser, addStakingPoint } = useAppContext();
  
  const [rdtSection, setRdtSection] = useState('');
  const [route, setRoute] = useState('');
  const [location, setLocation] = useState('');
  
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Voice State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceData, setVoiceData] = useState({ rdtSection: '', route: '', location: '' });

  const locationOptions = useMemo(() => {
    if (rdtSection === 'Toll N' || rdtSection === 'Toll S') {
      return Array.from({ length: 301 }, (_, i) => `${i}`);
    }
    return Array.from({ length: 51 }, (_, i) => `${i}`);
  }, [rdtSection]);

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error("Error getting location:", error);
        alert(`Error getting location: ${error.message}. Please ensure location services are enabled.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const processVoiceInput = (text) => {
    let lower = text.toLowerCase();
    let parsed = { rdtSection, route, location };

    // Match RDT
    const rdtMatch = [...lower.matchAll(/rdt\s*(\d+)/g)].pop();
    if (rdtMatch) parsed.rdtSection = `RDT ${rdtMatch[1]}`;
    if (lower.lastIndexOf('toll north') > lower.lastIndexOf('toll south')) parsed.rdtSection = 'Toll N';
    else if (lower.lastIndexOf('toll south') !== -1) parsed.rdtSection = 'Toll S';

    // Match Route
    const routeMatch = [...lower.matchAll(/route\s*(\d+)/g)].pop();
    if (routeMatch) {
      parsed.route = String(routeMatch[1]);
      lower = lower.replace(routeMatch[0], ''); // Scrub
    }

    // Match Location
    const locMatch = [...lower.matchAll(/location\s*(\d+)/g)].pop();
    if (locMatch) {
      parsed.location = String(locMatch[1]);
    }

    setVoiceData(parsed);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const fullText = voiceText + ' ' + finalTranscript;
        setVoiceText(fullText.trim());
        processVoiceInput(fullText);
      }
    };

    recognition.start();
    window.currentRecognition = recognition;
  };

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setIsListening(false);
  };

  const applyVoiceData = () => {
    setRdtSection(voiceData.rdtSection);
    setRoute(voiceData.route);
    setLocation(voiceData.location);
    setShowVoiceModal(false);
    setVoiceText('');
    stopListening();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rdtSection || !route || !location) {
      alert("Please fill in RDT Section, Route, and Location.");
      return;
    }
    
    if (!lat || !lng) {
      alert("Please capture GPS coordinates.");
      return;
    }

    addStakingPoint({
      inspector: authUser.name,
      rdtSection,
      route,
      location,
      lat,
      lng,
      referenceImage: null
    });

    // Reset form for next entry
    setLat(null);
    setLng(null);
    // Keep hierarchy selections to make it easy to log the next point nearby
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Mic className="h-5 w-5 text-emerald-500 mr-2" /> Voice Dictation
              </h3>
              <button onClick={() => { setShowVoiceModal(false); stopListening(); }} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-1 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all duration-300 ${
                    isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105'
                  }`}
                >
                  {isListening ? <MicOff className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-white" />}
                </button>
                <p className={`mt-4 font-bold ${isListening ? 'text-red-500' : 'text-slate-500'}`}>
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Try saying: "RDT 1 Route 2 Location 5"</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 min-h-[80px] border border-slate-200 mb-6 relative">
                {voiceText ? (
                  <p className="text-slate-700 font-medium italic">"{voiceText}"</p>
                ) : (
                  <p className="text-slate-400 italic text-center mt-2">Speech will appear here...</p>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-emerald-600 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider flex items-center">
                  Live Parsing Preview
                </div>
                <div className="p-4 bg-white grid gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase">Node</label>
                      <input type="text" value={voiceData.rdtSection} onChange={e => setVoiceData({...voiceData, rdtSection: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase">Route</label>
                      <input type="text" value={voiceData.route} onChange={e => setVoiceData({...voiceData, route: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Location</label>
                    <input type="text" value={voiceData.location} onChange={e => setVoiceData({...voiceData, location: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setVoiceText('');
                  setVoiceData({ rdtSection: '', route: '', location: '' });
                }}
                className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyVoiceData}
                className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all"
              >
                Apply to Form
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-100 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="bg-emerald-50 p-3.5 rounded-xl mr-5 border border-emerald-100 shadow-sm shrink-0">
              <MapPin className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Log Staking Point</h3>
              <p className="mt-1 text-sm text-slate-500 font-medium">Capture exact GPS coordinates for hand hole placement.</p>
            </div>
          </div>
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 rounded-full font-bold shadow-sm transition-all sm:w-auto w-full justify-center"
          >
            <Mic className="h-4 w-4 mr-2" /> Voice Input
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Combobox 
              id="rdtSection" 
              label="RDT / Section" 
              value={rdtSection} 
              onChange={setRdtSection} 
              options={RDT_SECTIONS} 
              required 
            />
            
            {rdtSection !== 'Toll N' && rdtSection !== 'Toll S' ? (
              <Combobox 
                id="route" 
                label="Route" 
                value={route} 
                onChange={setRoute} 
                options={ROUTES} 
                required 
              />
            ) : (
              <div className="hidden md:block"></div>
            )}
            
            <Combobox 
              id="location" 
              label="Location" 
              value={location} 
              onChange={setLocation} 
              options={locationOptions} 
              required 
            />
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
            <div className="flex flex-col items-center justify-center space-y-4">
              <button
                type="button"
                onClick={getGPSLocation}
                disabled={isGettingLocation}
                className={`w-full max-w-sm py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${
                  lat ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
                } ${isGettingLocation ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isGettingLocation ? 'Acquiring GPS...' : lat ? 'Update GPS Coordinates' : 'Get Current GPS Coordinates'}
              </button>
              
              {lat && lng && (
                <div className="text-center">
                  <span className="inline-block bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-700 font-bold shadow-sm">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
            >
              <Send className="h-5 w-5 mr-2" /> Log Staking Point
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
