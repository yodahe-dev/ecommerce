const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  createTeamBox,
  updateTeamBox,
  deleteTeamBox,
  listTeamBoxes,
} = require('../controllers/teamBoxController');

// Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './upload/TeamProfile';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /team-boxes with image and form fields
router.post('/team-boxes', upload.single('avatar'), (req, res, next) => {
  if (req.file) {
    req.body.avatar = `/upload/TeamProfile/${req.file.filename}`;
  }
  next();
}, createTeamBox);

// Other routes
router.post('/team-boxes/update', upload.single('avatar'), updateTeamBox);
router.post('/team-boxes/delete', deleteTeamBox);
router.get('/team-boxes', listTeamBoxes);

module.exports = router;
