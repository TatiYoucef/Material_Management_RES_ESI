const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { acquireLock } = require('../file-lock');
const path = require('path');

const materialsFilePath = path.join(__dirname, '../data/materials.json');

// Middleware to load materials data
async function loadMaterials(req, res, next) {
  const release = await acquireLock(materialsFilePath);
  try {
    const data = await fs.readFile(materialsFilePath, 'utf8');
    req.materials = JSON.parse(data);
    next();
  } catch (error) {
    console.error('Error reading materials file:', error);
    res.status(500).json({ error: 'Error loading material data.' });
  } finally {
    release();
  }
}

// Helper to write materials data
async function writeMaterials(data) {
  const release = await acquireLock(materialsFilePath);
  try {
    await fs.writeFile(materialsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing materials file:', error);
    throw new Error('Error saving material data.');
  } finally {
    release();
  }
}

// Helper to write rooms data
async function writeRooms(data) {
  const roomsFilePath = path.join(__dirname, '../data/rooms.json');
  const release = await acquireLock(roomsFilePath);
  try {
    await fs.writeFile(roomsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing rooms file:', error);
    throw new Error('Error saving room data.');
  } finally {
    release();
  }
}

// Helper function for material instance validation
function validateMaterialInstance(material) {
  const errors = [];

  if (!material.type || typeof material.type !== 'string' || material.type.trim() === '') {
    errors.push('Material type is required and must be a string.');
  }
  if (!material.name || typeof material.name !== 'string' || material.name.trim() === '') {
    errors.push('Material name is required and must be a string.');
  }
  if (typeof material.isAvailable !== 'boolean') {
    errors.push('isAvailable must be a boolean.');
  }
  if (!material.currentLocation || typeof material.currentLocation !== 'string' || material.currentLocation.trim() === '') {
    errors.push('Current location is required and must be a string.');
  }
  if (material.details && typeof material.details !== 'string') {
    errors.push('Details must be a string.');
  }

  return errors;
}

// Get all specific material instances
router.get('/', loadMaterials, (req, res) => {
  let materials = [...req.materials];

  // Filtering for specific instances
  const { search, isAvailable, type, location } = req.query;
  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    materials = materials.filter(m => 
      (m.id && m.id.toLowerCase().includes(lowerCaseSearch)) || 
      (m.name && m.name.toLowerCase().includes(lowerCaseSearch)) || 
      (m.details && m.details.toLowerCase().includes(lowerCaseSearch)) ||
      (m.type && m.type.toLowerCase().includes(lowerCaseSearch))
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
router.get('/types', loadMaterials, (req, res) => {
  const materialTypes = {};
  const { search } = req.query;

  req.materials.forEach(m => {
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

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResults = {};
  paginatedResults.total = result.length;
  paginatedResults.page = page;
  paginatedResults.limit = limit;
  paginatedResults.totalPages = Math.ceil(result.length / limit);

  if (endIndex < result.length) {
    paginatedResults.next = {
      page: page + 1,
      limit: limit
    };
  }
  if (startIndex > 0) {
    paginatedResults.previous = {
      page: page - 1,
      limit: limit
    };
  }
  paginatedResults.data = result.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

// Get a specific material instance by ID
router.get('/:id', loadMaterials, async (req, res) => {
  const material = req.materials.find(m => m.id === req.params.id);
  if (material) {
    // Load reservations to find if this material is part of an active reservation
    const reservationsData = await fs.readFile(path.join(__dirname, '../data/reservations.json'), 'utf8');
    const reservations = JSON.parse(reservationsData);
    const activeReservation = reservations.find(res => 
      res.materials.some(mat => mat.id === material.id) && (!res.endDate || new Date(res.endDate) >= new Date())
    );

    if (activeReservation) {
      material.reservationDetails = {
        description: activeReservation.description,
        endDate: activeReservation.endDate
      };
    }
    res.json(material);
  } else {
    res.status(404).json({ error: 'Material not found' });
  }
});

// Create a new specific material instance
router.post('/', loadMaterials, async (req, res) => {
  const { quantity = 1, ...materialData } = req.body;
  console.log('Backend: Received new material data:', req.body);
  let materials = [...req.materials];
  const createdMaterials = [];

  for (let i = 0; i < quantity; i++) {
    const newMaterial = { ...materialData };

    // Automatically set availability
    newMaterial.isAvailable = true;

    // Generate a unique ID
    let nextIdNum = 1;
    const existingIds = new Set(materials.map(m => parseInt(m.id.substring(1))));
    while (existingIds.has(nextIdNum)) {
      nextIdNum++;
    }
    newMaterial.id = `M${nextIdNum.toString().padStart(3, '0')}`;
    console.log('Backend: Generated new ID:', newMaterial.id);

    newMaterial.history = [{ timestamp: new Date().toISOString(), action: 'created' }];
    materials.push(newMaterial);
    createdMaterials.push(newMaterial);
  }

  console.log('Backend: Materials array before write:', materials.length);
  try {
    await writeMaterials(materials);
    console.log('Backend: Material(s) created successfully:', createdMaterials);
    res.status(201).json(createdMaterials);
  } catch (error) {
    console.error('Backend: Error creating material:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a specific material instance
router.put('/:id', loadMaterials, async (req, res) => {
  const materialId = req.params.id;
  const updatedMaterial = req.body;
  let materials = [...req.materials];
  const index = materials.findIndex(m => m.id === materialId);

  if (index !== -1) {
    const oldMaterial = { ...materials[index] };
    const materialToValidate = { ...oldMaterial, ...updatedMaterial, id: materialId }; 

    const errors = validateMaterialInstance(materialToValidate);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    materials[index] = materialToValidate;
    
    if (!materials[index].history) {
      materials[index].history = [];
    }
    materials[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'updated', 
      changes: getChanges(oldMaterial, materials[index])
    });

    try {
      await writeMaterials(materials);
      res.json(materials[index]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Material not found' });
  }
});

// Delete a specific material instance
router.delete('/:id', loadMaterials, async (req, res) => {
  const materialId = req.params.id;
  console.log('Backend: Received delete request for material ID:', materialId);
  let materials = req.materials.filter(m => m.id !== materialId);

  if (materials.length < req.materials.length) {
    console.log('Backend: Material found and filtered. New materials count:', materials.length);
    try {
      await writeMaterials(materials);
      console.log('Backend: Material deleted successfully.');
      res.status(204).json({ message: 'Material deleted successfully.' });
    } catch (error) {
      console.error('Backend: Error writing materials after delete:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    console.log('Backend: Material not found for ID:', materialId);
    res.status(404).json({ error: 'Material not found' });
  }
});

// Helper function to get changes for history
function getChanges(oldObj, newObj) {
  const changes = {};
  for (const key in newObj) {
    if (['name', 'details', 'isAvailable', 'currentLocation'].includes(key) && oldObj[key] !== newObj[key]) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }
  return changes;
}

// Action: Move a material instance to a new location
router.post('/:id/move', loadMaterials, async (req, res) => {
  const materialId = req.params.id;
  const { newLocation } = req.body;
  let materials = [...req.materials];
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

    try {
      await writeMaterials(materials);

      // Update room histories
      const roomsFilePath = path.join(__dirname, '../data/rooms.json');
      const releaseRooms = await acquireLock(roomsFilePath);
      try {
        const roomsData = await fs.readFile(roomsFilePath, 'utf8');
        let rooms = JSON.parse(roomsData);

        const fromRoomObj = rooms.find(r => r.id === oldMaterial.currentLocation);
        const toRoomObj = rooms.find(r => r.id === newLocation);

        if (fromRoomObj) {
          if (!fromRoomObj.history) fromRoomObj.history = [];
          fromRoomObj.history.push({
            timestamp: new Date().toISOString(),
            action: 'materials_moved_out',
            description: `1 ${oldMaterial.type} (${oldMaterial.name}) moved out to ${newLocation}.`
          });
        }

        if (toRoomObj) {
          if (!toRoomObj.history) toRoomObj.history = [];
          toRoomObj.history.push({
            timestamp: new Date().toISOString(),
            action: 'materials_moved_in',
            description: `1 ${oldMaterial.type} (${oldMaterial.name}) moved in from ${oldMaterial.currentLocation}.`
          });
        }
        await writeRooms(rooms);
      } catch (error) {
        console.error('Error updating room histories for single move:', error);
      } finally {
        releaseRooms();
      }

      res.json(materials[index]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Material not found' });
  }
});



router.get('/:id/history', loadMaterials, (req, res) => {
  const materialId = req.params.id;
  const material = req.materials.find(m => m.id === materialId);
  if (material && material.history) {
    res.json(material.history);
  } else if (material) {
    res.json([]);
  } else {
    res.status(404).json({ error: 'Material not found' });
  }
});

// Action: Update material ID
router.put('/:oldId/id', loadMaterials, async (req, res) => {
  const oldId = req.params.oldId;
  const { newId } = req.body;
  let materials = [...req.materials];

  if (!newId || newId.trim() === '') {
    return res.status(400).json({ errors: ['New ID is required.'] });
  }
  if (materials.some(m => m.id === newId)) {
    return res.status(400).json({ errors: ['New ID already exists.'] });
  }

  const materialIndex = materials.findIndex(m => m.id === oldId);

  if (materialIndex !== -1) {
    const oldMaterial = { ...materials[materialIndex] };
    materials[materialIndex].id = newId;

    if (!materials[materialIndex].history) {
      materials[materialIndex].history = [];
    }
    materials[materialIndex].history.push({
      timestamp: new Date().toISOString(),
      action: 'id_updated',
      changes: { id: { old: oldId, new: newId } }
    });

    try {
      await writeMaterials(materials);
      res.json(materials[materialIndex]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Material not found' });
  }
});

module.exports = router;

// Action: Move a quantity of a material type from one room to another
router.post('/move-quantity', loadMaterials, async (req, res) => {
  const { materialType, quantity, fromRoom, toRoom } = req.body;
  let materials = [...req.materials];

  if (!materialType || !quantity || !fromRoom || !toRoom) {
    return res.status(400).json({ errors: ['Missing required fields.'] });
  }

  const available = materials.filter(m => m.type === materialType && m.currentLocation === fromRoom && m.isAvailable);
  if (available.length < quantity) {
    return res.status(400).json({ errors: [`Not enough available materials of type ${materialType} in room ${fromRoom}.`] });
  }

  const movedInstances = available.slice(0, quantity);
  for (const instance of movedInstances) {
    const index = materials.findIndex(m => m.id === instance.id);
    const oldLocation = materials[index].currentLocation;
    materials[index].currentLocation = toRoom;

    // Add history entry for each moved instance
    if (!materials[index].history) materials[index].history = [];
    materials[index].history.push({
      timestamp: new Date().toISOString(),
      action: 'moved_bulk',
      changes: { from: oldLocation, to: toRoom, type: materialType, quantity: 1 },
      description: `Moved from ${oldLocation} to ${toRoom} as part of a bulk move of ${quantity} ${materialType}(s).`
    });
  }

  // Update room histories
  const roomsFilePath = path.join(__dirname, '../data/rooms.json');
  const releaseRooms = await acquireLock(roomsFilePath);
  try {
    const roomsData = await fs.readFile(roomsFilePath, 'utf8');
    let rooms = JSON.parse(roomsData);

    const fromRoomObj = rooms.find(r => r.id === fromRoom);
    const toRoomObj = rooms.find(r => r.id === toRoom);

    if (fromRoomObj) {
      if (!fromRoomObj.history) fromRoomObj.history = [];
      fromRoomObj.history.push({
        timestamp: new Date().toISOString(),
        action: 'materials_moved_out',
        description: `${quantity} ${materialType}(s) moved out to ${toRoom}.`
      });
    }

    if (toRoomObj) {
      if (!toRoomObj.history) toRoomObj.history = [];
      toRoomObj.history.push({
        timestamp: new Date().toISOString(),
        action: 'materials_moved_in',
        description: `${quantity} ${materialType}(s) moved in from ${fromRoom}.`
      });
    }
    await writeRooms(rooms);
  } catch (error) {
    console.error('Error updating room histories:', error);
  } finally {
    releaseRooms();
  }

  try {
    await writeMaterials(materials);
    res.json({ message: `Successfully moved ${quantity} instances of ${materialType} from ${fromRoom} to ${toRoom}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});