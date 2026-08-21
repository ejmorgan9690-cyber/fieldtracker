import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navigation from './components/Navigation';
import LoggingForm from './components/LoggingForm';
import MasterDashboard from './components/MasterDashboard';
import MyHistory from './components/MyHistory';
import Login from './components/Login';
import DailiesForm from './components/DailiesForm';
import MasterDailies from './components/MasterDailies';
import GigList from './components/GigList';
import MasterGigList from './components/MasterGigList';
import RedlinesForm from './components/RedlinesForm';
import MasterRedlines from './components/MasterRedlines';
import MasterDrops from './components/MasterDrops';
import NotesForm from './components/NotesForm';
import MasterNotes from './components/MasterNotes';
import PendingReview from './components/PendingReview';
import AcceptedLogFeed from './components/AcceptedLogFeed';
import MasterUnitSheet from './components/MasterUnitSheet';
import MapRoute from './components/MapRoute';
import StakingDashboard from './components/staking/StakingDashboard';
import { LayoutGrid, MapPin } from 'lucide-react';


const MainContent = () => {
  const { authUser, activeTab } = useAppContext();
  const [appMode, setAppMode] = React.useState('field-tracker');


  if (!authUser) {
    return <Login />;
  }

  // If tab is map, don't pad so much so it takes full screen
  const isMapTab = activeTab === 'map';

  return (
    
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs sm:text-sm shadow-md z-50">
        <div className="font-bold flex items-center tracking-wider">
           <span className="text-emerald-400 mr-2">♦</span> COMPANY PORTAL
        </div>
        <div className="flex space-x-2">
           <button onClick={() => setAppMode('field-tracker')} className={`px-3 py-1.5 rounded flex items-center transition-colors ${appMode === 'field-tracker' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
             <LayoutGrid className="h-4 w-4 mr-1.5 hidden sm:block" /> Tracker
           </button>
           <button onClick={() => setAppMode('staking')} className={`px-3 py-1.5 rounded flex items-center transition-colors ${appMode === 'staking' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
             <MapPin className="h-4 w-4 mr-1.5 hidden sm:block" /> Staking
           </button>
        </div>
      </div>
      {appMode === 'field-tracker' ? (
        <>

      <Navigation />
      <main className={isMapTab ? "" : "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"}>
        {activeTab === 'map' && <MapRoute />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'log' && <LoggingForm />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'dailies' && <DailiesForm />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'notes' && <NotesForm />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'master_notes' && <MasterNotes />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'history' && <MyHistory />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'gig_list' && <GigList />}
        {(authUser.role === 'Inspector' || authUser.role === 'Supervisor') && activeTab === 'redlines' && <RedlinesForm />}
        
        {authUser.role === 'Supervisor' && activeTab === 'dashboard' && <MasterDashboard />}
        {authUser.role === 'Supervisor' && activeTab === 'pending_review' && <PendingReview />}
        {authUser.role === 'Supervisor' && activeTab === 'accepted_logs' && <AcceptedLogFeed />}
        {authUser.role === 'Supervisor' && activeTab === 'master_dailies' && <MasterDailies />}
        {authUser.role === 'Supervisor' && activeTab === 'master_redlines' && <MasterRedlines />}
        {authUser.role === 'Supervisor' && activeTab === 'master_gig_list' && <MasterGigList />}
        {authUser.role === 'Supervisor' && activeTab === 'master_drops' && <MasterDrops />}
        {authUser.role === 'Supervisor' && activeTab === 'master_unit_sheet' && <MasterUnitSheet />}
        
        {authUser.role === 'Resident' && activeTab === 'pending_review' && <PendingReview />}
        {authUser.role === 'Resident' && activeTab === 'dashboard' && <MasterUnitSheet />}
        {authUser.role === 'Resident' && activeTab === 'accepted_logs' && <AcceptedLogFeed />}
        {authUser.role === 'Resident' && activeTab === 'master_dailies' && <MasterDailies />}
        {authUser.role === 'Resident' && activeTab === 'master_redlines' && <MasterRedlines />}
        {authUser.role === 'Resident' && activeTab === 'master_gig_list' && <MasterGigList />}
        {authUser.role === 'Resident' && activeTab === 'master_drops' && <MasterDrops />}
      </main>
        </>
      ) : (
        <StakingDashboard />
      )}
    </div>

  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
          <h2 style={{ color: '#e53e3e' }}>Something went wrong.</h2>
          <p>Please screenshot this and send it to the developer:</p>
          <pre style={{ background: '#f7fafc', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
