# Quick Start Guide - TwelveLabs Video Search Demo

## What You Have Now

A fully functional Next.js application that demonstrates comprehensive TwelveLabs video understanding capabilities for law enforcement and government use cases.

**Application is running at:** http://localhost:3000

## Immediate Next Steps (Before Interview)

### 1. Upload Test Videos to TwelveLabs (CRITICAL)

You need to upload your 4 video types to TwelveLabs:

1. Go to [TwelveLabs Playground](https://playground.twelvelabs.io/)
2. Log in with your account
3. Create an index (or use existing)
4. Upload videos with proper metadata:

```json
{
  "type": "bwc",
  "source": "Axon Body 3",
  "scenario": "patrol",
  "lightingConditions": "night"
}
```

**Video Categories:**
- **BWC**: Your real Axon body-worn camera footage
- **CCTV**: Fixed surveillance camera footage
- **iPhone/DJI**: High-quality consumer video
- **YouTube**: Re-encoded police/security footage

### 2. Test Core Workflows

Once videos are uploaded, test these workflows:

#### A. Index Management
1. Navigate to http://localhost:3000/indexes
2. Create a search index (Marengo)
3. Create an analysis index (Pegasus)
4. Verify they appear in the dashboard

#### B. Video Gallery
1. Navigate to http://localhost:3000/videos
2. Verify your uploaded videos appear
3. Check that they're categorized correctly (BWC, CCTV, etc.)
4. Note the resolution, fps, and file size differences

#### C. Semantic Search
1. Navigate to http://localhost:3000/search
2. Select your search index
3. Try these law enforcement queries:
   - "officer running"
   - "person wearing red jacket"
   - "vehicle fleeing scene"
   - "officer with hand on weapon"
4. Note the confidence scores and processing times
5. Compare results across different video types

#### D. Video Analysis
1. From the videos page, click "Analyze" on a video
2. Generate:
   - Summary (TL;DR of content)
   - Chapters (timestamped breakdown)
   - Highlights (key moments)
   - Topics (main themes)
3. Note how quality of analysis varies by video type

### 3. Document Your Findings

Create notes on:

**Performance by Video Type:**
- BWC accuracy vs high-quality baseline
- Impact of low-light conditions
- Audio transcription quality (BWC vs iPhone)
- Processing time differences

**Key Observations:**
- Where does TwelveLabs excel?
- Where does it struggle?
- What's the production threshold for LE use?

### 4. Prepare Demo Flow for Interview

**Opening (2 min):**
"I built this application this weekend to understand TwelveLabs from a government customer perspective. Let me walk you through what I learned..."

**Demo Sequence (5-7 min):**
1. **Dashboard** - Show the 4 video types and why they matter
2. **Search** - Run a live search query, show results
3. **Comparison** - Show side-by-side results from BWC vs iPhone
4. **Insights** - Walk through government deployment scenarios

**Key Talking Points:**
- "I tested with real Axon BWC footage because that's what agencies actually deploy"
- "Notice the accuracy drop in low-light scenarios - that's critical for night shifts"
- "This comparison shows the production threshold for LE adoption"

### 5. Review Claude Skills Documentation

Before the interview, review:
- `.claude/skills/product-context.md` - Product knowledge
- `.claude/skills/interview-strategy.md` - Talking points
- `.claude/skills/video-types-analysis.md` - Testing framework

## Technical Details for Interview

### Architecture
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind
- **Backend**: API routes with TwelveLabs SDK
- **Deployment**: Currently local, designed for cloud/on-premise/air-gapped

### Key Features Implemented
- Semantic search with natural language
- Video analysis (summaries, chapters, highlights)
- Index management (Marengo for search, Pegasus for generation)
- Quality comparison framework
- Government use case documentation

### What This Demonstrates
1. **Technical Depth**: Built full integration with TwelveLabs SDK
2. **Product Thinking**: Identified quality thresholds and accuracy tradeoffs
3. **Customer Empathy**: Tested with real LE video types
4. **Strategic Thinking**: Documented deployment scenarios and compliance requirements

## During the Interview

### When They Ask About Your Experience
"At Axon, I managed the NYPD BWC deployment - 20,000+ cameras, largest in the world at the time. I learned that video AI success depends on real-world performance, not just demo quality. That's why I built this with actual BWC footage..."

### When They Ask About Technical Skills
"I built this Next.js app with your SDK over the weekend. I implemented search, analysis, and comparison features. But more importantly, I tested across four video quality levels to understand where your technology thrives and where it faces challenges..."

### When They Ask About Product Thinking
"I noticed accuracy drops significantly with low-light BWC footage. For government adoption, that's a product risk because night shifts are 40-60% of captures. I'd want to explore adding quality gates or confidence thresholds to manage customer expectations..."

### Questions to Ask Them

**Technical:**
- What's your strategy for handling the quality variance in government video?
- Have you benchmarked performance on actual BWC footage vs high-quality datasets?
- How do you think about model updates in environments that require validation and testing?

**Product/Market:**
- What's your current government customer traction?
- How are you approaching FedRAMP certification? Timeline?
- What's the wedge against established competitors like Veritone?

**Strategic:**
- How do you balance research innovation with stability needs of government?
- What's the roadmap for explainability and court admissibility?
- How does this role evolve as the government business scales?

## Post-Interview

### If It Goes Well
Follow up with:
1. Thank you email referencing specific conversation points
2. Offer to share detailed findings from your testing
3. Propose next steps for deeper technical discussions

### Additional Analysis You Can Do
- Benchmark processing times across video types
- Create accuracy comparison charts
- Document specific failure modes
- Build cost model for different deployment scenarios

## Troubleshooting

### If Videos Don't Appear
- Check that they're uploaded to TwelveLabs Playground
- Verify API key in `.env.local`
- Check browser console for API errors

### If Search Fails
- Ensure you have a search index (Marengo)
- Verify videos are fully processed in TwelveLabs
- Check that index has videos uploaded to it

### If Analysis Fails
- Ensure you have an analysis index (Pegasus)
- Verify video is fully processed
- Some operations take time - wait for completion

## Key Files Reference

- **API Routes**: `/app/api/*` - All TwelveLabs integrations
- **Pages**: `/app/*` - All UI pages
- **SDK Client**: `/lib/twelvelabs.ts` - TwelveLabs SDK setup
- **Types**: `/lib/types.ts` - TypeScript definitions
- **Documentation**: `/.claude/skills/*` - Claude Skills docs

## Final Checklist Before Interview

- [ ] Videos uploaded to TwelveLabs with metadata
- [ ] Tested search with law enforcement queries
- [ ] Generated analysis (summary, chapters) for sample videos
- [ ] Documented performance differences by video type
- [ ] Reviewed interview strategy document
- [ ] Prepared 2-3 specific examples from testing
- [ ] Questions ready for interviewer
- [ ] Laptop charged, dev server tested

## Remember

You're not trying to convince them to hire you. You're demonstrating what's possible when you combine:
- Deep domain expertise (Axon/LE experience)
- Technical capability (built this app)
- Product thinking (identified key challenges)
- Customer empathy (tested with real video types)

You're evaluating if they're worthy of your expertise as much as they're evaluating you.

Good luck! 🚀
