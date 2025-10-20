# TwelveLabs API v1.3 Reference

Complete reference for TwelveLabs video understanding API, customized for law enforcement use cases.

---

## Base Configuration

```typescript
const API_BASE = 'https://api.twelvelabs.io/v1.3';
const headers = {
  'x-api-key': process.env.TWELVELABS_API_KEY,
  'Content-Type': 'application/json',
};
```

---

## Indexes

### List All Indexes
Get all video indexes in your account.

```bash
GET /v1.3/indexes
```

**Response**:
```json
{
  "data": [
    {
      "_id": "68f5b7e4f4b07b407a25d763",
      "index_name": "Axon Body Camera Footage",
      "created_at": "2025-10-15T10:30:00Z",
      "updated_at": "2025-10-20T08:45:00Z",
      "expires_at": "2026-10-15T10:30:00Z",
      "addons": ["thumbnail"],
      "models": [
        {
          "model_name": "marengo2.7",
          "model_options": ["visual", "conversation", "text_in_video"],
          "finetuned": false
        }
      ],
      "video_count": 2,
      "total_duration": 258
    }
  ]
}
```

### Get Specific Index
Retrieve details for a single index.

```bash
GET /v1.3/indexes/{index_id}
```

**Example**:
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.twelvelabs.io/v1.3/indexes/68f5b7e4f4b07b407a25d763
```

### Create Index
Create a new video index with specific model configuration.

```bash
POST /v1.3/indexes
```

**Body**:
```json
{
  "index_name": "Law Enforcement Search - 2025-10-20",
  "models": [
    {
      "model_name": "marengo2.7",
      "model_options": ["visual", "conversation", "text_in_video"]
    }
  ],
  "addons": ["thumbnail"]
}
```

**Model Options**:
- **Marengo 2.7**: Search and embeddings (visual, conversation, text_in_video, logo)
- **Pegasus 1.2**: Text generation (visual, conversation)

**Use Cases**:
- **Search Index**: Use Marengo for semantic search across body cam, CCTV footage
- **Analysis Index**: Use Pegasus for summaries, chapters, insights

### Delete Index
⚠️ Permanently delete an index and all its videos.

```bash
DELETE /v1.3/indexes/{index_id}
```

---

## Videos

### List Videos in Index
Get all videos in a specific index.

```bash
GET /v1.3/indexes/{index_id}/videos
```

**Response**:
```json
{
  "data": [
    {
      "_id": "68f5b7fc50d73a53e9029f93",
      "index_id": "68f5b7e4f4b07b407a25d763",
      "created_at": "2025-10-15T12:00:00Z",
      "updated_at": "2025-10-15T12:05:00Z",
      "system_metadata": {
        "filename": "axon_bwc_traffic_stop.mp4",
        "duration": 129.5,
        "fps": 30,
        "width": 1920,
        "height": 1080,
        "size": 52428800
      },
      "hls": {
        "video_url": "https://...",
        "thumbnail_urls": ["https://..."],
        "status": "ready"
      }
    }
  ]
}
```

**Note**: API returns `system_metadata` but you should map to `metadata` for consistency.

### Upload Video
Upload a video to an index for processing.

```bash
POST /v1.3/indexes/{index_id}/videos
```

**Body (URL upload)**:
```json
{
  "url": "https://storage.example.com/videos/bwc_footage.mp4",
  "metadata": {
    "type": "bwc",
    "source": "Axon Body 3",
    "scenario": "Traffic Stop",
    "lightingConditions": "Daylight",
    "officer_id": "12345",
    "incident_number": "2025-10-20-001"
  }
}
```

**Body (File upload)**:
```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/video.mp4" \
  -F "metadata={\"type\":\"bwc\",\"source\":\"Axon Body 3\"}" \
  https://api.twelvelabs.io/v1.3/indexes/{index_id}/videos
```

**Response**:
```json
{
  "task_id": "68f5b8a1f4b07b407a25d764",
  "status": "pending"
}
```

### Check Upload Status
Monitor video processing progress.

```bash
GET /v1.3/tasks/{task_id}
```

**Response**:
```json
{
  "_id": "68f5b8a1f4b07b407a25d764",
  "status": "ready",
  "video_id": "68f5b7fc50d73a53e9029f93",
  "created_at": "2025-10-20T10:00:00Z",
  "updated_at": "2025-10-20T10:05:00Z"
}
```

**Status Values**:
- `pending` - Waiting to start
- `validating` - Checking file format
- `indexing` - Processing video
- `ready` - Complete and searchable
- `failed` - Error occurred

### Delete Video
Remove a video from an index.

```bash
DELETE /v1.3/indexes/{index_id}/videos/{video_id}
```

---

## Search

### Semantic Search
Search videos using natural language queries.

```bash
POST /v1.3/search
```

**Body**:
```json
{
  "index_id": "68f5b7e4f4b07b407a25d763",
  "query": "officer speaking into radio during traffic stop",
  "search_options": ["visual", "conversation", "text_in_video"],
  "page_limit": 10,
  "sort_option": "score"
}
```

**Law Enforcement Query Examples**:
- "suspect fleeing on foot"
- "vehicle description white sedan"
- "officer drawing weapon"
- "handcuffs being applied"
- "miranda rights being read"
- "person wearing red jacket"

**Response**:
```json
{
  "search_pool": {
    "index_id": "68f5b7e4f4b07b407a25d763",
    "total_count": 2,
    "total_duration": 258
  },
  "data": [
    {
      "id": "search-result-1",
      "score": 89.7,
      "start": 15.2,
      "end": 23.8,
      "video_id": "68f5b7fc50d73a53e9029f93",
      "confidence": "high",
      "metadata": [
        {
          "type": "visual",
          "text": "Police officer holding radio device near face"
        }
      ],
      "modules": [
        {
          "type": "visual",
          "confidence": "high"
        }
      ]
    }
  ],
  "page_info": {
    "limit_per_page": 10,
    "page": 1,
    "total_page": 1,
    "total_results": 1
  }
}
```

**Search Options**:
- `visual` - Visual content (objects, actions, scenes)
- `conversation` - Spoken dialogue (requires audio)
- `text_in_video` - On-screen text (signs, license plates, subtitles)
- `logo` - Brand/logo detection

**Sort Options**:
- `score` - Highest relevance first (default)
- `clip_count` - Most matching clips first

---

## Generate (Text Analysis)

### Generate Summary
Create a summary of video content.

```bash
POST /v1.3/summarize
```

**Body**:
```json
{
  "video_id": "68f5b7fc50d73a53e9029f93",
  "type": "summary"
}
```

**Example**:
```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"video_id":"68f5b7fc50d73a53e9029f93","type":"summary"}' \
  https://api.twelvelabs.io/v1.3/summarize
```

**Response**:
```json
{
  "summary": "The video shows a person demonstrating the functionality of a recording device, likely a body-worn camera. The individual is seen in various settings, including outdoors and indoors, while speaking directly to the camera. Throughout the footage, the person explains different features of the device, such as video and audio recording capabilities...",
  "video_id": "68f5b7fc50d73a53e9029f93"
}
```

**Summary Types**:
- `summary` - Overall video summary (1-3 paragraphs)
- `chapter` - Timestamped chapter breakdown
- `highlight` - Key moments and highlights

### Generate Chapters
Get timestamped chapter breakdown.

```bash
POST /v1.3/summarize
```

**Body**:
```json
{
  "video_id": "68f5b7fc50d73a53e9029f93",
  "type": "chapter"
}
```

**Response**:
```json
{
  "chapters": [
    {
      "start": 0,
      "end": 45.2,
      "chapter_title": "Introduction and Device Overview",
      "chapter_summary": "Officer introduces body-worn camera and explains basic recording functions"
    },
    {
      "start": 45.2,
      "end": 129.5,
      "chapter_title": "Feature Demonstration",
      "chapter_summary": "Demonstration of various recording modes and settings"
    }
  ],
  "video_id": "68f5b7fc50d73a53e9029f93"
}
```

**Law Enforcement Use**: Generate incident reports, create case summaries, timestamp key events.

### Generate Highlights
Extract key moments from video.

```bash
POST /v1.3/summarize
```

**Body**:
```json
{
  "video_id": "68f5b7fc50d73a53e9029f93",
  "type": "highlight"
}
```

**Response**:
```json
{
  "highlights": [
    {
      "start": 12.5,
      "end": 18.3,
      "highlight": "Officer activates body camera recording"
    },
    {
      "start": 67.2,
      "end": 75.8,
      "highlight": "Audio recording demonstration with clarity check"
    }
  ],
  "video_id": "68f5b7fc50d73a53e9029f93"
}
```

---

## Generate (Open-Ended Text)

### Generate Topics/Hashtags/Titles
Use `/gist` endpoint for open-ended text generation.

```bash
POST /v1.3/gist
```

**Body (with types)**:
```json
{
  "video_id": "68f5b7fc50d73a53e9029f93",
  "types": ["topic", "hashtag", "title"]
}
```

**Body (with custom prompt)**:
```json
{
  "video_id": "68f5b7fc50d73a53e9029f93",
  "prompt": "List all visible evidence items, weapons, or contraband in this video. Format as a bulleted list."
}
```

**Response**:
```json
{
  "topics": ["Body-worn cameras", "Recording devices", "Law enforcement technology"],
  "hashtags": ["#BWC", "#BodyCamera", "#LawEnforcement", "#VideoEvidence"],
  "title": "Body-Worn Camera Feature Demonstration and Training",
  "video_id": "68f5b7fc50d73a53e9029f93"
}
```

**Law Enforcement Prompts**:
- "Identify all persons visible in the video and describe their appearance"
- "List all vehicles shown with make, model, color, and license plate if visible"
- "Describe the location and setting where this incident occurred"
- "Identify any weapons or contraband visible in the footage"
- "Summarize officer actions and use of force incidents"
- "Extract key dialogue and verbal exchanges"

---

## Embeddings (Advanced)

### Create Video Embeddings
Generate vector embeddings for similarity search.

```bash
POST /v1.3/embed/task
```

**Body**:
```json
{
  "index_id": "68f5b7e4f4b07b407a25d763",
  "url": "https://storage.example.com/video.mp4",
  "engine_name": "marengo2.7"
}
```

**Use Cases**:
- Find similar incidents across thousands of videos
- Detect patterns in suspect behavior
- Match vehicle descriptions across multiple cameras
- Identify repeat offenders from appearance

---

## Model Comparison

### Marengo 2.7 (Search & Embeddings)
**Purpose**: Semantic search and video understanding

**Capabilities**:
- Visual understanding (objects, actions, scenes)
- Audio transcription and conversation understanding
- Text-in-video detection (OCR)
- Logo and brand detection

**Best For**:
- Body-worn camera search
- CCTV footage analysis
- Evidence discovery
- Incident matching

**Model Options**: `["visual", "conversation", "text_in_video", "logo"]`

### Pegasus 1.2 (Text Generation)
**Purpose**: Generating summaries and descriptions

**Capabilities**:
- Video summarization
- Chapter generation
- Highlight extraction
- Open-ended text generation

**Best For**:
- Incident reports
- Case summaries
- Training materials
- Public records requests

**Model Options**: `["visual", "conversation"]`

---

## Law Enforcement Video Types

### 1. Body-Worn Camera (BWC)
**Characteristics**:
- Resolution: 720p-1080p
- FPS: 30
- Challenges: Low-light, motion blur, fish-eye lens
- Audio: Usually good quality

**Metadata Tags**:
```json
{
  "type": "bwc",
  "source": "Axon Body 3",
  "officer_id": "12345",
  "incident_number": "2025-10-20-001",
  "scenario": "Traffic Stop"
}
```

### 2. CCTV Surveillance
**Characteristics**:
- Resolution: 480p-720p (often lower)
- FPS: 15-30 (often lower)
- Challenges: Compression artifacts, static angle, poor lighting
- Audio: Often none or poor quality

**Metadata Tags**:
```json
{
  "type": "cctv",
  "source": "Security Camera",
  "location": "Main Street & 5th Ave",
  "camera_id": "CAM-001"
}
```

### 3. High-Quality Consumer (iPhone/DJI)
**Characteristics**:
- Resolution: 1080p-4K
- FPS: 30-60
- Quality: Excellent
- Audio: High quality

**Metadata Tags**:
```json
{
  "type": "iphone",
  "source": "iPhone 14 Pro",
  "scenario": "Witness Recording"
}
```

### 4. YouTube/Social Media
**Characteristics**:
- Variable resolution (re-encoded)
- Compression artifacts
- Quality: Depends on platform
- Audio: Variable

**Metadata Tags**:
```json
{
  "type": "youtube",
  "source": "Social Media",
  "platform": "YouTube"
}
```

---

## Error Handling

### Common Errors

**401 Unauthorized**:
```json
{
  "code": "unauthorized",
  "message": "Invalid API key"
}
```
**Fix**: Check `TWELVELABS_API_KEY` environment variable

**404 Not Found**:
```json
{
  "code": "endpoint_not_exists",
  "message": "The endpoint '/generate/summarize' does not exist"
}
```
**Fix**: Use `/summarize` not `/generate/summarize` (v1.3 endpoints)

**400 Bad Request**:
```json
{
  "code": "invalid_request",
  "message": "video_id is required"
}
```
**Fix**: Verify all required fields in request body

**429 Rate Limited**:
```json
{
  "code": "rate_limit_exceeded",
  "message": "Too many requests"
}
```
**Fix**: Implement exponential backoff, reduce request frequency

---

## Best Practices

### 1. Index Organization
- Create separate indexes for different video types (BWC vs CCTV)
- Use descriptive names: "BWC-2025-Q4" not "Index-1"
- Tag videos with consistent metadata

### 2. Search Optimization
- Use specific queries: "suspect wearing red hoodie" not "person"
- Combine search options: `["visual", "conversation"]` for best results
- Filter by timeframes for large indexes

### 3. Video Upload
- Include comprehensive metadata at upload time
- Use consistent naming conventions
- Tag with incident numbers for tracking

### 4. Analysis Workflow
1. Upload video → Get task_id
2. Poll task status until "ready"
3. Run search queries
4. Generate summaries/chapters
5. Export results for case files

### 5. Government Compliance
- Store API keys in secure environment variables
- Use server-side API routes (never expose keys to client)
- Log all API calls for audit trail
- Consider on-premise deployment for CJIS compliance

---

## Rate Limits

**Current Limits** (verify with TwelveLabs):
- Search: 100 requests/minute
- Upload: 50 videos/hour
- Generation: 50 requests/minute

**Handling**:
```typescript
async function retryWithBackoff(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Additional Resources

- **Official Docs**: https://docs.twelvelabs.io/
- **API Status**: https://status.twelvelabs.io/
- **API Changelog**: https://docs.twelvelabs.io/changelog
- **Support**: support@twelvelabs.io

---

**Last Updated**: 2025-10-20
**API Version**: v1.3
**For**: TwelveLabs PM Interview - Government + Security Deployment
