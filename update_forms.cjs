const fs = require('fs');
const path = require('path');

function updateForm(filename, iconImport, iconName, formTitle, headerColor) {
  let fPath = path.join(process.cwd(), 'src/components', filename);
  if (!fs.existsSync(fPath)) return;
  let content = fs.readFileSync(fPath, 'utf-8');
  
  // Replace slate/zinc generically for forms
  content = content.replace(/zinc-/g, 'slate-');
  
  // Outer container
  content = content.replace(/<div className=\"max-w-[\w]+ mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mt-6\">/g, 
    '<div className=\"max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6\">');
    
  // Header section
  const headerRegex = /<div className=\"px-8 py-6 border-b border-slate-200 bg-white[\s\S]*?\">([\s\S]*?)<\/div>\s*<form onSubmit=\{handleSubmit\} className=\"px-8 py-8 space-y-6 bg-slate-50\">/;
  
  // Build new header
  const newHeader = \<div className="flex items-center mb-8 pb-6 border-b border-slate-100">
        <div className="bg-\-50 p-3.5 rounded-xl mr-5 border border-\-100 shadow-sm">
          <\ className="h-6 w-6 text-\-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">\</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Log entry for <span className="font-bold text-\-600">{authUser?.name}</span>.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">\;
      
  content = content.replace(headerRegex, newHeader);

  // Update button classes to be bolder and have transitions
  content = content.replace(/className=\"w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md transition-all active:scale-95\"/g, 
    'className=\"w-full sm:w-auto inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md transition-all active:scale-95 duration-200\"');

  content = content.replace(/className=\"w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all active:scale-95\"/g, 
    'className=\"w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 active:scale-95\"');

  // Fix imports
  if (!content.includes(iconName)) {
    content = content.replace(/import \{ (.*?) \} from 'lucide-react';/, \import { , \ } from 'lucide-react';\);
  }

  fs.writeFileSync(fPath, content);
}

updateForm('LoggingForm.jsx', 'Activity', 'Activity', 'Mainline Production Log', 'indigo');
updateForm('DailiesForm.jsx', 'FileText', 'FileText', 'Daily Progress Report', 'indigo');
// updateForm('GigList.jsx', 'AlertCircle', 'AlertCircle', 'Report a Deficiency', 'red');
// updateForm('RedlinesForm.jsx', 'Map', 'Map', 'Upload Redlines', 'purple');
console.log('Forms updated');
