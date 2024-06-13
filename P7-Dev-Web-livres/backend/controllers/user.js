const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// *** Sign up an account ***
exports.signup = (req, res, next) => {
  // Encrypt the password
  bcrypt
    .hash(req.body.password, 10)
    // Update the request body
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Save the account to DB
      user
        .save()
        .then(() => res.status(201).json({ message: "User created successfully" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// *** Login to an account ***
exports.login = (req, res, next) => {
  // Find account in DB
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Incorrect login" });
      }
      // Compare password to encrypted password
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Incorrect login" });
          }
          // If valid, return user._id & auth token
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
