const fs = require('fs');
let content = fs.readFileSync('src/components/LoggingForm.jsx', 'utf8');

content = content.replace(
  "import { Save, CheckCircle, FileSignature, Calendar, User, Upload, Image as ImageIcon, X, MapPin, AlertTriangle } from 'lucide-react';",
  "import { Save, CheckCircle, FileSignature, Calendar, User, Upload, Image as ImageIcon, X, MapPin, AlertTriangle, Mic, MicOff } from 'lucide-react';"
);

const stateHookMatch = "  const [successMsg, setSuccessMsg] = useState(false);";
const stateHookInject = \  const [successMsg, setSuccessMsg] = useState(false);

  // --- Voice Logging State & Logic ---
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceData, setVoiceData] = useState({});

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice-to-Text. Please use Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setVoiceTranscript(text);
      parseVoiceTranscript(text);
      setShowVoiceModal(true);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      alert("Microphone error: " + event.error);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const parseVoiceTranscript = (text) => {
    let lower = text.toLowerCase().replace(/[.,!]/g, '');
    
    const numMap = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10' };
    Object.keys(numMap).forEach(k => {
      const regex = new RegExp(\\\\\b\\\\\b\, 'g');
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

    const rdtMatch = lower.match(/rdt\\\\s*(\\\\d+)/);
    if (rdtMatch) parsed.rdtSection = \RDT\\;
    if (lower.includes('toll north')) parsed.rdtSection = 'Toll N';
    if (lower.includes('toll south')) parsed.rdtSection = 'Toll S';

    const routeMatch = lower.match(/route\\\\s*(\\\\d+)/);
    if (routeMatch) parsed.route = String(routeMatch[1]);

    const locMatch = lower.match(/location\\\\s*(\\\\d+)/);
    if (locMatch) parsed.location = String(locMatch[1]);

    if (lower.includes('bore')) parsed.taskType = 'Bore';
    else if (lower.includes('trench')) parsed.taskType = 'Trench';
    else if (lower.includes('plow')) parsed.taskType = 'Plow Duct';
    else if (lower.includes('fiber')) parsed.taskType = 'Fiber';
    else if (lower.includes('hand hole') || lower.includes('handhole')) parsed.taskType = 'Hand Hole';
    else if (lower.includes('drop')) parsed.taskType = 'Drop';

    const numMatch = lower.match(/number\\\\s*(\\\\d+)/);
    if (numMatch) parsed.specNumber = String(numMatch[1]);

    const ftMatch = lower.match(/(\\\\d+)\\\\s*feet/);
    const ftMatch2 = lower.match(/(\\\\d+)\\\\s*foot/);
    if (ftMatch) parsed.footage = String(ftMatch[1]);
    else if (ftMatch2) parsed.footage = String(ftMatch2[1]);

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
      fiberCount: voiceData.taskType === 'Fiber' ? FIBER_COUNTS[0] : null,
      handHoleNumber: voiceData.taskType === 'Hand Hole' ? voiceData.specNumber : null,
      dropNumber: voiceData.taskType === 'Drop' ? voiceData.specNumber : null,
      isAddedBore: false,
      isFiberLoop: false,
      loopQuantity: '',
      hasGroundRod: false,
      hasSign: false,
      unitCode: '',
      psNumber: '',
      gpsCoordinates: voiceData.gpsCoordinates,
      inspector: authUser.name
    });
    setShowVoiceModal(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };\;

content = content.replace(stateHookMatch, stateHookInject);

// Voice Button UI
const buttonUIMatch = "        <div className=\"bg-indigo-50 p-3.5 rounded-xl mr-5 border border-indigo-100 shadow-sm\">\n          <FileSignature className=\"h-6 w-6 text-indigo-600\" />\n        </div>\n        <div>\n          <h2 className=\"text-2xl font-bold text-slate-800 tracking-tight\">Production Log</h2>\n          <p className=\"mt-1 text-sm text-slate-500 font-medium\">Enter new production record for <span className=\"font-bold text-indigo-600\">{authUser?.name}</span>.</p>\n        </div>";

const buttonUIInject = "        <div className=\"bg-indigo-50 p-3.5 rounded-xl mr-5 border border-indigo-100 shadow-sm\">\n          <FileSignature className=\"h-6 w-6 text-indigo-600\" />\n        </div>\n        <div className=\"flex-1\">\n          <h2 className=\"text-2xl font-bold text-slate-800 tracking-tight\">Production Log</h2>\n          <p className=\"mt-1 text-sm text-slate-500 font-medium\">Enter new production record for <span className=\"font-bold text-indigo-600\">{authUser?.name}</span>.</p>\n        </div>\n        <button\n          type=\"button\"\n          onClick={startVoiceRecognition}\n          className={inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors \}\n        >\n          {isListening ? <MicOff className=\"h-5 w-5 mr-2\" /> : <Mic className=\"h-5 w-5 mr-2\" />}\n          {isListening ? 'Listening...' : 'Quick Entry'}\n        </button>";

content = content.replace(buttonUIMatch, buttonUIInject);

// Voice Modal UI
const modalUIMatch = "  return (\n    <div className=\"max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6 relative\">";
const modalUIInject = \  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6 relative">
      
      {showVoiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowVoiceModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Verify Quick Entry</h3>
            <p className="text-sm text-slate-500 mb-6 italic">"\"</p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Node</label>
                  <input type="text" value={voiceData.rdtSection} onChange={e => setVoiceData({...voiceData, rdtSection: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Route</label>
                  <input type="text" value={voiceData.route} onChange={e => setVoiceData({...voiceData, route: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Location</label>
                  <input type="text" value={voiceData.location} onChange={e => setVoiceData({...voiceData, location: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Task</label>
                  <input type="text" value={voiceData.taskType} onChange={e => setVoiceData({...voiceData, taskType: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Spec Number</label>
                  <input type="text" value={voiceData.specNumber} onChange={e => setVoiceData({...voiceData, specNumber: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Footage</label>
                  <input type="text" value={voiceData.footage} onChange={e => setVoiceData({...voiceData, footage: e.target.value})} className="w-full mt-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">GPS Coordinates</label>
                <div className="flex space-x-2">
                  <input type="text" value={voiceData.gpsCoordinates} onChange={e => setVoiceData({...voiceData, gpsCoordinates: e.target.value})} placeholder="e.g. 36.78, -96.65" className="flex-1 p-2 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50" />
                  <button 
                    type="button"
                    onClick={() => {
                      if (!navigator.geolocation) return alert('GPS not supported');
                      navigator.geolocation.getCurrentPosition(
                        (pos) => setVoiceData({...voiceData, gpsCoordinates: \\, \\}),
                        () => alert('Could not get GPS location')
                      );
                    }}
                    className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-sm font-bold flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1" /> GPS
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowVoiceModal(false)} className="flex-1 py-3 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50">Cancel</button>
              <button onClick={submitVoiceLog} className="flex-1 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Log Entry
              </button>
            </div>
          </div>
        </div>
      )}\;

content = content.replace(modalUIMatch, modalUIInject);

fs.writeFileSync('src/components/LoggingForm.jsx', content);
