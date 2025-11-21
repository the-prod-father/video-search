'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Video, AlertCircle, Play, Loader2 } from 'lucide-react';
import VideoPlayerModal from '@/components/VideoPlayerModal';

interface Index {
  id: string;
  name: string;
}

interface SearchResult {
  score: number;
  start: number;
  end: number;
  video_id: string;
  confidence: string;
  thumbnail_url?: string;
  transcription?: string;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedClip, setSelectedClip] = useState<{
    videoId: string;
    videoUrl: string | null;
    startTime: number;
    endTime: number;
    title?: string;
  } | null>(null);
  const [loadingVideoUrl, setLoadingVideoUrl] = useState(false);

  useEffect(() => {
    fetchIndexes();
    // Check if indexId is provided in URL params using Next.js useSearchParams
    const indexIdParam = searchParams.get('indexId');
    if (indexIdParam) {
      setSelectedIndex(indexIdParam);
    }
  }, [searchParams]);


  const fetchIndexes = async () => {
    try {
      const response = await fetch('/api/indexes');
      const data = await response.json();
      setIndexes(data.indexes || []);
      if (data.indexes.length > 0) {
        setSelectedIndex(data.indexes[0].id);
      }
    } catch (error) {
      console.error('Error fetching indexes:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !selectedIndex) return;

    setSearching(true);
    setError('');
    setResults([]);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indexId: selectedIndex,
          query: query.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setProcessingTime(data.processingTime);
      } else {
        setError(data.error || 'Search failed. Please try again.');
      }
    } catch (error) {
      setError('Could not connect. Please check your internet connection.');
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Possible Match';
  };

  const handleWatchClip = async (result: SearchResult) => {
    const videoId = result.video_id || '';
    if (!videoId) {
      setError('Video ID not available');
      return;
    }

    setLoadingVideoUrl(true);
    try {
      // Find the index ID from the selected index
      const index = indexes.find(i => i.id === selectedIndex);
      if (!index) {
        throw new Error('Index not found');
      }

      // Fetch video details to get the HLS URL
      const videoResponse = await fetch(`/api/videos?indexId=${selectedIndex}`);
      const videoData = await videoResponse.json();
      
      if (!videoResponse.ok) {
        throw new Error(videoData.error || 'Failed to fetch video details');
      }

      const video = videoData.videos?.find((v: any) => v.id === videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // Check both video_url and videoUrl formats
      const videoUrl = video.hls?.video_url || video.hls?.videoUrl || null;
      const hlsStatus = video.hls?.status;
      
      console.log('Video details:', {
        videoId,
        hls: video.hls,
        videoUrl,
        hasHls: !!video.hls,
        hlsStatus,
        fullVideo: video,
      });
      
      if (!videoUrl) {
        throw new Error(
          `Video URL not available. HLS status: ${hlsStatus || 'unknown'}. ` +
          `The video may still be processing. Please try again later.`
        );
      }

      // Accept various completion statuses: 'ready', 'COMPLETE', 'complete', etc.
      const isReady = !hlsStatus || 
        hlsStatus.toLowerCase() === 'ready' || 
        hlsStatus.toLowerCase() === 'complete' ||
        hlsStatus.toLowerCase() === 'completed';
      
      if (!isReady) {
        throw new Error(
          `Video is not ready for playback. Status: ${hlsStatus}. ` +
          `Please wait for processing to complete and try again.`
        );
      }
      
      setSelectedClip({
        videoId,
        videoUrl,
        startTime: result.start,
        endTime: result.end,
        title: video.metadata?.filename || 'Video Clip',
      });
    } catch (error: any) {
      console.error('Error loading video:', error);
      setError(error.message || 'Failed to load video');
    } finally {
      setLoadingVideoUrl(false);
    }
  };

  const exampleQueries = [
    'person with white shirt',
    'person appearing multiple times',
    'inside building',
    'outdoor location',
    'daytime scene',
    'nighttime scene',
    'person walking',
    'person standing still',
    'person talking',
    'person running',
    'vehicle in frame',
    'multiple people together',
    'person entering room',
    'person leaving area',
    'person carrying object',
  ];


  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Simple Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🔍 Search Your Videos</h1>
        <p className="text-xl text-muted-foreground">
          Type what you're looking for in plain English
        </p>
        {selectedIndex && indexes.find(i => i.id === selectedIndex) && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD]">
            <span className="text-sm font-medium text-[#0369A1]">
              🔍 Searching case: <span className="font-semibold">{indexes.find(i => i.id === selectedIndex)?.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Big Search Box */}
      <Card className="border-2">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input - BIG and CLEAR */}
            <div>
              <label className="text-lg font-semibold mb-3 block">
                What are you looking for?
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type here... (e.g., 'person demonstrating device')"
                  className="flex-1 px-6 py-4 text-lg border-2 rounded-lg bg-background focus:ring-2 focus:ring-blue-500"
                  disabled={searching || indexes.length === 0}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={searching || !query.trim() || indexes.length === 0}
                  size="lg"
                  className="px-8 text-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Example Queries - Swipeable Horizontal Scroll */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                💡 Click an example to try:
              </p>
              
              {/* Horizontal Scrollable Container */}
              <div className="relative">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1">
                  {exampleQueries.map((example) => (
                    <Button
                      key={example}
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setQuery(example)}
                      disabled={searching}
                      className="text-sm sm:text-base whitespace-nowrap flex-shrink-0 snap-start border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F0F9FF] transition-all px-4 sm:px-6"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
                
                {/* Gradient Fade Indicators */}
                <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-[#FFFEF9] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#FFFEF9] to-transparent pointer-events-none" />
              </div>
              
              {/* Swipe Hint */}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Swipe or scroll to see more examples
              </p>
            </div>

            {/* Index Selection - Hidden if only one */}
            {indexes.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search in:
                </label>
                <select
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 rounded-lg bg-background"
                >
                  {indexes.map((index) => (
                    <option key={index.id} value={index.id}>
                      {index.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Error Message - Big and Clear */}
      {error && (
        <Card className="border-2 border-red-500 bg-red-50">
          <CardContent className="flex items-center space-x-3 py-6">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <p className="text-lg text-red-900 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {searching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-xl font-semibold">Searching your videos...</p>
            <p className="text-muted-foreground">This usually takes less than a second</p>
          </CardContent>
        </Card>
      )}

      {/* Results - BIG VISUAL CARDS */}
      {!searching && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-900">
              ✅ Found {results.length} {results.length === 1 ? 'result' : 'results'}!
            </h2>
            <div className="flex items-center space-x-2 text-green-700">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-semibold">{(processingTime / 1000).toFixed(2)}s</span>
            </div>
          </div>

          <div className="grid gap-6">
            {results.map((result, index) => {
              const videoId = result.video_id || '';
              const score = Math.round(result.score);

              return (
                <Card key={`${videoId}-${index}`} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Thumbnail - BIG and VISUAL */}
                    <div className="relative aspect-video md:aspect-auto bg-muted">
                      {result.thumbnail_url ? (
                        <img
                          src={result.thumbnail_url}
                          alt="Video moment"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Video className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/80 px-3 py-1 rounded">
                        <Play className="inline h-4 w-4 mr-1 text-white" />
                        <span className="text-white font-semibold">
                          {formatTime(result.start)} - {formatTime(result.end)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 p-6 space-y-4">
                      {/* Match Score - BIG and CLEAR */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Match Quality</p>
                          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
                            {score}%
                          </p>
                        </div>
                        <Badge
                          variant={score >= 80 ? 'default' : 'secondary'}
                          className="text-lg px-4 py-2"
                        >
                          {getScoreLabel(score)}
                        </Badge>
                      </div>

                      {/* Transcription - What was said */}
                      {result.transcription && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-semibold text-muted-foreground mb-1">
                            💬 What was said:
                          </p>
                          <p className="text-base leading-relaxed">
                            "{result.transcription.substring(0, 200)}
                            {result.transcription.length > 200 ? '...' : ''}"
                          </p>
                        </div>
                      )}

                      {/* Clip Duration */}
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-semibold">Starts at:</span> {formatTime(result.start)}
                        </div>
                        <div>
                          <span className="font-semibold">Ends at:</span> {formatTime(result.end)}
                        </div>
                        <div>
                          <span className="font-semibold">Duration:</span> {Math.round(result.end - result.start)}s
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="lg" 
                        className="w-full md:w-auto"
                        onClick={() => handleWatchClip(result)}
                        disabled={loadingVideoUrl || searching}
                      >
                        {loadingVideoUrl ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-5 w-5" />
                            Watch This Clip
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results - Only show after a search has been performed */}
      {!searching && hasSearched && results.length === 0 && query && !error && (
        <Card className="border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-24 w-24 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold mb-3">No matches found</h3>
            <p className="text-xl text-muted-foreground mb-6 max-w-md">
              Try using different words or one of the example searches above
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setQuery(exampleQueries[0]);
                setHasSearched(false);
              }}
            >
              Try an example search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Video Player Modal */}
      {selectedClip && (
        <VideoPlayerModal
          isOpen={!!selectedClip}
          onClose={() => setSelectedClip(null)}
          videoUrl={selectedClip.videoUrl}
          startTime={selectedClip.startTime}
          endTime={selectedClip.endTime}
          title={selectedClip.title}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] mx-auto" />
          <p className="text-[#64748B]">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
