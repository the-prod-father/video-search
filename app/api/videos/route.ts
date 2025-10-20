import { NextRequest, NextResponse } from 'next/server';
import { listIndexes, listVideos, deleteVideo as deleteVideoAPI } from '@/lib/twelvelabs-custom';

function categorizeVideo(metadata?: any) {
  if (!metadata) return 'unknown';
  const type = metadata.type?.toLowerCase();
  if (type === 'bwc' || type === 'body-worn-camera') return 'bwc';
  if (type === 'cctv' || type === 'surveillance') return 'cctv';
  if (type === 'iphone' || type === 'dji' || type === 'consumer') return 'high-quality';
  if (type === 'youtube' || type === 'social-media') return 'youtube';
  return 'unknown';
}

// GET /api/videos?indexId=INDEX_ID - Get all videos (optionally filtered by index)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const indexId = searchParams.get('indexId');

    if (indexId) {
      // Get videos from specific index
      const result = await listVideos(indexId);
      const videos = result.data.map((video) => ({
        id: video._id,
        indexId: video.index_id,
        metadata: video.metadata,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        duration: video.metadata?.duration || 0,
        size: video.metadata?.size || 0,
        fps: video.metadata?.fps || 0,
        width: video.metadata?.width || 0,
        height: video.metadata?.height || 0,
        hls: video.hls,
        category: categorizeVideo(video.metadata),
        thumbnailUrl: video.hls?.thumbnail_urls?.[0] || null,
      }));
      return NextResponse.json({ videos });
    }

    // Get videos from all indexes
    const indexes = await listIndexes();
    const allVideos = [];

    for (const index of indexes.data) {
      const result = await listVideos(index._id);
      const videos = result.data.map((video) => ({
        id: video._id,
        indexId: video.index_id,
        metadata: video.metadata,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        duration: video.metadata?.duration || 0,
        size: video.metadata?.size || 0,
        fps: video.metadata?.fps || 0,
        width: video.metadata?.width || 0,
        height: video.metadata?.height || 0,
        hls: video.hls,
        category: categorizeVideo(video.metadata),
        thumbnailUrl: video.hls?.thumbnail_urls?.[0] || null,
      }));
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

    // Note: Video upload would require the task API which we haven't implemented yet
    // For now, return a message
    return NextResponse.json({
      message: 'Video upload not yet implemented in custom client. Use TwelveLabs playground to upload videos.',
    });
  } catch (error: any) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos?videoId=VIDEO_ID&indexId=INDEX_ID - Delete a video
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');
    const indexId = searchParams.get('indexId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!indexId) {
      return NextResponse.json(
        { error: 'Index ID is required' },
        { status: 400 }
      );
    }

    await deleteVideoAPI(indexId, videoId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
