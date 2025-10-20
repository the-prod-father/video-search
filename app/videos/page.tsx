'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Clock, Calendar, Database } from 'lucide-react';
import { formatDuration, formatFileSize, getCategoryColor, getCategoryLabel, getResolutionLabel } from '@/lib/utils';
import type { EnhancedVideo } from '@/lib/types';

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<EnhancedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = filter === 'all'
    ? videos
    : videos.filter(v => v.category === filter);

  const categoryCounts = videos.reduce((acc, video) => {
    acc[video.category] = (acc[video.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Video className="h-12 w-12 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Gallery</h1>
        <p className="text-muted-foreground">
          Browse all videos categorized by source type
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({videos.length})
        </Button>
        {Object.entries(categoryCounts).map(([category, count]) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category)}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(category)}`} />
            {getCategoryLabel(category)} ({count})
          </Button>
        ))}
      </div>

      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground text-center">
              {filter === 'all'
                ? 'Upload videos to your indexes to get started'
                : `No ${getCategoryLabel(filter)} videos found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={getCategoryColor(video.category)}>
                    {getCategoryLabel(video.category)}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary">
                    {formatDuration(video.duration)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Video ID */}
                <div>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {video.id}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {getResolutionLabel(video.width, video.height)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {video.fps} fps
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {formatFileSize(video.size)}
                  </div>
                </div>

                {/* Metadata Tags */}
                {video.metadata && (
                  <div className="flex flex-wrap gap-1">
                    {video.metadata.source && (
                      <Badge variant="outline" className="text-xs">
                        {video.metadata.source}
                      </Badge>
                    )}
                    {video.metadata.scenario && (
                      <Badge variant="outline" className="text-xs">
                        {video.metadata.scenario}
                      </Badge>
                    )}
                    {video.metadata.lightingConditions && (
                      <Badge variant="outline" className="text-xs">
                        {video.metadata.lightingConditions}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    variant="outline"
                    onClick={() => router.push(`/analyze/${video.id}?indexId=${video.indexId}`)}
                  >
                    Analyze
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    variant="outline"
                    onClick={() => router.push(`/search?indexId=${video.indexId}`)}
                  >
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
