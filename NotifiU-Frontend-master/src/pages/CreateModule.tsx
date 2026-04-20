import { useState } from "react";
import API from "../services/api";
import { showSuccess, showError, showInfo } from "../utils/premiumAlert";

type CreateModuleProps = {
  onBack: () => void;
};

function CreateModule({ onBack }: CreateModuleProps) {
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const handleSubmit = async () => {
    const trimmedModuleCode = moduleCode.trim().toUpperCase();
    const trimmedModuleName = moduleName.trim();
    const trimmedAcademicYear = academicYear.trim();

    if (!trimmedModuleCode || !trimmedModuleName || !semester || !trimmedAcademicYear) {
      showInfo("Missing Fields", "Please fill all required fields");
      return;
    }

    const moduleCodePattern = /^[A-Z]{2,}\d{3,}$/;
    if (!moduleCodePattern.test(trimmedModuleCode)) {
      showInfo("Invalid Module Code", "Module code should look like SE2030 or IT1102");
      return;
    }

    const academicYearPattern = /^(\d{4}|\d{4}\/\d{4})$/;
    if (!academicYearPattern.test(trimmedAcademicYear)) {
      showInfo("Invalid Academic Year", "Use format like 2025 or 2025/2026");
      return;
    }

    try {
      await API.post("/modules", {
        moduleCode: trimmedModuleCode,
        moduleName: trimmedModuleName,
        semester,
        academicYear: trimmedAcademicYear
      });

      await showSuccess("Success", "Module created successfully");

      onBack();
    } catch (error: any) {
      console.log(error);

      showError("Error", error?.response?.data?.message || "Failed to create module");
    }
  };

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2>Create Module</h2>

      <div className="formCard">
        <div className="formGroup">
          <label>Module Code *</label>
          <input
            value={moduleCode}
            onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
            placeholder="e.g. SE2030"
          />
        </div>

        <div className="formGroup">
          <label>Module Name *</label>
          <input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="Enter module name"
          />
        </div>

        <div className="formGroup">
          <label>Semester *</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            <option value="Year 1 Semester 1">Year 1 Semester 1</option>
            <option value="Year 1 Semester 2">Year 1 Semester 2</option>
            <option value="Year 2 Semester 1">Year 2 Semester 1</option>
            <option value="Year 2 Semester 2">Year 2 Semester 2</option>
            <option value="Year 3 Semester 1">Year 3 Semester 1</option>
            <option value="Year 3 Semester 2">Year 3 Semester 2</option>
            <option value="Year 4 Semester 1">Year 4 Semester 1</option>
            <option value="Year 4 Semester 2">Year 4 Semester 2</option>
          </select>
        </div>

        <div className="formGroup">
          <label>Academic Year *</label>
          <input
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2025 or 2025/2026"
          />
        </div>

        <div className="formButtons">
          <button
            className="cancelBtn"
            onClick={onBack}
          >
            Cancel
          </button>

          <button
            className="saveBtn"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateModule;