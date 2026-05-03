// Module Management Dashboard - implemented by Module Management member
import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError, showConfirm } from "../utils/premiumAlert";

type ModuleDashboardProps = {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onAssignLecturer: () => void;
  onEnrollments: () => void;
  onReports: () => void;
};

function ModuleDashboard({
  onCreate,
  onEdit,
  onAssignLecturer,
  onEnrollments,
  onReports
}: ModuleDashboardProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules", {
        params: { role: "superadmin" }
      });
      setModules(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      "Are you sure?",
      "This module will be permanently deleted!",
      "Yes, delete it!"
    );

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/modules/${id}`);

      await showSuccess("Deleted!", "Module deleted successfully");

      fetchModules();
    } catch (err) {
      console.log(err);

      showError("Error", "Failed to delete module");
    }
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    const result = await showConfirm(
      isArchived ? "Unarchive module?" : "Archive module?",
      isArchived
        ? "This module will be visible again"
        : "This module will be hidden from students and lecturers",
      isArchived ? "Yes, unarchive" : "Yes, archive"
    );

    if (!result.isConfirmed) return;

    try {
      await API.put(`/modules/archive/${id}`);

      await showSuccess(isArchived ? "Unarchived!" : "Archived!", isArchived ? "Module is now visible" : "Module is now hidden");

      fetchModules();
    } catch (err) {
      console.log(err);

      showError("Error", "Action failed");
    }
  };

  const filteredModules = modules
    .filter(
      (m: any) =>
        search === "" ||
        m.moduleName?.toLowerCase().includes(search.toLowerCase()) ||
        m.moduleCode?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((m: any) => semesterFilter === "" || m.semester === semesterFilter);

  return (
    <>
      <h2 style={{ marginBottom: "10px", color: "#1b1b3a" }}>
        Module Management
      </h2>

      <p style={{ color: "#f4a300" }}>
        Manage all modules by semester
      </p>

      <div className="dashboardGrid">
        <div>
          <div className="searchRow">
            <input
              placeholder="Search Module"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #f4a300"
              }}
            >
              <option value="">All Semesters</option>
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

          {filteredModules.map((m: any) => (
            <div key={m._id} className="moduleRow">
              <div>
                <strong>
                  {m.moduleName} - {m.moduleCode}
                </strong>
                <p>Semester: {m.semester}</p>

                {m.archived && (
                  <p
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      marginTop: "4px"
                    }}
                  >
                    Archived
                  </p>
                )}
              </div>

              <div>
                <button
                  className="editBtn"
                  onClick={() => onEdit(m._id)}
                >
                  Edit
                </button>

                <button
                  className="archiveBtn"
                  onClick={() => handleArchive(m._id, m.archived)}
                >
                  {m.archived ? "Unarchive" : "Archive"}
                </button>

                <button
                  className="deleteBtn"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <button
            className="createBtn"
            onClick={onCreate}
          >
            + Create Module
          </button>
        </div>

        <div className="sidePanel">
          <button
            className="sideBtn"
            onClick={onAssignLecturer}
          >
            Assign Lecturer
          </button>

          <button
            className="sideBtn"
            onClick={onEnrollments}
          >
            Enrollments
          </button>

          <button
            className="sideBtn"
            onClick={onReports}
          >
            Reports
          </button>
        </div>
      </div>
    </>
  );
}

export default ModuleDashboard;