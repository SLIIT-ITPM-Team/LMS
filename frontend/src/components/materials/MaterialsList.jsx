import React from "react";
import MaterialCard from "./MaterialCard";

const MaterialsList = ({ materials, onDownload, onDelete }) => {
  if (!materials.length) {
    return (
      <div className="empty-state">
        <h4>No materials yet</h4>
        <p className="muted">
          Upload your first PDF or DOCX to see it listed here. Summaries appear
          automatically for PDFs.
        </p>
      </div>
    );
  }

  return (
    <div className="materials-grid">
      {materials.map((item) => (
        <MaterialCard
          key={item._id}
          material={item}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default MaterialsList;
