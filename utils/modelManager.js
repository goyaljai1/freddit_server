const mongoose = require("mongoose");
const Community = require("../models/community");
const Comment = require("../models/comment");
const Vote = require("../models/vote");
const models = {
  Community,
  Comment,
  Vote,
};

function getModel(collectionName) {
  if (models[collectionName]) {
    return models[collectionName];
  }
  throw new Error(`Model for collection ${collectionName} not found.`);
}

module.exports = {
  getModel,
};
