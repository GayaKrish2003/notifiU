// ModuleRoutes.js file  
const express = require("express");
const router = express.Router();
const controller = require("../controllers/moduleController");
const upload = require("../middlewares/moduleUploadMiddleware");

// ADMIN
router.post("/modules", controller.createModule);
router.get("/modules/:id", controller.getModuleById);
router.put("/modules/:id", controller.updateModule);
router.delete("/modules/:id", controller.deleteModule);
router.put("/modules/archive/:id", controller.archiveModule);
router.put("/modules/:id/assign", controller.assignLecturer);

// COMMON
router.get("/modules", controller.getModules);

// LECTURER
router.post("/modules/:id/upload", upload.array("files", 10), controller.uploadFile);
router.put("/modules/:id/file/rename", controller.renameFile);
router.delete("/modules/:id/file", controller.removeFile);
router.get("/lecturer/enrollments", controller.getLecturerEnrollments);

// STUDENT
router.post("/modules/:id/enroll", controller.enrollStudent);
router.get("/my-enrollments", controller.getMyEnrollments);

// USERS
router.get("/users/lecturers", controller.getLecturers);

// ADMIN
router.get("/enrollments", controller.getEnrollments);
router.delete("/enrollments/:id", controller.deleteEnrollment);
router.get("/reports/workload", controller.getWorkloadReport);
router.get("/reports/semester", controller.getSemesterReport);

module.exports = router;