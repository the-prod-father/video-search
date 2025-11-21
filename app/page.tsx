'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Clock,
  Search,
  Database,
  Play,
  Sparkles,
  FileVideo,
  TrendingUp,
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Eye,
  Fingerprint,
  AlertTriangle,
  FileSearch
} from 'lucide-react';
import VideoPlayerModal from '@/components/VideoPlayerModal';

interface Index {
  id: string;
  name: string;
  videoCount: number;
  totalDuration: number;
}

interface VideoItem {
  id: string;
  metadata?: {
    filename?: string;
    duration?: number;
    recordedOn?: string;
    location?: string;
    officer?: string;
    scenario?: string;
    [key: string]: any; // Allow additional metadata properties
  };
  createdAt: string;
  thumbnailUrl?: string;
  indexId?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [evidenceVideos, setEvidenceVideos] = useState<any[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidenceSuccess, setEvidenceSuccess] = useState(false);
  const [evidenceSource, setEvidenceSource] = useState<string | null>(null);
  const [evidenceEndpoint, setEvidenceEndpoint] = useState<string | null>(null);
  const [videoAnalyses, setVideoAnalyses] = useState<Record<string, any>>({});
  const [selectedVideo, setSelectedVideo] = useState<{
    videoUrl: string | null;
    title: string;
  } | null>(null);
  const [loadingVideoUrl, setLoadingVideoUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const indexResponse = await fetch('/api/indexes');
      const indexData = await indexResponse.json();
      const indexesList = indexData.indexes || [];
      setIndexes(indexesList);

      if (indexesList.length > 0) {
        const videoResponse = await fetch(`/api/videos?indexId=${indexesList[0].id}`);
        const videoData = await videoResponse.json();
        setVideos((videoData.videos || []).map((v: VideoItem) => ({
          ...v,
          indexId: indexesList[0].id
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const syncFromEvidence = async () => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    setEvidenceSuccess(false);
    setEvidenceSource(null);
    setEvidenceEndpoint(null);

    try {
      // Try real API first
      let response = await fetch('/api/evidence/videos');
      let data = await response.json();

      // If real API fails, fallback to demo mode
      if (!response.ok) {
        console.log('Real API failed, using demo mode:', data.error);
        response = await fetch('/api/evidence/videos?demo=true');
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Evidence.com videos');
      }

      // Track source information
      const isDemo = data.demo === true || data.source === 'evidence.com (demo)';
      setEvidenceSource(isDemo ? 'Demo Data' : 'Evidence.com API');
      setEvidenceEndpoint(data.endpoint || (isDemo ? 'Demo Mode' : 'Unknown'));
      
      console.log('Evidence sync result:', {
        source: isDemo ? 'Demo Data' : 'Evidence.com API',
        endpoint: data.endpoint,
        count: data.videos?.length || 0,
        demo: isDemo,
        fullResponse: data
      });

      setEvidenceVideos(data.videos || []);
      setEvidenceSuccess(true);
    } catch (error: any) {
      console.error('Error syncing Evidence.com:', error);
      setEvidenceError(error.message);
    } finally {
      setEvidenceLoading(false);
    }
  };

      const fetchSpecificEvidence = async (evidenceId: string) => {
    setEvidenceLoading(true);
    setEvidenceError(null);
    setEvidenceSuccess(false);
    setEvidenceSource(null);
    setEvidenceEndpoint(null);

    try {
      const response = await fetch(`/api/evidence/${evidenceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch evidence ${evidenceId}`);
      }

      if (data.evidence) {
        // Track source information
        setEvidenceSource(data.source || 'Evidence.com API');
        setEvidenceEndpoint(data.endpoint || 'Unknown');
        
        console.log('Specific evidence fetch result:', {
          source: data.source,
          endpoint: data.endpoint,
          authMethod: data.authMethod,
          evidenceId: evidenceId,
          hasFiles: !!data.files,
          fileCount: data.files?.length || 0
        });

        // Add the specific evidence to the list
        setEvidenceVideos([data.evidence]);
        setEvidenceSuccess(true);
      } else {
        throw new Error('No evidence data returned');
      }
    } catch (error: any) {
      console.error('Error fetching specific evidence:', error);
      setEvidenceError(error.message);
    } finally {
      setEvidenceLoading(false);
    }
  };

  const totalVideos = indexes.reduce((sum, idx) => sum + idx.videoCount, 0);
  const totalDuration = indexes.reduce((sum, idx) => sum + idx.totalDuration, 0);

  const handlePlayVideo = async (video: VideoItem) => {
    if (!video.id || !video.indexId) {
      console.error('Video ID or Index ID missing');
      return;
    }

    // Close any currently playing video first and wait for cleanup
    if (selectedVideo) {
      setSelectedVideo(null);
      // Wait longer for video element cleanup to prevent AbortError
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setLoadingVideoUrl(true);
    try {
      // Fetch video details to get the HLS URL
      const videoResponse = await fetch(`/api/videos?indexId=${video.indexId}`);
      const videoData = await videoResponse.json();
      
      if (!videoResponse.ok) {
        throw new Error(videoData.error || 'Failed to fetch video details');
      }

      const videoDetails = videoData.videos?.find((v: any) => v.id === video.id);
      if (!videoDetails) {
        throw new Error('Video not found');
      }

      // Check both video_url and videoUrl formats
      const videoUrl = videoDetails.hls?.video_url || videoDetails.hls?.videoUrl || null;
      const hlsStatus = videoDetails.hls?.status;
      
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
      
      // Open the new video
      setSelectedVideo({
        videoUrl,
        title: video.metadata?.filename || videoDetails.metadata?.filename || 'Video',
      });
    } catch (error: any) {
      console.error('Error loading video:', error);
      alert(error.message || 'Failed to load video');
    } finally {
      setLoadingVideoUrl(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Example queries for the chips
  const exampleQueries = [
    'officer draws weapon',
    'vehicle pursuit',
    'verbal altercation',
    'person in red jacket',
    'handcuffs',
    'license plate'
  ];

  const handleSearch = (query: string) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    if (indexes.length > 0) searchParams.set('indexId', indexes[0].id);
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* NEW HERO - Problem → Solution → Proof */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] rounded-xl sm:rounded-2xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Pain Point & Solution */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>AI-Powered Evidence Search</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Find the Critical Moment<br className="hidden sm:block" /> in Seconds, Not Hours
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed">
              Officers spend <span className="text-yellow-300 font-semibold">4+ hours per incident</span> reviewing video evidence.
              Search by objects, actions, speech, and text—instantly.
            </p>
          </div>

          {/* Live Search Box */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your evidence... (e.g., 'person with weapon')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSearch(searchQuery.trim());
                  }
                }}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white text-gray-900 rounded-xl border-2 border-transparent focus:border-yellow-300 focus:outline-none shadow-xl placeholder:text-gray-400"
              />
              <Button
                onClick={() => searchQuery.trim() && handleSearch(searchQuery.trim())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg font-semibold"
              >
                Search
              </Button>
            </div>

            {/* Example Query Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-white/60">Try:</span>
              {exampleQueries.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSearch(query)}
                  className="text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors border border-white/20 hover:border-white/40"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/20">
            {/* Accuracy by Video Type */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Eye className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tested on Real Video Quality</p>
                <p className="text-xs text-white/60 mt-1">
                  BWC 75-85% • CCTV 70-80% • iPhone 95%
                </p>
              </div>
            </div>

            {/* Deployment Options */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">Government-Ready</p>
                <p className="text-xs text-white/60 mt-1">
                  Cloud • On-Premise • Air-Gapped
                </p>
              </div>
            </div>

            {/* Compliance */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Fingerprint className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="font-semibold text-sm">Compliance Ready</p>
                <p className="text-xs text-white/60 mt-1">
                  FedRAMP • CJIS • ITAR pathways
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 h-11 border-2 border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] font-medium rounded-xl"
          onClick={() => router.push('/videos')}
        >
          <FileVideo className="mr-2 h-4 w-4" />
          View All Evidence ({totalVideos})
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 border-2 border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] font-medium rounded-xl disabled:opacity-50"
          onClick={async () => {
            setEvidenceLoading(true);
            setEvidenceError(null);
            setEvidenceSuccess(false);
            try {
              await fetchSpecificEvidence('A8C1377632F64E1D97235886047E1BE4');
            } catch (error: any) {
              setEvidenceError(error.message);
            } finally {
              setEvidenceLoading(false);
            }
          }}
          disabled={evidenceLoading}
        >
          {evidenceLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
              Syncing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Sync from Evidence.com
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-11 border-2 border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:border-[#8B5CF6] hover:text-[#8B5CF6] font-medium rounded-xl"
          onClick={() => router.push('/insights')}
        >
          <FileSearch className="mr-2 h-4 w-4" />
          Deployment Guide
        </Button>
      </div>

      {/* Evidence.com Sync Status - Mobile-Optimized */}
      {(evidenceSuccess || evidenceError) && (
        <Card className={`border-2 ${evidenceSuccess ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 shadow-lg'}`}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                {evidenceSuccess ? (
                  <>
                    <div className="p-2 bg-green-500 rounded-full shadow-md flex-shrink-0">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-green-900 text-sm sm:text-base">Evidence.com Sync Successful!</p>
                      <p className="text-xs sm:text-sm text-green-700">
                        Found {evidenceVideos.length} video{evidenceVideos.length !== 1 ? 's' : ''} {evidenceSource === 'Demo Data' ? '(Demo Mode)' : 'from Evidence.com'}
                      </p>
                      {evidenceSource && (
                        <p className="text-xs text-green-600 mt-1 font-mono break-all">
                          Source: {evidenceSource} {evidenceEndpoint && `• ${evidenceEndpoint}`}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-red-500 rounded-full shadow-md flex-shrink-0">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-900 text-sm sm:text-base">Error Syncing Evidence.com</p>
                      <p className="text-xs sm:text-sm text-red-700 break-words">{evidenceError}</p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto hover:bg-white/50"
                onClick={() => {
                  setEvidenceSuccess(false);
                  setEvidenceError(null);
                }}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence.com Videos - Mobile-Optimized */}
      {evidenceSuccess && evidenceVideos.length > 0 && (
        <Card className="border-2 border-[#2563EB] bg-[#FFFEF9] shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-lg flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">Evidence.com Videos</h2>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  {evidenceVideos.length} video{evidenceVideos.length !== 1 ? 's' : ''} {evidenceSource === 'Demo Data' ? '(Demo Mode)' : 'from Evidence.com'}
                  {evidenceSource && evidenceSource !== 'Demo Data' && evidenceEndpoint && (
                    <span className="text-xs font-mono ml-2 text-[#94A3B8] break-all">• {evidenceEndpoint}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {evidenceSource === 'Demo Data' ? (
                  <Badge className="text-xs sm:text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
                    Demo Mode
                  </Badge>
                ) : evidenceSource ? (
                  <Badge className="text-xs sm:text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                    ✓ Live Data
                  </Badge>
                ) : null}
                <Badge className="text-xs sm:text-sm bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white border-0 shadow-md">
                  Body-Worn Camera
                </Badge>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {evidenceVideos.map((video, index) => (
                <div
                  key={video.id || index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-[#FFFEF9] rounded-lg border-2 border-[#E8E6E0] hover:border-[#2563EB] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="w-20 h-14 sm:w-24 sm:h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Video className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{video.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.duration && `${formatTime(video.duration)} • `}
                        {video.uploadDate && formatDate(video.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit sm:w-auto">
                    BWC
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Mobile-Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#2563EB] hover:shadow-lg transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-[#64748B] uppercase tracking-wide">Evidence Files</p>
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg">
                <FileVideo className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2563EB] mb-1">{totalVideos}</p>
            <p className="text-xs text-[#64748B]">Indexed and searchable</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#10B981] hover:shadow-lg transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-[#64748B] uppercase tracking-wide">Total Footage</p>
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg shadow-lg">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#059669] mb-1">{formatDuration(totalDuration)}</p>
            <p className="text-xs text-[#64748B]">Hours of video analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:shadow-lg transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-[#64748B] uppercase tracking-wide">Evidence Indexes</p>
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg">
                <Database className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7C3AED] mb-1">{indexes.length}</p>
            <p className="text-xs text-[#64748B]">Active collections</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#F59E0B] hover:shadow-lg transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-[#64748B] uppercase tracking-wide">Avg Duration</p>
              <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg shadow-lg">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D97706] mb-1">
              {totalVideos > 0 ? formatDuration(totalDuration / totalVideos) : '0m'}
            </p>
            <p className="text-xs text-[#64748B]">Per evidence file</p>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Files Section - Mobile-Optimized */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <FileVideo className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <span>Evidence Files</span>
            </h2>
            <p className="text-[#64748B] mt-1 text-xs sm:text-sm">Search and analyze video evidence • Case coordination enabled</p>
          </div>
          {videos.length > 6 && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/videos')} 
              className="w-full sm:w-auto border border-[#E8E6E0] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F0F9FF] transition-all"
            >
              View All ({videos.length})
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

          {videos.length === 0 ? (
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0]">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] mb-4 shadow-lg">
              <Video className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <p className="text-lg sm:text-xl font-semibold text-[#1E3A8A] mb-2">No evidence files yet</p>
            <p className="text-sm sm:text-base text-[#64748B] mb-6">Upload videos or sync from Evidence.com to get started</p>
            <Button 
              onClick={() => router.push('/indexes')} 
              className="w-full sm:w-auto bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Database className="mr-2 h-4 w-4" />
              Go to Evidence Indexes
            </Button>
          </CardContent>
        </Card>
          ) : (
            <div className="space-y-4">
              {/* Group videos by case/index for coordination - Mobile-Optimized */}
              {indexes.length > 0 && indexes[0] && (
                <div className="mb-4 p-3 sm:p-4 rounded-lg bg-white border border-[#E8E6E0]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Database className="h-4 w-4 text-[#8B5CF6] flex-shrink-0" />
                      <span className="font-semibold text-sm text-[#1E3A8A] truncate">{indexes[0].name}</span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {videos.length} files
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto border border-[#E8E6E0] hover:border-[#2563EB] hover:text-[#2563EB] text-xs"
                      onClick={() => router.push(`/search${videos[0]?.indexId ? `?indexId=${videos[0].indexId}` : ''}`)}
                    >
                      <Search className="mr-1 h-3 w-3" />
                      Search Case
                    </Button>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Universal search across all {videos.length} evidence files in this case
                  </p>
                </div>
              )}
              
              {/* Social Media-Style Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {videos.slice(0, 12).map((video, videoIndex) => {
                  // Check for coordination with other videos
                  const relatedVideos = videos.filter((v, i) => 
                    i !== videoIndex && 
                    v.metadata?.filename && 
                    video.metadata?.filename &&
                    (v.metadata.filename.includes(video.metadata.filename.split(' ')[0]) ||
                     video.metadata.filename.includes(v.metadata.filename.split(' ')[0]))
                  );
                  
                  return (
                    <div
                      key={video.id}
                      className="group relative aspect-square bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => handlePlayVideo(video)}
                    >
                      {/* Thumbnail */}
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.metadata?.filename || 'Evidence'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Video className="h-8 w-8 sm:h-12 sm:w-12 text-[#94A3B8]" />
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      
                      {/* Duration Badge */}
                      {video.metadata?.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                          <span className="text-[10px] sm:text-xs font-medium text-white">
                            {formatTime(video.metadata.duration)}
                          </span>
                        </div>
                      )}
                      
                      {/* Hover Info */}
                      <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2 drop-shadow-lg">
                          {video.metadata?.filename || 'Untitled Evidence'}
                        </p>
                        <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 drop-shadow">
                          {formatDate(video.createdAt)}
                        </p>
                      </div>
                      
                      {/* Click Indicator */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-[#2563EB] rounded-full p-1.5 shadow-lg">
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Loading Overlay */}
                      {loadingVideoUrl && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Evidence Indexes Summary - Mobile-Optimized */}
      {indexes.length > 0 && (
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span>Evidence Indexes</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/indexes')}
                className="w-full sm:w-auto border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 font-medium transition-all"
              >
                Manage
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {indexes.map((index) => (
                <div
                  key={index.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-[#FFFEF9] to-[#FAF8F2] rounded-lg border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push('/videos')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1E3A8A] truncate">{index.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {index.videoCount} files • {formatDuration(index.totalDuration)} total
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8] flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.videoUrl || null}
        title={selectedVideo?.title}
      />
    </div>
  );
}

