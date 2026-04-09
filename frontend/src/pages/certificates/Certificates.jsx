import React, { useState } from 'react';
import CertificateCard from '../../components/certificates/CertificateCard';
import '../../styles/certificates.css';

const Certificates = () => {
  const [selectedMode, setSelectedMode] = useState('professional');

  // Sample certificate data - in production, this would come from an API
  const sampleCertificates = [
    {
      id: 'CERT-2024-001',
      recipientName: 'John Doe',
      courseName: 'Introduction to Computer Networks',
      courseDescription: 'A comprehensive course covering fundamental concepts of computer networks, including TCP/IP, routing protocols, and network security.',
      issueDate: '2024-03-15',
      instructorName: 'Dr. Jane Smith',
    },
    {
      id: 'CERT-2024-002',
      recipientName: 'John Doe',
      courseName: 'Object-Oriented Programming',
      courseDescription: 'Master the principles of OOP including encapsulation, inheritance, polymorphism, and design patterns.',
      issueDate: '2024-02-20',
      instructorName: 'Prof. Alan Johnson',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
            <p className="mt-2 text-sm text-slate-600">
              View and download your course completion certificates
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setSelectedMode('professional')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedMode === 'professional'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => setSelectedMode('classic')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedMode === 'classic'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Classic
            </button>
          </div>
        </div>

        {/* Certificate List */}
        {sampleCertificates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No certificates yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Complete courses to earn your certificates
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sampleCertificates.map((cert, index) => (
              <div key={cert.id} className="certificate-list-item">
                {/* Certificate Info Header */}
                <div className="mb-4 flex items-center justify-between rounded-t-xl border border-slate-200 bg-white px-6 py-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{cert.courseName}</h3>
                    <p className="text-sm text-slate-500">
                      Issued on {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Certificate Preview */}
                <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-white shadow-sm">
                  <div className="certificate-preview-container" style={{ overflow: 'auto' }}>
                    <div className="certificate-preview-scale" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '166.67%' }}>
                      <CertificateCard
                        recipientName={cert.recipientName}
                        courseName={cert.courseName}
                        courseDescription={cert.courseDescription}
                        issueDate={cert.issueDate}
                        certificateId={cert.id}
                        instructorName={cert.instructorName}
                        mode={selectedMode}
                        showSeal={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Certificates;