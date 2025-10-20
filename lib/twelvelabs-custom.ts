// Custom TwelveLabs API client for v1.3
const API_BASE = 'https://api.twelvelabs.io/v1.3';
const API_KEY = process.env.TWELVELABS_API_KEY;

if (!API_KEY) {
  throw new Error('TWELVELABS_API_KEY environment variable is not set');
}

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

export interface TLIndex {
  _id: string;
  index_name: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  addons: string[];
  models: Array<{
    model_name: string;
    model_options: string[];
    finetuned: boolean;
  }>;
  video_count: number;
  total_duration: number;
}

export interface TLVideo {
  _id: string;
  index_id: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    filename?: string;
    duration?: number;
    fps?: number;
    width?: number;
    height?: number;
    size?: number;
    [key: string]: any;
  };
  hls?: {
    video_url?: string;
    thumbnail_urls?: string[];
    status?: string;
  };
}

export interface TLSearchResult {
  search_pool: {
    index_id: string;
    total_count: number;
    total_duration: number;
  };
  data: Array<{
    id: string;
    score: number;
    start: number;
    end: number;
    video_id: string;
    confidence: string;
    metadata: Array<{
      type: string;
      text?: string;
    }>;
    modules: Array<{
      type: string;
      confidence: string;
    }>;
  }>;
  page_info: {
    limit_per_page: number;
    page: number;
    total_page: number;
    total_results: number;
  };
}

// List all indexes
export async function listIndexes(): Promise<{ data: TLIndex[] }> {
  const response = await fetch(`${API_BASE}/indexes`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to list indexes: ${response.statusText}`);
  }

  return response.json();
}

// Get a specific index
export async function getIndex(indexId: string): Promise<TLIndex> {
  const response = await fetch(`${API_BASE}/indexes/${indexId}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to get index: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// List videos in an index
export async function listVideos(indexId: string): Promise<{ data: TLVideo[] }> {
  const response = await fetch(
    `${API_BASE}/indexes/${indexId}/videos`,
    {
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list videos: ${response.statusText}`);
  }

  const result = await response.json();

  // Map system_metadata to metadata for consistency
  if (result.data) {
    result.data = result.data.map((video: any) => ({
      ...video,
      metadata: video.system_metadata || video.metadata,
    }));
  }

  return result;
}

// Search videos
export async function searchVideos(
  indexId: string,
  query: string,
  options?: {
    search_options?: string[];
    page_limit?: number;
    sort_option?: string;
  }
): Promise<TLSearchResult> {
  const body = {
    index_id: indexId,
    query,
    search_options: options?.search_options || ['visual', 'conversation', 'text_in_video'],
    page_limit: options?.page_limit || 10,
    sort_option: options?.sort_option || 'score',
  };

  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

// Generate summary/chapters/highlights
export async function generateSummary(
  videoId: string,
  type: 'summary' | 'chapter' | 'highlight'
): Promise<any> {
  const endpoint = type === 'summary' ? 'summarize' : type;

  const response = await fetch(`${API_BASE}/generate/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      video_id: videoId,
      type: type,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generate ${type} failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Generate text (for topics, hashtags, titles)
export async function generateText(
  videoId: string,
  prompt: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/generate/text`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      video_id: videoId,
      prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generate text failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Open-ended text generation (gist)
export async function generateGist(
  videoId: string,
  types: string[]
): Promise<any> {
  const response = await fetch(`${API_BASE}/generate/gist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      video_id: videoId,
      types,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generate gist failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Create index
export async function createIndex(
  name: string,
  models: Array<{
    model_name: string;
    model_options: string[];
  }>
): Promise<TLIndex> {
  const response = await fetch(`${API_BASE}/indexes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      index_name: name,
      models,
      addons: ['thumbnail'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Create index failed: ${response.statusText}`);
  }

  return response.json();
}

// Delete index
export async function deleteIndex(indexId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/indexes/${indexId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Delete index failed: ${response.statusText}`);
  }
}

// Delete video
export async function deleteVideo(indexId: string, videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/indexes/${indexId}/videos/${videoId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Delete video failed: ${response.statusText}`);
  }
}
