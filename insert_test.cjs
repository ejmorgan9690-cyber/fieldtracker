const url = 'https://owygcutjqfbjiihpevfr.supabase.co/rest/v1/staking_points';
const key = 'sb_publishable_SRExcUhLmEReJ-W99l5Kjg_ug_cjCur';

const data = {
  inspector: 'AI Test System',
  rdt_section: 'RDT 1',
  route: 'Test Route',
  location: 'Test Loc',
  lat: 36.77636737041102,
  lng: -96.6618198447001
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=representation'
  },
  body: JSON.stringify(data)
})
.then(res => res.json())
.then(data => console.log('Successfully inserted:', data))
.catch(err => console.error(err));
