import { NextRequest, NextResponse } from 'next/server';
import { generateSummary, generateText, generateGist } from '@/lib/twelvelabs-custom';

// POST /api/analyze - Generate video analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, analysisType } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let result;

    try {
      switch (analysisType) {
        case 'summary':
          result = await generateSummary(videoId, 'summary');
          break;

        case 'chapters':
          result = await generateSummary(videoId, 'chapter');
          break;

        case 'highlights':
          result = await generateSummary(videoId, 'highlight');
          break;

        case 'topics':
          result = await generateGist(videoId, ['topic']);
          break;

        case 'hashtags':
          result = await generateGist(videoId, ['hashtag']);
          break;

        case 'title':
          result = await generateGist(videoId, ['title']);
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid analysis type. Use: summary, chapters, highlights, topics, hashtags, or title' },
            { status: 400 }
          );
      }

      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        result,
        processingTime,
        analysisType,
      });
    } catch (apiError: any) {
      console.error(`Analysis API error for ${analysisType}:`, apiError);
      return NextResponse.json(
        { error: apiError.message || `Failed to generate ${analysisType}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error analyzing video:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
