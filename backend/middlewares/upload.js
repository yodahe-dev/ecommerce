const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Allowed image extensions
const allowedExt = ['.png', '.jpg', '.jpeg', '.gif']; // add/remove as needed

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/src/assets/products'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Generate random string for filename
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, randomName + ext);
  },
});

// File filter to accept only allowed image types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload.fields([
  { name: 'main', maxCount: 1 },
  { name: 'extra', maxCount: 5 },
]);
