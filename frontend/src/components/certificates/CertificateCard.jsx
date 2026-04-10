import React, { useRef } from 'react';
import '../../styles/certificates.css';

const CertificateCard = ({
  recipientName,
  courseName,
  courseDescription,
  issueDate,
  certificateId,
  instructorName = 'Course Instructor',
  institutionName = 'Learning Management System',
  mode = 'professional', // 'professional' or 'classic'
  showSeal = true,
  showRibbon = false,
  showQRPlaceholder = false,
}) => {
  const certificateRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // For a production app, you would use html2canvas or similar
    // to generate a PDF/image. For now, we'll trigger print dialog.
    handlePrint();
  };

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="certificate-wrapper">
      <div
        ref={certificateRef}
        className={`certificate-container certificate--${mode}`}
      >
        {/* Decorative Border */}
        <div className="certificate-border"></div>

        {/* Corner Ornaments */}
        <div className="certificate-corner certificate-corner--top-left"></div>
        <div className="certificate-corner certificate-corner--top-right"></div>
        <div className="certificate-corner certificate-corner--bottom-left"></div>
        <div className="certificate-corner certificate-corner--bottom-right"></div>

        {/* Corner Diamond Accents */}
        <div className="certificate-corner-diamond certificate-corner-diamond--top-left"></div>
        <div className="certificate-corner-diamond certificate-corner-diamond--top-right"></div>
        <div className="certificate-corner-diamond certificate-corner-diamond--bottom-left"></div>
        <div className="certificate-corner-diamond certificate-corner-diamond--bottom-right"></div>

        {/* Side Decorative Elements */}
        <div className="certificate-side-decoration certificate-side-decoration--left"></div>
        <div className="certificate-side-decoration certificate-side-decoration--right"></div>

        {/* Optional Ribbon Badge */}
        {showRibbon && (
          <div className="certificate-ribbon"></div>
        )}

        {/* Watermark */}
        <div className="certificate-watermark">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <polygon points="50,20 60,45 85,45 65,60 72,85 50,70 28,85 35,60 15,45 40,45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="certificate-content">
          {/* Header */}
          <div className="certificate-header">
            <div className="certificate-logo">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke={mode === 'professional' ? '#0f3460' : '#c9a84c'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h1 className="certificate-title">Certificate</h1>
            <p className="certificate-subtitle">of Completion</p>
          </div>

          {/* Decorative Line with Diamond Center */}
          <div className="certificate-line"></div>

          {/* Body */}
          <div className="certificate-body">
            <p className="certificate-presented-to">This is to certify that</p>
            <h2 className="certificate-recipient">{recipientName}</h2>
            <p className="certificate-achievement">
              has successfully completed the course
            </p>
            <p className="certificate-course-name">{courseName}</p>
            {courseDescription && (
              <p
                className="certificate-achievement"
                style={{ marginTop: '15px', fontSize: '13px' }}
              >
                {courseDescription}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="certificate-footer">
            <div className="certificate-signature-block">
              <div className="certificate-signature-line"></div>
              <p className="certificate-signature-name">{instructorName}</p>
              <p className="certificate-signature-title">Course Instructor</p>
            </div>

            {showSeal && (
              <div className="certificate-seal">
                <span>Verified</span>
              </div>
            )}

            <div className="certificate-meta">
              <p className="certificate-id">ID: {certificateId || 'CERT-2024-001'}</p>
              <p className="certificate-date">{formattedDate}</p>
            </div>
          </div>

          {/* Optional QR Code Placeholder */}
          {showQRPlaceholder && (
            <div className="certificate-qr-placeholder">
              QR Code
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (not printed) */}
      <div className="certificate-actions">
        <button onClick={handleDownload} className="btn-download">
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;