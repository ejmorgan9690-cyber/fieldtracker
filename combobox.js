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