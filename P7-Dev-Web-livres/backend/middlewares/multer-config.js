const multer = require("multer");

const AUTH_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },

  filename: function (req, file, cb) {
    const name = file.originalname.slice(0, file.originalname.lastIndexOf("."));

    const extension = AUTH_MIME_TYPES[file.mimetype];

    const date = new Date();

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

    const newDate = `${month}-${day}-${year}_${hours}h-${minutes}m-${seconds}s-${milliseconds}ms`;

    const newName = name.replace(/\s+/g, "_") + "_" + newDate + extension;

    cb(null, newName);
  },
});

module.exports = multer({ storage: storage }).single("image");
