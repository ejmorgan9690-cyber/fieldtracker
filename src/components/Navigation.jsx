import React from 'react';
import { useAppContext } from '../context/AppContext';
import { HardHat, LogOut, UserCircle, Activity, FileText, CalendarDays, ClipboardList, Map, Target, Calculator, CheckCircle, Mic } from 'lucide-react';

export default function Navigation() {
  const { authUser, activeTab, setActiveTab, logout } = useAppContext();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-4 sm:py-0">
          {/* Logo & Brand */}
          <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start mb-4 sm:mb-0">
            <div className="flex items-center">
              <img src="/mrl-logo.png" alt="MRL Logo" className="h-10 object-contain mr-3 mix-blend-multiply" />
              <span className="font-bold text-2xl text-slate-900 tracking-tight">Field Tracker</span>
              <span className="ml-3 text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">v1.0.1</span>
            </div>
            
            {/* Mobile User Profile & Logout (shows on mobile) */}
            <div className="flex items-center sm:hidden bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-xs font-bold text-slate-700 mr-3">{authUser?.name} <span className="text-indigo-600">({authUser?.role})</span></span>
              <button
                onClick={logout}
                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors flex items-center border border-red-100 shadow-sm"
                title="Logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="text-xs font-bold">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {authUser?.role === 'Inspector' && (
              <>
                <button
                  onClick={() => setActiveTab('log')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'log'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Log Entry
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'map'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map
                </button>
                <button
                  onClick={() => setActiveTab('dailies')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'dailies'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Dailies
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'notes'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('gig_list')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'gig_list'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Gig List
                </button>
                <button
                  onClick={() => setActiveTab('redlines')}
                  className={`flex-1 sm:flex-none flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'redlines'
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Redlines
                </button>
              </>
            )}
            
            {authUser?.role === 'Resident' && (
              <div className="flex flex-col space-y-3 w-full mt-2 sm:mt-0">
                {/* Top Level View Toggle */}
                <div className="flex items-center">
                  <div className="flex bg-slate-200 p-1 rounded-xl w-64 relative">
                    <button 
                      onClick={() => activeTab === 'master_drops' && setActiveTab('dashboard')}
                      className={`flex-1 py-1.5 flex items-center justify-center text-sm font-bold rounded-lg z-10 transition-colors ${activeTab !== 'master_drops' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Activity className="w-4 h-4 mr-1.5" />
                      Mainline
                    </button>
                    <button 
                      onClick={() => setActiveTab('master_drops')}
                      className={`flex-1 py-1.5 flex items-center justify-center text-sm font-bold rounded-lg z-10 transition-colors ${activeTab === 'master_drops' ? 'text-pink-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Target className="w-4 h-4 mr-1.5" />
                      Drops
                    </button>
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ${activeTab === 'master_drops' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}
                    ></div>
                  </div>
                </div>

                {/* Mainline Sub-tabs */}
                {activeTab !== 'master_drops' && (
                  <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('pending_review')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'pending_review'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Pending Review
                    </button>
                    <button
                      onClick={() => setActiveTab('map')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'map'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Map
                    </button>
                    <button
                      onClick={() => setActiveTab('accepted_logs')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'accepted_logs'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepted Logs
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'dashboard'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Unit Pay Sheet
                    </button>
                    <button
                      onClick={() => setActiveTab('master_dailies')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'master_dailies'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Dailies Master
                    </button>
                    <button
                      onClick={() => setActiveTab('master_notes')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'master_notes'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Notes Feed
                    </button>
                    <button
                      onClick={() => setActiveTab('master_gig_list')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'master_gig_list'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Gig List Master
                    </button>
                    <button
                      onClick={() => setActiveTab('master_redlines')}
                      className={`flex-1 sm:flex-none flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'master_redlines'
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Redlines Master
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile (desktop) */}
          <div className="hidden sm:flex items-center bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200 shadow-inner">
            <UserCircle className="h-5 w-5 text-slate-400 mr-2" />
            <span className="text-sm font-semibold text-slate-800 mr-4">{authUser?.name} <span className="text-slate-500 font-normal">({authUser?.role})</span></span>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
