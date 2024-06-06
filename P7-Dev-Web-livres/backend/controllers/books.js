const Books = require("../models/Books");

// GET
exports.getAllBooks = (req, res, next) => {
  Books.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Books.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// POST
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  // const bookObject = req.body.book;

  // delete booksObject._id;
  // delete bookObject._userId;
  // delete bookObject._userId;

  const book = new Books({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `http://localhost:4000/images/Book-test.jpg`,
  });
  // imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,

  book
    .save()
    .then(() => res.status(201).json({ message: "Object added" }))
    .catch((error) => res.status(400).json({ error }));
};

// PUT
exports.modifyBook = (req, res, next) => {
  delete req.body._userId;
  Books.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Object modified" }))
    .catch((error) => res.status(401).json({ error }));
};

// DEL
exports.deleteBook = (req, res, next) => {
  Books.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Object deleted" }))
    .catch((error) => res.status(401).json({ error }));
};

// const fs = require("fs");

// exports.modifyModel = (req, res, next) => {
//   const modelObject = req.file
//     ? {
//         ...JSON.parse(req.body.model),
//         imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
//       }
//     : { ...req.body };

//   delete modelObject._userId;

//   Models.findOne({ _id: req.params.id })
//     .then((model) => {
//       if (model.userId != req.auth.userId) {
//         res.status(401).json({ message: "Not authorized" });
//       } else {
//         Models.updateOne({ _id: req.params.id }, { ...modelObject, _id: req.params.id })
//           .then(() => res.status(200).json({ message: "Object modified" }))
//           .catch((error) => res.status(401).json({ error }));
//       }
//     })
//     .catch((error) => {
//       res.status(400).json({ error });
//     });
// };

// exports.createModel = (req, res, next) => {
//   const modelObject = JSON.parse(req.body.model);

//   delete modelObject._id;
//   delete modelObject._userId;

//   const model = new Model({
//     ...modelObject,
//     userId: req.auth.userId,
//     imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
//   });

//   model
//     .save()
//     .then(() => res.status(201).json({ message: "Object added" }))
//     .catch((error) => res.status(400).json({ error }));
// };

// exports.deleteModel = (req, res, next) => {
//   Models.findOne({ _id: req.params.id })
//     .then((model) => {
//       if (model.userId != req.auth.userId) {
//         res.status(401).json({ message: "Not authorized" });
//       } else {
//         const filename = model.imageUrl.split("/images/")[1];
//         fs.unlink(`images/filename`, () => {
//           Models.deleteOne({ _id: req.params.id })
//             .then(() => {
//               res.status(200).json({ message: "Object deleted" });
//             })
//             .catch((error) => res.status(401).json({ error }));
//         });
//       }
//     })
//     .catch((error) => {
//       res.status(500).json({ error });
//     });
// };
