'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Video, AlertCircle } from 'lucide-react';
import { formatDuration, getConfidenceLevel } from '@/lib/utils';

interface Index {
  id: string;
  name: string;
}

interface SearchResult {
  id: string;
  score: number;
  start: number;
  end: number;
  videoId: string;
  confidence: string;
  metadata: Array<{ type: string; text?: string }>;
}

export default function SearchPage() {
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchIndexes();
  }, []);

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

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indexId: selectedIndex,
          query: query.trim(),
          options: {
            searchOptions: ['visual', 'conversation', 'text_in_video'],
            pageLimit: 20,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setProcessingTime(data.processingTime);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const exampleQueries = [
    'officer running',
    'person wearing red jacket',
    'vehicle fleeing scene',
    'officer with hand on weapon',
    'verbal commands given',
    'suspect detained',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semantic Video Search</h1>
        <p className="text-muted-foreground">
          Search across your video content using natural language
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Query</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Index Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Index
              </label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={indexes.length === 0}
              >
                {indexes.length === 0 ? (
                  <option>No indexes available</option>
                ) : (
                  indexes.map((index) => (
                    <option key={index.id} value={index.id}>
                      {index.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Query Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Search Query
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., officer running towards suspect"
                  className="flex-1 px-3 py-2 border rounded-md bg-background"
                  disabled={searching || indexes.length === 0}
                />
                <Button
                  type="submit"
                  disabled={searching || !query.trim() || indexes.length === 0}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Example Queries */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Try these law enforcement search queries:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    disabled={searching}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Search Results ({results.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Processed in {processingTime}ms</span>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => {
              const confidence = getConfidenceLevel(result.score);
              return (
                <Card key={`${result.videoId}-${result.start}-${result.end}-${index}`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm text-muted-foreground">
                            {result.videoId.substring(0, 20)}...
                          </span>
                          <Badge variant="outline">
                            {formatDuration(result.start)} - {formatDuration(result.end)}
                          </Badge>
                        </div>

                        {result.metadata && result.metadata.length > 0 && (
                          <div className="text-sm">
                            {result.metadata.map((meta, i) => (
                              meta.text && (
                                <p key={i} className="text-muted-foreground">
                                  <strong className="text-foreground">{meta.type}:</strong> {meta.text}
                                </p>
                              )
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Confidence</p>
                          <p className={`text-lg font-bold ${confidence.color}`}>
                            {(result.score * 100).toFixed(1)}%
                          </p>
                          <Badge variant={confidence.level === 'high' ? 'default' : 'outline'}>
                            {confidence.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!searching && results.length === 0 && query && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground text-center">
              Try a different search query or check that your videos are indexed
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
