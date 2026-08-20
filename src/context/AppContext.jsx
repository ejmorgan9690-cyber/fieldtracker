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
  const [authUser, setAuthUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [dailies, setDailies] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [redlines, setRedlines] = useState([]);
  const [activeTab, setActiveTab] = useState('log');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const { data: logsData, error: logsError } = await supabase.from('production_logs').select('*');
        if (logsError) {
          console.error('Error fetching logs from Supabase:', logsError);
        } else if (logsData) {
          const mappedEntries = logsData.map(row => ({
            id: row.id || Date.now().toString() + Math.random(),
            inspector: row.inspector_name,
            date: row.service_date,
            taskType: row.task_type,
            rdtSection: row.section,
            route: row.route,
            location: row.location,
            footage: row.footage,
            boreNumber: row.task_type === 'Bore' ? row.spec_number : null,
            fiberCount: row.task_type === 'Fiber' ? row.spec_number : null,
            handHoleNumber: row.task_type === 'Hand Hole' ? row.spec_number : null,
            dropNumber: row.task_type === 'Drop' ? row.spec_number : null,
            isAddedBore: row.is_added_bore || false,
            gpsCoordinates: row.gps_coordinates || null,
            psNumber: row.ps_number || '',
            status: row.status || 'Pending',
            unitCode: row.unit_code || '',
            hasGroundRod: row.has_ground_rod || false,
            hasSign: row.has_sign || false,
            created_at: row.created_at || null
          }));
          setEntries(mappedEntries);
          localStorage.setItem('fieldTrackerEntries', JSON.stringify(mappedEntries));
        }

        const { data: redlinesData, error: redlinesError } = await supabase.from('redlines').select('*');
        if (redlinesError) {
          console.error('Error fetching redlines from Supabase:', redlinesError);
        } else if (redlinesData) {
          const mappedRedlines = redlinesData.map(row => ({
            id: row.id,
            inspector: row.inspector_name,
            date: row.service_date,
            rdtSection: row.section,
            route: row.route,
            location: row.location,
            psNumber: row.ps_number || '',
            imageData: row.image_data,
            created_at: row.created_at || null
          }));
          setRedlines(mappedRedlines);
          localStorage.setItem('fieldTrackerRedlines', JSON.stringify(mappedRedlines));
        }

      } catch (err) {
        console.error('Unexpected error fetching from Supabase:', err);
      }
      
      try {
        const savedEntries = localStorage.getItem('fieldTrackerEntries');
        if (savedEntries && savedEntries !== 'undefined') setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error('Failed to parse saved entries:', e);
      }
    };

    fetchEntries();
    
    // Always load other offline data
    try {
      const savedDailies = localStorage.getItem('fieldTrackerDailies');
      if (savedDailies && savedDailies !== 'undefined') setDailies(JSON.parse(savedDailies));

      const savedGigs = localStorage.getItem('fieldTrackerGigs');
      if (savedGigs && savedGigs !== 'undefined') setGigs(JSON.parse(savedGigs));

      const savedRedlines = localStorage.getItem('fieldTrackerRedlines');
      if (savedRedlines && savedRedlines !== 'undefined') setRedlines(JSON.parse(savedRedlines));
    } catch (e) {
      console.error('Failed to parse saved local data:', e);
    }
    
    const savedUser = localStorage.getItem('fieldTrackerAuth') || sessionStorage.getItem('fieldTrackerAuth');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setAuthUser(parsedUser);
        setActiveTab(parsedUser.role === 'Resident' ? 'pending_review' : 'log');
      } catch (e) {
        console.error('Failed to parse saved auth:', e);
        localStorage.removeItem('fieldTrackerAuth');
        sessionStorage.removeItem('fieldTrackerAuth');
      }
    }
  }, []);

  const login = async (username, password, rememberMe) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .ilike('username', username)
        .eq('password', password);

      if (error) {
        console.error("Login error", error);
        return { success: false, error: 'Database error connecting to users.' };
      }

      if (data && data.length > 0) {
        const user = data[0];
        const authPayload = { id: user.id, name: user.username, role: user.role };
        setAuthUser(authPayload);
        
        if (rememberMe) {
          localStorage.setItem('fieldTrackerAuth', JSON.stringify(authPayload));
          localStorage.setItem('fieldTrackerRememberedUser', username);
        } else {
          sessionStorage.setItem('fieldTrackerAuth', JSON.stringify(authPayload));
        }
        
        setActiveTab(user.role === 'Resident' ? 'pending_review' : 'log');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (err) {
      return { success: false, error: 'Network error connecting to database.' };
    }
  };

  const register = async (username, password, role) => {
    try {
      const { data: existing } = await supabase.from('app_users').select('id').ilike('username', username);
      if (existing && existing.length > 0) {
        return { success: false, error: 'Username is already taken. Please choose another.' };
      }

      const { data, error } = await supabase
        .from('app_users')
        .insert([{ username, password, role }])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.length > 0) {
        const user = data[0];
        const authPayload = { id: user.id, name: user.username, role: user.role };
        setAuthUser(authPayload);
        localStorage.setItem('fieldTrackerAuth', JSON.stringify(authPayload));
        setActiveTab(user.role === 'Resident' ? 'pending_review' : 'log');
        return { success: true };
      }
      return { success: false, error: 'Unknown error creating account' };
    } catch (err) {
      return { success: false, error: 'Network error connecting to database.' };
    }
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem('fieldTrackerAuth');
    sessionStorage.removeItem('fieldTrackerAuth');
  };

  const addEntry = async (entry) => {
    try {
      // Consolidate conditional fields into a single spec_number string
      const specNumber = entry.taskType === 'Bore' ? entry.boreNumber :
                         entry.taskType === 'Fiber' ? entry.fiberCount :
                         entry.taskType === 'Hand Hole' ? entry.handHoleNumber :
                         entry.taskType === 'Drop' ? entry.dropNumber : null;

      const initialStatus = entry.taskType === 'Drop' ? 'Accepted' : 'Pending';

      const supabasePayload = {
        town: entry.town || 'Shidler',
        service_date: entry.date,
        section: entry.rdtSection,
        route: entry.route,
        location: entry.location,
        task_type: entry.taskType,
        spec_number: specNumber,
        footage: entry.footage,
        inspector_name: entry.inspector,
        is_added_bore: entry.isAddedBore || false,
        gps_coordinates: entry.gpsCoordinates || null,
        ps_number: entry.psNumber,
        status: initialStatus,
        unit_code: entry.unitCode || '',
        has_ground_rod: entry.hasGroundRod || false,
        has_sign: entry.hasSign || false
      };

      const payloads = [supabasePayload];

      // If they checked the Fiber Loop box, generate a second distinct payload for the loops!
      if (entry.taskType === 'Fiber' && entry.isFiberLoop) {
        payloads.push({
          ...supabasePayload,
          unit_code: entry.unitCode ? `${entry.unitCode} LOOP` : 'LOOP',
          footage: entry.loopQuantity || '1',
          task_type: 'Fiber Loop'
        });
      }

      const { data, error } = await supabase
        .from('production_logs')
        .insert(payloads)
        .select();

      if (error) {
        console.error('Error saving to Supabase:', error);
        alert(`Failed to save to cloud: ${error.message}. Please check if you ran the latest SQL script in Supabase!`);
        return; // Don't add to local state if cloud fails, so they don't think it succeeded
      }

      const addedEntries = data.map(row => ({
        id: row.id,
        inspector: row.inspector_name,
        date: row.service_date,
        town: row.town || 'Shidler',
        taskType: row.task_type,
        footage: row.footage,
        rdtSection: row.section,
        route: row.route,
        location: row.location,
        boreNumber: row.task_type === 'Bore' ? row.spec_number : null,
        fiberCount: row.task_type === 'Fiber' ? row.spec_number : null,
        handHoleNumber: row.task_type === 'Hand Hole' ? row.spec_number : null,
        dropNumber: row.task_type === 'Drop' ? row.spec_number : null,
        isAddedBore: row.is_added_bore || false,
        gpsCoordinates: row.gps_coordinates || null,
        psNumber: row.ps_number || '',
        status: row.status || 'Pending',
        unitCode: row.unit_code || '',
        hasGroundRod: row.has_ground_rod || false,
        hasSign: row.has_sign || false
      }));

      const newEntries = [...entries, ...addedEntries];
      setEntries(newEntries);
      localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
    } catch (err) {
      console.error('Unexpected error saving to Supabase:', err);
      alert(`Unexpected error saving to cloud: ${err.message}`);
    }
  };

  const verifyEntry = async (id) => {
    try {
      const { error } = await supabase.from('production_logs').update({ status: 'Accepted' }).eq('id', id);
      if (error) console.error("Error verifying entry:", error);
      
      const newEntries = entries.map(e => e.id === id ? { ...e, status: 'Accepted' } : e);
      setEntries(newEntries);
      localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
    } catch (err) {
      console.error("Error in verifyEntry:", err);
    }
  };

  const rejectEntry = async (id) => {
    try {
      const { error } = await supabase.from('production_logs').update({ status: 'Rejected' }).eq('id', id);
      if (error) console.error("Error rejecting entry:", error);
      
      const newEntries = entries.map(e => e.id === id ? { ...e, status: 'Rejected' } : e);
      setEntries(newEntries);
      localStorage.setItem('fieldTrackerEntries', JSON.stringify(newEntries));
    } catch (err) {
      console.error("Error in rejectEntry:", err);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await supabase.from('production_logs').delete().eq('id', id);
    } catch(e) {}
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

  const addRedline = async (redline) => {
    try {
      const supabasePayload = {
        inspector_name: redline.inspector,
        service_date: redline.date,
        section: redline.rdtSection,
        route: redline.route,
        location: redline.location,
        ps_number: redline.psNumber,
        image_data: redline.imageData
      };

      const { data, error } = await supabase.from('redlines').insert([supabasePayload]).select();
      if (error) console.error("Error saving redline to Supabase:", error);

      const newRedlines = [...redlines, { ...redline, id: data && data.length > 0 ? data[0].id : Date.now().toString() }];
      setRedlines(newRedlines);
      localStorage.setItem('fieldTrackerRedlines', JSON.stringify(newRedlines));
    } catch (err) {
      console.error("Error in addRedline:", err);
      const newRedlines = [...redlines, { ...redline, id: Date.now().toString() }];
      setRedlines(newRedlines);
      localStorage.setItem('fieldTrackerRedlines', JSON.stringify(newRedlines));
    }
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
      authUser, login, logout, register,
      entries, addEntry, deleteEntry, verifyEntry, rejectEntry,
      dailies, addDaily, deleteDaily,
      gigs, addGig, deleteGig,
      redlines, addRedline, deleteRedline,
      activeTab, setActiveTab, clearData 
    }}>
      {children}
    </AppContext.Provider>
  );
};
