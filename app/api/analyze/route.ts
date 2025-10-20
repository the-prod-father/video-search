import { NextRequest, NextResponse } from 'next/server';
import { generateVideoAnalysis, client } from '@/lib/twelvelabs';

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

    switch (analysisType) {
      case 'summary':
        result = await client.generate.summarize({
          videoId,
          type: 'summary',
        });
        break;

      case 'chapters':
        result = await client.generate.summarize({
          videoId,
          type: 'chapter',
        });
        break;

      case 'highlights':
        result = await client.generate.summarize({
          videoId,
          type: 'highlight',
        });
        break;

      case 'topics':
        result = await client.generate.text({
          videoId,
          prompt: 'List the main topics, themes, and subjects discussed or shown in this video. Format as a comma-separated list.',
        });
        break;

      case 'hashtags':
        result = await client.generate.text({
          videoId,
          prompt: 'Generate relevant hashtags for this video content. Include hashtags for the main subjects, actions, locations, and themes shown.',
        });
        break;

      case 'title':
        result = await client.generate.text({
          videoId,
          prompt: 'Generate a concise, descriptive title for this video (maximum 10 words).',
        });
        break;

      case 'comprehensive':
        result = await generateVideoAnalysis(videoId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        );
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      result,
      processingTime,
      analysisType,
    });
  } catch (error: any) {
    console.error('Error analyzing video:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
