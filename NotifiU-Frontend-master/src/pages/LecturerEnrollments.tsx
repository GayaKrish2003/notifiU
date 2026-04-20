import { useEffect, useState } from "react";
import API from "../services/api";

type LecturerEnrollmentsProps = {
  moduleId: string;
  onBack: () => void;
};

function LecturerEnrollments({ moduleId, onBack }: LecturerEnrollmentsProps) {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!moduleId) return;

    API.get("/lecturer/enrollments", {
      params: { moduleId }
    })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.log(err);
        alert("Failed to load enrollments");
      });
  }, [moduleId]);

  const filtered = data.filter((e: any) =>
    String(e.studentId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2>Student Enrollments</h2>

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
            <th>Module Name</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e: any) => (
            <tr key={e._id}>
              <td>{String(e.studentId)}</td>
              <td>{e.studentName}</td>
              <td>{e.moduleCode}</td>
              <td>{e.moduleName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default LecturerEnrollments;