'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Hls from 'hls.js';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  startTime?: number;
  endTime?: number;
  title?: string;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  startTime = 0,
  endTime,
  title,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current && videoUrl) {
      const video = videoRef.current;
      
      // Stop any previous video playback
      video.pause();
      video.src = '';
      video.load();
      
      setError(null);
      setLoading(true);

      // Check if URL is HLS (.m3u8)
      const isHLS = videoUrl.includes('.m3u8') || videoUrl.includes('hls') || videoUrl.includes('stream');

      // TwelveLabs CloudFront URLs are publicly accessible - no proxy needed
      const finalVideoUrl = videoUrl;
      
      if (isHLS && Hls.isSupported()) {
        // Clean up any existing HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Use HLS.js for HLS streams
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });

        hlsRef.current = hls;

        // Load the video source
        hls.loadSource(finalVideoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          // Don't auto-play, let user click play
          if (startTime !== undefined) {
            video.currentTime = startTime;
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          // Only log fatal errors to avoid Next.js dev overlay noise
          if (!data.fatal) {
            // Non-fatal errors (buffer gaps, etc.) are handled automatically by HLS.js
            return;
          }

          console.error('HLS fatal error:', {
            type: data.type,
            details: data.details,
            url: data.url,
          });

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                const errorMsg = data.details || data.err?.message || 'Network error loading video stream';
                const isManifestError = errorMsg.includes('manifest') || errorMsg.includes('levelLoadError');
                
                console.error('Fatal network error:', {
                  url: videoUrl,
                  errorDetails: errorMsg,
                  isManifestError,
                });
                
                // Show user-friendly error message
                if (isManifestError) {
                  setError(`Unable to load video manifest. Please check:\n1. Video is fully processed (status: COMPLETE)\n2. API key is configured correctly\n3. Network connection is stable`);
                } else {
                  setError(`Network error: ${errorMsg}. The video may still be processing or the URL may be invalid.`);
                }
                setLoading(false);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, attempting recovery...');
                try {
                  hls.recoverMediaError();
                } catch (recoverError) {
                  setError('Media error - unable to recover');
                  setLoading(false);
                }
                break;
              default:
                setError(`Failed to load video: ${data.details || 'Unknown error'}`);
                setLoading(false);
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });

        // Handle time updates
        const handleTimeUpdate = () => {
          setCurrentTime(video.currentTime);
          
          // Auto-stop at end time if specified
          if (endTime !== undefined && video.currentTime >= endTime) {
            video.pause();
            setIsPlaying(false);
          }
        };

        const handleLoadedMetadata = () => {
          setDuration(video.duration);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else if (isHLS && video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = videoUrl;
        
        const handleLoadedMetadata = () => {
          setDuration(video.duration);
          setLoading(false);
          if (startTime !== undefined) {
            video.currentTime = startTime;
          }
        };

        const handleTimeUpdate = () => {
          setCurrentTime(video.currentTime);
          if (endTime !== undefined && video.currentTime >= endTime) {
            video.pause();
            setIsPlaying(false);
          }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleError = () => {
          setError('Failed to load video');
          setLoading(false);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);

        video.load();

        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('error', handleError);
        };
      } else {
        // Regular video (MP4, etc.)
        video.src = videoUrl;
        
        const handleLoadedMetadata = () => {
          setDuration(video.duration);
          setLoading(false);
          if (startTime !== undefined) {
            video.currentTime = startTime;
          }
        };

        const handleTimeUpdate = () => {
          setCurrentTime(video.currentTime);
          if (endTime !== undefined && video.currentTime >= endTime) {
            video.pause();
            setIsPlaying(false);
          }
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleError = (e: Event) => {
          console.error('Video error:', e);
          setError('Failed to load video. The video format may not be supported.');
          setLoading(false);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);

        video.load();

        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('error', handleError);
        };
      }
    } else if (isOpen && !videoUrl) {
      setError('Video URL not available');
      setLoading(false);
    }
  }, [isOpen, videoUrl, startTime, endTime]);

  useEffect(() => {
    if (!isOpen) {
      // Stop and cleanup when modal closes
      const cleanup = () => {
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch (e) {
            // Ignore cleanup errors
          }
          hlsRef.current = null;
        }
        if (videoRef.current) {
          try {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            videoRef.current.currentTime = 0;
          } catch (e) {
            // Ignore cleanup errors (like AbortError)
          }
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setLoading(true);
        setError(null);
      };
      
      // Small delay to ensure any pending play() calls complete
      setTimeout(cleanup, 50);
    }
  }, [isOpen]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Ensure we're within the clip bounds if specified
      if (startTime !== undefined && videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      if (endTime !== undefined && videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime || 0;
      }
      
      // Use play() promise to handle AbortError gracefully
      try {
        await videoRef.current.play();
      } catch (error: any) {
        // Ignore AbortError - it happens when video is switched quickly
        if (error.name !== 'AbortError') {
          console.error('Play error:', error);
        }
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    const minTime = startTime || 0;
    const maxTime = endTime || duration;
    const clampedTime = Math.max(minTime, Math.min(maxTime, newTime));
    videoRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-[#FFFEF9] rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8E6E0]">
          <h3 className="text-lg font-semibold text-[#1E3A8A]">
            {title || 'Video Clip'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-[#475569]" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          {error ? (
            <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-white text-lg font-semibold mb-2">Video Playback Error</p>
              <p className="text-gray-300 text-sm text-center max-w-md">{error}</p>
              {videoUrl && (
                <p className="text-gray-400 text-xs mt-4 break-all max-w-md text-center">
                  URL: {videoUrl.substring(0, 100)}...
                </p>
              )}
            </div>
          ) : !videoUrl ? (
            <div className="aspect-video flex items-center justify-center bg-gray-900">
              <p className="text-white">Video URL not available</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full aspect-video"
              controls={false}
              playsInline
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Controls */}
        {videoUrl && !error && (
          <div className="p-4 space-y-3 bg-[#FFFEF9]">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={startTime || 0}
                max={endTime || duration}
                value={currentTime}
                onChange={handleSeek}
                step={0.1}
                className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>{formatTime(currentTime)}</span>
                {startTime !== undefined && endTime !== undefined ? (
                  <span className="text-[#2563EB] font-medium">
                    Clip: {formatTime(startTime)} - {formatTime(endTime)}
                  </span>
                ) : (
                  <span className="text-[#2563EB] font-medium">
                    Full Video
                  </span>
                )}
                <span>{formatTime(endTime || duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePlay}
                  size="sm"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="outline"
                  className="border-[#E2E8F0]"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-[#E2E8F0]"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

