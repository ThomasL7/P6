const fs = require("fs");
const path = require("path");

const Books = require("../models/Book");

// *** GET ***
// Getting all books
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

// Getting one specify book
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

// Getting the 3 best rating books
exports.getBestRating = (req, res, next) => {
  Books.find()
    .then((books) => {
      if (!books) {
        return res.status(404).json({ error: "Books not found" });
      }
      // Sorting books in descending order
      const sortBooks = books.sort((a, b) => b.averageRating - a.averageRating);
      // Split the list to get the first 3 best rating books
      const bestThreeRating = sortBooks.slice(0, 3);
      res.status(200).json(bestThreeRating);
    })
    .catch((error) => res.status(500).json({ error }));
};

// *** POST ***
// Book creation
exports.createBook = (req, res, next) => {
  // Error if no image
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded or file is not an image" });
  }

  // Parsing body
  const bookObject = JSON.parse(req.body.book);

  // Delete all body request ID for security or avoiding double ID in DB
  delete bookObject._id;
  delete bookObject.userId;

  // Define new content body
  const book = new Books({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  // Validate book inputs
  const validationError = book.validateSync();

  if (validationError) {
    // Delete the image if an error occur
    const filePath = path.join(__dirname, "../images", req.file.filename);
    fs.unlink(filePath, (error) => {
      if (error) {
        return res.status(500).json({ error: "An error occurred while deleting the image" });
      }
    });
    return res.status(400).json({ error: validationError.message });
  }

  // Save in DB
  book
    .save()
    .then(() => res.status(201).json({ message: "Object added" }))
    .catch((error) => {
      // Delete the image if an error occur
      const filePath = path.join(__dirname, "../images", req.file.filename);
      fs.unlink(filePath, (error) => {
        if (error) {
          return res.status(500).json({ error: "An error occurred while deleting the image" });
        }
      });
      res.status(500).json({ error });
    });
};

// Add the user rating to a specify book
exports.addUserRating = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      // Check if logged user is the same as in body
      if (req.body.userId === req.auth.userId) {
        // Check if user has already a rating
        const existingUser = book.ratings.findIndex((rating) => rating.userId === req.auth.userId);

        // Add user rating {userID: user, grade: rating} to ratings array of body
        if (existingUser === -1) {
          book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
          // Update the average rating
          let sumRating = 0;
          book.ratings.forEach((rating) => {
            sumRating += rating.grade;
          });
          // Rounded to two digits
          book.averageRating = (sumRating / book.ratings.length).toFixed(2);

          // Update DB book
          Books.updateOne({ _id: req.params.id }, { ratings: book.ratings, averageRating: book.averageRating })
            .then(() => res.status(201).json(book))
            .catch((error) => res.status(500).json({ error }));
        } else {
          res.status(409).json({ error: "User has already rated this book" });
        }
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// *** PUT ***
// Modify a specific book (only for the creator of the book)
exports.modifyBook = (req, res, next) => {
  // Adapt & parse the body (with modifications of the book) to the type of body content: if just book infos or with a new image
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  const bookInstance = new Books(bookObject);

  // Validate book inputs
  const fieldsToValidate = ["title", "author", "year", "genre"];
  let validationError = "";

  for (const field of fieldsToValidate) {
    const testField = bookInstance.validateSync(field);
    if (testField) {
      validationError = testField.message;
    }
  }

  if (validationError) {
    // Delete the existant image if an error occur
    if (req.file) {
      const filePath = path.join(__dirname, "../images", req.file.filename);
      fs.unlink(filePath, (error) => {
        if (error) {
          return res.status(500).json({ error: "An error occurred while deleting the image" });
        }
      });
    }
    return res.status(400).json({ error: validationError });
  }

  // Delete user ID in body for security
  delete bookObject.userId;

  // Find specify book
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      // Check if logged user is the one who create the book
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ error: "Not authorized" });
      } else {
        // Update DB book
        Books.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => {
            // If a new image was uploaded, delete the old image
            if (req.file) {
              const oldFileName = book.imageUrl.split("/images/")[1];
              fs.unlink(`images/${oldFileName}`, (error) => {
                if (error) {
                  return res.status(500).json({ error: "An error occurred while deleting the image" });
                }
              });
            }
            res.status(200).json({ message: "Object modified" });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      // Delete the existant image if an error occur
      if (req.file) {
        const filePath = path.join(__dirname, "../images", req.file.filename);
        fs.unlink(filePath, (error) => {
          if (error) {
            return res.status(500).json({ error: "An error occurred while deleting the image" });
          }
        });
      }
      res.status(500).json({ error });
    });
};

// *** DEL ***
// Delete a specify book (only for the creator of the book)
exports.deleteBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => {
      // Check if logged user is the one who create the book
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ error: "Not authorized" });
      } else {
        // Get image name to delete it
        const fileName = book.imageUrl.split("/images/")[1];

        // Delete image
        fs.unlink(`images/${fileName}`, () => {
          // Delete DB book
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
