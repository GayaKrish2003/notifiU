import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import Swal from "sweetalert2";

type LecturerModuleViewProps = {
  moduleId: string;
  onBack: () => void;
  onViewFullEnrollments: (moduleId: string) => void;
};

function LecturerModuleView({
  moduleId,
  onBack,
  onViewFullEnrollments
}: LecturerModuleViewProps) {
  const [moduleData, setModuleData] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [editingStoredName, setEditingStoredName] = useState<string | null>(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchData = async () => {
    try {
      const moduleRes = await API.get(`/modules/${moduleId}`);
      const enrollRes = await API.get("/lecturer/enrollments", {
        params: { moduleId }
      });
      setModuleData(moduleRes.data);
      setEnrollments(enrollRes.data);
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load module"
      });
    }
  };

  useEffect(() => {
    if (moduleId) fetchData();
  }, [moduleId]);

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Files Selected",
        text: "Please select files before uploading"
      });
      return;
    }

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }

      await API.post(`/modules/${moduleId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await Swal.fire({
        icon: "success",
        title: "Uploaded!",
        text: "Files uploaded successfully"
      });

      setSelectedFiles(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchData();
    } catch (err: any) {
      console.log(err?.response?.data || err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.response?.data?.message || "Upload failed"
      });
    }
  };

  const handleCancelSelection = () => {
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (storedName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This file will be removed permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/modules/${moduleId}/file`, {
        data: { storedName }
      });

      await Swal.fire({
        icon: "success",
        title: "Removed!",
        text: "File removed successfully"
      });

      fetchData();
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove file"
      });
    }
  };

  const startRename = (file: any) => {
    setEditingStoredName(file.storedName);
    setNewDisplayName(file.displayName);
  };

  const cancelRename = () => {
    setEditingStoredName(null);
    setNewDisplayName("");
  };

  const saveRename = async (storedName: string) => {
    if (!newDisplayName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Name",
        text: "Please enter a file name"
      });
      return;
    }

    try {
      await API.put(`/modules/${moduleId}/file/rename`, {
        storedName,
        displayName: newDisplayName.trim()
      });

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "File name updated successfully"
      });

      setEditingStoredName(null);
      setNewDisplayName("");
      fetchData();
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to rename file"
      });
    }
  };

  if (!moduleData) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: "20px"
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2 style={{ marginBottom: "20px" }}>
        Module: {moduleData.moduleName} ({moduleData.moduleCode})
      </h2>

      <div
        className="formCard"
        style={{
          marginBottom: "20px",
          width: "100%",
          maxWidth: "none"
        }}
      >
        <h3>Lecture Materials</h3>

        {moduleData.files?.length > 0 ? (
          moduleData.files.map((file: any, index: number) => (
            <div
              key={index}
              style={{
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              {editingStoredName === file.storedName ? (
                <>
                  <input
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: "240px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc"
                    }}
                  />
                  <button className="saveBtn" onClick={() => saveRename(file.storedName)}>
                    Save
                  </button>
                  <button className="cancelBtn" onClick={cancelRename}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>📄 {file.displayName}</span>
                  <a href={file.url || "#"} className="editBtn" target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <button className="archiveBtn" onClick={() => startRename(file)}>
                    Rename
                  </button>
                  <button className="deleteBtn" onClick={() => handleRemoveFile(file.storedName)}>
                    Remove
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No files uploaded</p>
        )}

        <h3 style={{ marginTop: "20px", marginBottom: "12px" }}>Upload Files</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <label
              htmlFor="fileUpload"
              style={{
                background: "#0b1445",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Choose Files
            </label>

            <input
              id="fileUpload"
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => setSelectedFiles(e.target.files)}
            />

            <span style={{ fontSize: "14px", color: "#555" }}>
              {selectedFiles && selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : "No file chosen"}
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="saveBtn" onClick={handleUpload}>
              Upload
            </button>

            <button className="cancelBtn" onClick={handleCancelSelection}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div
        className="formCard"
        style={{
          width: "100%",
          maxWidth: "none"
        }}
      >
        <h3>Students Enrolled ({enrollments.length})</h3>

        <table className="enrollTable">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Module Code</th>
              <th>Module Name</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.slice(0, 5).map((e: any) => (
              <tr key={e._id}>
                <td>{e.studentId}</td>
                <td>{e.studentName}</td>
                <td>{e.moduleCode}</td>
                <td>{e.moduleName}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="sideBtn"
          style={{ marginTop: "15px" }}
          onClick={() => onViewFullEnrollments(moduleId)}
        >
          View Full Enrollments
        </button>
      </div>
    </div>
  );
}

export default LecturerModuleView;