const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { acquireLock } = require('../file-lock');
const path = require('path');

const roomsFilePath = path.join(__dirname, '../data/rooms.json');
const materialsFilePath = path.join(__dirname, '../data/materials.json');

// Middleware to load data
async function loadData(req, res, next) {
  const release = await acquireLock(roomsFilePath);
  try {
    const roomsData = await fs.readFile(roomsFilePath, 'utf8');
    req.rooms = JSON.parse(roomsData);
    const materialsData = await fs.readFile(materialsFilePath, 'utf8');
    req.materials = JSON.parse(materialsData);
    next();
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Error loading data.' });
  } finally {
    release();
  }
}

// Helper to write data
async function writeData(filePath, data) {
  const release = await acquireLock(filePath);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${path.basename(filePath)}:`, error);
    throw new Error(`Error saving ${path.basename(filePath)}.`);
  } finally {
    release();
  }
}

// Helper function for room validation
function validateRoom(room) {
  const errors = [];

  if (!room.name || typeof room.name !== 'string' || room.name.trim() === '') {
    errors.push('Room name is required and must be a string.');
  }
  if (typeof room.capacity !== 'number' || !Number.isInteger(room.capacity) || room.capacity < 0) {
    errors.push('Capacity must be a non-negative integer.');
  }
  if (room.description && typeof room.description !== 'string') {
    errors.push('Description must be a string.');
  }

  return errors;
}

router.get('/', loadData, (req, res) => {
  let rooms = [...req.rooms];
  const materials = [...req.materials];

  // Add material count to each room
  rooms.forEach(room => {
    room.materialCount = materials.filter(m => m.currentLocation === room.id).length;
  });

  // Bypass pagination if 'all' is requested
  if (req.query.all === 'true') {
    return res.json(rooms); // Return full list
  }

  // Filtering
  const { search, capacity } = req.query;
  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    rooms = rooms.filter(r => 
      r.name.toLowerCase().includes(lowerCaseSearch) ||
      r.id.toLowerCase().includes(lowerCaseSearch)
    );
  }
  if (capacity) {
    rooms = rooms.filter(r => r.capacity >= parseInt(capacity));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  results.total = rooms.length;
  results.page = page;
  results.limit = limit;
  results.totalPages = Math.ceil(rooms.length / limit);


  if (endIndex < rooms.length) {
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
  results.data = rooms.slice(startIndex, endIndex);

  res.json(results);
});

router.get('/:id', loadData, (req, res) => {
  let room = req.rooms.find(r => r.id === req.params.id);
  const materials = [...req.materials];

  room.materialCount = materials.filter(m => m.currentLocation === room.id).length;

  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

router.post('/', loadData, async (req, res) => {
  const newRoom = req.body;
  let rooms = [...req.rooms];

  if (newRoom.id && rooms.some(r => r.id === newRoom.id)) {
    return res.status(400).json({ errors: ['ID already exists.'] });
  }

  const errors = validateRoom(newRoom);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (!newRoom.id) {
    let nextIdNum = 1;
    const existingIds = new Set(rooms.map(r => parseInt(r.id.substring(1))));
    while (existingIds.has(nextIdNum)) {
        nextIdNum++;
    }
    newRoom.id = `R${nextIdNum.toString().padStart(3, '0')}`;
  }
  
  newRoom.history = [{ timestamp: new Date().toISOString(), action: 'created' }];
  rooms.push(newRoom);

  try {
    await writeData(roomsFilePath, rooms);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Backend: Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', loadData, async (req, res) => {
  const roomId = req.params.id;
  const updatedRoom = req.body;
  let rooms = [...req.rooms];
  const index = rooms.findIndex(r => r.id === roomId);

  if (index !== -1) {
    const oldRoom = { ...rooms[index] };
    const roomToValidate = { ...oldRoom, ...updatedRoom, id: roomId };

    const errors = validateRoom(roomToValidate);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    rooms[index] = roomToValidate;
    
    if (!rooms[index].history) {
      rooms[index].history = [];
    }
    rooms[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'updated', 
      changes: getChanges(oldRoom, rooms[index])
    });

    try {
      await writeData(roomsFilePath, rooms);
      res.json(rooms[index]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

router.delete('/:id', loadData, async (req, res) => {
  const roomId = req.params.id;
  const materialsInRoom = req.materials.filter(m => m.currentLocation === roomId);

  if (materialsInRoom.length > 0) {
    return res.status(400).json({ error: 'Cannot delete a room that contains materials. Please move the materials first.' });
  }

  let rooms = req.rooms.filter(r => r.id !== roomId);

  if (rooms.length < req.rooms.length) {
    try {
      await writeData(roomsFilePath, rooms);
      res.status(204).json({ message: 'Room deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Helper function to get changes for history
function getChanges(oldObj, newObj) {
  const changes = {};
  for (const key in newObj) {
    if (['name', 'capacity'].includes(key) && oldObj[key] !== newObj[key]) {
      changes[key] = { old: oldObj[key], new: newObj[key] };
    }
  }
  return changes;
}

router.get('/:id/history', loadData, (req, res) => {
  const room = req.rooms.find(r => r.id === req.params.id);
  if (room && room.history) {
    res.json(room.history);
  } else if (room) {
    res.json([]);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

// Action: Update room ID
router.put('/:oldId/id', loadData, async (req, res) => {
  const oldId = req.params.oldId;
  const { newId } = req.body;
  let rooms = [...req.rooms];
  let materials = [...req.materials];

  if (!newId || newId.trim() === '') {
    return res.status(400).json({ errors: ['New ID is required.'] });
  }
  if (rooms.some(r => r.id === newId)) {
    return res.status(400).json({ errors: ['New ID already exists.'] });
  }

  const roomIndex = rooms.findIndex(r => r.id === oldId);

  if (roomIndex !== -1) {
    const oldRoom = { ...rooms[roomIndex] };
    rooms[roomIndex].id = newId;

    materials = materials.map(m => {
      if (m.currentLocation === oldId) {
        return { ...m, currentLocation: newId };
      }
      return m;
    });

    if (!rooms[roomIndex].history) {
      rooms[roomIndex].history = [];
    }
    rooms[roomIndex].history.push({
      timestamp: new Date().toISOString(),
      action: 'id_updated',
      changes: { id: { old: oldId, new: newId } }
    });

    try {
      await writeData(roomsFilePath, rooms);
      await writeData(materialsFilePath, materials);
      res.json(rooms[roomIndex]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

module.exports = router;