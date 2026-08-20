const fs = require('fs');

let content = fs.readFileSync('src/components/MapRoute.jsx', 'utf8');

// 1. Remove INSPECTOR_COLORS
content = content.replace(/const INSPECTOR_COLORS = \[\s*'#ef4444'[^\]]*\];\s*/, '');

// 2. Change state to 'annotated'
content = content.replace(/useState\('standard'\); \/\/ 'standard' \| 'inspector'/g, "useState('standard'); // 'standard' | 'annotated'");
content = content.replace(/setMapMode\('inspector'\)/g, "setMapMode('annotated')");
content = content.replace(/mapMode === 'inspector'/g, "mapMode === 'annotated'");
content = content.replace(/>\s*Inspector View\s*<\/button>/g, "> Annotated View </button>");

// 3. Remove iColors from useMemo
content = content.replace(/const iColors = new Map\(\);\s*let colorIdx = 0;/g, '');
content = content.replace(/if \(!iColors\.has\(inspector\)\) {[\s\S]*?colorIdx\+\+;\s*}/g, '');
content = content.replace(/inspectorColor: iColors\.get\(inspector\),/g, '');
content = content.replace(/inspectorColors: iColors/g, '');
content = content.replace(/const { completedHandholes, completedSegments, inspectorColors }/g, 'const { completedHandholes, completedSegments }');
content = content.replace(/inspectorColors: new Map\(\)/g, '');

// 4. Update Polyline rendering to always use standardColor
content = content.replace(/const strokeColor = mapMode === 'annotated' \? \(seg\.inspectorColor \|\| '#333333'\) : seg\.standardColor;/g, "const strokeColor = seg.standardColor;");

fs.writeFileSync('src/components/MapRoute.jsx', content);
