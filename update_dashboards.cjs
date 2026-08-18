const fs = require('fs');
const path = require('path');

const files = [
  'MasterDashboard.jsx', 'MasterDailies.jsx', 'MasterGigList.jsx', 
  'MasterDrops.jsx', 'MasterRedlines.jsx', 'MyHistory.jsx'
];

for (const file of files) {
  let fPath = path.join(process.cwd(), 'src/components', file);
  if (!fs.existsSync(fPath)) continue;
  let content = fs.readFileSync(fPath, 'utf-8');
  
  // Convert filterInspector select
  const selectRegex = /<select[\s\S]*?value=\{filterInspector\}[\s\S]*?>[\s\S]*?<option value=\"\">.*?<\/option>[\s\S]*?<\/select>/;
  const listId = "inspector-options-" + file.replace(".jsx", "");
  const inputReplacement = "<input type=\"text\" list=\"" + listId + "\" value={filterInspector} onChange={(e) => setFilterInspector(e.target.value)} onClick={(e) => e.target.select()} placeholder=\"All Inspectors\" className=\"block w-full sm:w-auto px-3 py-2 rounded-lg border border-zinc-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all\" />\n            <datalist id=\"" + listId + "\">\n              {uniqueInspectors.map(i => <option key={i} value={i} />)}\n            </datalist>";
  content = content.replace(selectRegex, inputReplacement);

  // Convert hover states on tables
  content = content.replace(/hover:bg-zinc-50/g, 'hover:bg-indigo-50/80');

  // Add card hover states
  content = content.replace(/className=\"bg-white rounded-xl shadow-md border border-zinc-200 p-6 flex items-center\"/g, 'className=\"bg-white rounded-xl shadow-md border border-zinc-200 p-6 flex items-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-zinc-50\"');

  fs.writeFileSync(fPath, content);
}
console.log('Master dashboards updated.');
