import { NextRequest, NextResponse } from 'next/server';
import { client, createLawEnforcementIndex } from '@/lib/twelvelabs';

// GET /api/indexes - List all indexes
export async function GET() {
  try {
    const indexes = await client.index.list();

    // Enhance with video counts and metadata
    const enhancedIndexes = await Promise.all(
      indexes.data.map(async (index) => {
        const videos = await client.index.video.list(index.id);
        const totalDuration = videos.data.reduce((sum, video) => sum + (video.metadata?.duration || 0), 0);

        return {
          id: index.id,
          name: index.name,
          engines: index.engines,
          videoCount: videos.data.length,
          totalDuration,
          createdAt: index.createdAt,
        };
      })
    );

    return NextResponse.json({ indexes: enhancedIndexes });
  } catch (error: any) {
    console.error('Error fetching indexes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch indexes' },
      { status: 500 }
    );
  }
}

// POST /api/indexes - Create a new index
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, purpose } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 }
      );
    }

    const index = await createLawEnforcementIndex(name, purpose || 'search');

    return NextResponse.json({
      index: {
        id: index.id,
        name: index.name,
        engines: index.engines,
        createdAt: index.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create index' },
      { status: 500 }
    );
  }
}

// DELETE /api/indexes?id=INDEX_ID - Delete an index
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indexId = searchParams.get('id');

    if (!indexId) {
      return NextResponse.json(
        { error: 'Index ID is required' },
        { status: 400 }
      );
    }

    await client.index.delete(indexId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete index' },
      { status: 500 }
    );
  }
}
