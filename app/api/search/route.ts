import { NextRequest, NextResponse } from 'next/server';
import { searchVideos as searchAPI } from '@/lib/twelvelabs-custom';

// POST /api/search - Search across videos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indexId, query, options } = body;

    if (!indexId || !query) {
      return NextResponse.json(
        { error: 'Index ID and search query are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const results = await searchAPI(indexId, query, options);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      results: results.data,
      pageInfo: results.page_info,
      processingTime,
      query,
    });
  } catch (error: any) {
    console.error('Error searching videos:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
