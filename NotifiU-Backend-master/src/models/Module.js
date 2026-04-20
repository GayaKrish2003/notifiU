const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    storedName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema({
  moduleCode: {
    type: String,
    required: true
  },
  moduleName: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  files: {
    type: [fileSchema],
    default: []
  },
  archived: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.models.Module || mongoose.model("Module", moduleSchema);