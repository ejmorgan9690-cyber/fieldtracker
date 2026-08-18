const fs = require('fs');
const path = require('path');

function updateFormContainer(filename, iconImport, iconName, formTitle, headerColor, subTitle) {
  let fPath = path.join(process.cwd(), 'src/components', filename);
  if (!fs.existsSync(fPath)) return;
  let content = fs.readFileSync(fPath, 'utf-8');
  
  // Outer container
  content = content.replace(/className=\"max-w-[\w]+ mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mt-6\"/g, 
    'className=\"max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-6\"');
  
  content = content.replace(/className=\"bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4\"/g, 
    'className=\"bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-6 animate-in fade-in slide-in-from-top-4\"');

  // Replace header section if not already done
  const headerRegex1 = /<div className=\"px-8 py-6 border-b border-slate-200 bg-white[\s\S]*?\">([\s\S]*?)<\/div>\s*<form onSubmit=\{handleAddGig\} className=\"p-8 space-y-6 bg-white\">/;
  const headerRegex2 = /<div className=\"px-8 py-6 border-b border-slate-200 bg-white\">([\s\S]*?)<\/div>\s*<form onSubmit=\{handleSubmit\} className=\"px-8 py-8 space-y-6 bg-slate-50\">/;
  const headerRegex3 = /<div className=\"px-8 py-6 border-b border-slate-200 bg-white flex items-center\">([\s\S]*?)<\/div>\s*<form onSubmit=\{handleSubmit\} className=\"px-8 py-8 space-y-6 bg-slate-50\">/;
  const headerRegex4 = /<div className=\"px-8 py-5 border-b border-slate-200 bg-red-50\">([\s\S]*?)<\/div>\s*<form onSubmit=\{handleAddGig\} className=\"p-8 space-y-6 bg-white\">/;
  
  const newHeader = \<div className="flex items-center mb-8 pb-6 border-b border-slate-100">
        <div className="bg-\-50 p-3.5 rounded-xl mr-5 border border-\-100 shadow-sm">
          <\ className="h-6 w-6 text-\-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">\</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">\</p>
        </div>
      </div>
      <form onSubmit={\} className="space-y-8">\;
      
  content = content.replace(headerRegex1, newHeader);
  content = content.replace(headerRegex2, newHeader);
  content = content.replace(headerRegex3, newHeader);
  content = content.replace(headerRegex4, newHeader);

  // Fix imports
  if (!content.includes(iconName)) {
    content = content.replace(/import \{ (.*?) \} from 'lucide-react';/, \import { , \ } from 'lucide-react';\);
  }

  fs.writeFileSync(fPath, content);
}

updateFormContainer('DailiesForm.jsx', 'FileText', 'FileText', 'Daily Progress Report', 'indigo', 'Record your descriptive daily report.');
updateFormContainer('GigList.jsx', 'AlertCircle', 'AlertCircle', 'Report a Deficiency', 'red', 'Log a new gig or issue that needs to be addressed.');
updateFormContainer('RedlinesForm.jsx', 'Map', 'Map', 'Upload Redlines', 'purple', 'Submit a hard-copy redline print.');
console.log('Forms updated completely');
