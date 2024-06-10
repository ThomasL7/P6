const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const booksCtrl = require("../controllers/books");

router.get("/", booksCtrl.getAllBooks);
router.get("/bestrating", booksCtrl.getBestRating);
router.post("/", auth, multer, booksCtrl.createBook);

router.get("/:id", booksCtrl.getOneBook);
router.post("/:id/rating", auth, booksCtrl.addUserRating);
router.put("/:id", auth, multer, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);

module.exports = router;
