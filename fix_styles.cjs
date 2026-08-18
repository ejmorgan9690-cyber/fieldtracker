const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => path.join(dir, f));
files.push(path.join(process.cwd(), 'src/App.jsx'));

for (const f of files) {
  let content = fs.readFileSync(f, 'utf-8');
  content = content.replace(/zinc-/g, 'slate-');

  // Replace button classes
  content = content.replace(/w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md transition-all active:scale-95/g, 
    'w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md transition-all duration-200 active:scale-95');

  content = content.replace(/w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all active:scale-95/g, 
    'w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 active:scale-95');

  fs.writeFileSync(f, content);
}
console.log('Styles updated');
