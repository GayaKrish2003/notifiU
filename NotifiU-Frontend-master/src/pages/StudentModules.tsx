import { useEffect, useState } from "react";
import API from "../services/api";
import { getUser } from "../utils/currentUser";
import { showSuccess, showError } from "../utils/premiumAlert";

type StudentModulesProps = {
  onOpenModule: (id: string) => void;
};

function StudentModules({ onOpenModule }: StudentModulesProps) {
  const currentUser = getUser();
  const [modules, setModules] = useState<any[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const fetchData = async () => {
    try {
      const modulesRes = await API.get("/modules");
      const enrollmentsRes = await API.get("/my-enrollments", {
        params: { studentId: currentUser?._id }
      });

      setModules(modulesRes.data.filter((m: any) => !m.archived));
      setMyEnrollments(enrollmentsRes.data);
    } catch (err) {
      console.log(err);
      showError("Error", "Failed to load modules");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  const isEnrolled = (moduleId: string) => {
    return myEnrollments.some((e: any) => String(e.moduleId) === moduleId);
  };

  const handleEnroll = async (id: string) => {
    try {
      await API.post(`/modules/${id}/enroll`, {
        studentId: currentUser._id,
        studentName: currentUser.name
      });

      await showSuccess("Enrolled!", "You enrolled successfully");

      fetchData();
    } catch (err: any) {
      console.log(err?.response?.data || err);
      showError("Enroll Failed", err?.response?.data?.message || "Enroll failed");
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
      <h2>My Modules</h2>

      <div className="searchRow">
        <input
          placeholder="Search Module"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
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
            <h3>{m.moduleName}</h3>
            <p>{m.moduleCode}</p>
            <p>Semester: {m.semester}</p>
          </div>

          <div>
            {isEnrolled(m._id) ? (
              <button
                className="saveBtn"
                onClick={() => onOpenModule(m._id)}
              >
                Open Module
              </button>
            ) : (
              <button className="saveBtn" onClick={() => handleEnroll(m._id)}>
                Enroll
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default StudentModules;