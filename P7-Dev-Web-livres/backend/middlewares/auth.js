const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Get token & decode it
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Return user ID in request "auth"
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Not authorized" });
  }
};
