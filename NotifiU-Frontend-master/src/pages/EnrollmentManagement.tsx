import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError, showConfirm } from "../utils/premiumAlert";

type EnrollmentManagementProps = {
  onBack: () => void;
};

function EnrollmentManagement({ onBack }: EnrollmentManagementProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await API.get("/enrollments");
      setEnrollments(res.data);
    } catch (err) {
      console.log(err);
      showError("Error", "Failed to load enrollments");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      "Are you sure?",
      "This enrollment will be deleted!",
      "Yes, delete it"
    );

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/enrollments/${id}`);

      await showSuccess("Deleted!", "Enrollment has been deleted");

      fetchEnrollments();
    } catch (err: any) {
      console.log(err);

      showError("Error", err?.response?.data?.message || "Failed to delete enrollment");
    }
  };

  const filtered = enrollments.filter((e: any) =>
    String(e.studentId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2>Enrollment Management</h2>

      <input
        placeholder="Search by Student ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px", padding: "10px" }}
      />

      <table className="enrollTable">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Module Code</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((e: any) => (
            <tr key={e._id}>
              <td>{String(e.studentId)}</td>
              <td>{e.studentName}</td>
              <td>{e.moduleCode}</td>
              <td>
                <button
                  className="deleteBtn"
                  onClick={() => handleDelete(e._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default EnrollmentManagement;