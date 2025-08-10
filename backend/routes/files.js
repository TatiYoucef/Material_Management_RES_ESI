const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { acquireLock } = require('../file-lock');

const filesFilePath = path.join(__dirname, '../data/files.json');
const uploadsDir = path.join(__dirname, '../uploads');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to write data
async function writeData(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to ${path.basename(filePath)}:`, error);
    throw new Error(`Error saving ${path.basename(filePath)}.`);
  }
}

// Middleware to load files data
async function loadFiles(req, res, next) {
  const release = await acquireLock(filesFilePath);
  try {
    const data = await fs.readFile(filesFilePath, 'utf8');
    req.filesData = JSON.parse(data);
    next();
  } catch (error) {
    console.error('Error reading files data file:', error);
    res.status(500).json({ error: 'Error loading files data.' });
  } finally {
    release();
  }
}

// Get all files metadata
router.get('/', loadFiles, (req, res) => {
  let files = [...req.filesData];
  const { search, type, supplier, fromDate, toDate, factureFromDate, factureToDate } = req.query;

  if (search) {
    const lowerCaseSearch = search.toLowerCase();
    files = files.filter(f => 
      (f.id && f.id.toLowerCase().includes(lowerCaseSearch)) || 
      (f.title && f.title.toLowerCase().includes(lowerCaseSearch))
    );
  }

  if (type) {
    files = files.filter(f => f.type === type);
  }

  if (supplier) {
    const lowerCaseSupplier = supplier.toLowerCase();
    files = files.filter(f => f.supplier && f.supplier.toLowerCase().includes(lowerCaseSupplier));
  }

  if (type === 'Facture') {
    if (factureFromDate) {
      files = files.filter(f => f.type === 'Facture' && f.factureDate && new Date(f.factureDate) >= new Date(factureFromDate));
    }
    if (factureToDate) {
      files = files.filter(f => f.type === 'Facture' && f.factureDate && new Date(f.factureDate) <= new Date(factureToDate));
    }
  } else {
    if (fromDate) {
      files = files.filter(f => new Date(f.createdAt) >= new Date(fromDate));
    }
    if (toDate) {
      files = files.filter(f => new Date(f.createdAt) <= new Date(toDate));
    }
  }

  res.json(files);
});

// Get a single file metadata by ID
router.get('/:id', loadFiles, (req, res) => {
  const file = req.filesData.find(f => f.id === req.params.id);
  if (file) {
    res.json(file);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Download a file
router.get('/download/:id', loadFiles, (req, res) => {
  const file = req.filesData.find(f => f.id === req.params.id);
  if (file) {
    const filePath = path.join(uploadsDir, file.filename);
    res.download(filePath, file.title, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Error downloading file.' });
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Upload a new file
router.post('/upload', upload.single('file'), loadFiles, async (req, res) => {
  const { title, description, type, supplier, factureDate } = req.body;
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  if (!title || title.trim() === '') {
    // If title is missing, delete the uploaded file
    await fs.unlink(uploadedFile.path);
    return res.status(400).json({ error: 'File title is required.' });
  }

  const newFile = {
    id: `FILE${Date.now()}`,
    title: title,
    description: description || '',
    filename: uploadedFile.filename, // Stored filename on server
    originalname: uploadedFile.originalname, // Original filename
    mimetype: uploadedFile.mimetype,
    size: uploadedFile.size,
    createdAt: new Date().toISOString(),
    history: [{ timestamp: new Date().toISOString(), action: 'uploaded' }],
    type: type || 'Facture',
    supplier: supplier || null,
    factureDate: (type === 'Facture' && factureDate) ? factureDate : null
  };

  req.filesData.push(newFile);

  try {
    await writeData(filesFilePath, req.filesData);
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error saving file metadata:', error);
    // If metadata saving fails, attempt to delete the uploaded file to prevent orphans
    await fs.unlink(uploadedFile.path).catch(err => console.error('Error deleting orphaned file:', err));
    res.status(500).json({ error: error.message });
  }
});

// Delete a file and its metadata
router.delete('/:id', loadFiles, async (req, res) => {
  const fileId = req.params.id;
  const fileIndex = req.filesData.findIndex(f => f.id === fileId);

  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const fileToDelete = req.filesData[fileIndex];
  req.filesData.splice(fileIndex, 1); // Remove from metadata

  try {
    // Delete the actual file from disk
    await fs.unlink(path.join(uploadsDir, fileToDelete.filename));
    await writeData(filesFilePath, req.filesData);
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting file or metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
