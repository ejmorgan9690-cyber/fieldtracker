import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Save, CheckCircle, FileSignature, Calendar, User } from 'lucide-react';

const RDT_SECTIONS = [...Array.from({ length: 10 }, (_, i) => `RDT${i + 1}`), 'Toll N', 'Toll S'];
const ROUTES = Array.from({ length: 20 }, (_, i) => `Route ${i + 1}`);
const TASK_TYPES = ['Bore', 'Plow Duct', 'Fiber', 'Hand Hole', 'Drop'];
const FIBER_COUNTS = ['4 count', '12 count', '24 count', '48 count', '96 count', '144 count', '288 count'];
const BORE_NUMBERS = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

// Custom Combobox to replace buggy native datalists
const Combobox = ({ id, label, value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt => 
    String(opt).toLowerCase().includes(String(search).toLowerCase())
  );
  const displayOptions = isOpen && search === '' ? options : filteredOptions;

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => { setSearch(''); setIsOpen(true); }}
          className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
          placeholder={placeholder}
          required={required && !value}
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
  const { authUser, addEntry } = useAppContext();
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString());
  const [taskType, setTaskType] = useState('Bore');
  const [psNumber, setPsNumber] = useState('');
  const [boreNumber, setBoreNumber] = useState('1');
  const [isAddedBore, setIsAddedBore] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [dropNumber, setDropNumber] = useState('');
  const [fiberCount, setFiberCount] = useState(FIBER_COUNTS[0]);
  const [rdtSection, setRdtSection] = useState('RDT1');
  const [route, setRoute] = useState('Route 1');
  const [location, setLocation] = useState('1');
  const [footage, setFootage] = useState('');
  
  // Unit Code State
  const [unitCode, setUnitCode] = useState('');
  const [isFiberLoop, setIsFiberLoop] = useState(false);
  const [loopQuantity, setLoopQuantity] = useState('');
  const [hasGroundRod, setHasGroundRod] = useState(false);
  const [hasSign, setHasSign] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState(false);

  const locationOptions = useMemo(() => {
    if (rdtSection === 'Toll N' || rdtSection === 'Toll S') {
      return Array.from({ length: 301 }, (_, i) => `${i}`);
    }
    return Array.from({ length: 50 }, (_, i) => `${i + 1}`);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (taskType !== 'Drop' && taskType !== 'Hand Hole' && (!footage || isNaN(footage) || Number(footage) <= 0)) {
      alert('Please enter a valid positive quantity/footage.');
      return;
    }

    addEntry({
      inspector: authUser.name,
      date,
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
      gpsCoordinates: taskType === 'Bore' && isAddedBore ? gpsCoordinates : null,
      psNumber: taskType === 'Drop' ? '' : psNumber,
      unitCode: unitCode,
      hasGroundRod,
      hasSign,
      isFiberLoop,
      loopQuantity
    });

    if (taskType !== 'Drop' && taskType !== 'Hand Hole') setFootage('');
    setDropNumber('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12">
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
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Daily Production Log</h2>
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
                Date: <span className="text-white ml-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                  required
                />
              </div>
              
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
                    label="Unit Code (Bore)" 
                    value={unitCode} 
                    onChange={setUnitCode} 
                    options={['BM61D (Dirt)', 'BM61R (Rock)'].map(o => o.split(' ')[0])} 
                    required 
                  />
                  <Combobox 
                    id="boreNumber" 
                    label="Bore Number" 
                    value={boreNumber} 
                    onChange={setBoreNumber} 
                    options={BORE_NUMBERS} 
                    required={!isAddedBore} 
                  />
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
                  {isAddedBore && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label htmlFor="gpsCoordinates" className="block text-sm font-bold text-slate-700 mb-2">GPS Coordinates (Start)</label>
                      <input
                        type="text"
                        id="gpsCoordinates"
                        value={gpsCoordinates}
                        onChange={(e) => setGpsCoordinates(e.target.value)}
                        className="block w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all font-medium"
                        placeholder="e.g. 35.123, -90.456"
                        required={isAddedBore}
                      />
                    </div>
                  )}
                </div>
              ) : taskType === 'Plow' || taskType === 'Trench' ? (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <Combobox 
                    id="unitCode" 
                    label={`Unit Code (${taskType})`} 
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
                    label="Unit Code (Fiber)" 
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
                    label="Unit Code (Hand Hole Size)" 
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
