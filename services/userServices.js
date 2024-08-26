const { connectToMongoDB } = require("../utils/database");
const User = require("../models/user");
const { encrypt, decrypt } = require("../utils/encrypt_decrypt");

async function findUser(query = {}) {
  await connectToMongoDB();
  try {
    const users = await User.find(query);
    return users;
  } catch (error) {
    console.error("Error finding users:", error);
    throw error;
  }
}

async function createUser(userData) {
  await connectToMongoDB();
  try {
    const newUser = new User(userData);
    // console.log(newUser, "new user");
    newUser.password = encrypt(newUser.password.encrypted_data);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");

    return user;
  } catch (error) {
    throw new Error("Unable to fetch user profile");
  }
};

async function updateUserField(userData) {
  await connectToMongoDB();
  const { id, field, fieldValue, isArray, arrayAction } = userData;

  try {
    const updateObject = {};

    if (isArray) {
      if (arrayAction === "push") {
        updateObject["$push"] = { [field]: fieldValue };
      } else if (arrayAction === "pop") {
        updateObject["$pull"] = { [field]: fieldValue };
      } else {
        throw new Error("Invalid array action");
      }
    } else {
      updateObject["$set"] = { [field]: fieldValue };
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateObject, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user field:", error);
    throw error;
  }
}

module.exports = {
  findUser,
  createUser,
  getUserProfile,
  updateUserField,
};
