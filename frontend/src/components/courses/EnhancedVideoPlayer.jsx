import React, { useEffect, useMemo, useState } from 'react';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';

const EnhancedVideoPlayer = ({ videoUrl, title, onVideoEnd }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedUrl = useMemo(() => {
    if (!videoUrl) return '';

    const trimmed = String(videoUrl).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }, [videoUrl]);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  };

  const youtubeId = useMemo(() => getYouTubeVideoId(normalizedUrl), [normalizedUrl]);
  const isYouTube = Boolean(youtubeId);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(true);
  }, [normalizedUrl]);

  useEffect(() => {
    if (!isLoading || error || !isYouTube) return;

    const timeout = setTimeout(() => {
      setError('Video took too long to load. Please open in YouTube.');
      setIsLoading(false);
    }, 12000);

    return () => clearTimeout(timeout);
  }, [isLoading, error, isYouTube]);

  const handlePlay = () => {
    if (isYouTube) {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setIsPlaying(true);
    setIsLoading(false);
    setError(null);
  };

  const handlePause = () => {
    if (isYouTube) return;
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onVideoEnd && onVideoEnd();
  };

  const handleError = (playerError) => {
    console.error('Video player error:', playerError);

    setError('Failed to load video. Please check the URL and try again.');
    setIsLoading(false);
    toast.error('Failed to load video');
  };

  const handleReady = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => (isYouTube ? handlePlay() : setIsPlaying(!isPlaying))}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isYouTube
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : isPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isYouTube ? 'Open in YouTube' : isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-center">
              <div className="text-red-500 mb-2">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {isYouTube ? (
          <iframe
            title={title || 'Course Video'}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full"
            style={{ minHeight: '300px' }}
            onLoad={() => {
              setIsLoading(false);
              setError(null);
            }}
          />
        ) : (
          <ReactPlayer
            url={normalizedUrl}
            playing={isPlaying}
            controls
            playsinline
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
            onReady={handleReady}
            onStart={() => setIsLoading(false)}
            onBuffer={() => setIsLoading(true)}
            onBufferEnd={() => setIsLoading(false)}
            width="100%"
            height="100%"
            style={{ minHeight: '300px' }}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  rel: 0,
                  modestbranding: 1,
                },
              },
            }}
          />
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Video URL: {normalizedUrl || 'N/A'}</p>
        <p className="mt-1">
          {isYouTube
            ? 'Tip: This is playing through YouTube embed for better compatibility.'
            : 'Tip: If playback fails, try opening the video URL directly in a new tab.'}
        </p>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;