const fs = require('fs');
const materialsFilePath = './backend/data/materials.json';
fs.readFile(materialsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading materials file:', err);
    return;
  }
  const materials = JSON.parse(data);
  const updatedMaterials = materials.map(material => {
    material.isServing = material.currentLocation !== 'Magazin';
    return material;
  });
  fs.writeFile(materialsFilePath, JSON.stringify(updatedMaterials, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing materials file:', err);
      return;
    }
    console.log('Successfully updated materials.json with isServing property.');
  });
});