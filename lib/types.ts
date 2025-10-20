// Core TwelveLabs types and extensions

export type VideoCategory = 'bwc' | 'cctv' | 'high-quality' | 'youtube' | 'unknown';

export interface VideoMetadata {
  type?: string;
  resolution?: string;
  source?: string;
  scenario?: string;
  lightingConditions?: 'day' | 'night' | 'mixed';
  duration?: number;
  fps?: number;
  [key: string]: any;
}

export interface EnhancedVideo {
  id: string;
  indexId: string;
  metadata?: VideoMetadata;
  createdAt: string;
  updatedAt: string;
  duration: number;
  size: number;
  fps: number;
  width: number;
  height: number;
  hls?: {
    videoUrl?: string;
    thumbnailUrls?: string[];
    status?: string;
  };
  category: VideoCategory;
  thumbnailUrl: string | null;
}

export interface Index {
  id: string;
  name: string;
  engines: Array<{
    name: string;
    options: string[];
  }>;
  videoCount: number;
  totalDuration: number;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  score: number;
  start: number;
  end: number;
  metadata: Array<{
    type: string;
    text?: string;
  }>;
  videoId: string;
  confidence: string;
  thumbnailUrl?: string;
  modules: Array<{
    type: string;
    confidence: string;
  }>;
}

export interface VideoAnalysis {
  summary: string | null;
  chapters: Array<{
    start: number;
    end: number;
    chapterTitle: string;
    chapterSummary: string;
  }> | null;
  highlights: Array<{
    start: number;
    end: number;
    highlight: string;
  }> | null;
  topics: string[] | null;
}

export interface ComparisonResult {
  videoId: string;
  category: VideoCategory;
  searchResults: SearchResult[];
  processingTime: number;
  accuracy: number;
  metadata: VideoMetadata;
}

export interface PerformanceMetrics {
  category: VideoCategory;
  averageProcessingTime: number;
  averageSearchAccuracy: number;
  totalVideos: number;
  resolution: string;
  fps: number;
}

// Government/Law Enforcement specific types

export interface LEUseCase {
  id: string;
  title: string;
  description: string;
  applicableVideoTypes: VideoCategory[];
  searchQueries: string[];
  expectedAccuracy: {
    bwc: number;
    cctv: number;
    highQuality: number;
  };
}

export interface DeploymentScenario {
  id: string;
  name: string;
  type: 'cloud' | 'on-premise' | 'air-gapped';
  description: string;
  requirements: string[];
  considerations: string[];
  certifications: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'search' | 'analyze' | 'upload' | 'delete' | 'access';
  resourceId: string;
  resourceType: 'video' | 'index' | 'search';
  timestamp: Date;
  metadata: Record<string, any>;
}

// Video quality thresholds for government use
export const QUALITY_THRESHOLDS = {
  minimum: {
    resolution: 480,
    fps: 15,
    bitrate: 1000, // kbps
  },
  recommended: {
    resolution: 720,
    fps: 30,
    bitrate: 3000, // kbps
  },
  optimal: {
    resolution: 1080,
    fps: 30,
    bitrate: 8000, // kbps
  },
};

// Expected accuracy by video type (based on testing)
export const ACCURACY_BASELINES = {
  'high-quality': 0.95, // iPhone/DJI
  bwc: 0.80, // Body Worn Camera
  cctv: 0.75, // CCTV
  youtube: 0.70, // Re-encoded
  unknown: 0.60,
};

// Law enforcement use cases
export const LE_USE_CASES: LEUseCase[] = [
  {
    id: 'use-of-force',
    title: 'Use of Force Investigation',
    description: 'Search across BWC footage to identify and review use of force incidents',
    applicableVideoTypes: ['bwc', 'cctv'],
    searchQueries: [
      'officer with hand on weapon',
      'physical struggle',
      'taser deployment',
      'officer running',
    ],
    expectedAccuracy: {
      bwc: 0.85,
      cctv: 0.70,
      highQuality: 0.95,
    },
  },
  {
    id: 'vehicle-search',
    title: 'Vehicle Identification',
    description: 'Find vehicles matching description across camera networks',
    applicableVideoTypes: ['cctv', 'bwc', 'high-quality'],
    searchQueries: [
      'silver sedan',
      'vehicle fleeing scene',
      'license plate visible',
      'vehicle collision',
    ],
    expectedAccuracy: {
      bwc: 0.75,
      cctv: 0.80,
      highQuality: 0.90,
    },
  },
  {
    id: 'person-tracking',
    title: 'Person of Interest Tracking',
    description: 'Track individuals across multiple video sources',
    applicableVideoTypes: ['cctv', 'bwc', 'high-quality'],
    searchQueries: [
      'person wearing red jacket',
      'person carrying backpack',
      'person entering building',
      'person running from scene',
    ],
    expectedAccuracy: {
      bwc: 0.80,
      cctv: 0.75,
      highQuality: 0.92,
    },
  },
  {
    id: 'evidence-timeline',
    title: 'Incident Timeline Generation',
    description: 'Auto-generate chronological breakdown of incident events',
    applicableVideoTypes: ['bwc', 'cctv', 'high-quality'],
    searchQueries: [
      'officer arrival at scene',
      'verbal commands given',
      'suspect detained',
      'medical assistance requested',
    ],
    expectedAccuracy: {
      bwc: 0.85,
      cctv: 0.70,
      highQuality: 0.95,
    },
  },
];

// Deployment scenarios
export const DEPLOYMENT_SCENARIOS: DeploymentScenario[] = [
  {
    id: 'cloud',
    name: 'Cloud Deployment',
    type: 'cloud',
    description: 'SaaS deployment via TwelveLabs API',
    requirements: [
      'Internet connectivity',
      'API key management',
      'Rate limiting compliance',
    ],
    considerations: [
      'Data residency requirements',
      'Video upload bandwidth',
      'Processing latency',
      'Cost per video/minute',
    ],
    certifications: ['SOC 2', 'FedRAMP (in progress)'],
  },
  {
    id: 'on-premise',
    name: 'On-Premise Deployment',
    type: 'on-premise',
    description: 'Self-hosted within agency data center',
    requirements: [
      'GPU infrastructure (NVIDIA A100/H100)',
      'Kubernetes cluster',
      'Storage: 10TB+ for models and indexes',
      'Network: 10Gbps internal',
    ],
    considerations: [
      'Model update cadence',
      'Local support requirements',
      'Hardware refresh cycles',
      'Scaling for concurrent users',
    ],
    certifications: ['CJIS', 'FedRAMP', 'ITAR'],
  },
  {
    id: 'air-gapped',
    name: 'Air-Gapped Deployment',
    type: 'air-gapped',
    description: 'Fully disconnected, high-security environment',
    requirements: [
      'Dedicated hardware infrastructure',
      'Manual model deployment',
      'Offline license management',
      'Physical security controls',
    ],
    considerations: [
      'No telemetry or usage analytics',
      'Manual updates via secure media',
      'Limited support options',
      'Custom integration required',
    ],
    certifications: ['DoD IL4+', 'SCIF-compliant', 'ITAR'],
  },
];
