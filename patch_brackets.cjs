const fs = require('fs');
let content = fs.readFileSync('src/components/MapRoute.jsx', 'utf8');

// 1. Rename annotated to redline
content = content.replace(/useState\('standard'\); \/\/ 'standard' \| 'annotated'/g, "useState('standard'); // 'standard' | 'redline'");
content = content.replace(/setMapMode\('annotated'\)/g, "setMapMode('redline')");
content = content.replace(/mapMode === 'annotated'/g, "mapMode === 'redline'");
content = content.replace(/> Annotated View <\/button>/g, "> Redline View </button>");
content = content.replace(/{\/\* Red Pen Annotations \(Annotated View Only\) \*\/}/g, "{/* Red Pen Annotations (Redline View Only) */}");

// 2. Rewrite duct processing block
const ductStart = content.indexOf('let currentDuctFt = 0;');
const ductEnd = content.indexOf('let currentFiberFt = 0;');
if (ductStart > -1 && ductEnd > -1) {
    const oldDuctBlock = content.substring(ductStart, ductEnd);
    const newDuctBlock = \let currentDuctFt = 0;
          group.duct.forEach((entry, idx) => {
            if (currentDuctFt >= fullLengthFt) return;
            const startFt = currentDuctFt;
            let endFt = currentDuctFt + entry.ft;
            if (endFt > fullLengthFt) endFt = fullLengthFt;
            
            try {
              const chunkSegment = turf.lineSliceAlong(fullSegment, startFt, endFt, {units: 'feet'});
              const latLngs = chunkSegment.geometry.coordinates.map(coord => [coord[1], coord[0]]);
              let bracketLine = null, bracketStart = null, bracketEnd = null;
              let midCoord = latLngs[Math.floor(latLngs.length / 2)];
              
              try {
                const offset = turf.lineOffset(chunkSegment, 30, {units: 'feet'});
                bracketLine = offset.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                bracketStart = [latLngs[0], bracketLine[0]];
                bracketEnd = [latLngs[latLngs.length - 1], bracketLine[bracketLine.length - 1]];
                midCoord = bracketLine[Math.floor(bracketLine.length / 2)];
              } catch (e) { }

              segments.push({
                key: \\_duct_\\,
                positions: latLngs,
                standardColor: '#22c55e',
                inspector: entry.inspector,
                date: entry.date,
                midCoord: midCoord,
                bracketLine, bracketStart, bracketEnd,
                type: 'duct'
              });
            } catch (err) {}
            currentDuctFt = endFt;
          });
          
          \;
    content = content.replace(oldDuctBlock, newDuctBlock);
}

// 3. Rewrite fiber processing block
const fiberStart = content.indexOf('let currentFiberFt = 0;');
const fiberEnd = content.indexOf('} catch (err) {', fiberStart); // end of the try block
if (fiberStart > -1 && fiberEnd > -1) {
    const oldFiberBlock = content.substring(fiberStart, fiberEnd);
    const newFiberBlock = \let currentFiberFt = 0;
          group.fiber.forEach((entry, idx) => {
            if (currentFiberFt >= fullLengthFt) return;
            const startFt = currentFiberFt;
            let endFt = currentFiberFt + entry.ft;
            if (endFt > fullLengthFt) endFt = fullLengthFt;
            
            try {
              const chunkSegment = turf.lineSliceAlong(fullSegment, startFt, endFt, {units: 'feet'});
              const latLngs = chunkSegment.geometry.coordinates.map(coord => [coord[1], coord[0]]);
              let bracketLine = null, bracketStart = null, bracketEnd = null;
              let midCoord = latLngs[Math.floor(latLngs.length / 2)];
              
              try {
                const offset = turf.lineOffset(chunkSegment, 45, {units: 'feet'});
                bracketLine = offset.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                bracketStart = [latLngs[0], bracketLine[0]];
                bracketEnd = [latLngs[latLngs.length - 1], bracketLine[bracketLine.length - 1]];
                midCoord = bracketLine[Math.floor(bracketLine.length / 2)];
              } catch (e) { }

              segments.push({
                key: \\_fiber_\\,
                positions: latLngs,
                standardColor: '#a855f7',
                inspector: entry.inspector,
                date: entry.date,
                midCoord: midCoord,
                bracketLine, bracketStart, bracketEnd,
                type: 'fiber'
              });
            } catch (err) {}
            currentFiberFt = endFt;
          });
          
        \;
    content = content.replace(oldFiberBlock, newFiberBlock);
}

// 4. Update Render Block
const renderStart = content.indexOf("{/* Red Pen Annotations (Redline View Only) */}");
const renderEnd = content.indexOf("<FitBounds data={geoData} />");
if (renderStart > -1 && renderEnd > -1) {
    const oldRenderBlock = content.substring(renderStart, renderEnd);
    const newRenderBlock = \{/* Red Pen Annotations (Redline View Only) */}
              {mapMode === 'redline' && completedSegments.filter(s => s.type === 'duct' || s.type === 'fiber').map(seg => {
                if (!seg.inspector || !seg.date || !seg.midCoord || !seg.bracketLine) return null;
                const d = new Date(seg.date);
                const dateStr = \\-\-\\;
                
                const icon = L.divIcon({
                  className: 'red-pen-label',
                  html: \<div class="red-pen-container">
                           <div class="red-pen-line"></div>
                           <div class="red-pen-text">\<br/>\</div>
                         </div>\,
                  iconSize: [150, 100],
                  iconAnchor: [0, 100]
                });

                return (
                  <React.Fragment key={\pen-group-\\}>
                    <Marker position={seg.midCoord} icon={icon} zIndexOffset={1000} />
                    <Polyline positions={seg.bracketLine} pathOptions={{ color: '#dc2626', weight: 2, opacity: 0.8 }} />
                    <Polyline positions={seg.bracketStart} pathOptions={{ color: '#dc2626', weight: 2, opacity: 0.8 }} />
                    <Polyline positions={seg.bracketEnd} pathOptions={{ color: '#dc2626', weight: 2, opacity: 0.8 }} />
                  </React.Fragment>
                );
              })}

              \;
    content = content.replace(oldRenderBlock, newRenderBlock);
}

fs.writeFileSync('src/components/MapRoute.jsx', content);
