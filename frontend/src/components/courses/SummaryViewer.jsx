import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { courseApi } from '../../api/course.api';

const SummaryViewer = ({ course, onDownloadComplete }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!course.summaryPdfUrl) {
      toast.error('No PDF available for download');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await courseApi.downloadPDF(course.summaryPdfUrl);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course.title.replace(/\s+/g, '_')}_summary.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
      onDownloadComplete && onDownloadComplete();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(course.summaryText);
      toast.success('Summary copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Course Summary</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleCopyToClipboard}
            disabled={!course.summaryText}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Copy Text
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || !course.summaryPdfUrl}
            className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </span>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>
      </div>

      {/* Summary Content */}
      {course.summaryText ? (
        <>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="prose prose-indigo max-w-none">
              <p className="text-gray-800 leading-relaxed">
                {course.summaryText}
              </p>
            </div>
          </div>

          {/* Course Info */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>Generated on: {new Date(course.createdAt).toLocaleDateString()}</span>
            <span>Word count: {course.summaryText?.split(/\s+/).length || 0}</span>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-amber-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Summary Not Available</h3>
          <p className="text-amber-800 mb-4">
            This course does not have a summary yet. This can happen if the video has no captions or the summary generation was skipped.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-amber-700">
              <strong>To enable summary:</strong>
            </p>
            <ul className="text-sm text-amber-700 space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Check if the video has captions enabled on YouTube</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>If using admin panel, edit the course and add a manual transcript</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Click regenerate to process the new transcript</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryViewer;