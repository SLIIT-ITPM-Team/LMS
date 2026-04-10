import toast from 'react-hot-toast';

const SummaryViewer = ({ course, onDownloadComplete }) => {

  const handleDownloadPDF = () => {
    if (!course.summaryPdfUrl) {
      toast.error('No PDF available for download');
      return;
    }

    // Direct link download — avoids blob/proxy issues entirely
    const filename = `${course.title.replace(/\s+/g, '_')}_summary.pdf`;
    const link = document.createElement('a');
    link.href = course.summaryPdfUrl;          // e.g. /uploads/course-summary-xyz.pdf
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('PDF download started');
    onDownloadComplete && onDownloadComplete();
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
            disabled={!course.summaryPdfUrl}
            className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Summary Content */}
      {course.summaryText ? (
        <>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3">
            {course.summaryText.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              // Bold heading: **text**
              if (/^\*\*(.+)\*\*$/.test(trimmed)) {
                return (
                  <h3 key={i} className="text-base font-bold text-blue-800 mt-4 first:mt-0">
                    {trimmed.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              // Bullet: * text or - text
              if (/^[*-]\s+/.test(trimmed)) {
                return (
                  <div key={i} className="flex gap-2 text-gray-700 text-sm leading-relaxed">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    <span>{trimmed.replace(/^[*-]\s+/, '').replace(/\*\*/g, '')}</span>
                  </div>
                );
              }
              // Normal paragraph
              return (
                <p key={i} className="text-gray-800 text-sm leading-relaxed">
                  {trimmed.replace(/\*\*/g, '')}
                </p>
              );
            })}
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