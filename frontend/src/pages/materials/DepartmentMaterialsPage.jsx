import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { downloadMaterial, getAllMaterials, openMaterialInNewTab } from "../../api/material.api";

const YEAR_OPTIONS = ["Year 1", "Year 2", "Year 3", "Year 4"];

const toDepartmentCodes = (name = "") => {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) return [];

  const words = normalizedName.match(/[A-Za-z0-9]+/g) || [];
  const compact = normalizedName.replace(/\s+/g, "").toUpperCase();
  const initials = words.map((word) => word[0]).join("").toUpperCase();

  const codes = new Set();
  if (compact) codes.add(compact);
  if (initials) codes.add(initials);
  if (words.length === 1) {
    codes.add(words[0].toUpperCase());
    codes.add(words[0].slice(0, 5).toUpperCase());
  }

  if (normalizedName.toLowerCase().includes("cyber")) {
    codes.add("CYBER");
  }

  return Array.from(codes);
};

const matchesDepartmentCode = (departmentName, routeDepartmentCode) => {
  const routeCode = String(routeDepartmentCode || "").trim().toUpperCase();
  if (!routeCode) return true;

  const deptCodes = toDepartmentCodes(departmentName);
  return deptCodes.some((code) => code === routeCode || code.startsWith(routeCode) || routeCode.startsWith(code));
};

const DepartmentMaterialsPage = ({ materialType, headingLabel, buttonLabel }) => {
  const navigate = useNavigate();
  const { department } = useParams();
  const departmentCode = String(department || "").trim();

  const [selectedYear, setSelectedYear] = useState(YEAR_OPTIONS[0]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await getAllMaterials({
          limit: 500,
          sort: "latest",
          materialType,
        });

        const rows = response?.data || [];
        const filtered = rows.filter(
          (item) =>
            item?.submissionStatus === "approved" &&
            matchesDepartmentCode(item?.department?.name || "", departmentCode)
        );

        setMaterials(filtered);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load materials");
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, [departmentCode, materialType]);

  const yearMaterials = useMemo(() => {
    return materials.filter((item) => !item.academicYear || item.academicYear === selectedYear);
  }, [materials, selectedYear]);

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
            Materials / {headingLabel} / {departmentCode.toUpperCase()}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            {departmentCode.toUpperCase()} {headingLabel}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Select an academic year to view materials uploaded by admins.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">{selectedYear} Materials</h2>

            {isLoading ? (
              <p className="mt-4 text-sm text-slate-600">Loading materials...</p>
            ) : yearMaterials.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No materials found for this department and year.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {yearMaterials.map((material) => (
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
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await openMaterialInNewTab(material._id);
                        } catch (error) {
                          toast.error(error?.response?.data?.message || "Failed to open material");
                        }
                      }}
                      className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
                      className="mt-3 ml-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Download
                    </button>
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
