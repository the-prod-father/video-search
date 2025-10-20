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
    const errorText = await response.text();
    throw new Error(`Failed to list indexes: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Get a specific index
export async function getIndex(indexId: string): Promise<TLIndex> {
  const response = await fetch(`${API_BASE}/indexes/${indexId}`, {
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get index: ${response.statusText} - ${errorText}`);
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
    const errorText = await response.text();
    throw new Error(`Failed to list videos: ${response.statusText} - ${errorText}`);
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
  // TwelveLabs v1.3 search requires multipart/form-data
  const formData = new FormData();
  formData.append('index_id', indexId);
  formData.append('query_text', query);  // Use query_text not query
  formData.append('page_limit', String(options?.page_limit || 10));
  formData.append('sort_option', options?.sort_option || 'score');

  // Add search options as individual form fields
  // Note: This index supports 'visual' and 'audio' (not 'conversation')
  const searchOptions = options?.search_options || ['visual', 'audio'];
  searchOptions.forEach(option => {
    formData.append('search_options', option);
  });

  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY!,
      // Don't set Content-Type - let fetch set it with boundary for multipart
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TwelveLabs API Error:', errorText);
    throw new Error(`Search failed: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Generate summary/chapters/highlights
export async function generateSummary(
  videoId: string,
  type: 'summary' | 'chapter' | 'highlight'
): Promise<any> {
  const response = await fetch(`${API_BASE}/summarize`, {
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

// Generate text (for topics, hashtags, titles) using gist endpoint
export async function generateText(
  videoId: string,
  prompt: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/gist`, {
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

// Open-ended text generation (gist) - for topics, hashtags, titles
export async function generateGist(
  videoId: string,
  types: string[]
): Promise<any> {
  const response = await fetch(`${API_BASE}/gist`, {
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
    const errorText = await response.text();
    console.error('TwelveLabs API Error:', errorText);
    throw new Error(`Create index failed: ${response.statusText} - ${errorText}`);
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
    const errorText = await response.text();
    throw new Error(`Delete index failed: ${response.statusText} - ${errorText}`);
  }
}

// Delete video
export async function deleteVideo(indexId: string, videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/indexes/${indexId}/videos/${videoId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete video failed: ${response.statusText} - ${errorText}`);
  }
}
