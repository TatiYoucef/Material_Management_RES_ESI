const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { acquireLock } = require('../file-lock');
const path = require('path');

const reservationsFilePath = path.join(__dirname, '../data/reservations.json');
const materialsFilePath = path.join(__dirname, '../data/materials.json');

// Helper to write data
async function writeData(filePath, data) {
  // Note: A robust implementation would use a temporary file and rename for atomicity
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${path.basename(filePath)}:`, error);
    throw new Error(`Error saving ${path.basename(filePath)}.`);
  }
}

// Middleware to load data and handle expired reservations
async function loadAndCleanData(req, res, next) {
  const releaseReservations = await acquireLock(reservationsFilePath);
  const releaseMaterials = await acquireLock(materialsFilePath);
  try {
    const reservationsData = await fs.readFile(reservationsFilePath, 'utf8');
    let reservations = JSON.parse(reservationsData);
    const materialsData = await fs.readFile(materialsFilePath, 'utf8');
    let materials = JSON.parse(materialsData);

    const now = new Date();
    let reservationsModified = false;
    const activeReservations = [];

    for (const res of reservations) {
      if (res.endDate && new Date(res.endDate) < now && res.status === 'active') {
        res.status = 'ended'; // Mark as ended
        reservationsModified = true;
        for (const mat of res.materials) {
          const material = materials.find(m => m.id === mat.id);
          if (material) {
            material.isAvailable = true;
            if (!material.history) material.history = [];
            material.history.push({ 
              timestamp: new Date().toISOString(), 
              action: 'unreserved', 
              description: `Reservation automatically ended: ${res.description}` 
            });
          }
        }
      } else {
        activeReservations.push(res);
      }
    }

    if (reservationsModified) {
      await writeData(reservationsFilePath, reservations); // Write all reservations back with updated statuses
      await writeData(materialsFilePath, materials);
    }

    req.reservations = reservations; // Pass all reservations to the next middleware
    req.materials = materials;
    next();
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Error loading data.' });
  } finally {
    releaseReservations();
    releaseMaterials();
  }
}

// Get all reservations
router.get('/', loadAndCleanData, (req, res) => {
  let reservations = [...req.reservations];
  const { search, status, startDate, endDate } = req.query;

  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    reservations = reservations.filter(r => 
      r.description.toLowerCase().includes(lowerCaseSearch) ||
      r.id.toLowerCase().includes(lowerCaseSearch)
    );
  }

  if (status && status !== 'all') {
    reservations = reservations.filter(r => r.status === status);
  }

  if (startDate) {
    const filterStartDate = new Date(startDate);
    reservations = reservations.filter(r => new Date(r.startDate) >= filterStartDate);
  }

  if (endDate) {
    const filterEndDate = new Date(endDate);
    reservations = reservations.filter(r => new Date(r.endDate || r.startDate) <= filterEndDate);
  }

  res.json(reservations.reverse());
});

// Get a single reservation by ID
router.get('/:id', loadAndCleanData, (req, res) => {
  const reservation = req.reservations.find(r => r.id === req.params.id);
  if (reservation) {
    res.json(reservation);
  } else {
    res.status(404).json({ error: 'Reservation not found' });
  }
});

// Create a new reservation
router.post('/', loadAndCleanData, async (req, res) => {
  const { description, startDate, endDate, materials: requestedItems } = req.body;
  let { reservations, materials } = req;

  if (!description || description.trim() === '') {
    return res.status(400).json({ errors: ['Reservation description is required.'] });
  }
  if (!requestedItems || requestedItems.length === 0) {
    return res.status(400).json({ errors: ['At least one material must be requested.'] });
  }

  const newReservation = {
    id: `RES${Date.now()}`,
    description,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || null,
    materials: [],
    status: 'active', // active, ended, cancelled
    timestamp: new Date().toISOString()
  };

  const materialsToUpdate = [];

  // Logic to handle different ways of adding materials
  for (const item of requestedItems) {
    if (item.ids && Array.isArray(item.ids)) { // By specific IDs
      for (const id of item.ids) {
        const material = materials.find(m => m.id === id);
        if (!material) return res.status(400).json({ errors: [`Material with ID ${id} not found.`] });
        if (!material.isAvailable) return res.status(400).json({ errors: [`Material ${material.name} (${id}) is not available.`] });
        materialsToUpdate.push(material);
        newReservation.materials.push({ id: material.id, type: material.type, name: material.name });
      }
    } else if (item.type && item.quantity && item.fromRoom) { // By type and location
      const available = materials.filter(m => m.type === item.type && m.currentLocation === item.fromRoom && m.isAvailable);
      if (available.length < item.quantity) {
        return res.status(400).json({ errors: [`Not enough available materials of type ${item.type} in room ${item.fromRoom}.`] });
      }
      const instancesToReserve = available.slice(0, item.quantity);
      materialsToUpdate.push(...instancesToReserve);
      instancesToReserve.forEach(inst => newReservation.materials.push({ id: inst.id, type: inst.type, name: inst.name }));
    } else {
      return res.status(400).json({ errors: ['Invalid material request format.'] });
    }
  }

  // Update material statuses and history
  for (const material of materialsToUpdate) {
    const index = materials.findIndex(m => m.id === material.id);
    materials[index].isAvailable = false;
    if (!materials[index].history) materials[index].history = [];
    materials[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'reserved', 
      description: `Reserved for: ${newReservation.id} - ${description}` 
    });
  }

  reservations.push(newReservation);

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a reservation
router.delete('/:id', loadAndCleanData, async (req, res) => {
  let { reservations, materials } = req;
  const reservationId = req.params.id;
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];
  if (reservation.status !== 'active') {
    return res.status(400).json({ error: `Cannot cancel a reservation that is already ${reservation.status}.` });
  }

  // Release materials
  for (const mat of reservation.materials) {
    const material = materials.find(m => m.id === mat.id);
    if (material) {
      material.isAvailable = true;
      if (!material.history) material.history = [];
      material.history.push({ 
        timestamp: new Date().toISOString(), 
        action: 'unreserved', 
        description: `Reservation cancelled: ${reservation.id}` 
      });
    }
  }

  // Update reservation status instead of deleting
  reservations[reservationIndex].status = 'cancelled';
  reservations[reservationIndex].cancelledAt = new Date().toISOString();

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(200).json(reservations[reservationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End a reservation manually
router.patch('/:id/end', loadAndCleanData, async (req, res) => {
  let { reservations, materials } = req;
  const reservationId = req.params.id;
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];
  if (reservation.status !== 'active') {
    return res.status(400).json({ error: `Cannot end a reservation that is already ${reservation.status}.` });
  }

  // Release materials
  for (const mat of reservation.materials) {
    const material = materials.find(m => m.id === mat.id);
    if (material) {
      material.isAvailable = true;
      if (!material.history) material.history = [];
      material.history.push({ 
        timestamp: new Date().toISOString(), 
        action: 'unreserved', 
        description: `Reservation ended: ${reservation.id}` 
      });
    }
  }

  reservations[reservationIndex].status = 'ended';
  reservations[reservationIndex].endDate = new Date().toISOString();

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(200).json(reservations[reservationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add materials to an existing reservation
router.post('/:id/materials', loadAndCleanData, async (req, res) => {
  const { materials: requestedItems } = req.body;
  let { reservations, materials } = req;
  const reservationId = req.params.id;
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  if (reservations[reservationIndex].status !== 'active') {
    return res.status(400).json({ error: 'Can only add materials to an active reservation.' });
  }
  if (!requestedItems || requestedItems.length === 0) {
    return res.status(400).json({ errors: ['No materials provided to add.'] });
  }

  const materialsToUpdate = [];
  const newMaterialEntries = [];

  // Same logic as creation
  for (const item of requestedItems) {
    if (item.ids && Array.isArray(item.ids)) {
      for (const id of item.ids) {
        if (reservations[reservationIndex].materials.some(m => m.id === id)) continue; // Skip if already in reservation
        const material = materials.find(m => m.id === id);
        if (!material) return res.status(400).json({ errors: [`Material with ID ${id} not found.`] });
        if (!material.isAvailable) return res.status(400).json({ errors: [`Material ${material.name} (${id}) is not available.`] });
        materialsToUpdate.push(material);
        newMaterialEntries.push({ id: material.id, type: material.type, name: material.name });
      }
    } else if (item.type && item.quantity && item.fromRoom) {
      const available = materials.filter(m => m.type === item.type && m.currentLocation === item.fromRoom && m.isAvailable);
      if (available.length < item.quantity) {
        return res.status(400).json({ errors: [`Not enough available materials of type ${item.type} in room ${item.fromRoom}.`] });
      }
      const instancesToReserve = available.slice(0, item.quantity);
      materialsToUpdate.push(...instancesToReserve);
      instancesToReserve.forEach(inst => newMaterialEntries.push({ id: inst.id, type: inst.type, name: inst.name }));
    } else {
      return res.status(400).json({ errors: ['Invalid material request format.'] });
    }
  }

  // Update material statuses and history
  for (const material of materialsToUpdate) {
    const index = materials.findIndex(m => m.id === material.id);
    materials[index].isAvailable = false;
    if (!materials[index].history) materials[index].history = [];
    materials[index].history.push({ 
      timestamp: new Date().toISOString(), 
      action: 'reserved', 
      description: `Added to reservation: ${reservations[reservationIndex].id}` 
    });
  }

  reservations[reservationIndex].materials.push(...newMaterialEntries);
  if (!reservations[reservationIndex].history) reservations[reservationIndex].history = [];
  reservations[reservationIndex].history.push({
    timestamp: new Date().toISOString(),
    action: 'add_materials',
    materials: newMaterialEntries
  });

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(200).json(reservations[reservationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a material from an existing reservation
router.patch('/:id/remove-material/:materialId', loadAndCleanData, async (req, res) => {
  let { reservations, materials } = req;
  const reservationId = req.params.id;
  const materialIdToRemove = req.params.materialId;

  const reservationIndex = reservations.findIndex(r => r.id === reservationId);
  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];
  if (reservation.status !== 'active') {
    return res.status(400).json({ error: 'Cannot remove materials from an inactive reservation.' });
  }

  const materialIndexInReservation = reservation.materials.findIndex(m => m.id === materialIdToRemove);
  if (materialIndexInReservation === -1) {
    return res.status(404).json({ error: 'Material not found in this reservation.' });
  }

  // Remove material from reservation's materials array
  const materialToRemove = reservation.materials.splice(materialIndexInReservation, 1);

  if (!reservations[reservationIndex].history) reservations[reservationIndex].history = [];
  reservations[reservationIndex].history.push({
    timestamp: new Date().toISOString(),
    action: 'remove_material',
    material: materialToRemove[0]
  });

  // Find the material in the global materials list and make it available
  const materialInGlobalList = materials.find(m => m.id === materialIdToRemove);
  if (materialInGlobalList) {
    materialInGlobalList.isAvailable = true;
    if (!materialInGlobalList.history) materialInGlobalList.history = [];
    materialInGlobalList.history.push({
      timestamp: new Date().toISOString(),
      action: 'unreserved',
      description: `Removed from reservation: ${reservation.id}`
    });
  }

  // If no more materials in reservation, mark it as cancelled
  if (reservation.materials.length === 0) {
    reservations[reservationIndex].status = 'cancelled';
    reservations[reservationIndex].cancelledAt = new Date().toISOString();
    if (!reservations[reservationIndex].history) reservations[reservationIndex].history = [];
    reservations[reservationIndex].history.push({
      timestamp: new Date().toISOString(),
      action: 'cancelled',
      description: 'Reservation cancelled automatically after last material was removed.'
    });
  }

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a reservation
router.delete('/:id/delete', loadAndCleanData, async (req, res) => {
  let { reservations, materials } = req;
  const reservationId = req.params.id;
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];

  // Release materials if the reservation is active
  if (reservation.status === 'active') {
    for (const mat of reservation.materials) {
      const material = materials.find(m => m.id === mat.id);
      if (material) {
        material.isAvailable = true;
        if (!material.history) material.history = [];
        material.history.push({ 
          timestamp: new Date().toISOString(), 
          action: 'unreserved', 
          description: `Reservation deleted: ${reservation.id}` 
        });
      }
    }
  }

  // Remove the reservation from the array
  reservations.splice(reservationIndex, 1);

  try {
    await writeData(reservationsFilePath, reservations);
    await writeData(materialsFilePath, materials);
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reservation end date
router.put('/:id/update-end-date', loadAndCleanData, async (req, res) => {
  let { reservations } = req;
  const { newEndDate } = req.body;
  const reservationId = req.params.id;
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);

  if (reservationIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];
  if (reservation.status !== 'active') {
    return res.status(400).json({ error: `Cannot modify an already ${reservation.status} reservation.` });
  }

  const newDate = new Date(newEndDate);
  const startDate = new Date(reservation.startDate);
  const now = new Date();

  if (newDate < startDate) {
    return res.status(400).json({ error: 'End date cannot be before the start date.' });
  }

  if (newDate < now) {
    return res.status(400).json({ error: 'End date cannot be in the past.' });
  }

  const oldEndDate = reservation.endDate;
  reservations[reservationIndex].endDate = newDate.toISOString();

  if (!reservations[reservationIndex].history) {
    reservations[reservationIndex].history = [];
  }
  reservations[reservationIndex].history.push({
    timestamp: new Date().toISOString(),
    action: 'end_date_updated',
    oldEndDate: oldEndDate,
    newEndDate: newDate.toISOString(),
  });

  try {
    await writeData(reservationsFilePath, reservations);
    res.status(200).json(reservations[reservationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
