const userService = require("../services/userServices");

async function getUsers(req, res) {
  const { query } = req;
  const searchField = Object.keys(query)[0];
  const searchValue = query[searchField];

  try {
    let users;
    if (req.params.id) {
      const query = { _id: req.params.id };
      users = await userService.findUser(query);
    } else if (searchField && searchValue) {
      const query = { [searchField]: searchValue };
      users = await userService.findUser(query);
    } else {
      users = await userService.findUser({});
    }

    if (users.length > 0) {
      res.send(users);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Could not get users:", error);
    res.status(500).send(error);
  }
}

async function createUser(req, res) {
  const userData = req.body;

  try {
    const newUser = await userService.createUser(userData);
    res.status(201).send(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send(error);
  }
}

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.send(user);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

async function updateUserField(req, res) {
  const userData = req.body;
  try {
    const updatedUser = await userService.updateUserField(userData);
    res.status(200).send(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send(error);
  }
}

module.exports = {
  getUsers,
  createUser,
  getUserProfile,
  updateUserField,
};
