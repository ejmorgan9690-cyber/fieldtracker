import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { HardHat, Lock, User, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';

export default function Login() {
  const { login, register } = useAppContext();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Inspector');
  const [rememberMe, setRememberMe] = useState(true);
  const [residentExists, setResidentExists] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if a resident already exists in the database
    const checkResident = async () => {
      try {
        const { data } = await supabase.from('app_users').select('id').eq('role', 'Resident').limit(1);
        if (data && data.length > 0) {
          setResidentExists(true);
        }
      } catch (err) {
        console.error("Error checking for resident", err);
      }
    };
    checkResident();

    const savedUser = localStorage.getItem('fieldTrackerRememberedUser');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!username || !password) {
          setError('Please fill in all fields.');
          setLoading(false);
          return;
        }
        
        // If they bypass UI somehow and try to create a second resident
        if (role === 'Resident' && residentExists) {
          setError('A Resident account already exists. Only one Resident is allowed.');
          setLoading(false);
          return;
        }
        
        const result = await register(username, password, role);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        const result = await login(username, password, rememberMe);
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-pink-100/50 blur-[120px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <img src="/mrl-logo.png" alt="MRL Logo" className="h-20 object-contain drop-shadow-md" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Field Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700">
                Username / Login Name
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors bg-slate-50 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium transition-colors bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Account Role</label>
                <div className={`grid ${residentExists ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  <button
                    type="button"
                    onClick={() => setRole('Inspector')}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${role === 'Inspector' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Inspector
                  </button>
                  {!residentExists && (
                    <button
                      type="button"
                      onClick={() => setRole('Resident')}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${role === 'Resident' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      Resident
                    </button>
                  )}
                </div>
                {residentExists && (
                  <p className="mt-2 text-xs text-slate-500 font-medium italic">A Resident account has already been registered for this project.</p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">
                {isSignUp ? 'Already have an account?' : 'Need to create an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                if (residentExists) setRole('Inspector');
              }}
              className="w-full flex justify-center py-3 px-4 border-2 border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none transition-all"
            >
              {isSignUp ? 'Sign in to existing account' : 'Sign up as a new user'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
