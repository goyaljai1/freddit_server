const { findByEmail } = require("../services/loginService");
const { decrypt } = require("../utils/encrypt_decrypt");
const jwt = require("jsonwebtoken");
async function authUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findByEmail("users", email);
    if (user) {
      const decryptedPassword = decrypt(user.password);
      if (password === decryptedPassword) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res.send({ token });
      } else {
        return res.status(401).send("Invalid email or password");
      }
    } else {
      return res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("Error 500");
  }
}

module.exports = {
  authUser,
};
