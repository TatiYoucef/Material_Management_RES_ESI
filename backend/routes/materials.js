const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data');

// Helper function for material instance validation
function validateMaterialInstance(material) {
  const errors = [];

  if (!material.type || material.type.trim() === '') {
    errors.push('Material type is required.');
  }
  if (!material.name || material.name.trim() === '') {
    errors.push('Material name is required.');
  }
  if (typeof material.isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean.');
  }
  if (!material.currentLocation || material.currentLocation.trim() === '') {
    errors.push('Current location is required.');
  }

  return errors;
}

// Get all specific material instances
router.get('/', (req, res) => {
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));

  // Filtering for specific instances
  const { search, isAvailable, type, location } = req.query;
  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    materials = materials.filter(m => 
      m.name.toLowerCase().includes(lowerCaseSearch) || 
      m.details.toLowerCase().includes(lowerCaseSearch) ||
      m.type.toLowerCase().includes(lowerCaseSearch)
    );
  }
  if (isAvailable !== undefined) {
    materials = materials.filter(m => m.isAvailable === (isAvailable === 'true'));
  }
  if (type) {
    materials = materials.filter(m => m.type && m.type.toLowerCase() === type.toLowerCase());
  }
  if (location) {
    materials = materials.filter(m => m.currentLocation && m.currentLocation.toLowerCase() === location.toLowerCase());
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  results.total = materials.length;
  results.page = page;
  results.limit = limit;

  if (endIndex < materials.length) {
    results.next = {
      page: page + 1,
      limit: limit
    };
  }
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit
    };
  }
  results.data = materials.slice(startIndex, endIndex);

  res.json(results);
});

// Get aggregated material types for home page
router.get('/types', (req, res) => {
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const materialTypes = {};
  const { search } = req.query;

  materials.forEach(m => {
    if (!materialTypes[m.type]) {
      materialTypes[m.type] = {
        type: m.type,
        available: 0,
        reserved: 0,
        totalInstances: 0
      };
    }
    materialTypes[m.type].totalInstances++;
    if (m.isAvailable) {
      materialTypes[m.type].available++;
    } else {
      materialTypes[m.type].reserved++;
    }
  });

  let result = Object.values(materialTypes);

  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    result = result.filter(type => type.type.toLowerCase().includes(lowerCaseSearch));
  }

  res.json(result);
});

// Get a specific material instance by ID
router.get('/:id', (req, res) => {
  const materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const material = materials.find(m => m.id === req.params.id);
  if (material) {
    res.json(material);
  } else {
    res.status(404).send('Material not found');
  }
});

// Create a new specific material instance
router.post('/', (req, res) => {
  const newMaterial = req.body;
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));

  const errors = validateMaterialInstance(newMaterial);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Generate a unique ID
  let nextIdNum = 1;
  const existingIds = new Set(materials.map(m => parseInt(m.id.substring(1))));
  while (existingIds.has(nextIdNum)) {
    nextIdNum++;
  }
  newMaterial.id = `M${nextIdNum.toString().padStart(3, '0')}`;

  newMaterial.history = [{ timestamp: new Date().toISOString(), action: 'created' }];
  materials.push(newMaterial);
  fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
  res.status(201).json(newMaterial);
});

// Update a specific material instance
router.put('/:id', (req, res) => {
  const materialId = req.params.id;
  const updatedMaterial = req.body;
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const index = materials.findIndex(m => m.id === materialId);

  if (index !== -1) {
    const oldMaterial = { ...materials[index] };
    const materialToValidate = { ...oldMaterial, ...updatedMaterial, id: materialId }; 

    const errors = validateMaterialInstance(materialToValidate);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    materials[index] = materialToValidate;
    
    // Add history entry
    if (!materials[index].history) {
      materials[index].history = [];
    }
    materials[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'updated', 
      changes: getChanges(oldMaterial, materials[index])
    });

    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.json(materials[index]);
  } else {
    res.status(404).send('Material not found');
  }
});

// Delete a specific material instance
router.delete('/:id', (req, res) => {
  const materialId = req.params.id;
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const initialLength = materials.length;
  materials = materials.filter(m => m.id !== materialId);

  if (materials.length < initialLength) {
    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Material not found');
  }
});

// Helper function to get changes for history
function getChanges(oldObj, newObj) {
  const changes = {};
  for (const key in newObj) {
    // Only track changes for relevant fields in the new model
    if (['name', 'details', 'isAvailable', 'currentLocation'].includes(key) && oldObj[key] !== newObj[key]) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }
  return changes;
}

// Action: Move a material instance to a new location
router.post('/:id/move', (req, res) => {
  const materialId = req.params.id;
  const { newLocation } = req.body;
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const index = materials.findIndex(m => m.id === materialId);

  if (index !== -1) {
    const oldMaterial = { ...materials[index] };
    if (!newLocation || newLocation.trim() === '') {
      return res.status(400).json({ errors: ['New location is required.'] });
    }
    materials[index].currentLocation = newLocation;

    if (!materials[index].history) {
      materials[index].history = [];
    }
    materials[index].history.push({
      timestamp: new Date().toISOString(),
      action: 'moved',
      changes: { currentLocation: { old: oldMaterial.currentLocation, new: newLocation } }
    });

    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.json(materials[index]);
  } else {
    res.status(404).send('Material not found');
  }
});

// Action: Reserve/Unreserve a material instance
router.post('/:id/reserve', (req, res) => {
  const materialId = req.params.id;
  const { reserve } = req.body; // boolean: true to reserve, false to unreserve
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const index = materials.findIndex(m => m.id === materialId);

  if (index !== -1) {
    const oldMaterial = { ...materials[index] };
    if (typeof reserve !== 'boolean') {
      return res.status(400).json({ errors: ["'reserve' must be a boolean."] });
    }

    materials[index].isAvailable = !reserve;

    if (!materials[index].history) {
      materials[index].history = [];
    }
    materials[index].history.push({
      timestamp: new Date().toISOString(),
      action: reserve ? 'reserved' : 'unreserved',
      changes: { isAvailable: { old: oldMaterial.isAvailable, new: !reserve } }
    });

    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.json(materials[index]);
  } else {
    res.status(404).send('Material not found');
  }
});

router.get('/:id/history', (req, res) => {
  const materialId = req.params.id;
  const materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));
  const material = materials.find(m => m.id === materialId);
  if (material && material.history) {
    res.json(material.history);
  } else if (material) {
    res.json([]); // Material found but no history
  } else {
    res.status(404).send('Material not found');
  }
});

// Action: Update material ID
router.put('/:oldId/id', (req, res) => {
  const oldId = req.params.oldId;
  const { newId } = req.body;
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));

  // 1. Validate newId
  if (!newId || newId.trim() === '') {
    return res.status(400).json({ errors: ['New ID is required.'] });
  }
  if (materials.some(m => m.id === newId)) {
    return res.status(400).json({ errors: ['New ID already exists.'] });
  }

  const materialIndex = materials.findIndex(m => m.id === oldId);

  if (materialIndex !== -1) {
    const oldMaterial = { ...materials[materialIndex] };
    materials[materialIndex].id = newId; // Update the ID

    // Add history entry for ID change
    if (!materials[materialIndex].history) {
      materials[materialIndex].history = [];
    }
    materials[materialIndex].history.push({
      timestamp: new Date().toISOString(),
      action: 'id_updated',
      changes: { id: { old: oldId, new: newId } }
    });

    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.json(materials[materialIndex]);
  } else {
    res.status(404).send('Material not found');
  }
});

module.exports = router;