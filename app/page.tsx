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
  ChevronRight
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
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">📊 Dashboard</h1>
          <p className="text-lg text-muted-foreground">Your video library at a glance</p>
        </div>
        <div className="flex space-x-3">
          <Button size="lg" onClick={() => router.push('/search')}>
            <Search className="mr-2 h-5 w-5" />
            Search Videos
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/videos')}>
            <Video className="mr-2 h-5 w-5" />
            View All
          </Button>
        </div>
      </div>

      {/* Key Metrics - BIG and CLEAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Total Videos</p>
              <FileVideo className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-4xl font-bold">{totalVideos}</p>
            <p className="text-xs text-muted-foreground mt-1">Indexed and ready</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Total Duration</p>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-4xl font-bold">{formatDuration(totalDuration)}</p>
            <p className="text-xs text-muted-foreground mt-1">Of video content</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Indexes</p>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-4xl font-bold">{indexes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active collections</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-muted-foreground">Avg Length</p>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-4xl font-bold">
              {totalVideos > 0 ? formatDuration(totalDuration / totalVideos) : '0m'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per video</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Videos - BIG VISUAL CARDS */}
      <Card className="border-2">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">📹 Your Videos</h2>
              <p className="text-muted-foreground">Click to analyze or search</p>
            </div>
            {videos.length > 6 && (
              <Button variant="ghost" onClick={() => router.push('/videos')}>
                View All ({videos.length})
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 pt-0">
          {videos.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <Video className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No videos yet</p>
              <p className="text-muted-foreground mb-6">Upload videos to your index to get started</p>
              <Button onClick={() => router.push('/indexes')}>
                <Database className="mr-2 h-4 w-4" />
                Go to Indexes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 6).map((video) => (
                <Card
                  key={video.id}
                  className="overflow-hidden border-2 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                >
                  {/* Large Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt="Video"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {video.metadata?.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(video.metadata.duration)}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">
                        {video.metadata?.filename || 'Untitled Video'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(video.createdAt)}
                      </p>
                    </div>

                    {/* Big Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/analyze/${video.id}${video.indexId ? `?indexId=${video.indexId}` : ''}`)}
                      >
                        <Sparkles className="mr-1 h-4 w-4" />
                        Analyze
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/search')}
                      >
                        <Search className="mr-1 h-4 w-4" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Index Summary - If multiple */}
      {indexes.length > 0 && (
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🗂️ Your Collections</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/indexes')}
              >
                Manage
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {indexes.map((index) => (
                <div
                  key={index.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-semibold text-sm">{index.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {index.videoCount} videos • {formatDuration(index.totalDuration)} total
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/videos')}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
