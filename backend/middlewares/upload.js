const multer = require('multer');
const path = require('path');

// Save to frontend/src/assets
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/src/assets/products'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Support 'main' (1 image) and 'extra' (up to 5 images)
module.exports = upload.fields([
  { name: 'main', maxCount: 1 },
  { name: 'extra', maxCount: 5 },
]);
