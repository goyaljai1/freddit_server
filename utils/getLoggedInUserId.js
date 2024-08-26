const jwt = require("jsonwebtoken");

async function getLoggedInUserId(req) {
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    let token = authHeader.split(" ")[1];
    token = token.replace(/"/g, "");

    if (token) {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        return verified._id; // Return user ID from the token
      } catch (err) {
        // Token verification failed, return null or handle error appropriately
        throw new Error("Unauthorized");
      }
    } else {
      // Token is missing or empty
      return null;
    }
  }

  // Authorization header is missing
  return null;
}

module.exports = getLoggedInUserId; // Export function directly
