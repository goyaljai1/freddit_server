const User = require("../models/user");
const { connectToMongoDB } = require("../utils/database");

async function findByEmail(collectionName, email) {
  await connectToMongoDB();

  try {
    const item = await User.findOne({ email });
    return item;
  } catch (error) {
    console.error(
      `Error finding document by email in ${collectionName}:`,
      error
    );
    throw error;
  }
}

module.exports = {
  findByEmail,
};
