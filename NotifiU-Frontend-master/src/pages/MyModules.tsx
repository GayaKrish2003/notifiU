import { useEffect, useState } from "react";
import API from "../services/api";
import { showError } from "../utils/premiumAlert";

type MyModulesProps = {
  moduleId: string;
  onBack: () => void;
};

function MyModules({ moduleId, onBack }: MyModulesProps) {
  const [moduleData, setModuleData] = useState<any>(null);

  useEffect(() => {
    if (moduleId) {
      API.get(`/modules/${moduleId}`)
        .then((res) => setModuleData(res.data))
        .catch((err) => {
          console.log(err);
          showError("Error", "Failed to load module");
        });
    }
  }, [moduleId]);

  if (!moduleData) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Module: {moduleData.moduleName} ({moduleData.moduleCode})
      </h2>

      <div className="formCard" style={{ width: "100%", maxWidth: "none" }}>
        <h3>Module Materials</h3>
        <p>Semester: {moduleData.semester}</p>

        {moduleData.files?.length > 0 ? (
          <div style={{ marginTop: "20px" }}>
            {moduleData.files.map((file: any, index: number) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px"
                }}
              >
                <span style={{ flex: 1 }}>
                  {file.displayName || file.storedName || file}
                </span>

                <a
                  href={file.url || "#"}
                  className="editBtn"
                  style={{ textDecoration: "none" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: "15px" }}>No documents uploaded yet</p>
        )}

        <div style={{ marginTop: "20px" }}>
          <button className="cancelBtn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyModules;