'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, Trash2, Video, Clock } from 'lucide-react';
import { formatDuration, formatRelativeTime } from '@/lib/utils';

interface Index {
  id: string;
  name: string;
  engines: Array<{ name: string; options: string[] }>;
  videoCount: number;
  totalDuration: number;
  createdAt: string;
}

export default function IndexesPage() {
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchIndexes();
  }, []);

  const fetchIndexes = async () => {
    try {
      const response = await fetch('/api/indexes');
      const data = await response.json();
      setIndexes(data.indexes || []);
    } catch (error) {
      console.error('Error fetching indexes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIndex = async (purpose: 'search' | 'generation') => {
    setCreating(true);
    try {
      const name = purpose === 'search'
        ? `Law Enforcement Search - ${new Date().toISOString().split('T')[0]}`
        : `Law Enforcement Analysis - ${new Date().toISOString().split('T')[0]}`;

      const response = await fetch('/api/indexes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, purpose }),
      });

      if (response.ok) {
        fetchIndexes();
      }
    } catch (error) {
      console.error('Error creating index:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteIndex = async (indexId: string) => {
    if (!confirm('Are you sure you want to delete this index? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/indexes?id=${indexId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchIndexes();
      }
    } catch (error) {
      console.error('Error deleting index:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Database className="h-12 w-12 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading indexes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Indexes</h1>
          <p className="text-muted-foreground">
            Manage your TwelveLabs video indexes for search and analysis
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => createIndex('search')}
            disabled={creating}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Search Index
          </Button>
          <Button
            onClick={() => createIndex('generation')}
            disabled={creating}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Analysis Index
          </Button>
        </div>
      </div>

      {indexes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No indexes found</h3>
            <p className="text-muted-foreground text-center mb-6">
              Create your first index to start uploading and analyzing videos
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => createIndex('search')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Search Index
              </Button>
              <Button onClick={() => createIndex('generation')} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Analysis Index
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {indexes.map((index) => (
            <Card key={index.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle>{index.name}</CardTitle>
                      <Badge variant="outline">
                        {index.engines[0]?.name === 'marengo2.6' ? 'Search' : 'Analysis'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Engine: {index.engines[0]?.name} |
                      Options: {index.engines[0]?.options.join(', ')}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteIndex(index.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Video className="mr-2 h-4 w-4" />
                      Videos
                    </div>
                    <p className="text-2xl font-bold">{index.videoCount}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      Duration
                    </div>
                    <p className="text-2xl font-bold">
                      {formatDuration(index.totalDuration)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Created</div>
                    <p className="text-lg font-semibold">
                      {formatRelativeTime(index.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Index ID</div>
                    <p className="text-xs font-mono">{index.id.substring(0, 20)}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>About Indexes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Search Index (Marengo):</strong> Optimized for semantic search across video content.
            Use this for finding specific moments, actions, objects, or conversations in your videos.
          </p>
          <p>
            <strong>Analysis Index (Pegasus):</strong> Optimized for generating summaries, chapters,
            highlights, and other text-based analysis of video content.
          </p>
          <p className="text-muted-foreground">
            Note: Videos must be uploaded to an index before they can be searched or analyzed.
            Each index operates independently.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
