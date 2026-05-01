jest.mock("@aws-sdk/client-s3", () => {
  const send = jest.fn().mockResolvedValue({});
  return {
    S3Client: jest.fn(() => ({ send })),
    PutObjectCommand: jest.fn((input) => input),
    DeleteObjectCommand: jest.fn((input) => input),
  };
});

jest.mock("../src/models/Module");
jest.mock("../src/models/Enrollment");
jest.mock("../src/models/user");

const mongoose = require("mongoose");
const Module = require("../src/models/Module");
const Enrollment = require("../src/models/Enrollment");
const User = require("../src/models/user");

const {
  createModule,
  updateModule,
  deleteModule,
  archiveModule,
  assignLecturer,
  getLecturers,
  enrollStudent,
  getEnrollments,
  deleteEnrollment,
  renameFile,
  removeFile,
  getLecturerEnrollments,
  getMyEnrollments,
  getWorkloadReport,
  getSemesterReport,
} = require("../src/controllers/moduleController");

// helper: fake req/res
function mockReqRes(body = {}, params = {}, query = {}, files = null, file = null) {
  const req = { body, params, query, files, file };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return { req, res };
}

// helper: fake module document
function makeModuleDoc(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439011",
    moduleCode: "IT2150",
    moduleName: "SE",
    semester: "Y2S1",
    academicYear: "2026",
    archived: false,
    lecturerId: null,
    files: [],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
      _id: "507f1f77bcf86cd799439011",
      moduleCode: "IT2150",
      moduleName: "SE",
      semester: "Y2S1",
      academicYear: "2026",
      archived: false,
      lecturerId: null,
      files: [],
      ...overrides,
    }),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  // used by getSafeModule()
  mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
});

describe("Module Management Controller Tests", () => {
  describe("createModule", () => {
    it("TC001 - should create a module successfully", async () => {
      const fakeModule = {
        moduleCode: "IT2150",
        moduleName: "SE",
        semester: "Y2S1",
        academicYear: "2026",
        save: jest.fn().mockResolvedValue(true),
      };

      Module.mockImplementation(() => fakeModule);

      const { req, res } = mockReqRes({
        moduleCode: "IT2150",
        moduleName: "SE",
        semester: "Y2S1",
        academicYear: "2026",
      });

      await createModule(req, res);

      expect(fakeModule.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeModule);
    });
  });

  
  describe("assignLecturer", () => {
    it("TC003 - should assign lecturer to module", async () => {
      const moduleDoc = makeModuleDoc();
      Module.findById = jest.fn().mockResolvedValue(moduleDoc);

      const { req, res } = mockReqRes(
        { lecturerId: "lect123" },
        { id: "507f1f77bcf86cd799439011" }
      );

      await assignLecturer(req, res);

      expect(moduleDoc.lecturerId).toBe("lect123");
      expect(moduleDoc.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it("should reject assigning lecturer to archived module", async () => {
      const moduleDoc = makeModuleDoc({ archived: true });
      Module.findById = jest.fn().mockResolvedValue(moduleDoc);

      const { req, res } = mockReqRes(
        { lecturerId: "lect123" },
        { id: "507f1f77bcf86cd799439011" }
      );

      await assignLecturer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cannot assign lecturer to archived module",
      });
    });
  });

  describe("deleteModule", () => {
    it("TC004 - should delete module successfully", async () => {
      Module.collection = {
        findOne: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          files: [],
        }),
      };
      Module.findByIdAndDelete = jest.fn().mockResolvedValue(true);

      const { req, res } = mockReqRes({}, { id: "507f1f77bcf86cd799439011" });

      await deleteModule(req, res);

      expect(Module.findByIdAndDelete).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(res.json).toHaveBeenCalledWith({ message: "Module deleted" });
    });
  });

  
  describe("getEnrollments", () => {
    it("TC006 - should return all enrollments", async () => {
      const fakeEnrollments = [
        { moduleId: "mod1", studentId: "ST001" },
        { moduleId: "mod2", studentId: "ST002" },
      ];

      Enrollment.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeEnrollments),
      });

      const { req, res } = mockReqRes();

      await getEnrollments(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeEnrollments);
    });
  });

  describe("enrollStudent", () => {
    it("should enroll a student successfully", async () => {
      Module.collection = {
        findOne: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          moduleCode: "IT2150",
          moduleName: "SE",
          archived: false,
          files: [],
        }),
      };

      Enrollment.findOne = jest.fn().mockResolvedValue(null);

      const fakeEnrollment = {
        moduleId: "507f1f77bcf86cd799439011",
        moduleCode: "IT2150",
        moduleName: "SE",
        studentId: "ST001",
        studentName: "Ann",
        save: jest.fn().mockResolvedValue(true),
      };

      Enrollment.mockImplementation(() => fakeEnrollment);

      const { req, res } = mockReqRes(
        { studentId: "ST001", studentName: "Ann" },
        { id: "507f1f77bcf86cd799439011" }
      );

      await enrollStudent(req, res);

      expect(Enrollment.findOne).toHaveBeenCalled();
      expect(fakeEnrollment.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeEnrollment);
    });

    it("should reject duplicate enrollment", async () => {
      Module.collection = {
        findOne: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          moduleCode: "IT2150",
          moduleName: "SE",
          archived: false,
          files: [],
        }),
      };

      Enrollment.findOne = jest.fn().mockResolvedValue({
        _id: "enroll123",
        studentId: "ST001",
      });

      const { req, res } = mockReqRes(
        { studentId: "ST001" },
        { id: "507f1f77bcf86cd799439011" }
      );

      await enrollStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Already enrolled" });
    });
  });

  describe("renameFile", () => {
    it("TC010 - should rename module file display name", async () => {
      Module.collection = {
        findOne: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          files: [
            {
              storedName: "modules/1/file.pdf",
              displayName: "lecture1.pdf",
              url: "https://cdn.example.com/file.pdf",
            },
          ],
        }),
        updateOne: jest.fn().mockResolvedValue(true),
      };

      const { req, res } = mockReqRes(
        {
          storedName: "modules/1/file.pdf",
          displayName: "Week1 Lecture",
        },
        { id: "507f1f77bcf86cd799439011" }
      );

      await renameFile(req, res);

      expect(Module.collection.updateOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "File name updated successfully",
        })
      );
    });
  });

  describe("removeFile", () => {
    it("TC011 - should remove a file successfully", async () => {
      const moduleDoc = makeModuleDoc({
        files: [
          {
            storedName: "modules/1/file.pdf",
            displayName: "lecture1.pdf",
            url: "https://cdn.example.com/file.pdf",
          },
        ],
      });

      Module.findById = jest.fn().mockResolvedValue(moduleDoc);

      const { req, res } = mockReqRes(
        { storedName: "modules/1/file.pdf" },
        { id: "507f1f77bcf86cd799439011" }
      );

      await removeFile(req, res);

      expect(moduleDoc.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "File removed successfully",
      });
    });
  });

  describe("getLecturers", () => {
    it("should return lecturer users", async () => {
      const fakeLecturers = [{ _id: "u1", name: "Ann", role: "lecturer" }];

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeLecturers),
      });

      const { req, res } = mockReqRes();

      await getLecturers(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeLecturers);
    });
  });

  
});