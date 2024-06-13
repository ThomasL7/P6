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
  // limits: {
  //   fileSize: 2000000,
  // },
  fileFilter: (req, file, cb) => {
    // Check type of image
    if (!AUTH_MIME_TYPES[file.mimetype]) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
}).single("image");

// Optimize image & saved it locally
const treatingImage = (req, res, next) => {
  // Set file name & extension
  const fileName = req.file.originalname.slice(0, req.file.originalname.lastIndexOf("."));

  // const date = new Date();
  // const day = date.getDate().toString().padStart(2, "0");
  // const month = (date.getMonth() + 1).toString().padStart(2, "0");
  // const year = date.getFullYear();
  // const hours = date.getHours().toString().padStart(2, "0");
  // const minutes = date.getMinutes().toString().padStart(2, "0");
  // const seconds = date.getSeconds().toString().padStart(2, "0");
  // const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  // const newDate = `${day}-${month}-${year}_${hours}h-${minutes}m-${seconds}s-${milliseconds}ms`;

  // const newFileName = fileName.replace(/\s+/g, "-") + "_" + newDate;

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
        return next(error);
      }
      // Set new name in request file
      req.file.filename = newFileName + ".webp";
      next();
    });
};

// Combined middlewares
const processImage = (req, res, next) => {
  checkImage(req, res, (error) => {
    // If no file found, it will continue the request (for PUT request without modifying image)
    if (!req.file) {
      return next();
    }
    // Return an error if invalid file type
    if (error) {
      return next(error);
    }
    // Processing image file if valid image
    treatingImage(req, res, next);
  });
};

module.exports = {
  processImage,
};
