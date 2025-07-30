const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data');

// Helper function for room validation
function validateRoom(room) {
  const errors = [];

  if (!room.name || room.name.trim() === '') {
    errors.push('Room name is required.');
  }
  if (typeof room.capacity !== 'number' || room.capacity < 0) {
    errors.push('Capacity must be a non-negative number.');
  }

  return errors;
}

router.get('/', (req, res) => {
  let rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));

  // Filtering
  const { search, capacity } = req.query;
  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    rooms = rooms.filter(r => 
      r.name.toLowerCase().includes(lowerCaseSearch)
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

router.get('/:id', (req, res) => {
  const rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));
  const room = rooms.find(r => r.id === req.params.id);
  if (room) {
    res.json(room);
  } else {
    res.status(404).send('Room not found');
  }
});

router.post('/', (req, res) => {
  const newRoom = req.body;
  let rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));

  const errors = validateRoom(newRoom);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Generate a unique ID
  let nextIdNum = 1;
  const existingIds = new Set(rooms.map(r => parseInt(r.id.substring(1))));
  while (existingIds.has(nextIdNum)) {
    nextIdNum++;
  }
  newRoom.id = `R${nextIdNum.toString().padStart(3, '0')}`;

  newRoom.history = [{ timestamp: new Date().toISOString(), action: 'created' }];
  rooms.push(newRoom);
  fs.writeFileSync(path.join(dataPath, 'rooms.json'), JSON.stringify(rooms, null, 2));
  res.status(201).json(newRoom);
});

router.put('/:id', (req, res) => {
  const roomId = req.params.id;
  const updatedRoom = req.body;
  let rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));
  const index = rooms.findIndex(r => r.id === roomId);

  if (index !== -1) {
    const oldRoom = { ...rooms[index] };
    const roomToValidate = { ...oldRoom, ...updatedRoom, id: roomId };

    const errors = validateRoom(roomToValidate);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    rooms[index] = roomToValidate;
    
    // Add history entry
    if (!rooms[index].history) {
      rooms[index].history = [];
    }
    rooms[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'updated', 
      changes: getChanges(oldRoom, rooms[index])
    });

    fs.writeFileSync(path.join(dataPath, 'rooms.json'), JSON.stringify(rooms, null, 2));
    res.json(rooms[index]);
  } else {
    res.status(404).send('Room not found');
  }
});

router.delete('/:id', (req, res) => {
  const roomId = req.params.id;
  let rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));
  const initialLength = rooms.length;
  rooms = rooms.filter(r => r.id !== roomId);

  if (rooms.length < initialLength) {
    fs.writeFileSync(path.join(dataPath, 'rooms.json'), JSON.stringify(rooms, null, 2));
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Room not found');
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

router.get('/:id/history', (req, res) => {
  const roomId = req.params.id;
  const rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));
  const room = rooms.find(r => r.id === roomId);
  if (room && room.history) {
    res.json(room.history);
  } else if (room) {
    res.json([]); // Room found but no history
  } else {
    res.status(404).send('Room not found');
  }
});

// Action: Update room ID
router.put('/:oldId/id', (req, res) => {
  const oldId = req.params.oldId;
  const { newId } = req.body;
  let rooms = JSON.parse(fs.readFileSync(path.join(dataPath, 'rooms.json')));
  let materials = JSON.parse(fs.readFileSync(path.join(dataPath, 'materials.json')));

  // 1. Validate newId
  if (!newId || newId.trim() === '') {
    return res.status(400).json({ errors: ['New ID is required.'] });
  }
  if (rooms.some(r => r.id === newId)) {
    return res.status(400).json({ errors: ['New ID already exists.'] });
  }

  const roomIndex = rooms.findIndex(r => r.id === oldId);

  if (roomIndex !== -1) {
    const oldRoom = { ...rooms[roomIndex] };
    rooms[roomIndex].id = newId; // Update the room ID

    // Update references in materials.json
    materials = materials.map(m => {
      if (m.currentLocation === oldId) {
        return { ...m, currentLocation: newId };
      }
      return m;
    });

    // Add history entry for ID change
    if (!rooms[roomIndex].history) {
      rooms[roomIndex].history = [];
    }
    rooms[roomIndex].history.push({
      timestamp: new Date().toISOString(),
      action: 'id_updated',
      changes: { id: { old: oldId, new: newId } }
    });

    fs.writeFileSync(path.join(dataPath, 'rooms.json'), JSON.stringify(rooms, null, 2));
    fs.writeFileSync(path.join(dataPath, 'materials.json'), JSON.stringify(materials, null, 2));
    res.json(rooms[roomIndex]);
  } else {
    res.status(404).send('Room not found');
  }
});

module.exports = router;
