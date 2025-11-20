'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, ListOrdered, Sparkles, Hash, Video as VideoIcon, Download, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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
            <div className="flex items-center gap-2">
              {results?.[activeTab] && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const dataToCopy = results[activeTab];
                      const jsonString = JSON.stringify(dataToCopy, null, 2);
                      await navigator.clipboard.writeText(jsonString);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const dataToExport = results[activeTab];
                      const jsonString = JSON.stringify(dataToExport, null, 2);
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `video-${activeTab}-${videoId.substring(0, 8)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                </>
              )}
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
              {/* Summary - Clean Format */}
              {activeTab === 'summary' && (() => {
                const summaryData = results.summary;
                let summaryText = '';
                
                // Handle different response formats
                if (typeof summaryData === 'string') {
                  summaryText = summaryData;
                } else if (summaryData && typeof summaryData === 'object') {
                  // Extract summary from object (e.g., { summary: "...", summarize_type: "summary" })
                  summaryText = summaryData.summary || summaryData.text || summaryData.content || JSON.stringify(summaryData, null, 2);
                }
                
                return (
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-white border border-[#E8E6E0] rounded-lg p-6">
                        <p className="text-base leading-relaxed text-[#1E3A8A] whitespace-pre-wrap">
                          {summaryText}
                        </p>
                      </div>
                    </div>
                    {typeof summaryData === 'object' && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-[#64748B] hover:text-[#2563EB]">
                          View raw data (for technical users)
                        </summary>
                        <pre className="mt-2 text-xs bg-[#F8FAFC] border border-[#E8E6E0] p-4 rounded overflow-auto">
                          {JSON.stringify(summaryData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()}

              {/* Chapters */}
              {activeTab === 'chapters' && Array.isArray(results.chapters) && (
                <div className="space-y-4">
                  {results.chapters.map((chapter: any, index: number) => (
                    <div key={index} className="bg-white border border-[#E8E6E0] rounded-lg p-4 hover:border-[#2563EB] transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]">
                            Chapter {index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(chapter.start)} - {formatDuration(chapter.end)}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-[#1E3A8A] mb-2">
                        {chapter.chapterTitle || chapter.chapter_title || `Chapter ${index + 1}`}
                      </h4>
                      <p className="text-sm text-[#475569] leading-relaxed">
                        {chapter.chapterSummary || chapter.chapter_summary || chapter.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {activeTab === 'highlights' && Array.isArray(results.highlights) && (
                <div className="space-y-3">
                  {results.highlights.map((highlight: any, index: number) => (
                    <div key={index} className="bg-white border-l-4 border-[#F59E0B] border border-[#E8E6E0] rounded-lg p-4 hover:border-[#F59E0B] transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]">
                          {formatDuration(highlight.start)} - {formatDuration(highlight.end)}
                        </Badge>
                        <span className="text-xs text-[#64748B]">Highlight {index + 1}</span>
                      </div>
                      <p className="text-sm text-[#1E3A8A] leading-relaxed">
                        {highlight.highlight || highlight.text || highlight.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics */}
              {activeTab === 'topics' && (() => {
                const topicsData = results.topics;
                let topicsList: string[] = [];
                
                if (typeof topicsData === 'string') {
                  topicsList = topicsData.split(',').map(t => t.trim());
                } else if (Array.isArray(topicsData)) {
                  topicsList = topicsData;
                } else if (topicsData && typeof topicsData === 'object') {
                  // Handle object format (e.g., { topics: [...], gist_type: "topic" })
                  topicsList = topicsData.topics || topicsData.items || topicsData.list || [];
                }
                
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {topicsList.map((topic: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    {typeof topicsData === 'object' && !Array.isArray(topicsData) && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-[#64748B] hover:text-[#2563EB]">
                          View raw data (for technical users)
                        </summary>
                        <pre className="mt-2 text-xs bg-[#F8FAFC] border border-[#E8E6E0] p-4 rounded overflow-auto">
                          {JSON.stringify(topicsData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()}

              {/* Fallback for other object formats */}
              {typeof results[activeTab] === 'object' && 
               !Array.isArray(results[activeTab]) && 
               activeTab !== 'summary' && 
               activeTab !== 'topics' && (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E8E6E0] rounded-lg p-6">
                    <p className="text-sm text-[#64748B] mb-4">
                      Analysis data received. View formatted output below or export raw JSON.
                    </p>
                    <details>
                      <summary className="cursor-pointer text-sm text-[#2563EB] hover:underline mb-2">
                        View raw JSON data
                      </summary>
                      <pre className="text-xs bg-[#F8FAFC] border border-[#E8E6E0] p-4 rounded overflow-auto mt-2">
                        {JSON.stringify(results[activeTab], null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
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
