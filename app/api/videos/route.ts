import { NextRequest, NextResponse } from 'next/server';
import { client, getVideosWithMetadata, categorizeVideo } from '@/lib/twelvelabs';

// GET /api/videos?indexId=INDEX_ID - Get all videos (optionally filtered by index)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indexId = searchParams.get('indexId');

    if (indexId) {
      // Get videos from specific index
      const videos = await getVideosWithMetadata(indexId);
      return NextResponse.json({ videos });
    }

    // Get videos from all indexes
    const indexes = await client.index.list();
    const allVideos = [];

    for (const index of indexes.data) {
      const videos = await getVideosWithMetadata(index.id);
      allVideos.push(...videos);
    }

    return NextResponse.json({ videos: allVideos });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Upload a new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { indexId, videoUrl, metadata } = body;

    if (!indexId || !videoUrl) {
      return NextResponse.json(
        { error: 'Index ID and video URL are required' },
        { status: 400 }
      );
    }

    // Create video indexing task
    const task = await client.task.create({
      indexId,
      url: videoUrl,
      language: 'en',
      ...(metadata && { metadata }),
    });

    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      message: 'Video upload initiated. Processing in background.',
    });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos?videoId=VIDEO_ID - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await client.index.video.delete(videoId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
