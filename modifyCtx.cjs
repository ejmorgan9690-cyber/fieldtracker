const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.jsx', 'utf8');

// 1. Add state variable
code = code.replace(
  /const \[notes, setNotes\] = useState\(\[\]\);/,
  "const [notes, setNotes] = useState([]);\n  const [stakingPoints, setStakingPoints] = useState([]);"
);

// 2. Add fetch logic inside useEffect
code = code.replace(
  /setNotes\(notesData \|\| \[\]\);/,
  "setNotes(notesData || []);\n        const { data: stakingData } = await supabase.from('staking_points').select('*');\n        setStakingPoints(stakingData || []);"
);

// 3. Add functions right before clearData
const addFunctions = `
  const addStakingPoint = async (pointData) => {
    try {
      const { data, error } = await supabase
        .from('staking_points')
        .insert([{
          inspector: pointData.inspector,
          rdt_section: pointData.rdtSection,
          route: pointData.route,
          location: pointData.location,
          lat: pointData.lat,
          lng: pointData.lng,
          reference_image: pointData.referenceImage || null
        }])
        .select();

      if (error) {
        console.error('Error inserting staking point:', error);
        alert('Error saving staking point. See console.');
      } else if (data) {
        setStakingPoints([...stakingPoints, data[0]]);
        alert('Staking point saved successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStakingPoint = async (id) => {
    try {
      const { error } = await supabase.from('staking_points').delete().eq('id', id);
      if (error) {
        console.error('Error deleting staking point:', error);
      } else {
        setStakingPoints(stakingPoints.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearData = () => {`;

code = code.replace(/const clearData = \(\) => \{/, addFunctions);

// 4. Update the exported values
code = code.replace(
  /notes, addNote, deleteNote,/,
  "notes, addNote, deleteNote,\n      stakingPoints, addStakingPoint, deleteStakingPoint,"
);

fs.writeFileSync('src/context/AppContext.jsx', code);
