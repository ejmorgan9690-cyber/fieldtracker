const fs = require('fs');
const { kml } = require('@tmcw/togeojson');
const { DOMParser } = require('@xmldom/xmldom');

console.log('Loading KML...');
const kmlContent = fs.readFileSync('./kanokla_design_extract/doc.kml', 'utf8');
const doc = new DOMParser().parseFromString(kmlContent, 'text/xml');
console.log('Converting to GeoJSON...');
const geojson = kml(doc);

// Basic simplification logic to reduce size (stripping out properties if they are massive, or removing tiny features)
// But for now let's just write it
fs.writeFileSync('./public/route.geojson', JSON.stringify(geojson));
console.log('Done! Saved to public/route.geojson');
