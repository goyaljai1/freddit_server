const mongoose = require("mongoose");
const { connectToMongoDB } = require("../utils/database");
const { getModel } = require("../utils/modelManager");

async function getAllDocumentsWithFieldNames(collectionName, fieldNames) {
  await connectToMongoDB();
  try {
    const collection = mongoose.model(collectionName);
    const projection = fieldNames.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {});
    const documents = await collection.find({}, projection).exec();
    return documents;
  } catch (error) {
    console.error("Error retrieving documents:", error);
    throw error;
  }
}

async function createDocument(collection, documentData) {
  await connectToMongoDB();
  try {
    const Model = getModel(collection);
    const newDocument = new Model(documentData);
    const savedDocument = await newDocument.save();
    return savedDocument;
  } catch (error) {
    console.error(
      `Error creating document in collection ${collection}:`,
      error
    );
    throw error;
  }
}

async function getDocumentById(collectionName, id) {
  await connectToMongoDB();
  try {
    const collection = mongoose.model(collectionName);
    let projection = collectionName === "User" ? "-email -password" : "";
    const document = await collection.findById(id).select(projection);
    return document;
  } catch (error) {
    throw new Error(`Unable to fetch document: ${error.message}`);
  }
}

async function updateField(
  collectionName,
  id,
  field,
  fieldValue,
  isArray,
  arrayAction,
  isNumber
) {
  await connectToMongoDB();

  try {
    const updateObject = {};

    if (isNumber) {
      updateObject["$inc"] = { [field]: fieldValue };
    } else if (isArray) {
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

    const collection = mongoose.model(collectionName);
    const updatedDocument = await collection.findByIdAndUpdate(
      id,
      updateObject,
      { new: true }
    );

    if (!updatedDocument) {
      throw new Error(`${collectionName} document not found`);
    }

    return updatedDocument;
  } catch (error) {
    console.error(
      `Error updating field in ${collectionName} collection:`,
      error
    );
    throw error;
  }
}

async function deleteDocument(collectionName, documentId) {
  await connectToMongoDB();

  try {
    const collection = mongoose.model(collectionName);
    const deletedDocument = await collection.findByIdAndDelete(documentId);

    if (!deletedDocument) {
      throw new Error(`${collectionName} document not found`);
    }

    return deletedDocument;
  } catch (error) {
    console.error(
      `Error deleting document in ${collectionName} collection:`,
      error
    );
    throw error;
  }
}

module.exports = {
  getAllDocumentsWithFieldNames,
  updateField,
  createDocument,
  getDocumentById,
  deleteDocument,
};
