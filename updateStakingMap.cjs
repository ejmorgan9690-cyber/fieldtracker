const fs = require('fs');
let code = fs.readFileSync('src/components/staking/StakingMap.jsx', 'utf8');

code = code.replace(
  /const response = await fetch\(`\/kml\/\$\{filename\}`\);\s*if \(\!response\.ok\) throw new Error\("Failed to load map"\);\s*const kmlText = await response\.text\(\);\s*processKmlText\(kmlText\);/,
  `const response = await fetch(filename.endsWith('.geojson') ? \`/\${filename}\` : \`/kml/\${filename}\`);
      if (!response.ok) throw new Error("Failed to load map");
      if (filename.endsWith('.geojson')) {
        const jsonData = await response.json();
        setGeoJsonData(jsonData);
        
        if (jsonData.features && jsonData.features.length > 0) {
          const firstFeature = jsonData.features[0];
          let coords = null;
          if (firstFeature.geometry.type === 'Point') {
            coords = [firstFeature.geometry.coordinates[1], firstFeature.geometry.coordinates[0]];
          } else if (firstFeature.geometry.type === 'LineString' || firstFeature.geometry.type === 'Polygon') {
            const firstCoord = firstFeature.geometry.coordinates[0];
            if (Array.isArray(firstCoord[0])) {
               coords = [firstCoord[0][1], firstCoord[0][0]];
            } else {
               coords = [firstCoord[1], firstCoord[0]];
            }
          }
          if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
            setMapCenter(coords);
            if (mapRef.current) {
              mapRef.current.flyTo(coords, 14);
            }
          }
        }
      } else {
        const kmlText = await response.text();
        processKmlText(kmlText);
      }`
);

code = code.replace(
  /<option value="KanOkla\.kml">KanOkla Telephone<\/option>/,
  '<option value="route.geojson">KanOkla Telephone (Full Route)</option>'
);

// We also need to change how GeoJSON is rendered if it's identical to MapRoute, 
// wait, GeoJSON handles styles via properties, or we can just pass a style function.
// Let's add a style function to GeoJSON in StakingMap like MapRoute does.
code = code.replace(
  /style=\{\{\s*color:\s*'#4f46e5',\s*\/\/\s*indigo-600\s*weight:\s*3,\s*opacity:\s*0\.7\s*\}\}/,
  `style={(feature) => {
                  if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    return { color: '#3b82f6', weight: 4, opacity: 0.8 };
                  }
                  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    return { color: '#8b5cf6', fillColor: '#8b5cf6', weight: 2, fillOpacity: 0.2 };
                  }
                  return { color: '#4f46e5', weight: 3, opacity: 0.7 };
                }}
                pointToLayer={(feature, latlng) => {
                  if (feature.properties && feature.properties.description && feature.properties.description.includes('Handhole')) {
                    return L.circleMarker(latlng, { radius: 5, color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 1, weight: 1 });
                  }
                  return L.circleMarker(latlng, { radius: 3, color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 1, weight: 1 });
                }}`
);

fs.writeFileSync('src/components/staking/StakingMap.jsx', code);
