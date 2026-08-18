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

const MainContent = () => {
  const { authUser, activeTab } = useAppContext();

  if (!authUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navigation />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {authUser.role === 'Inspector' && activeTab === 'log' && <LoggingForm />}
        {authUser.role === 'Inspector' && activeTab === 'dailies' && <DailiesForm />}
        {authUser.role === 'Inspector' && activeTab === 'redlines' && <RedlinesForm />}
        {authUser.role === 'Inspector' && activeTab === 'history' && <MyHistory />}
        {authUser.role === 'Inspector' && activeTab === 'gig_list' && <GigList />}
        {authUser.role === 'Resident' && activeTab === 'dashboard' && <MasterDashboard />}
        {authUser.role === 'Resident' && activeTab === 'master_dailies' && <MasterDailies />}
        {authUser.role === 'Resident' && activeTab === 'master_redlines' && <MasterRedlines />}
        {authUser.role === 'Resident' && activeTab === 'master_gig_list' && <MasterGigList />}
        {authUser.role === 'Resident' && activeTab === 'master_drops' && <MasterDrops />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
