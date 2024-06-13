const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const { processImage } = require("../middlewares/image");
const booksCtrl = require("../controllers/books");

// Routes for books without ID
router.get("/", booksCtrl.getAllBooks);
router.get("/bestrating", booksCtrl.getBestRating);
router.post("/", auth, processImage, booksCtrl.createBook);

// Routes for books with ID parameter
router.get("/:id", booksCtrl.getOneBook);
router.post("/:id/rating", auth, booksCtrl.addUserRating);
router.put("/:id", auth, processImage, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
