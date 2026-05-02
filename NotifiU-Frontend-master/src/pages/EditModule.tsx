import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError, showInfo } from "../utils/premiumAlert";

type EditModuleProps = {
  moduleId: string;
  onBack: () => void;
};

function EditModule({ moduleId, onBack }: EditModuleProps) {
  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const res = await API.get(`/modules/${moduleId}`);
      const m = res.data;
      setModuleName(m.moduleName || "");
      setModuleCode(m.moduleCode || "");
      setSemester(m.semester || "");
      setAcademicYear(m.academicYear || "");
    } catch (err) {
      console.log(err);
      showError("Error", "Failed to load module");
    }
  };

  const handleUpdate = async () => {
    const trimmedModuleCode = moduleCode.trim().toUpperCase();
    const trimmedModuleName = moduleName.trim();
    const trimmedAcademicYear = academicYear.trim();

    if (!trimmedModuleName || !trimmedModuleCode || !semester || !trimmedAcademicYear) {
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
      await API.put(`/modules/${moduleId}`, {
        moduleName: trimmedModuleName,
        moduleCode: trimmedModuleCode,
        semester,
        academicYear: trimmedAcademicYear
      });

      await showSuccess("Updated!", "Module updated successfully");
    
       onBack();
    } catch (err: any) {
      console.log(err);

      showError("Error", err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2>Edit Module</h2>

      <div className="formCard">
        <div className="formGroup">
          <label>Module Name *</label>
          <input
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="Enter module name"
          />
        </div>

        <div className="formGroup">
          <label>Module Code *</label>
          <input
            value={moduleCode}
            onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
            placeholder="e.g. SE2030"
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
          <button className="cancelBtn" onClick={onBack}>
            Cancel
          </button>
          <button className="saveBtn" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </>
  );
}

export default EditModule;