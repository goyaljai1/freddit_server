const uri = "mongodb://localhost:27017/reddit-clone";

const mongoose = require("mongoose");
const { Schema } = mongoose;

let connection;

async function connectToMongoDB() {
  if (!connection) {
    connection = await mongoose.connect(uri);
  }
  return connection;
}

module.exports = {
  connectToMongoDB,
};
