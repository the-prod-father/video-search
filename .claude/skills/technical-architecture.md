# Technical Architecture

## Application Stack

### Frontend
- **Next.js 14+**: App Router with React Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library

### Backend/API
- **Next.js API Routes**: Server-side API handlers
- **TwelveLabs SDK**: Official Node.js SDK (twelvelabs-js)
- **API Key Management**: Environment variables, secure storage

## Data Flow

### 1. Video Upload & Indexing
```
User Upload → TwelveLabs API → Async Processing → Index Complete → Available for Search/Analysis
```

### 2. Search Flow
```
User Query → API Route → TwelveLabs Search → Results → Client Display
```

### 3. Analysis Generation
```
Video Selection → API Route → TwelveLabs Generate → Stream Response → Client Display
```

## Component Architecture

### Pages/Routes
- `/` - Dashboard: Overview of all indexes and videos
- `/indexes` - Index Management: Create, list, delete indexes
- `/videos` - Video Gallery: Categorized by type (BWC, CCTV, iPhone, YouTube)
- `/search` - Search Interface: Query across all videos
- `/analyze/[videoId]` - Analysis Results: Summaries, chapters, highlights
- `/compare` - Comparison View: Side-by-side analysis of different video types
- `/insights` - Government Insights: Metrics, performance, deployment considerations

### Core Components
- `VideoCard` - Display video metadata, thumbnail, actions
- `SearchResults` - Display search results with timestamps
- `AnalysisPanel` - Show generated summaries, chapters, highlights
- `VideoComparison` - Side-by-side comparison of analysis results
- `MetricsChart` - Visualize performance across video types
- `IndexManager` - Create and manage video indexes

## TwelveLabs Integration

### SDK Initialization
```typescript
import { TwelveLabs } from 'twelvelabs-js';

const client = new TwelveLabs({
  apiKey: process.env.TWELVELABS_API_KEY
});
```

### Key Operations

#### 1. Index Management
```typescript
// Create index with Marengo (search) or Pegasus (generation)
const index = await client.index.create({
  name: 'law-enforcement-footage',
  engines: [
    {
      name: 'marengo2.6',
      options: ['visual', 'conversation', 'text_in_video']
    }
  ]
});
```

#### 2. Video Upload
```typescript
// Upload video to index
const task = await client.task.create({
  indexId: index.id,
  videoUrl: 'https://...',
  language: 'en'
});

// Monitor processing
await task.waitForDone();
```

#### 3. Search
```typescript
// Natural language search
const results = await client.search.query({
  indexId: index.id,
  query: 'police officer running',
  options: ['visual', 'conversation']
});
```

#### 4. Generate Analysis
```typescript
// Generate summary
const summary = await client.generate.summarize({
  videoId: video.id,
  type: 'summary'
});

// Generate chapters
const chapters = await client.generate.summarize({
  videoId: video.id,
  type: 'chapter'
});
```

#### 5. Embeddings
```typescript
// Create video embeddings
const embeddings = await client.embed.task.create({
  indexId: index.id,
  videoUrl: 'https://...',
  engineName: 'marengo2.6'
});
```

## Video Categorization Strategy

### Metadata Tagging
When uploading videos, tag them with metadata:
```typescript
{
  videoUrl: 'https://...',
  metadata: {
    type: 'bwc' | 'cctv' | 'iphone' | 'youtube',
    resolution: '1080p',
    source: 'Axon Body 3',
    scenario: 'patrol' | 'incident' | 'training',
    lightingConditions: 'day' | 'night' | 'mixed'
  }
}
```

### Performance Tracking
Track and display:
- Processing time by video type
- Search accuracy/relevance by video type
- Analysis quality by video type
- Cost/resource usage by video type

## Security Considerations

### API Key Protection
- Store in `.env.local` (never commit)
- Use server-side API routes only
- Rotate keys regularly

### Data Privacy
- No video storage in application (reference only)
- No PII in client-side code
- Audit trail for all operations

## Deployment Scenarios (Demo Understanding)

### Cloud (Current Demo)
- Next.js on Vercel
- TwelveLabs cloud API
- Internet connectivity required

### On-Premise (Future for Government)
- Self-hosted Next.js
- TwelveLabs on-premise deployment
- Internal network only

### Air-Gapped (High Security)
- Fully disconnected infrastructure
- TwelveLabs model deployed locally
- No external API calls

## Performance Optimization

### Client-Side
- Server Components for static content
- Client Components only for interactivity
- Streaming responses for analysis
- Pagination for large result sets

### Server-Side
- Caching for frequently accessed data
- Batch operations where possible
- Async processing with status polling
- Rate limiting compliance

## Error Handling

### Graceful Degradation
- Handle API rate limits
- Display processing status
- Retry logic for transient failures
- Clear error messages for users

### Monitoring
- Log all API calls
- Track processing times
- Monitor error rates
- Alert on failures
