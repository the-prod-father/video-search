# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15 application showcasing TwelveLabs video AI capabilities for law enforcement and government use cases. The app tests video analysis across four categories: Body Worn Camera (BWC), CCTV, high-quality consumer video, and YouTube/social media content.

Built for TwelveLabs Product Manager interview (Government + Secure Deployment role).

## Tech Stack

- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Full type safety throughout
- **TwelveLabs API v1.3**: Custom client implementation (not official SDK)
- **Tailwind CSS**: Utility-first styling
- **Axon Evidence.com**: OAuth integration (in development)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (default port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Vercel deployment
npm run vercel-build
```

## Environment Variables

Required in `.env.local`:

```bash
# TwelveLabs API
TWELVELABS_API_KEY=your_api_key_here

# Evidence.com OAuth (optional, for sync feature)
EVIDENCE_CLIENT_ID=your_client_id
EVIDENCE_API_SECRET=your_client_secret
EVIDENCE_PARTNER_ID=your_partner_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture

### TwelveLabs API Integration

- **Custom client**: `lib/twelvelabs-custom.ts` implements TwelveLabs API v1.3 directly (not using `twelvelabs-js` SDK)
- **Why custom**: API v1.3 uses multipart/form-data for search, requires specific field names (`query_text`, not `query`)
- **Key difference**: Search options are `visual` and `audio` (not `conversation` like older SDK)

### API Routes Structure

All backend logic in Next.js API routes:

- `/api/indexes` - Index CRUD operations
- `/api/videos` - Video management
- `/api/search` - Semantic video search
- `/api/analyze` - Video analysis (summaries, chapters, highlights)
- `/api/evidence/*` - Evidence.com OAuth and sync (in development)

### Evidence.com Integration

Located in `/api/evidence/*` routes. Current status: **401 authentication issues**

**Critical context**:
- Tries multiple auth endpoints (api.evidence.com, evidence.com, [PARTNER_ID].evidence.com)
- Requires `any.read` scope permission on Evidence API client
- See `EVIDENCE_SYNC_REQUIREMENTS.md` for detailed troubleshooting

### Type System

`lib/types.ts` contains all TypeScript interfaces:

- **Core types**: `EnhancedVideo`, `Index`, `SearchResult`, `VideoAnalysis`
- **Government types**: `LEUseCase`, `DeploymentScenario`, `AuditLog`
- **Video categories**: `bwc`, `cctv`, `high-quality`, `youtube`, `unknown`
- **Quality thresholds**: Minimum/recommended/optimal resolution, fps, bitrate
- **Accuracy baselines**: Expected performance by video type (BWC: 80%, CCTV: 75%, etc.)

### Page Structure

Dashboard-first design (max 2 clicks to any feature):

- `/` - Dashboard with quick actions and stats
- `/indexes` - Index management
- `/videos` - Video gallery
- `/search` - Search interface
- `/analyze/[videoId]` - Video analysis results
- `/insights` - Government deployment insights

## Key Implementation Details

### Search Implementation

Search uses TwelveLabs v1.3 API with **multipart/form-data**:

```typescript
const formData = new FormData();
formData.append('index_id', indexId);
formData.append('query_text', query);  // Note: query_text not query
formData.append('page_limit', '10');
formData.append('sort_option', 'score');
// Add each search option separately
searchOptions.forEach(option => {
  formData.append('search_options', option);
});
```

**Important**: This index supports `visual` and `audio` options (not `conversation`).

### Video Analysis

Three types generated via `/api/analyze`:

1. **Summary**: Overall video description
2. **Chapters**: Timeline breakdown with titles/summaries
3. **Highlights**: Key moments extraction

All use TwelveLabs summarize/gist endpoints.

### Video Categories

Videos are categorized for performance testing:

- **BWC**: Body worn cameras (Axon) - expect 75-85% accuracy
- **CCTV**: Fixed surveillance - expect 70-80% accuracy
- **High-quality**: iPhone/DJI baseline - expect ~95% accuracy
- **YouTube**: Re-encoded content - expect 60-80% accuracy

Category detection is based on metadata or filename patterns.

## Law Enforcement Use Cases

Defined in `lib/types.ts` as `LE_USE_CASES`:

1. **Use of Force Investigation**: Search BWC for force incidents
2. **Vehicle Identification**: Track vehicles across camera networks
3. **Person of Interest Tracking**: Find individuals across multiple sources
4. **Incident Timeline Generation**: Auto-generate chronological breakdowns

Each use case includes:
- Applicable video types
- Example search queries
- Expected accuracy by category

## Deployment Scenarios

Three deployment models defined in `lib/types.ts`:

1. **Cloud**: SaaS via TwelveLabs API (current implementation)
2. **On-Premise**: Self-hosted in agency data center (requires GPU infrastructure)
3. **Air-Gapped**: Fully disconnected high-security environment

Each includes requirements, considerations, and compliance certifications (FedRAMP, CJIS, ITAR).

## Path Aliases

`@/` maps to project root via `tsconfig.json`:

```typescript
import { searchVideos } from '@/lib/twelvelabs-custom';
import { VideoCategory } from '@/lib/types';
```

## Known Issues

1. **Evidence.com sync**: Currently returns 401 Unauthorized
   - Check `EVIDENCE_SYNC_REQUIREMENTS.md` for troubleshooting
   - Verify API client has `any.read` scope
   - Try regenerating Client Secret

2. **TwelveLabs API version**: Using v1.3, not compatible with older SDK examples
   - Search requires multipart/form-data
   - Field names differ (`query_text` vs `query`)

## Critical Files

- `lib/twelvelabs-custom.ts` - All TwelveLabs API interactions
- `lib/types.ts` - Complete type system + constants
- `app/api/search/route.ts` - Search implementation
- `app/api/evidence/videos/route.ts` - Evidence.com sync logic

## Product Context

This is a **demonstration project** showcasing:

1. **Technical depth**: Full-stack Next.js + TwelveLabs integration
2. **Product thinking**: Tested across real-world video quality levels
3. **Customer empathy**: Built for actual LE workflows and challenges
4. **Government focus**: Compliance, deployment scenarios, accuracy thresholds

Key insight: **Video quality matters** - Real BWC/CCTV footage is significantly lower quality than demo footage, impacting AI accuracy. Government adoption requires understanding compression tradeoffs, compliance certifications, and an 80%+ accuracy threshold for production trust.
