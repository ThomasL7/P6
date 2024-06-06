const multer = require("multer");

const MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },

  filename: function (req, file, cb) {
    const name = file.originalname.replace(/\s+/g, "-") + Date.now();
    const extension = MIME_TYPES[file.mimetype];
    cb(null, name + extension);
  },
});

module.exports = multer({ storage: storage }).single("file");
