import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, CheckCircle, FileSignature, Calendar, User, Upload, Image as ImageIcon, X, MapPin, AlertTriangle, Mic, MicOff } from 'lucide-react';

const RDT_SECTIONS = [...Array.from({ length: 10 }, (_, i) => `RDT${i + 1}`), 'Toll N', 'Toll S'];
const ROUTES = Array.from({ length: 50 }, (_, i) => String(i + 1));
const TASK_TYPES = ['Bore', 'Plow Duct', 'Fiber', 'Hand Hole', 'Drop'];
const FIBER_COUNTS = ['4 count', '12 count', '24 count', '48 count', '96 count', '144 count', '288 count'];
const BORE_NUMBERS = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

// Custom Combobox to replace buggy native datalists
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
        setSearch(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value]);

  const displayOptions = (isTyping && search)
    ? options.filter(opt => String(opt).toLowerCase().includes(String(search).toLowerCase()))
    : options;

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={search}
          onChange={(e) => {
            setIsTyping(true);
            setSearch(e.target.value);
            setIsOpen(true);
            const exactMatch = options.find(o => String(o).toLowerCase() === e.target.value.toLowerCase());
            if (exactMatch) onChange(exactMatch);
          }}
          onFocus={(e) => {
            setIsOpen(true);
            setIsTyping(false);
            e.target.select();
          }}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
          placeholder={placeholder || `Select ${label.split(' ')[0]}...`}
          required={required}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
          {displayOptions.length > 0 ? (
            displayOptions.map((opt, idx) => (
              <li
                key={idx}
                className="px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-slate-700 font-semibold transition-colors border-b border-slate-50 last:border-0"
                onClick={() => {
                  onChange(String(opt));
                  setSearch(String(opt));
                  setIsOpen(false);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500 italic text-sm">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function LoggingForm() {
  const { authUser, addEntry, addRedline, entries } = useAppContext();
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [dateManuallyChanged, setDateManuallyChanged] = useState(false);
  const [taskType, setTaskType] = useState('Bore');
  const [psNumber, setPsNumber] = useState('');
  const [boreNumber, setBoreNumber] = useState('1');
  const [isAddedBore, setIsAddedBore] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [dropNumber, setDropNumber] = useState('');
  const [fiberCount, setFiberCount] = useState(FIBER_COUNTS[0]);
  
  // Persist town across app reloads
  const [town, setTown] = useState(() => localStorage.getItem('fieldTrackerTown') || '');

  // --- Auto-Update Date to Today (unless manually overridden) ---
  useEffect(() => {
    const handleVisibility = () => {
      // If the user brings the app to the foreground on a new day, update the date
      if (document.visibilityState === 'visible' && !dateManuallyChanged) {
        setDate(getLocalDateString());
      }
    };
    
    // Check periodically in case they just leave the screen on over midnight
    const interval = setInterval(() => {
      if (!dateManuallyChanged) setDate(getLocalDateString());
    }, 60000);

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [dateManuallyChanged]);
  
  const [rdtSection, setRdtSection] = useState('RDT1');
  const [route, setRoute] = useState('1');
  const [location, setLocation] = useState('1');
  const [footage, setFootage] = useState('');
  
  // Unit Code State
  const [unitCode, setUnitCode] = useState('');
  const [isFiberLoop, setIsFiberLoop] = useState(false);
  const [loopQuantity, setLoopQuantity] = useState('');
  const [hasGroundRod, setHasGroundRod] = useState(false);
  const [hasSign, setHasSign] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const duplicateBoreNumber = useMemo(() => {
    if (taskType !== 'Bore' || isAddedBore || !boreNumber || !route || !location || !town || !rdtSection || !entries) return null;
    
    const existing = entries.find(e => 
      e.taskType === 'Bore' && 
      !e.isAddedBore && 
      e.town === town && 
      e.rdtSection === rdtSection && 
      e.route === route && 
      e.location === location && 
      String(e.boreNumber) === String(boreNumber)
    );

    if (existing) {
      const allBoresForLocation = entries.filter(e => 
        e.taskType === 'Bore' && 
        !e.isAddedBore && 
        e.town === town && 
        e.rdtSection === rdtSection && 
        e.route === route && 
        e.location === location
      ).map(e => parseInt(e.boreNumber)).filter(n => !isNaN(n));
      
      const nextBore = allBoresForLocation.length > 0 ? Math.max(...allBoresForLocation) + 1 : 1;
      return { existingInspector: existing.inspector, nextBore: String(nextBore) };
    }
    return null;
  }, [entries, taskType, isAddedBore, town, rdtSection, route, location, boreNumber]);

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
      alert('Unable to retrieve your location. Please check your device permissions.');
      setIsLocating(false);
    }, { enableHighAccuracy: true });
  };
  
  // Redline Image State
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const fileInputRef = useRef(null);
  
  const [successMsg, setSuccessMsg] = useState(false);

  // --- Voice Logging State & Logic ---
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceData, setVoiceData] = useState({});

  const recognitionRef = useRef(null);
  const manuallyStoppedRef = useRef(false);
  const transcriptRef = useRef('');

  const startVoiceRecognition = () => {
    setShowVoiceModal(true);
    setVoiceTranscript('');
    transcriptRef.current = '';
    manuallyStoppedRef.current = false;
    
    setVoiceData({
      town: town,
      rdtSection: rdtSection,
      route: '',
      location: '',
      taskType: 'Bore',
      specNumber: '1',
      footage: '',
      gpsCoordinates: '',
      unitCode: '',
      psNumber: '',
      isAddedBore: false,
      isFiberLoop: false,
      loopQuantity: '',
      hasGroundRod: false,
      hasSign: false,
      fiberCount: FIBER_COUNTS[0]
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice-to-Text. Please use Chrome or Safari.");
      return;
    }
    
    // Abort any old instance just in case
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let newPhrases = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        newPhrases += event.results[i][0].transcript + ' ';
      }
      
      // Auto-correct common misinterpretations before saving to transcript
      newPhrases = newPhrases.replace(/\bboard\b/gi, 'bore')
                             .replace(/\bboar\b/gi, 'bore')
                             .replace(/\bbored\b/gi, 'bore')
                             .replace(/\bfour\s+number\b/gi, 'bore number') // sometimes "bore number" -> "four number"
                             .replace(/\ba\s+(\d+)/gi, '$1 ');

      transcriptRef.current += newPhrases;
      setVoiceTranscript(transcriptRef.current);
      parseVoiceTranscript(transcriptRef.current);
    };
    
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error("Speech error:", event.error);
      }
    };
    
    recognition.onend = () => {
      // If the browser killed it due to silence, but we didn't hit cancel/submit, turn it right back on!
      if (!manuallyStoppedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start mic:", e);
    }
  };

  const stopVoiceRecognition = () => {
    manuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const parseVoiceTranscript = (text) => {
    let lower = text.toLowerCase().replace(/[.,!]/g, '');
    
    const numMap = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15', 'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90', 'hundred': '100' };
    Object.keys(numMap).forEach(k => {
      const regex = new RegExp(`\\b${k}\\b`, 'g');
      lower = lower.replace(regex, numMap[k]);
    });

    let parsed = {
      town: town,
      rdtSection: rdtSection,
      route: '',
      location: '',
      taskType: 'Bore',
      specNumber: '1',
      footage: '',
      gpsCoordinates: ''
    };

    const rdtMatch = lower.match(/rdt\s*(\d+)/);
    if (rdtMatch) parsed.rdtSection = `RDT${rdtMatch[1]}`;
    if (lower.includes('toll north')) parsed.rdtSection = 'Toll N';
    if (lower.includes('toll south')) parsed.rdtSection = 'Toll S';

    const routeMatch = lower.match(/route\s*(\d+)/);
    if (routeMatch) parsed.route = String(routeMatch[1]);

    const locMatch = lower.match(/location\s*(\d+)/);
    if (locMatch) parsed.location = String(locMatch[1]);

    if (lower.includes('bore') || lower.includes('board') || lower.includes('boar') || lower.includes('four')) parsed.taskType = 'Bore';
    else if (lower.includes('trench')) parsed.taskType = 'Trench';
    else if (lower.includes('plow')) parsed.taskType = 'Plow Duct';
    else if (lower.includes('fiber')) parsed.taskType = 'Fiber';
    else if (lower.includes('hand hole') || lower.includes('handhole')) parsed.taskType = 'Hand Hole';
    else if (lower.includes('drop')) parsed.taskType = 'Drop';

    // Look for numbers trailing words like "bore", "drop", etc. (Handles "bore number 1" or "bore 1")
    const numMatch = lower.match(/(?:number|bore|drop|hole)\s*(?:number\s*)?(\d+)/);
    if (numMatch) parsed.specNumber = String(numMatch[1]);

    const ftMatch = lower.match(/(\d+)\s*(?:feet|foot|ft|')/);
    if (ftMatch) {
      parsed.footage = String(ftMatch[1]);
    } else {
      // Smart Fallback: If no "feet" keyword was spoken, look for any standalone numbers.
      // Assume the very last unused number in the sentence is the footage (e.g. "Bore 1 150")
      const allNums = lower.match(/\b\d+\b/g) || [];
      const usedNums = [parsed.route, parsed.location, parsed.specNumber];
      const unused = allNums.filter(n => !usedNums.includes(n));
      if (unused.length > 0) {
        parsed.footage = unused[unused.length - 1];
      }
    }

    if (lower.includes('dirt')) parsed.unitCode = 'BM61D';
    if (lower.includes('rock')) parsed.unitCode = 'BM61R';

    // Extract valid fiber counts anywhere in the sentence (e.g. "48 fiber", "fiber 48")
    const allNumsForFiber = lower.match(/\b\d+\b/g) || [];
    const validCounts = ['4', '12', '24', '48', '96', '144', '288'];
    const foundCount = allNumsForFiber.find(n => validCounts.includes(n) && n !== parsed.route && n !== parsed.location);
    if (foundCount) {
        parsed.fiberCount = `${foundCount} count`;
    }

    if (lower.includes('loop')) {
       parsed.isFiberLoop = true;
       const loopMatch = lower.match(/(\d+)\s*loop/);
       if (loopMatch) parsed.loopQuantity = String(loopMatch[1]);
       else parsed.loopQuantity = '1';
    }

    if (lower.includes('added bore') || lower.includes('added boar') || lower.includes('added board') || lower.includes('added')) {
       parsed.isAddedBore = true;
    }

    if (lower.includes('ground rod') || lower.includes('rod')) parsed.hasGroundRod = true;
    if (lower.includes('warning sign') || lower.includes('sign')) parsed.hasSign = true;

    const psMatch = lower.match(/(?:ps|p s)\s*(\d+)/);
    if (psMatch) parsed.psNumber = String(psMatch[1]);

    setVoiceData(parsed);
  };
  
  const submitVoiceLog = () => {
    if (!voiceData.route || !voiceData.location) {
      alert("Missing Route or Location in voice data!");
      return;
    }
    
    addEntry({
      town: voiceData.town,
      date: getLocalDateString(),
      rdtSection: voiceData.rdtSection,
      route: voiceData.route,
      location: voiceData.location,
      taskType: voiceData.taskType,
      footage: voiceData.footage,
      boreNumber: voiceData.taskType === 'Bore' ? voiceData.specNumber : null,
      fiberCount: voiceData.taskType === 'Fiber' ? voiceData.fiberCount : null,
      handHoleNumber: voiceData.taskType === 'Hand Hole' ? voiceData.specNumber : null,
      dropNumber: voiceData.taskType === 'Drop' ? voiceData.specNumber : null,
      isAddedBore: voiceData.isAddedBore,
      isFiberLoop: voiceData.isFiberLoop,
      loopQuantity: voiceData.loopQuantity,
      hasGroundRod: voiceData.hasGroundRod,
      hasSign: voiceData.hasSign,
      unitCode: voiceData.unitCode,
      psNumber: voiceData.psNumber,
      gpsCoordinates: voiceData.gpsCoordinates,
      inspector: authUser.name
    });
    stopVoiceRecognition();
    setShowVoiceModal(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // Sync town changes to local storage
  useEffect(() => {
    localStorage.setItem('fieldTrackerTown', town);
  }, [town]);

  const locationOptions = useMemo(() => {
    if (rdtSection === 'Toll N' || rdtSection === 'Toll S') {
      return Array.from({ length: 301 }, (_, i) => `${i}`);
    }
    return Array.from({ length: 51 }, (_, i) => `${i}`);
  }, [rdtSection]);

  useEffect(() => {
    if (taskType !== 'Drop' && !locationOptions.includes(String(location))) {
      setLocation(locationOptions[0] || '1');
    }
  }, [rdtSection, locationOptions, taskType]);

  useEffect(() => {
    setUnitCode('');
    setIsFiberLoop(false);
    setHasGroundRod(false);
    setHasSign(false);
  }, [taskType]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (taskType !== 'Drop' && taskType !== 'Hand Hole' && (!footage || isNaN(footage) || Number(footage) <= 0)) {
      alert('Please enter a valid positive quantity/footage.');
      return;
    }

    addEntry({
      inspector: authUser.name,
      date,
      town,
      taskType,
      boreNumber: taskType === 'Bore' ? boreNumber : null,
      fiberCount: taskType === 'Fiber' ? fiberCount : null,
      handHoleNumber: null,
      dropNumber: taskType === 'Drop' ? dropNumber : null,
      rdtSection: taskType === 'Drop' ? '-' : rdtSection,
      route: taskType === 'Drop' || rdtSection === 'Toll N' || rdtSection === 'Toll S' ? '-' : route,
      location: taskType === 'Drop' ? '-' : location,
      footage: taskType === 'Drop' || taskType === 'Hand Hole' ? 1 : Number(footage),
      isAddedBore: taskType === 'Bore' ? isAddedBore : false,
      gpsCoordinates: gpsCoordinates || null,
      psNumber: taskType === 'Drop' ? '' : psNumber,
      unitCode: unitCode,
      hasGroundRod,
      hasSign,
      isFiberLoop,
      loopQuantity
    });

    if (imageData) {
      addRedline({
        inspector: authUser.name,
        date,
        psNumber: taskType === 'Drop' ? '' : psNumber,
        rdtSection: taskType === 'Drop' ? '-' : rdtSection,
        route: taskType === 'Drop' || rdtSection === 'Toll N' || rdtSection === 'Toll S' ? '-' : route,
        location: taskType === 'Drop' ? '-' : location,
        imageData
      });
    }

    if (taskType !== 'Drop' && taskType !== 'Hand Hole') setFootage('');
    setDropNumber('');
    setLoopQuantity('');
    setIsAddedBore(false);
    setGpsCoordinates('');
    setHasGroundRod(false);
    setHasSign(false);
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12">
      
      {/* Voice Confirmation Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => { setShowVoiceModal(false); stopVoiceRecognition(); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center">
              <Mic className="h-5 w-5 mr-2 text-indigo-500" /> Verify Quick Entry
            </h3>
            <p className="text-sm text-slate-500 mb-6 italic border-l-4 border-indigo-200 pl-3 py-1 bg-indigo-50/50 rounded-r-lg">"{voiceTranscript}"</p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Node</label>
                  <input type="text" value={voiceData.rdtSection} onChange={e => setVoiceData({...voiceData, rdtSection: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Route</label>
                  <input type="text" value={voiceData.route} onChange={e => setVoiceData({...voiceData, route: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Location</label>
                  <input type="text" value={voiceData.location} onChange={e => setVoiceData({...voiceData, location: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Task</label>
                  <input type="text" value={voiceData.taskType} onChange={e => setVoiceData({...voiceData, taskType: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Spec / Bore #</label>
                  <input type="text" value={voiceData.specNumber} onChange={e => setVoiceData({...voiceData, specNumber: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Footage</label>
                  <input type="text" value={voiceData.footage} onChange={e => setVoiceData({...voiceData, footage: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {voiceData.taskType === 'Bore' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Unit Code</label>
                    <select value={voiceData.unitCode} onChange={e => setVoiceData({...voiceData, unitCode: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select Dirt/Rock</option>
                      <option value="BM61D">BM61D (Dirt)</option>
                      <option value="BM61R">BM61R (Rock)</option>
                    </select>
                  </div>
                </div>
              )}

              {voiceData.taskType === 'Fiber' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase">Fiber Size</label>
                    <select value={voiceData.fiberCount} onChange={e => setVoiceData({...voiceData, fiberCount: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500">
                      {FIBER_COUNTS.map(count => <option key={count} value={count}>{count}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                  <span>GPS Coordinates</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return alert('GPS not supported');
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setVoiceData({...voiceData, gpsCoordinates: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`}),
                        () => alert('Could not get GPS location')
                      );
                    }}
                    className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-xs font-bold flex items-center transition-colors"
                  >
                    <MapPin className="h-3 w-3 mr-1" /> Get Location
                  </button>
                </label>
                <input type="text" value={voiceData.gpsCoordinates} onChange={e => setVoiceData({...voiceData, gpsCoordinates: e.target.value})} placeholder="e.g. 36.7820, -96.6575" className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button onClick={() => { setShowVoiceModal(false); stopVoiceRecognition(); }} className="flex-1 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={submitVoiceLog} className="flex-1 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Submit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Report Card Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden mb-8">
        
        {/* Card Header Banner */}
        <div className="bg-slate-900 px-6 py-8 sm:px-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-slate-900 to-slate-900"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-indigo-500/20 p-3 rounded-xl mr-4 border border-indigo-400/30">
                <FileSignature className="h-7 w-7 text-indigo-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Daily Production Log</h2>
                  <button
                    type="button"
                    onClick={() => isListening ? stopVoiceRecognition() : startVoiceRecognition()}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                  >
                    {isListening ? <MicOff className="h-4 w-4 mr-1.5" /> : <Mic className="h-4 w-4 mr-1.5" />}
                    {isListening ? 'Listening...' : 'Quick Entry'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-400 font-medium">Record field progress, quantities, and deficiencies</p>
              </div>
            </div>
            <div className="flex flex-col sm:items-end space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center text-sm font-medium text-slate-300">
                <User className="h-4 w-4 mr-2 text-indigo-400" />
                Inspector: <span className="text-white ml-1 font-bold">{authUser?.name}</span>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-300">
                <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                Date: <span className="text-white ml-1">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 bg-slate-50/30">
          
          {/* Section 1: Location Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">1. Location Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-slate-700 mb-2">Service Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setDateManuallyChanged(true);
                  }}
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                  required
                />
              </div>
              
              {/* Town */}
              <div>
                <Combobox 
                  id="town" 
                  label="Town / Exchange" 
                  value={town} 
                  onChange={setTown} 
                  options={['Shidler', 'Wynona']} 
                  required 
                />
              </div>

              {/* RDT Section, Route, Location */}
              {taskType !== 'Drop' ? (
                <>
                  <Combobox 
                    id="rdtSection" 
                    label="Node / Section" 
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
                    <div className="hidden lg:block"></div>
                  )}

                  <Combobox 
                    id="location" 
                    label="Location" 
                    value={location} 
                    onChange={setLocation} 
                    options={locationOptions} 
                    placeholder="e.g. 1" 
                    required 
                  />
                </>
              ) : (
                <div className="col-span-1 lg:col-span-2 text-sm text-slate-500 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-4 italic py-3 shadow-inner">
                  Mainline hierarchy bypassed for Drops.
                </div>
              )}

              {/* Universal GPS Coordinates */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2 border-t border-slate-100 pt-5">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-grow w-full">
                    <label htmlFor="gpsCoordinates" className="block text-sm font-bold text-slate-700 mb-2">GPS Coordinates <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                    <input
                      type="text"
                      id="gpsCoordinates"
                      value={gpsCoordinates}
                      onChange={(e) => setGpsCoordinates(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                      placeholder="e.g. 36.421, -96.213"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full sm:w-auto px-6 py-3 h-[50px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap border border-indigo-200"
                  >
                    {isLocating ? (
                      <>
                        <span className="animate-spin mr-2 border-2 border-indigo-500 border-t-transparent rounded-full h-4 w-4"></span>
                        Locating...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-2" />
                        Get Current Location
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Task Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">2. Task Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Combobox 
                id="taskType" 
                label="Primary Task" 
                value={taskType} 
                onChange={setTaskType} 
                options={TASK_TYPES} 
                required 
              />
              
              {taskType !== 'Drop' && (
                <div>
                  <label htmlFor="psNumber" className="block text-sm font-bold text-slate-700 mb-2">P/S</label>
                  <input
                    type="text"
                    id="psNumber"
                    value={psNumber}
                    onChange={(e) => setPsNumber(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                    placeholder="e.g. 101"
                    required={taskType !== 'Drop'}
                  />
                </div>
              )}

              {taskType === 'Bore' ? (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                  <Combobox 
                    id="unitCode" 
                    label="Units (Bore)" 
                    value={unitCode} 
                    onChange={setUnitCode} 
                    options={['BM61D (Dirt)', 'BM61R (Rock)'].map(o => o.split(' ')[0])} 
                    required 
                  />
                  <div className="flex flex-col gap-2">
                    <Combobox 
                      id="boreNumber" 
                      label="Bore Number" 
                      value={boreNumber} 
                      onChange={setBoreNumber} 
                      options={BORE_NUMBERS} 
                      required={!isAddedBore} 
                    />
                    {duplicateBoreNumber && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-1 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-800 mb-1">
                              Duplicate Bore Detected
                            </p>
                            <p className="text-xs text-red-600 mb-2">
                              Bore #{boreNumber} was already logged here by {duplicateBoreNumber.existingInspector || 'someone'}.
                            </p>
                            <button
                              type="button"
                              onClick={() => setBoreNumber(duplicateBoreNumber.nextBore)}
                              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded shadow-sm transition-colors border border-red-200"
                            >
                              Auto-Correct to #{duplicateBoreNumber.nextBore}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center pt-2">
                    <input
                      id="isAddedBore"
                      type="checkbox"
                      checked={isAddedBore}
                      onChange={(e) => setIsAddedBore(e.target.checked)}
                      className="h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isAddedBore" className="ml-2 text-sm font-bold text-slate-700">
                      Added Bore (Not on Prints)
                    </label>
                  </div>
                </div>
              ) : taskType === 'Plow Duct' || taskType === 'Trench' ? (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <Combobox 
                    id="unitCode" 
                    label={`Units (${taskType})`} 
                    value={unitCode} 
                    onChange={setUnitCode} 
                    options={['BFOV (1.25)(1)', 'BFOV (1.25)(2)', 'BFOV (1.25)(3)', 'BFOV (1.25)(4)']} 
                    required 
                  />
                </div>
              ) : taskType === 'Fiber' ? (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                  <Combobox 
                    id="unitCode" 
                    label="Units (Fiber)" 
                    value={unitCode} 
                    onChange={setUnitCode} 
                    options={['BFO 24I', 'BFO 48I', 'BFO 72I', 'BFO 96I']} 
                    required 
                  />
                  <div className="flex items-center pt-2">
                    <input
                      id="isFiberLoop"
                      type="checkbox"
                      checked={isFiberLoop}
                      onChange={(e) => setIsFiberLoop(e.target.checked)}
                      className="h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="isFiberLoop" className="ml-2 text-sm font-bold text-slate-700">
                      Include Storage Loop (Generates a separate pay unit row)
                    </label>
                  </div>
                  {isFiberLoop && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <label htmlFor="loopQuantity" className="block text-sm font-bold text-slate-700 mb-2">Number of Loops</label>
                      <div className="relative">
                        <input
                          type="number"
                          id="loopQuantity"
                          value={loopQuantity}
                          onChange={(e) => setLoopQuantity(e.target.value)}
                          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium pr-12"
                          placeholder="e.g. 1"
                          min="1"
                          required={isFiberLoop}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-slate-400 font-bold">qty</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : taskType === 'Hand Hole' ? (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                  <Combobox 
                    id="unitCode" 
                    label="Units (Hand Hole Size)" 
                    value={unitCode} 
                    onChange={setUnitCode} 
                    options={['BHF (24x36x30)', 'BHF (30x48x36)']} 
                    required 
                  />
                  <div className="flex flex-col space-y-3 pt-2">
                    <div className="flex items-center">
                      <input
                        id="hasGroundRod"
                        type="checkbox"
                        checked={hasGroundRod}
                        onChange={(e) => setHasGroundRod(e.target.checked)}
                        className="h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="hasGroundRod" className="ml-2 text-sm font-bold text-slate-700">
                        Include Ground Rod (BM 2)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="hasSign"
                        type="checkbox"
                        checked={hasSign}
                        onChange={(e) => setHasSign(e.target.checked)}
                        className="h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <label htmlFor="hasSign" className="ml-2 text-sm font-bold text-slate-700">
                        Include Sign (BM 53)
                      </label>
                    </div>
                  </div>
                </div>
              ) : taskType === 'Drop' ? (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="dropNumber" className="block text-sm font-bold text-slate-700 mb-2">Drop Number</label>
                  <input
                    type="text"
                    id="dropNumber"
                    value={dropNumber}
                    onChange={(e) => setDropNumber(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                    placeholder="e.g. 1120"
                    required
                  />
                </div>
              ) : (
                <div className="hidden sm:block"></div>
              )}
            </div>
          </div>

          {/* Section 3: Output */}
          {taskType !== 'Drop' && taskType !== 'Hand Hole' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">3. Production Output</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="footage" className="block text-sm font-bold text-slate-700 mb-2">
                    {taskType === 'Hand Hole' || taskType === 'Drop' ? 'Quantity' : 'Total Footage (Mainline)'}
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type="number"
                      id="footage"
                      min="1"
                      value={footage}
                      onChange={(e) => setFootage(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium pr-12"
                      placeholder="e.g. 1500"
                      required={taskType !== 'Drop' && taskType !== 'Hand Hole'}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-slate-400 font-bold">
                        {taskType === 'Hand Hole' || taskType === 'Drop' ? 'qty' : 'ft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Attach Redline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">4. Attach Redline (Optional)</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 relative hover:bg-slate-100 transition-colors">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {!imagePreview ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-lg">Tap to upload Redline picture</p>
                    <p className="text-slate-500 text-sm mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative z-20">
                  <img src={imagePreview} alt="Redline Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setImageData(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-4 -right-4 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button & Success */}
          <div className="pt-8 flex flex-col items-center sm:flex-row sm:justify-between border-t border-slate-200">
            {successMsg ? (
              <div className="mb-4 sm:mb-0 w-full sm:w-auto p-4 rounded-xl bg-green-50 border border-green-200 flex items-center transition-all shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <p className="text-sm font-bold text-green-800">Report submitted to master record!</p>
              </div>
            ) : (
              <div className="hidden sm:block text-sm text-slate-500 font-medium">Please review all fields before submitting.</div>
            )}
            
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              <Save className="h-6 w-6 mr-2" />
              Sign & Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
