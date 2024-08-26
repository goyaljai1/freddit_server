const mongoose = require("mongoose");
const { Schema } = mongoose;

let connection;

async function connectToMongoDB() {
  if (!connection) {
    connection = await mongoose.connect(process.env.MONGO_URI);
  }
  return connection;
}

module.exports = {
  connectToMongoDB,
};
