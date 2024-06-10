const fs = require("fs");

const Books = require("../models/Book");

// GET
exports.getAllBooks = (req, res, next) => {
  Books.find()
    .then((books) => {
      if (!books) {
        return res.status(404).json({ error: "Books not found" });
      }
      res.status(200).json(books);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  Books.find()
    .then((books) => {
      if (!books) {
        return res.status(404).json({ error: "Books not found" });
      }
      const sortBooks = books.sort((a, b) => b.averageRating - a.averageRating);
      const bestThreeRating = sortBooks.slice(0, 3);
      res.status(200).json(bestThreeRating);
    })
    .catch((error) => res.status(500).json({ error }));
};

// POST
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;
  delete bookObject.userId;

  const book = new Books({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Object added" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.addUserRating = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      if (req.body.userId === req.auth.userId) {
        const existingUser = book.ratings.findIndex((rating) => rating.userId === req.auth.userId);
        if (existingUser === -1) {
          book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
          let sumRating = 0;
          book.ratings.forEach((rating) => {
            sumRating += rating.grade;
          });
          book.averageRating = (sumRating / book.ratings.length).toFixed(3);

          Books.updateOne({ _id: req.params.id }, { ratings: book.ratings, averageRating: book.averageRating })
            .then(() => res.status(201).json(book))
            .catch((error) => res.status(500).json({ error }));
        } else {
          res.status(400).json({ message: "User has already rated this book" });
        }
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// PUT
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject.userId;

  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Books.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Object modified" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// DEL
exports.deleteBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const fileName = book.imageUrl.split("/images/")[1];

        fs.unlink(`images/${fileName}`, () => {
          Books.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Object deleted" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
