'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ListOrdered, Sparkles, Hash, Video as VideoIcon } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function AnalyzePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.videoId as string;
  const indexId = searchParams.get('indexId');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'chapters' | 'highlights' | 'topics'>('summary');

  const analyzeVideo = async (type: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, analysisType: type }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults((prev: any) => ({ ...prev, [type]: data.result }));
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error analyzing video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Analysis</h1>
        <p className="text-muted-foreground">
          Generate AI-powered insights from your video content
        </p>
      </div>

      {/* Video Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <VideoIcon className="h-5 w-5" />
            <span className="font-mono text-sm">{videoId}</span>
          </CardTitle>
          <CardDescription>
            Index: {indexId || 'Unknown'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Analysis Type Tabs */}
      <div className="flex items-center space-x-2">
        <Button
          variant={activeTab === 'summary' ? 'default' : 'outline'}
          onClick={() => setActiveTab('summary')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Summary
        </Button>
        <Button
          variant={activeTab === 'chapters' ? 'default' : 'outline'}
          onClick={() => setActiveTab('chapters')}
        >
          <ListOrdered className="mr-2 h-4 w-4" />
          Chapters
        </Button>
        <Button
          variant={activeTab === 'highlights' ? 'default' : 'outline'}
          onClick={() => setActiveTab('highlights')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Highlights
        </Button>
        <Button
          variant={activeTab === 'topics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('topics')}
        >
          <Hash className="mr-2 h-4 w-4" />
          Topics
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeTab === 'summary' && 'Video Summary'}
              {activeTab === 'chapters' && 'Chapter Breakdown'}
              {activeTab === 'highlights' && 'Key Highlights'}
              {activeTab === 'topics' && 'Topics & Themes'}
            </CardTitle>
            {!results?.[activeTab] && (
              <Button
                onClick={() => analyzeVideo(activeTab)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  `Generate ${activeTab}`
                )}
              </Button>
            )}
          </div>
          <CardDescription>
            {activeTab === 'summary' && 'AI-generated overview of the video content'}
            {activeTab === 'chapters' && 'Timestamped breakdown of video sections'}
            {activeTab === 'highlights' && 'Key moments and important events'}
            {activeTab === 'topics' && 'Main themes and subjects discussed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : results?.[activeTab] ? (
            <div className="space-y-4">
              {/* Summary */}
              {activeTab === 'summary' && typeof results.summary === 'string' && (
                <p className="text-sm leading-relaxed">{results.summary}</p>
              )}

              {/* Chapters */}
              {activeTab === 'chapters' && Array.isArray(results.chapters) && (
                <div className="space-y-3">
                  {results.chapters.map((chapter: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">
                          {formatDuration(chapter.start)} - {formatDuration(chapter.end)}
                        </Badge>
                        <h4 className="font-semibold">{chapter.chapterTitle || chapter.chapter_title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {chapter.chapterSummary || chapter.chapter_summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {activeTab === 'highlights' && Array.isArray(results.highlights) && (
                <div className="space-y-3">
                  {results.highlights.map((highlight: any, index: number) => (
                    <div key={index} className="border-l-2 border-yellow-500 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="bg-yellow-50">
                          {formatDuration(highlight.start)} - {formatDuration(highlight.end)}
                        </Badge>
                      </div>
                      <p className="text-sm">{highlight.highlight}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics */}
              {activeTab === 'topics' && typeof results.topics === 'string' && (
                <div className="flex flex-wrap gap-2">
                  {results.topics.split(',').map((topic: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {topic.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Fallback for other formats */}
              {typeof results[activeTab] === 'object' && !Array.isArray(results[activeTab]) && (
                <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(results[activeTab], null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click "Generate {activeTab}" to analyze this video
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveTab('summary'); if (!results?.summary) analyzeVideo('summary'); }}
            >
              Generate Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveTab('chapters'); if (!results?.chapters) analyzeVideo('chapters'); }}
            >
              Generate Chapters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveTab('highlights'); if (!results?.highlights) analyzeVideo('highlights'); }}
            >
              Generate Highlights
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActiveTab('topics'); if (!results?.topics) analyzeVideo('topics'); }}
            >
              Generate Topics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
