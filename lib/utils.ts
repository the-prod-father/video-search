import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format duration in seconds to HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Format file size in bytes to human readable
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Format date to relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  // Define intervals once to avoid duplication
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Handle future dates
  if (seconds < 0) {
    const futureSeconds = Math.abs(seconds);

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(futureSeconds / secondsInUnit);
      if (interval >= 1) {
        return `in ${interval} ${unit}${interval > 1 ? 's' : ''}`;
      }
    }

    return 'in a moment';
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

// Get video category badge color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bwc: 'bg-blue-500',
    cctv: 'bg-purple-500',
    'high-quality': 'bg-green-500',
    youtube: 'bg-red-500',
    unknown: 'bg-gray-500',
  };
  return colors[category] || 'bg-gray-500';
}

// Get video category label
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    bwc: 'Body Worn Camera',
    cctv: 'CCTV Surveillance',
    'high-quality': 'High Quality (iPhone/DJI)',
    youtube: 'YouTube/Social Media',
    unknown: 'Unknown Source',
  };
  return labels[category] || 'Unknown';
}

// Calculate confidence level from score
export function getConfidenceLevel(score: number): {
  level: 'high' | 'medium' | 'low';
  color: string;
} {
  if (score >= 0.8) {
    return { level: 'high', color: 'text-green-600' };
  } else if (score >= 0.6) {
    return { level: 'medium', color: 'text-yellow-600' };
  } else {
    return { level: 'low', color: 'text-red-600' };
  }
}

// Truncate text to specified length
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Parse resolution from video dimensions
export function getResolutionLabel(width: number, height: number): string {
  if (height >= 2160) return '4K';
  if (height >= 1440) return '2K';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  return `${width}x${height}`;
}

// Check if video meets quality thresholds
export function checkQualityThreshold(
  resolution: number,
  fps: number,
  threshold: 'minimum' | 'recommended' | 'optimal'
): boolean {
  const thresholds = {
    minimum: { resolution: 480, fps: 15 },
    recommended: { resolution: 720, fps: 30 },
    optimal: { resolution: 1080, fps: 30 },
  };

  const { resolution: minRes, fps: minFps } = thresholds[threshold];
  return resolution >= minRes && fps >= minFps;
}

// Generate search result snippet
export function generateSearchSnippet(
  metadata: Array<{ type: string; text?: string }>,
  maxLength = 150
): string {
  const textMetadata = metadata.find(m => m.type === 'visual' || m.type === 'conversation');
  if (textMetadata?.text) {
    return truncate(textMetadata.text, maxLength);
  }
  return 'No description available';
}

// Calculate average from array of numbers
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

// Group items by key
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
