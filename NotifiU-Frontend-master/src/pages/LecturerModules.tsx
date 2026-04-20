import { useEffect, useState } from "react";
import API from "../services/api";

type LecturerModulesProps = {
  onOpen: (id: string) => void;
};

function LecturerModules({ onOpen }: LecturerModulesProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules");
      setModules(res.data.filter((m: any) => !m.archived));
    } catch (err) {
      console.log(err);
      alert("Failed to load modules");
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

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

      {filteredModules.length === 0 && <p>No modules assigned</p>}

      {filteredModules.map((m: any) => (
        <div key={m._id} className="moduleRow">
          <div>
            <h3>{m.moduleName}</h3>
            <p>{m.moduleCode}</p>
            <p>Semester: {m.semester}</p>
          </div>

          <div>
            <button
              className="saveBtn"
              onClick={() => onOpen(m._id)}
            >
              Open Module
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default LecturerModules;