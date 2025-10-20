# TwelveLabs Video Search - Law Enforcement Demo

A comprehensive Next.js application demonstrating TwelveLabs video understanding capabilities for government and law enforcement applications.

## Purpose

This application was built to showcase deep understanding of TwelveLabs' video AI platform, specifically focused on real-world government and law enforcement use cases. It tests video analysis across four distinct categories:

1. **Body Worn Camera (BWC)** - Real law enforcement footage from Axon cameras
2. **CCTV Surveillance** - Fixed camera systems with varying quality
3. **High-Quality Consumer** - iPhone/DJI cameras (baseline performance)
4. **YouTube/Social Media** - Re-encoded public content

## Key Features

- **Semantic Search**: Natural language search across video content
- **Video Analysis**: Auto-generate summaries, chapters, highlights, topics
- **Quality Comparison**: Side-by-side testing across video types
- **Government Insights**: Deployment considerations, use cases, compliance
- **Index Management**: Create and manage search/analysis indexes
- **Performance Metrics**: Track accuracy and processing time by video type

## Tech Stack

- **Next.js 15** - App Router with React Server Components
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **TwelveLabs SDK** - Official Node.js SDK (twelvelabs-js)
- **Lucide Icons** - Icon system

## Getting Started

### Prerequisites

- Node.js 18+ installed
- TwelveLabs API key
- Videos uploaded to TwelveLabs platform

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-search.git
cd video-search
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
TWELVELABS_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /page.tsx                 - Dashboard
  /indexes/page.tsx         - Index management
  /videos/page.tsx          - Video gallery
  /search/page.tsx          - Search interface
  /insights/page.tsx        - Gov deployment insights
  /api
    /indexes/route.ts       - Index API endpoints
    /videos/route.ts        - Video API endpoints
    /search/route.ts        - Search API endpoints
    /analyze/route.ts       - Analysis API endpoints
/components
  /ui                       - UI components (Button, Card, Badge)
/lib
  /twelvelabs.ts            - TwelveLabs SDK client
  /types.ts                 - TypeScript types
  /utils.ts                 - Utility functions
/.claude
  /skills                   - Claude Skills documentation
```

## Law Enforcement Use Cases

### 1. Use of Force Investigation
Search BWC footage to identify and review use of force incidents, generate incident timelines, and create evidence packages.

**Example Queries:**
- "officer with hand on weapon"
- "physical struggle"
- "taser deployment"

### 2. Vehicle & Person Tracking
Find vehicles or individuals across multiple camera feeds using natural language descriptions.

**Example Queries:**
- "silver sedan"
- "person wearing red jacket"
- "vehicle fleeing scene"

### 3. Evidence Timeline Generation
Auto-generate chronological breakdowns of incidents with chapters, summaries, and highlights for court proceedings.

### 4. Multi-Source Evidence Correlation
Correlate BWC, CCTV, and citizen-submitted videos of the same incident to build comprehensive evidence packages.

## Deployment Scenarios

### Cloud (Current)
- SaaS deployment via TwelveLabs API
- Requires internet connectivity
- Best for: pilot programs, small agencies

### On-Premise
- Self-hosted within agency data center
- Requires GPU infrastructure (NVIDIA A100/H100)
- Best for: medium to large agencies with IT infrastructure

### Air-Gapped
- Fully disconnected, high-security environment
- Manual model deployment and updates
- Best for: DoD, intelligence agencies, classified environments

## Performance Expectations

Based on testing across video types:

- **High-Quality (iPhone/DJI)**: ~95% accuracy baseline
- **Body Worn Camera**: 75-85% accuracy (lighting dependent)
- **CCTV**: 70-80% accuracy (quality/distance dependent)
- **YouTube Re-encoded**: 60-80% accuracy (variable)

## Key Insights

### Video Quality Matters
Real-world law enforcement video is significantly lower quality than demo footage. Agencies compress aggressively for storage costs, impacting AI accuracy.

### Compliance is Critical
Government adoption requires FedRAMP, CJIS, ITAR certifications. Technical capability alone is insufficient.

### Trust Threshold
For production deployment, 80%+ accuracy on real BWC footage is critical. Below this, investigators won't trust the system.

### Multi-Source Reality
Real investigations combine BWC from multiple officers, business CCTV, and citizen videos. AI must work across all sources.

## API Routes

### Indexes
- `GET /api/indexes` - List all indexes
- `POST /api/indexes` - Create new index
- `DELETE /api/indexes?id=INDEX_ID` - Delete index

### Videos
- `GET /api/videos?indexId=INDEX_ID` - Get videos
- `POST /api/videos` - Upload video
- `DELETE /api/videos?videoId=VIDEO_ID` - Delete video

### Search
- `POST /api/search` - Search videos with natural language

### Analysis
- `POST /api/analyze` - Generate video analysis (summaries, chapters, etc.)

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

## Claude Skills Documentation

This project includes comprehensive Claude Skills documentation in `.claude/skills/`:

- `product-context.md` - TwelveLabs product knowledge and gov use cases
- `technical-architecture.md` - Application architecture and integration
- `video-types-analysis.md` - Video category testing framework
- `interview-strategy.md` - Interview preparation and talking points
- `project-overview.md` - Project structure and getting started

## Interview Talking Points

### Technical Depth
- Built full-stack Next.js app with TwelveLabs SDK integration
- Tested across four real-world video quality levels
- Implemented search, analysis, and comparison features

### Product Thinking
- Identified accuracy drops with low-light BWC footage (product risk)
- Built comparison views to help agencies understand performance
- Designed for government requirements (audit trails, quality thresholds)

### Customer Empathy
- Tested exact video types government customers will use
- Understood storage vs. quality tradeoffs from Axon experience
- Built use case examples specific to LE workflows

## Next Steps

Potential enhancements:
- Authentication and user management
- Comprehensive audit logging
- Redaction workflow integration
- Multi-video correlation features
- Export to evidence management systems
- Batch processing for large video sets

## License

MIT

## Author

Built for TwelveLabs Product Manager interview (Government + Secure Deployment role)

Demonstrating deep understanding of:
- TwelveLabs video AI capabilities
- Real-world law enforcement video challenges
- Government deployment requirements
- Product thinking for secure enterprise customers
Search your videos using twlevelabs API to detect anything from video to audio to inflections so nothing is lost among your moments.
