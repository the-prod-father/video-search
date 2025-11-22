import { NextResponse } from 'next/server';

const TWELVELABS_API_KEY = process.env.TWELVELABS_API_KEY;
const TWELVELABS_API_URL = 'https://api.twelvelabs.io/v1.3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indexId = searchParams.get('indexId');

  if (!indexId) {
    return NextResponse.json({ error: 'Index ID is required' }, { status: 400 });
  }

  if (!TWELVELABS_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // First, get all videos in the index
    const videosResponse = await fetch(
      `${TWELVELABS_API_URL}/indexes/${indexId}/videos?page_limit=10`,
      {
        headers: {
          'x-api-key': TWELVELABS_API_KEY,
        },
      }
    );

    if (!videosResponse.ok) {
      const error = await videosResponse.json();
      throw new Error(error.message || 'Failed to fetch videos');
    }

    const videosData = await videosResponse.json();
    const videos = videosData.data || [];

    if (videos.length === 0) {
      return NextResponse.json({ keywords: [], message: 'No videos in index' });
    }

    // Collect all topics and hashtags from each video's gist
    const allTopics: string[] = [];
    const allHashtags: string[] = [];

    // Process videos in parallel (limit to first 5 to avoid rate limits)
    const videoPromises = videos.slice(0, 5).map(async (video: any) => {
      try {
        const gistResponse = await fetch(
          `${TWELVELABS_API_URL}/gist`,
          {
            method: 'POST',
            headers: {
              'x-api-key': TWELVELABS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              video_id: video._id,
              types: ['topic', 'hashtag'],
            }),
          }
        );

        if (gistResponse.ok) {
          const gistData = await gistResponse.json();

          // Extract topics
          if (gistData.topics && Array.isArray(gistData.topics)) {
            allTopics.push(...gistData.topics);
          }

          // Extract hashtags (remove # symbol)
          if (gistData.hashtags && Array.isArray(gistData.hashtags)) {
            const cleanHashtags = gistData.hashtags.map((tag: string) =>
              tag.replace(/^#/, '').toLowerCase()
            );
            allHashtags.push(...cleanHashtags);
          }
        }
      } catch (error) {
        console.error(`Error getting gist for video ${video._id}:`, error);
      }
    });

    await Promise.all(videoPromises);

    // Deduplicate and count frequency
    const topicCounts = new Map<string, number>();
    const hashtagCounts = new Map<string, number>();

    allTopics.forEach(topic => {
      const normalized = topic.toLowerCase().trim();
      topicCounts.set(normalized, (topicCounts.get(normalized) || 0) + 1);
    });

    allHashtags.forEach(tag => {
      const normalized = tag.toLowerCase().trim();
      hashtagCounts.set(normalized, (hashtagCounts.get(normalized) || 0) + 1);
    });

    // Sort by frequency and get top keywords
    const sortedTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([topic]) => topic);

    const sortedHashtags = Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);

    // Combine and deduplicate, prioritizing topics
    const combined = [...new Set([...sortedTopics, ...sortedHashtags])].slice(0, 8);

    // If we got no results, try to extract from video summaries instead
    if (combined.length === 0) {
      // Fallback: get summaries and extract key phrases
      const summaryPromises = videos.slice(0, 3).map(async (video: any) => {
        try {
          const summaryResponse = await fetch(
            `${TWELVELABS_API_URL}/summarize`,
            {
              method: 'POST',
              headers: {
                'x-api-key': TWELVELABS_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                video_id: video._id,
                type: 'summary',
              }),
            }
          );

          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            return summaryData.summary || '';
          }
        } catch (error) {
          console.error(`Error getting summary for video ${video._id}:`, error);
        }
        return '';
      });

      const summaries = await Promise.all(summaryPromises);
      const combinedText = summaries.join(' ');

      // Extract simple noun phrases (basic extraction)
      const words = combinedText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);

      // Count word frequency
      const wordCounts = new Map<string, number>();
      words.forEach(word => {
        if (!['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'would', 'could', 'should', 'about', 'which', 'there', 'these', 'other', 'into', 'some', 'than', 'then', 'them', 'what', 'when', 'where', 'while', 'being', 'video', 'shows', 'appears'].includes(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });

      const topWords = Array.from(wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([word]) => word);

      return NextResponse.json({
        keywords: topWords,
        source: 'summaries',
        videoCount: videos.length,
      });
    }

    return NextResponse.json({
      keywords: combined,
      topics: sortedTopics,
      hashtags: sortedHashtags,
      source: 'gist',
      videoCount: videos.length,
    });

  } catch (error: any) {
    console.error('Error extracting keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract keywords' },
      { status: 500 }
    );
  }
}
