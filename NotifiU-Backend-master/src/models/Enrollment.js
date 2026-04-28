const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module"
    },
    moduleCode: String,
    moduleName: String,
    studentId: {
      type: String
    },
    studentName: String
  },
  { timestamps: true }
);

module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);