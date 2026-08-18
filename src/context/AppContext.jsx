import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  }
  return dateString;
};

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('fieldTrackerUsers');
    if (savedUsers) return JSON.parse(savedUsers);
    return [
      { id: 'admin1', name: 'Resident', role: 'Resident', password: 'password123' },
    ];
  });

  const [authUser, setAuthUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [dailies, setDailies] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [redlines, setRedlines] = useState([]);
  const [activeTab, setActiveTab] = useState('log');

  useEffect(() => {
    localStorage.setItem('fieldTrackerUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('fieldTrackerEntries');
    if (savedEntries) setEntries(JSON.parse(savedEntries));

    const savedDailies = localStorage.getItem('fieldTrackerDailies');
    if (savedDailies) setDailies(JSON.parse(savedDailies));

    const savedGigs = localStorage.getItem('fieldTrackerGigs');
    if (savedGigs) setGigs(JSON.parse(savedGigs));
    
    const savedRedlines = localStorage.getItem('fieldTrackerRedlines');
    if (savedRedlines) setRedlines(JSON.parse(savedRedlines));
    
    const savedUser = localStorage.getItem('fieldTrackerAuth');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setAuthUser(parsedUser);
      setActiveTab(parsedUser.role === 'Resident' ? 'dashboard' : 'log');
    }
  }, []);

  const login = (name, password) => {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
    if (user) {
      setAuthUser(user);
      localStorage.setItem('fieldTrackerAuth', JSON.stringify(user));
      setActiveTab(user.role === 'Resident' ? 'dashboard' : 'log');
      return true;
    }
    return false;
  };

  const register = (name, password) => {
    if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      return false; // User already exists
    }
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      password,
      role: 'Inspector'
    };
    setUsers([...users, newUser]);
    
    setAuthUser(newUser);
    localStorage.setItem('fieldTrackerAuth', JSON.stringify(newUser));
    setActiveTab('log');
    return true;
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem('fieldTrackerAuth');
  };

  const addEntry = async (entry) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([entry])
        .select();

      if (error) {
        console.error('Error saving to Supabase:', error);
      }

      const newEntry = data && data.length > 0 ? data[0] : { ...entry, id: Date.now().toString() };
      const newEntries = [...entries, newEntry];
      setEntries(newEntries);
      localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
    } catch (err) {
      console.error('Unexpected error saving to Supabase:', err);
      const newEntries = [...entries, { ...entry, id: Date.now().toString() }];
      setEntries(newEntries);
      localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
    }
  };

  const deleteEntry = (id) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
  };

  const addDaily = (daily) => {
    const newDailies = [...dailies, { ...daily, id: Date.now().toString() }];
    setDailies(newDailies);
    localStorage.setItem('fieldTrackerDailies', JSON.stringify(newDailies));
  };

  const deleteDaily = (id) => {
    const newDailies = dailies.filter(d => d.id !== id);
    setDailies(newDailies);
    localStorage.setItem('fieldTrackerDailies', JSON.stringify(newDailies));
  };

  const addGig = (gig) => {
    const newGigs = [...gigs, { ...gig, id: Date.now().toString() }];
    setGigs(newGigs);
    localStorage.setItem('fieldTrackerGigs', JSON.stringify(newGigs));
  };

  const deleteGig = (id) => {
    const newGigs = gigs.filter(g => g.id !== id);
    setGigs(newGigs);
    localStorage.setItem('fieldTrackerGigs', JSON.stringify(newGigs));
  };

  const addRedline = (redline) => {
    const newRedlines = [...redlines, { ...redline, id: Date.now().toString() }];
    setRedlines(newRedlines);
    localStorage.setItem('fieldTrackerRedlines', JSON.stringify(newRedlines));
  };

  const deleteRedline = (id) => {
    const newRedlines = redlines.filter(r => r.id !== id);
    setRedlines(newRedlines);
    localStorage.setItem('fieldTrackerRedlines', JSON.stringify(newRedlines));
  };

  const clearData = () => {
    if (window.confirm('Clear all production logs AND daily reports?')) {
      setEntries([]);
      setDailies([]);
      setGigs([]);
      setRedlines([]);
      localStorage.removeItem('fieldTrackerEntries');
      localStorage.removeItem('fieldTrackerDailies');
      localStorage.removeItem('fieldTrackerGigs');
      localStorage.removeItem('fieldTrackerRedlines');
    }
  }

  return (
    <AppContext.Provider value={{ 
      users, authUser, login, logout, register,
      entries, addEntry, deleteEntry, 
      dailies, addDaily, deleteDaily,
      gigs, addGig, deleteGig,
      redlines, addRedline, deleteRedline,
      activeTab, setActiveTab, clearData 
    }}>
      {children}
    </AppContext.Provider>
  );
};
