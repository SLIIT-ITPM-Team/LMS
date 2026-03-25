import React, { useState } from "react";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const truncate = (text, len = 240) => {
  if (!text) return "";
  if (text.length <= len) return text;
  return `${text.slice(0, len)}…`;
};

const MaterialCard = ({ material, onDownload, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    title,
    description,
    fileType,
    createdAt,
    summaryText,
    module,
    _id,
  } = material;

  const hasLongSummary = summaryText && summaryText.length > 260;
  const displayedSummary =
    expanded || !hasLongSummary ? summaryText : truncate(summaryText, 240);

  const badgeColor =
    fileType?.toLowerCase() === "pdf" ? "badge red" : "badge blue";

  return (
    <div className="card material-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">{module || "General"}</p>
          <h4 className="card-title">{title}</h4>
          <p className="muted">{description || "No description provided."}</p>
        </div>
        <div className="card-actions">
          <span className={badgeColor}>{fileType?.toUpperCase() || "FILE"}</span>
          <span className="muted tiny">Added {formatDate(createdAt)}</span>
        </div>
      </div>

      <div className="summary-block">
        <p className="summary-title">Summary</p>
        <p className="summary-text">
          {displayedSummary || "Summary not available for this file yet."}
        </p>
        {hasLongSummary && (
          <button
            className="link-button"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      <div className="card-footer">
        <button className="btn ghost" onClick={() => onDownload(_id)}>
          Download
        </button>
        {onDelete && (
          <button className="btn danger" onClick={() => onDelete(_id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialCard;
