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
import PendingReview from './components/PendingReview';

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
        {authUser.role === 'Resident' && activeTab === 'pending_review' && <PendingReview />}
        {authUser.role === 'Resident' && activeTab === 'dashboard' && <MasterDashboard />}
        {authUser.role === 'Resident' && activeTab === 'master_dailies' && <MasterDailies />}
        {authUser.role === 'Resident' && activeTab === 'master_redlines' && <MasterRedlines />}
        {authUser.role === 'Resident' && activeTab === 'master_gig_list' && <MasterGigList />}
        {authUser.role === 'Resident' && activeTab === 'master_drops' && <MasterDrops />}
      </main>
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
