import React, { useState } from 'react';
import StakingForm from './StakingForm';
import StakingMap from './StakingMap';
import { Map, MapPin } from 'lucide-react';

export default function StakingDashboard() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'map'

  return (
    <div className="flex-1 w-full flex flex-col h-screen bg-slate-50 overflow-y-auto pb-20 sm:pb-0">
      
      {/* Staking Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'form'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <MapPin className={`h-4 w-4 mr-2 ${activeTab === 'form' ? 'text-emerald-500' : 'text-slate-400'}`} />
                Log GPS Point
              </button>
              
              <button
                onClick={() => setActiveTab('map')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'map'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Map className={`h-4 w-4 mr-2 ${activeTab === 'map' ? 'text-emerald-500' : 'text-slate-400'}`} />
                View Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto">
        {activeTab === 'form' && <StakingForm />}
        {activeTab === 'map' && <StakingMap />}
      </div>
    </div>
  );
}
