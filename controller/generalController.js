const generalService = require("../services/generalService");
const postService = require("../services/postService");

async function getAllDocumentsWithFieldNames(req, res) {
  try {
    const collectionName = req.params.collectionName;
    const fieldNames = req.query.fields ? req.query.fields.split(",") : [];
    const documents = await generalService.getAllDocumentsWithFieldNames(
      collectionName,
      fieldNames
    );
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ message: "Error retrieving documents", error });
  }
}

async function createDocument(req, res) {
  const collection = req.params.collection;
  const documentData = req.body;

  try {
    const newDocument = await generalService.createDocument(
      collection,
      documentData
    );
    res.status(201).send(newDocument);
  } catch (error) {
    console.error(
      `Error creating document in collection ${collection}:`,
      error
    );
    res.status(500).send(error);
  }
}

async function handleDeleteDocument(req, res) {
  const { collectionName, documentId } = req.params;

  try {
    const deletedDocument = await generalService.deleteDocument(
      collectionName,
      documentId
    );

    if (deletedDocument) {
      return res.status(200).json({
        message: "Document deleted successfully",
        data: deletedDocument,
      });
    } else {
      return res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    console.error("Error in handleDeleteDocument controller:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting the document" });
  }
}

async function getDocumentById(req, res) {
  const { collection, id } = req.params;
  let document;
  if (collection === "Post") {
    document = await postService.getPostById(id, req, res);
  } else {
    document = await generalService.getDocumentById(collection, id);
    try {
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching document", error: error.message });
    }
  }
}

async function updateField(req, res) {
  const {
    collectionName,
    id,
    field,
    fieldValue,
    isArray,
    arrayAction,
    isNumber,
  } = req.body;

  try {
    const updatedDocument = await generalService.updateField(
      collectionName,
      id,
      field,
      fieldValue,
      isArray,
      arrayAction,
      isNumber
    );
    res.status(200).send(updatedDocument);
  } catch (error) {
    console.error("Error updating field:", error);
    res.status(500).send(error);
  }
}

module.exports = {
  getAllDocumentsWithFieldNames,
  updateField,
  createDocument,
  getDocumentById,
  handleDeleteDocument,
};
