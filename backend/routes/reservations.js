const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const { acquireLock } = require('../file-lock');
const path = require('path');

const reservationsFilePath = path.join(__dirname, '../data/reservations.json');
const materialsFilePath = path.join(__dirname, '../data/materials.json');

// Middleware to load data
async function loadData(req, res, next) {
  const releaseReservations = await acquireLock(reservationsFilePath);
  const releaseMaterials = await acquireLock(materialsFilePath);
  try {
    const reservationsData = await fs.readFile(reservationsFilePath, 'utf8');
    let reservations = JSON.parse(reservationsData);
    const materialsData = await fs.readFile(materialsFilePath, 'utf8');
    let materials = JSON.parse(materialsData);

    // Check for expired reservations
    const now = new Date();
    let reservationsModified = false;
    reservations.forEach(res => {
      if (res.endDate && new Date(res.endDate) < now) {
        res.materials.forEach(mat => {
          const material = materials.find(m => m.id === mat.id);
          if (material) {
            material.isAvailable = true;
            if (!material.history) material.history = [];
            material.history.push({ timestamp: new Date().toISOString(), action: 'unreserved', description: `Reservation expired: ${res.description}` });
          }
        });
        reservationsModified = true;
      }
    });

    if (reservationsModified) {
      reservations = reservations.filter(res => !res.endDate || new Date(res.endDate) >= now);
      await writeData(reservationsFilePath, reservations);
      await writeData(materialsFilePath, materials);
    }

    req.reservations = reservations;
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

// Helper to write data
async function writeData(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${path.basename(filePath)}:`, error);
    throw new Error(`Error saving ${path.basename(filePath)}.`);
  }
}

// Get all reservations
router.get('/', loadData, (req, res) => {
  let reservations = [...req.reservations];
  const { search } = req.query;

  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    reservations = reservations.filter(r => 
      r.description.toLowerCase().includes(lowerCaseSearch)
    );
  }

  res.json(reservations);
});

// Create a new reservation
router.post('/', loadData, async (req, res) => {
  const { description, endDate, materials: requestedMaterials } = req.body;
  let reservations = [...req.reservations];
  let materials = [...req.materials];

  if (!description || description.trim() === '') {
    return res.status(400).json({ errors: ['Reservation description is required.'] });
  }

  const newReservation = {
    id: `RES${Date.now()}`,
    description,
    endDate,
    materials: [],
    timestamp: new Date().toISOString()
  };

  for (const requested of requestedMaterials) {
    const available = materials.filter(m => m.type === requested.type && m.isAvailable);
    if (available.length < requested.quantity) {
      return res.status(400).json({ errors: [`Not enough available materials for type ${requested.type}.`] });
    }

    const reservedInstances = available.slice(0, requested.quantity);
    for (const instance of reservedInstances) {
      instance.isAvailable = false;
      newReservation.materials.push({ id: instance.id, type: instance.type });
      // Add history entry for reservation
      if (!instance.history) instance.history = [];
      instance.history.push({ timestamp: new Date().toISOString(), action: 'reserved', description: description });
    }
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

module.exports = router;