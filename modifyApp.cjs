const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const imports = "import StakingDashboard from './components/staking/StakingDashboard';\nimport { LayoutGrid, MapPin } from 'lucide-react';\n";

code = code.replace(/import MapRoute from '\.\/components\/MapRoute';/, "import MapRoute from './components/MapRoute';\n" + imports);

const appModeState = "  const [appMode, setAppMode] = React.useState('field-tracker');\n";

code = code.replace(/const { authUser, activeTab } = useAppContext\(\);/, "const { authUser, activeTab } = useAppContext();\n" + appModeState);

const topBar = `
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs sm:text-sm shadow-md z-50">
        <div className="font-bold flex items-center tracking-wider">
           <span className="text-emerald-400 mr-2">♦</span> COMPANY PORTAL
        </div>
        <div className="flex space-x-2">
           <button onClick={() => setAppMode('field-tracker')} className={\`px-3 py-1.5 rounded flex items-center transition-colors \${appMode === 'field-tracker' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}\`}>
             <LayoutGrid className="h-4 w-4 mr-1.5 hidden sm:block" /> Tracker
           </button>
           <button onClick={() => setAppMode('staking')} className={\`px-3 py-1.5 rounded flex items-center transition-colors \${appMode === 'staking' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}\`}>
             <MapPin className="h-4 w-4 mr-1.5 hidden sm:block" /> Staking
           </button>
        </div>
      </div>
      {appMode === 'field-tracker' ? (
        <>
`;

code = code.replace(/<div className="min-h-screen bg-slate-50 font-sans text-slate-900">/, topBar);

const endDiv = `
        </>
      ) : (
        <StakingDashboard />
      )}
    </div>
`;

code = code.replace(/<\/main>\s*<\/div>/, "</main>" + endDiv);

fs.writeFileSync('src/App.jsx', code);
