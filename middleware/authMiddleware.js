const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    var token = authHeader.split(" ")[1];
    token = token.replace(/"/g, "");
    if (!token) return next();
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(400).send("Invalid Token");
    }
  }
  next();
};

module.exports = verifyToken;
