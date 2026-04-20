import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError, showInfo } from "../utils/premiumAlert";

type AssignLecturerProps = {
  onBack: () => void;
};

function AssignLecturer({ onBack }: AssignLecturerProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [lecturerId, setLecturerId] = useState("");

  useEffect(() => {
    fetchModules();
    fetchLecturers();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules", {
        params: { role: "superadmin" }
      });

      setModules(res.data.filter((m: any) => !m.archived));
    } catch (err) {
      console.log(err);
      showError("Error", "Failed to load modules");
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await API.get("/users/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.log(err);
      showError("Error", "Failed to load lecturers");
    }
  };

  const handleAssign = async () => {
    if (!moduleId || !lecturerId) {
      showInfo("Missing Selection", "Please select module and lecturer");
      return;
    }

    try {
      await API.put(`/modules/${moduleId}/assign`, {
        lecturerId
      });

      await showSuccess("Assigned!", "Lecturer assigned successfully");

      onBack();
    } catch (err: any) {
      console.log(err);
      showError("Error", err?.response?.data?.message || "Assignment failed");
    }
  };

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2>Assign Lecturer</h2>

      <div className="formCard">
        <div className="formGroup">
          <label>Module *</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
          >
            <option value="">Select Module</option>
            {modules.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.moduleName} ({m.moduleCode})
              </option>
            ))}
          </select>
        </div>

        <div className="formGroup">
          <label>Lecturer *</label>
          <select
            value={lecturerId}
            onChange={(e) => setLecturerId(e.target.value)}
          >
            <option value="">Select Lecturer</option>
            {lecturers.map((l: any) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
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
            onClick={handleAssign}
          >
            Assign Lecturer
          </button>
        </div>
      </div>
    </>
  );
}

export default AssignLecturer;