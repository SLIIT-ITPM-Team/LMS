import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { downloadMaterial, getAllMaterials, getMaterialHierarchy, openMaterialInNewTab } from "../../api/material.api";

const YEAR_OPTIONS = ["Year 1", "Year 2", "Year 3", "Year 4"];
const SEMESTER_OPTIONS = ["1st Semester", "2nd Semester"];

const DepartmentMaterialsPage = ({ materialType, headingLabel, buttonLabel }) => {
  const navigate = useNavigate();
  const { department: departmentId } = useParams();

  const [selectedYear, setSelectedYear] = useState(YEAR_OPTIONS[0]);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTER_OPTIONS[0]);
  const [materials, setMaterials] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!departmentId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [materialsResponse, hierarchyResponse] = await Promise.all([
          getAllMaterials({ departmentId, materialType, limit: 500, sort: "latest" }),
          getMaterialHierarchy(),
        ]);

        setMaterials(materialsResponse?.data || []);

        const dept = (hierarchyResponse?.data?.departments || []).find(
          (d) => String(d._id) === String(departmentId)
        );
        setDepartmentName(dept?.name || "");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load materials");
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [departmentId, materialType]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const yearMatch = !item.academicYear || item.academicYear === selectedYear;
      const semesterMatch = !item.academicSemester || item.academicSemester === selectedSemester;
      return yearMatch && semesterMatch;
    });
  }, [materials, selectedYear, selectedSemester]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-blue-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-10 h-80 w-80 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-pink-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 md:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8">
          <button
            type="button"
            onClick={() => navigate("/materials")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
            Back to Materials
          </button>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Materials / {headingLabel}{departmentName ? ` / ${departmentName}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            {departmentName || "Loading..."} {headingLabel}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Select an academic year and semester to view materials.
          </p>

          {/* Year selector */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Academic Year</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {YEAR_OPTIONS.map((yearLabel) => {
                const isActive = yearLabel === selectedYear;
                return (
                  <button
                    key={yearLabel}
                    type="button"
                    onClick={() => setSelectedYear(yearLabel)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200"
                        : "border-white/70 bg-white/90 text-slate-800 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    {yearLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semester selector */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Semester</p>
            <div className="flex gap-3">
              {SEMESTER_OPTIONS.map((semester) => {
                const isActive = semester === selectedSemester;
                return (
                  <button
                    key={semester}
                    type="button"
                    onClick={() => setSelectedSemester(semester)}
                    className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-200"
                        : "border-white/70 bg-white/90 text-slate-800 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                    }`}
                  >
                    {semester}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materials list */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedYear} — {selectedSemester}
            </h2>

            {isLoading ? (
              <p className="mt-4 text-sm text-slate-600">Loading materials...</p>
            ) : filteredMaterials.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No materials found for {selectedYear}, {selectedSemester}.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {filteredMaterials.map((material) => (
                  <article
                    key={material._id}
                    className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-md"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      {material.moduleCode || material?.module?.code || "MODULE"}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{material.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {material.description || "No description provided."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await openMaterialInNewTab(material._id);
                          } catch (error) {
                            toast.error(error?.response?.data?.message || "Failed to open material");
                          }
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        {buttonLabel}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await downloadMaterial(material._id);
                          } catch (error) {
                            toast.error(error?.response?.data?.message || "Failed to download material");
                          }
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Download
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DepartmentMaterialsPage;
