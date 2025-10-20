# Video Search - TwelveLabs Demo Application

## Project Purpose
This is a comprehensive Next.js application built to demonstrate mastery of TwelveLabs video understanding platform, specifically focused on government/law enforcement use cases.

Built for: TwelveLabs Product Manager interview (Government + Secure Deployment role)

## What This App Does

### Core Functionality
1. **Video Index Management**: Create, list, and manage TwelveLabs indexes
2. **Video Categorization**: Organize videos by type (BWC, CCTV, iPhone, YouTube)
3. **Semantic Search**: Natural language search across all video content
4. **Video Analysis**: Generate summaries, chapters, highlights, topics, hashtags
5. **Comparison View**: Side-by-side analysis of different video quality types
6. **Performance Metrics**: Track and visualize how TwelveLabs performs across video types
7. **Government Insights**: Deployment considerations, compliance notes, use cases

### Key Differentiators
- **Real-world Testing**: Uses actual BWC and CCTV footage, not just high-quality demos
- **Quality Analysis**: Compares performance across video types to understand deployment constraints
- **Law Enforcement Focus**: Use cases, terminology, and workflows specific to government customers
- **Deployment Awareness**: Demonstrates understanding of air-gapped, on-premise, compliance requirements

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Server Components

### Backend
- Next.js API Routes
- TwelveLabs Node.js SDK (twelvelabs-js)
- Server-side processing

### Deployment
- Local development (npm run dev)
- Can deploy to Vercel for demo purposes
- Architecture designed to show understanding of on-premise deployment needs

## Project Structure
```
/app
  /page.tsx                 - Dashboard
  /indexes/page.tsx         - Index management
  /videos/page.tsx          - Video gallery (categorized)
  /search/page.tsx          - Search interface
  /analyze/[videoId]/page.tsx - Video analysis
  /compare/page.tsx         - Comparison view
  /insights/page.tsx        - Government deployment insights
  /api
    /indexes/route.ts       - Index API endpoints
    /videos/route.ts        - Video API endpoints
    /search/route.ts        - Search API endpoints
    /analyze/route.ts       - Analysis API endpoints
/components
  /ui                       - shadcn/ui components
  /VideoCard.tsx            - Video display component
  /SearchResults.tsx        - Search results component
  /AnalysisPanel.tsx        - Analysis display
  /VideoComparison.tsx      - Side-by-side comparison
  /MetricsChart.tsx         - Performance visualization
/lib
  /twelvelabs.ts            - TwelveLabs SDK client
  /types.ts                 - TypeScript types
  /utils.ts                 - Utility functions
/.claude
  /skills                   - Claude Skills documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- TwelveLabs API key (already configured: tlk_1JB3X382GNYKS62YJQVEX27NRRMT)
- Videos uploaded to TwelveLabs platform (4 types: iPhone, BWC, CCTV, YouTube)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
echo "TWELVELABS_API_KEY=tlk_1JB3X382GNYKS62YJQVEX27NRRMT" > .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### First Time Setup
1. Create indexes (one for Marengo/search, one for Pegasus/generation)
2. Videos should already be uploaded to TwelveLabs
3. Categorize videos by type (metadata tagging)
4. Run test searches and analysis
5. Compare results across video types

## Key Features by Page

### Dashboard (/)
- Overview of all indexes
- Quick stats: total videos, total hours, video type breakdown
- Recent searches
- Quick actions (new index, upload video, search)

### Indexes (/indexes)
- List all indexes with metadata
- Create new index (Marengo or Pegasus)
- Delete indexes
- View videos in each index

### Videos (/videos)
- Gallery view of all videos
- Filter by type: BWC, CCTV, iPhone, YouTube
- Sort by date, duration, processing status
- Quick actions: search, analyze, compare

### Search (/search)
- Natural language search interface
- Search across all videos or specific index
- Results with timestamps and confidence scores
- Click to jump to exact moment in video
- Save searches for later

### Analyze (/analyze/[videoId])
- Video player with timeline
- Generate:
  - Summary (TL;DR of video content)
  - Chapters (timestamped breakdown)
  - Highlights (key moments)
  - Topics (main themes)
  - Hashtags (metadata tags)
  - Title (auto-generated description)
- Export analysis results

### Compare (/compare)
- Select multiple videos (different types)
- Run same search query against all
- Display results side-by-side
- Visualize accuracy differences
- Show processing time, confidence scores

### Insights (/insights)
- Government/LE use cases
- Deployment architecture notes
- Compliance considerations (FedRAMP, ITAR, etc.)
- Performance metrics across video types
- Best practices for law enforcement deployments

## Video Types Being Tested

### 1. iPhone/DJI (High Quality Baseline)
- Purpose: Establish best-case performance
- Resolution: 4K or 1080p
- Use Case: Citizen submissions, training videos

### 2. Axon Body Worn Camera (Real LE Footage)
- Purpose: Test real-world law enforcement video
- Resolution: 720p-1080p
- Challenges: Low light, motion, audio noise
- Use Case: Primary evidence source for LE

### 3. CCTV (Surveillance Cameras)
- Purpose: Test fixed camera, compressed video
- Resolution: 480p-1080p
- Challenges: Distance, compression artifacts, fixed angle
- Use Case: Business surveillance, municipal cameras

### 4. YouTube "Police Footage" (Comparison)
- Purpose: Validate against claimed BWC/CCTV footage
- Resolution: Variable (re-encoded)
- Challenges: Unknown source, multiple encoding passes
- Use Case: Public records, social media evidence

## Key Metrics to Demonstrate

### Performance by Video Type
- Search accuracy (precision/recall)
- Object detection rate
- Text-in-video recognition (OCR)
- Audio transcription accuracy (WER)
- Processing time per minute of video
- Embedding quality (semantic similarity)
- Generation quality (summary accuracy)

### Government Deployment Considerations
- Minimum viable video quality
- Accuracy thresholds for production use
- Processing resource requirements
- Storage implications for embeddings
- Compliance and auditability needs

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables
```
TWELVELABS_API_KEY=tlk_1JB3X382GNYKS62YJQVEX27NRRMT
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Integration Examples

### Initialize Client
```typescript
import { TwelveLabs } from 'twelvelabs-js';

const client = new TwelveLabs({
  apiKey: process.env.TWELVELABS_API_KEY
});
```

### Create Index
```typescript
const index = await client.index.create({
  name: 'law-enforcement-footage',
  engines: [{
    name: 'marengo2.6',
    options: ['visual', 'conversation', 'text_in_video']
  }]
});
```

### Search Videos
```typescript
const results = await client.search.query({
  indexId: 'INDEX_ID',
  query: 'officer running towards suspect',
  options: ['visual', 'conversation']
});
```

### Generate Summary
```typescript
const summary = await client.generate.summarize({
  videoId: 'VIDEO_ID',
  type: 'summary'
});
```

## Interview Talking Points

### Technical Depth
- "I built this Next.js app to test TwelveLabs with real law enforcement video types"
- "I compared performance across 4 video quality levels to understand deployment constraints"
- "I integrated the full SDK—search, analysis, embeddings—to understand all capabilities"

### Product Thinking
- "I noticed accuracy drops significantly with low-light BWC footage—that's a product risk for government adoption"
- "I built comparison views to help agencies understand where the technology works well vs. where it struggles"
- "I designed this with government deployment in mind—audit trails, quality thresholds, explainability"

### Customer Empathy
- "From my Axon experience, I know agencies care more about footage storage costs than quality—that affects your model performance"
- "I tested the exact video types government customers will use—BWC and CCTV, not just high-quality demos"
- "I built use case examples specific to law enforcement workflows—that's how you drive adoption"

## Next Steps / Future Enhancements
- Add authentication and user management
- Implement audit logging for all operations
- Add redaction workflow integration
- Build multi-video correlation features
- Add export to evidence management systems
- Implement batch processing for large video sets
- Add confidence thresholds and quality gates

## Key Resources
- [TwelveLabs Docs](https://docs.twelvelabs.io)
- [TwelveLabs API Reference](https://api.twelvelabs.io)
- [TwelveLabs Node.js SDK](https://github.com/twelvelabs-io/twelvelabs-js)
- [Next.js Documentation](https://nextjs.org/docs)
