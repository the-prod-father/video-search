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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section - Seamless and Cohesive */}
      <div className="bg-[#FFFEF9] rounded-2xl p-8 border border-[#E8E6E0] relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,#2563EB_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-6">
              {/* Title Section - Flat and Clean */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-[#1E3A8A] tracking-tight">Digital Evidence Intelligence</h1>
                </div>
                <p className="text-lg text-[#475569] leading-relaxed max-w-2xl">
                  Find critical evidence in video footage instantly. Search by objects, actions, conversations, and text—no manual review required.
                </p>
                <p className="text-sm text-[#64748B]">
                  <span className="font-semibold text-[#2563EB]">For Digital Forensics Teams:</span> Transform hours of video review into seconds. Identify suspects, vehicles, weapons, and key moments with AI-powered precision.
                </p>
              </div>

              {/* Feature Pills - Flat with Subtle Differences */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  AI-Powered Search
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  Object Detection
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF5FF] border border-[#E9D5FF] text-[#6B21A8] text-sm font-medium">
                  <FileSearch className="h-4 w-4" />
                  Text Recognition
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Auto Analysis
                </div>
              </div>

              {/* Capabilities Grid - Seamless Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-white border border-[#E8E6E0] hover:border-[#10B981] hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#10B981]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#10B981]/20 transition-colors">
                      <Eye className="h-4 w-4 text-[#059669]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1E3A8A] mb-1">Object Detection</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">Find vehicles, weapons, people instantly</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white border border-[#E8E6E0] hover:border-[#8B5CF6] hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8B5CF6]/20 transition-colors">
                      <FileSearch className="h-4 w-4 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1E3A8A] mb-1">Conversation Search</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">Search spoken words across all footage</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white border border-[#E8E6E0] hover:border-[#F59E0B] hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F59E0B]/20 transition-colors">
                      <Fingerprint className="h-4 w-4 text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1E3A8A] mb-1">Text Recognition</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">Extract text from license plates, signs</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white border border-[#E8E6E0] hover:border-[#EF4444] hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#EF4444]/20 transition-colors">
                      <Zap className="h-4 w-4 text-[#DC2626]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#1E3A8A] mb-1">Auto Analysis</h3>
                      <p className="text-xs text-[#64748B] leading-relaxed">Generate summaries, chapters, highlights</p>
                    </div>
                  </div>
                </div>
              </div>
        </div>
            {/* Action Buttons - Seamless Integration */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                size="lg"
                className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-medium shadow-sm hover:shadow transition-all"
                onClick={() => router.push('/search')}
              >
                <Search className="mr-2 h-5 w-5" />
                Search Evidence
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#E8E6E0] text-[#475569] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
                onClick={() => router.push('/videos')}
              >
                <Video className="mr-2 h-5 w-5" />
                Video Library
              </Button>
          <Button
            size="lg"
                variant="outline"
                className="border-[#E8E6E0] text-[#475569] hover:bg-[#F8FAFC] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
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
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
                    Loading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Sync Evidence.com
              </>
            )}
          </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence.com Sync Status */}
      {(evidenceSuccess || evidenceError) && (
        <Card className={`border-2 ${evidenceSuccess ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 shadow-lg'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {evidenceSuccess ? (
                  <>
                    <div className="p-2 bg-green-500 rounded-full shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Evidence.com Sync Successful!</p>
                      <p className="text-sm text-green-700">
                        Found {evidenceVideos.length} video{evidenceVideos.length !== 1 ? 's' : ''} {evidenceSource === 'Demo Data' ? '(Demo Mode)' : 'from Evidence.com'}
                      </p>
                      {evidenceSource && (
                        <p className="text-xs text-green-600 mt-1 font-mono">
                          Source: {evidenceSource} {evidenceEndpoint && `• ${evidenceEndpoint}`}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-red-500 rounded-full shadow-md">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-900">Error Syncing Evidence.com</p>
                      <p className="text-sm text-red-700">{evidenceError}</p>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-white/50"
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

      {/* Evidence.com Videos */}
      {evidenceSuccess && evidenceVideos.length > 0 && (
        <Card className="border-2 border-[#2563EB] bg-[#FFFEF9] shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1E3A8A]">Evidence.com Videos</h2>
                </div>
                <p className="text-[#64748B]">
                  {evidenceVideos.length} video{evidenceVideos.length !== 1 ? 's' : ''} {evidenceSource === 'Demo Data' ? '(Demo Mode)' : 'from Evidence.com'}
                  {evidenceSource && evidenceSource !== 'Demo Data' && evidenceEndpoint && (
                    <span className="text-xs font-mono ml-2 text-[#94A3B8]">• {evidenceEndpoint}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {evidenceSource === 'Demo Data' ? (
                  <Badge className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-md">
                    Demo Mode
                  </Badge>
                ) : evidenceSource ? (
                  <Badge className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                    ✓ Live Data
                  </Badge>
                ) : null}
                <Badge className="text-sm bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white border-0 shadow-md">
                Body-Worn Camera
              </Badge>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {evidenceVideos.map((video, index) => (
                <div
                  key={video.id || index}
                  className="flex items-center justify-between p-4 bg-[#FFFEF9] rounded-lg border-2 border-[#E8E6E0] hover:border-[#2563EB] hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-16 bg-muted rounded flex items-center justify-center">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{video.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.duration && `${formatTime(video.duration)} • `}
                        {video.uploadDate && formatDate(video.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    BWC
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Forensics Focused */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#2563EB] hover:shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Evidence Files</p>
              <div className="p-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg">
                <FileVideo className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#2563EB] mb-1">{totalVideos}</p>
            <p className="text-xs text-[#64748B]">Indexed and searchable</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#10B981] hover:shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Total Footage</p>
              <div className="p-2.5 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#059669] mb-1">{formatDuration(totalDuration)}</p>
            <p className="text-xs text-[#64748B]">Hours of video analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Evidence Indexes</p>
              <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#7C3AED] mb-1">{indexes.length}</p>
            <p className="text-xs text-[#64748B]">Active collections</p>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] hover:border-[#F59E0B] hover:shadow-2xl transition-all hover:scale-[1.02] hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Avg Duration</p>
              <div className="p-2.5 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[#D97706] mb-1">
              {totalVideos > 0 ? formatDuration(totalDuration / totalVideos) : '0m'}
            </p>
            <p className="text-xs text-[#64748B]">Per evidence file</p>
          </CardContent>
        </Card>
      </div>

      {/* Evidence Files Section - Seamless Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
            <h2 className="text-2xl font-bold text-[#1E3A8A] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <FileVideo className="h-4 w-4 text-white" />
              </div>
              <span>Evidence Files</span>
            </h2>
            <p className="text-[#64748B] mt-1 text-sm">Search and analyze video evidence • Case coordination enabled</p>
            </div>
            {videos.length > 6 && (
            <Button variant="outline" onClick={() => router.push('/videos')} className="border border-[#E8E6E0] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F0F9FF] transition-all">
                View All ({videos.length})
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
        </div>

          {videos.length === 0 ? (
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0]">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] mb-4 shadow-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold text-[#1E3A8A] mb-2">No evidence files yet</p>
            <p className="text-[#64748B] mb-6">Upload videos or sync from Evidence.com to get started</p>
                  <Button onClick={() => router.push('/indexes')} className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white shadow-lg hover:shadow-xl transition-all">
                    <Database className="mr-2 h-4 w-4" />
                    Go to Evidence Indexes
                  </Button>
          </CardContent>
        </Card>
          ) : (
            <div className="space-y-4">
              {/* Group videos by case/index for coordination */}
              {indexes.length > 0 && indexes[0] && (
                <div className="mb-4 p-4 rounded-lg bg-white border border-[#E8E6E0]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-[#8B5CF6]" />
                      <span className="font-semibold text-sm text-[#1E3A8A]">{indexes[0].name}</span>
                      <Badge variant="outline" className="text-xs">
                        {videos.length} files
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border border-[#E8E6E0] hover:border-[#2563EB] hover:text-[#2563EB] text-xs"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.slice(0, 6).map((video, idx) => {
                  // Check for coordination with other videos
                  const relatedVideos = videos.filter((v, i) => 
                    i !== idx && 
                    v.metadata?.filename && 
                    video.metadata?.filename &&
                    (v.metadata.filename.includes(video.metadata.filename.split(' ')[0]) ||
                     video.metadata.filename.includes(v.metadata.filename.split(' ')[0]))
                  );
                  
                  return (
                <Card
                  key={video.id}
                      className="bg-white border border-[#E8E6E0] hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0]">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                            alt="Evidence"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                            <Video className="h-12 w-12 text-[#94A3B8]" />
                      </div>
                    )}
                    {video.metadata?.duration && (
                          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(video.metadata.duration)}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                          <p className="font-semibold text-sm text-[#1E3A8A] line-clamp-2 mb-1">
                            {video.metadata?.filename || 'Untitled Evidence'}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-[#64748B]">
                              {formatDate(video.createdAt)}
                            </p>
                            {video.metadata?.recordedOn && (
                              <>
                                <span className="text-[#CBD5E1]">•</span>
                                <p className="text-xs text-[#64748B]">
                                  Recorded {new Date(video.metadata.recordedOn).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Coordination Indicators */}
                        {relatedVideos.length > 0 && (
                          <div className="flex items-center gap-2 p-2 rounded-md bg-[#F0F9FF] border border-[#BAE6FD]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div>
                            <p className="text-xs text-[#0369A1]">
                              {relatedVideos.length} related file{relatedVideos.length !== 1 ? 's' : ''} in case
                      </p>
                    </div>
                        )}

                        {/* Metadata Tags */}
                        {video.metadata && (
                          <div className="flex flex-wrap gap-1">
                            {video.metadata.location && (
                              <Badge variant="outline" className="text-xs border-[#E8E6E0] text-[#64748B]">
                                📍 {video.metadata.location}
                              </Badge>
                            )}
                            {video.metadata.officer && (
                              <Badge variant="outline" className="text-xs border-[#E8E6E0] text-[#64748B]">
                                👤 {video.metadata.officer}
                              </Badge>
                            )}
                            {video.metadata.scenario && (
                              <Badge variant="outline" className="text-xs border-[#E8E6E0] text-[#64748B]">
                                {video.metadata.scenario}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
                        onClick={() => router.push(`/analyze/${video.id}${video.indexId ? `?indexId=${video.indexId}` : ''}`)}
                      >
                            <Sparkles className="mr-1 h-3 w-3" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                            className="flex-1 border border-[#E8E6E0] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F0F9FF] text-xs"
                            onClick={() => router.push(`/search${video.indexId ? `?indexId=${video.indexId}` : ''}`)}
                      >
                            <Search className="mr-1 h-3 w-3" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                  );
                })}
              </div>
            </div>
          )}
      </div>

      {/* Evidence Indexes Summary */}
      {indexes.length > 0 && (
        <Card className="bg-[#FFFEF9] border-2 border-[#E8E6E0] shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <span>Evidence Indexes</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/indexes')}
                className="border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 font-medium transition-all"
              >
                Manage
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {indexes.map((index) => (
                <div
                  key={index.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FFFEF9] to-[#FAF8F2] rounded-lg border-2 border-[#E8E6E0] hover:border-[#8B5CF6] hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
                  onClick={() => router.push('/videos')}
                >
                  <div>
                    <p className="font-semibold text-sm text-[#1E3A8A]">{index.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {index.videoCount} files • {formatDuration(index.totalDuration)} total
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#8B5CF6]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
