import { useEffect, useState } from "react";
import API from "../services/api";

type ReportsPageProps = {
  onBack: () => void;
};

function ReportsPage({ onBack }: ReportsPageProps) {
  const [workload, setWorkload] = useState<any[]>([]);
  const [semesterReport, setSemesterReport] = useState<any[]>([]);

  const [showAllWorkload, setShowAllWorkload] = useState(false);
  const [showAllSemester, setShowAllSemester] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const workloadRes = await API.get("/reports/workload");
      const semesterRes = await API.get("/reports/semester");

      setWorkload(workloadRes.data);
      setSemesterReport(semesterRes.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load reports");
    }
  };

  const displayedWorkload = showAllWorkload ? workload : workload.slice(0, 5);
  const displayedSemester = showAllSemester
    ? semesterReport
    : semesterReport.slice(0, 5);

  const handleExportWorkload = () => {
    const csvRows = [
      ["Lecturer Name", "Module ID", "Module Name", "Semester"],
      ...workload.map((row) => [
        row.lecturerName,
        row.moduleCode,
        row.moduleName,
        row.semester
      ])
    ];

    downloadCSV(csvRows, "lecturer_workload_report.csv");
  };

  const handleExportSemester = () => {
    const csvRows = [
      ["Semester", "Module Name", "Module ID"],
      ...semesterReport.map((row) => [
        row.semester,
        row.moduleName,
        row.moduleCode
      ])
    ];

    downloadCSV(csvRows, "semester_module_report.csv");
  };

  const downloadCSV = (rows: string[][], fileName: string) => {
    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <button className="cancelBtn" onClick={onBack}>
          Back
        </button>
      </div>

      <h2 style={{ marginBottom: "20px" }}>Reports</h2>

      <div className="reportCard">
        <div className="reportHeader">
          <h3>Lecturer Workload Report</h3>

          <div className="reportActions">
            <button
              className="reportBtn"
              onClick={() => setShowAllWorkload(!showAllWorkload)}
            >
              👁 {showAllWorkload ? "Hide" : "View"}
            </button>

            <button className="reportBtn" onClick={handleExportWorkload}>
              📄 Export
            </button>
          </div>
        </div>

        <table className="reportTable">
          <thead>
            <tr>
              <th>Lecturer Name</th>
              <th>Module ID</th>
              <th>Module Name</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
            {displayedWorkload.map((item, index) => (
              <tr key={index}>
                <td>{item.lecturerName}</td>
                <td>{item.moduleCode}</td>
                <td>{item.moduleName}</td>
                <td>{item.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="reportInfo">
          Showing {displayedWorkload.length} of {workload.length} records
        </p>
      </div>

      <div className="reportCard">
        <div className="reportHeader">
          <h3>Semester Module Report</h3>

          <div className="reportActions">
            <button
              className="reportBtn"
              onClick={() => setShowAllSemester(!showAllSemester)}
            >
              👁 {showAllSemester ? "Hide" : "View"}
            </button>

            <button className="reportBtn" onClick={handleExportSemester}>
              📄 Export
            </button>
          </div>
        </div>

        <table className="reportTable">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Module Name</th>
              <th>Module ID</th>
            </tr>
          </thead>
          <tbody>
            {displayedSemester.map((item, index) => (
              <tr key={index}>
                <td>{item.semester}</td>
                <td>{item.moduleName}</td>
                <td>{item.moduleCode}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="reportInfo">
          Showing {displayedSemester.length} of {semesterReport.length} records
        </p>
      </div>
    </>
  );
}

export default ReportsPage;