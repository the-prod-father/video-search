import { NextRequest, NextResponse } from 'next/server';
import { listIndexes, createIndex, deleteIndex as deleteIndexAPI } from '@/lib/twelvelabs-custom';

// GET /api/indexes - List all indexes
export async function GET() {
  try {
    const result = await listIndexes();

    // Map to our expected format
    const enhancedIndexes = result.data.map((index) => ({
      id: index._id,
      name: index.index_name,
      engines: index.models.map((model) => ({
        name: model.model_name,
        options: model.model_options,
      })),
      videoCount: index.video_count,
      totalDuration: index.total_duration,
      createdAt: index.created_at,
    }));

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

    const models = purpose === 'search'
      ? [{ model_name: 'marengo2.7', model_options: ['visual', 'conversation', 'text_in_video'] }]
      : [{ model_name: 'pegasus1.2', model_options: ['visual', 'conversation'] }];

    const index = await createIndex(name, models);

    return NextResponse.json({
      index: {
        id: index._id,
        name: index.index_name,
        engines: index.models.map((m) => ({ name: m.model_name, options: m.model_options })),
        createdAt: index.created_at,
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

    await deleteIndexAPI(indexId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete index' },
      { status: 500 }
    );
  }
}
