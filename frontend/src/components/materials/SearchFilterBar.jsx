import React, { useState } from "react";

const SearchFilterBar = ({ onApply, loading }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [module, setModule] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({ search, type, module });
  };

  const handleReset = () => {
    setSearch("");
    setType("all");
    setModule("");
    onApply({ search: "", type: "all", module: "" });
  };

  return (
    <form className="search-bar surface" onSubmit={handleSubmit}>
      <div className="form-group grow">
        <label className="muted tiny" htmlFor="material-search">
          Search title
        </label>
        <input
          id="material-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials..."
        />
      </div>

      <div className="form-group">
        <label className="muted tiny" htmlFor="material-type">
          File type
        </label>
        <select
          id="material-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
        </select>
      </div>

      <div className="form-group">
        <label className="muted tiny" htmlFor="material-module">
          Module
        </label>
        <input
          id="material-module"
          type="text"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          placeholder="e.g. CS204"
        />
      </div>

      <div className="actions">
        <button className="btn ghost" type="button" onClick={handleReset}>
          Reset
        </button>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
    </form>
  );
};

export default SearchFilterBar;
