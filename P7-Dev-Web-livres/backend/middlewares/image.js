const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Path to save images
const directory = path.join(__dirname, "../images");

// Set accepting extension file
const AUTH_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

// Check if path exist or create it
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

// Configure multer type storage
const storage = multer.memoryStorage();

// Check image (max size & type) & store it in memory
const checkImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check type of image
    if (!AUTH_MIME_TYPES[file.mimetype]) {
      req.fileValidationError = "Invalid image file type";
      return cb(null, false);
    }
    // Check size of image
    // if (file.size > 2000000) {
    //   req.fileValidationError = "Uploaded image size is too large";
    //   return cb(null, false);
    // }
    cb(null, true);
  },
}).single("image");

// Optimize image & saved it locally
const treatingImage = (req, res, next) => {
  // Set file name & extension
  const fileName = req.file.originalname.slice(0, req.file.originalname.lastIndexOf("."));
  const newFileName = Date.now() + "_" + fileName.replace(/\s+/g, "-");

  // Resize, convert, compress image
  sharp(req.file.buffer)
    .resize(450, 568, {
      fit: sharp.fit.fill,
    })
    .webp({ quality: 70 })

    // Save image in directory
    .toFile(path.join(directory, newFileName + ".webp"), (error) => {
      if (error) {
        return res.status(500).json({ error: "An error occurred while saving the uploaded image" });
      }
      // Set new name in request file
      req.file.filename = newFileName + ".webp";
      next();
    });
};

// Combined middlewares
const processImage = (req, res, next) => {
  try {
    checkImage(req, res, (error) => {
      // If an error occur with multer
      if (error) {
        return res.status(500).json({ error });
      }
      // Return an error if invalid file type
      if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
      }
      // If no file found, it will continue the request (for PUT request without modifying image)
      if (!req.file) {
        return next();
      }
      // Processing image file if valid image
      treatingImage(req, res, next);
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  processImage,
};
