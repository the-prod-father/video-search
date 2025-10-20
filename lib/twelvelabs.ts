import { TwelveLabs } from 'twelvelabs-js';

if (!process.env.TWELVELABS_API_KEY) {
  throw new Error('TWELVELABS_API_KEY environment variable is not set');
}

// Initialize TwelveLabs client
export const client = new TwelveLabs({
  apiKey: process.env.TWELVELABS_API_KEY,
});

// Helper function to wait for video processing to complete
export async function waitForVideoProcessing(taskId: string, maxWaitTime = 600000) {
  const startTime = Date.now();
  const pollInterval = 5000; // 5 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const task = await client.task.retrieve(taskId);

    if (task.status === 'ready') {
      return { success: true, videoId: task.videoId };
    }

    if (task.status === 'failed') {
      return { success: false, error: 'Video processing failed' };
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return { success: false, error: 'Processing timeout' };
}

// Helper to create index with recommended settings for law enforcement
export async function createLawEnforcementIndex(
  name: string,
  purpose: 'search' | 'generation' = 'search'
) {
  const engineConfig = purpose === 'search'
    ? {
        name: 'marengo2.6',
        options: ['visual', 'conversation', 'text_in_video'],
      }
    : {
        name: 'pegasus1.1',
        options: ['visual', 'conversation'],
      };

  return await client.index.create({
    name,
    engines: [engineConfig],
  });
}

// Helper to categorize video by metadata
export function categorizeVideo(metadata?: Record<string, any>) {
  if (!metadata) return 'unknown';

  const type = metadata.type?.toLowerCase();

  if (type === 'bwc' || type === 'body-worn-camera') return 'bwc';
  if (type === 'cctv' || type === 'surveillance') return 'cctv';
  if (type === 'iphone' || type === 'dji' || type === 'consumer') return 'high-quality';
  if (type === 'youtube' || type === 'social-media') return 'youtube';

  return 'unknown';
}

// Helper to get all videos from an index with enhanced metadata
export async function getVideosWithMetadata(indexId: string) {
  const videos = await client.index.video.list(indexId);

  return videos.data.map(video => ({
    ...video,
    category: categorizeVideo(video.metadata),
    thumbnailUrl: video.hls?.thumbnailUrls?.[0] || null,
  }));
}

// Helper for semantic search across videos
export async function searchVideos(
  indexId: string,
  query: string,
  options: {
    searchOptions?: ('visual' | 'conversation' | 'text_in_video' | 'logo')[];
    pageLimit?: number;
    sortOption?: 'score' | 'clip_count';
  } = {}
) {
  const {
    searchOptions = ['visual', 'conversation', 'text_in_video'],
    pageLimit = 10,
    sortOption = 'score',
  } = options;

  return await client.search.query({
    indexId,
    query,
    options: searchOptions,
    pageLimit,
    sortOption,
  });
}

// Helper to generate comprehensive video analysis
export async function generateVideoAnalysis(videoId: string) {
  const [summary, chapters, highlights, topics] = await Promise.all([
    client.generate.summarize({
      videoId,
      type: 'summary',
    }).catch(() => null),
    client.generate.summarize({
      videoId,
      type: 'chapter',
    }).catch(() => null),
    client.generate.summarize({
      videoId,
      type: 'highlight',
    }).catch(() => null),
    client.generate.text({
      videoId,
      prompt: 'List the main topics discussed or shown in this video, separated by commas.',
    }).catch(() => null),
  ]);

  return {
    summary,
    chapters,
    highlights,
    topics,
  };
}

// Helper to generate video embeddings
export async function createVideoEmbeddings(
  indexId: string,
  videoUrl: string,
  engineName = 'marengo2.6'
) {
  const task = await client.embed.task.create({
    indexId,
    url: videoUrl,
    engineName,
  });

  return task;
}

// Helper to find similar videos using embeddings
export async function findSimilarVideos(
  indexId: string,
  videoId: string,
  threshold = 0.7
) {
  // This would require implementing vector similarity search
  // For now, return a placeholder
  return [];
}

// Export the client as default
export default client;
