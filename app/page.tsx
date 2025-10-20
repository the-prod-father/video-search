import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Search, Database, BarChart3, Shield, Zap, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          TwelveLabs Video Understanding
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive demonstration of video AI for government and law enforcement applications.
          Testing across real-world video types: BWC, CCTV, high-quality consumer, and social media.
        </p>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link href="/search">
            <Button size="lg">
              <Search className="mr-2 h-4 w-4" />
              Start Searching
            </Button>
          </Link>
          <Link href="/videos">
            <Button size="lg" variant="outline">
              <Video className="mr-2 h-4 w-4" />
              View Videos
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>Semantic Search</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Natural language search across all video content. Find specific moments, actions, or objects
              without manual tagging or timestamps.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Video Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Auto-generate summaries, chapters, highlights, and topics. Perfect for evidence review
              and incident timeline creation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Quality Comparison</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test and compare performance across different video types to understand real-world
              deployment constraints and accuracy.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Video Types */}
      <Card>
        <CardHeader>
          <CardTitle>Video Types Being Tested</CardTitle>
          <CardDescription>
            Four distinct categories representing real-world law enforcement video sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 p-4 border rounded-lg">
              <Badge className="bg-blue-500">Body Worn Camera</Badge>
              <h4 className="font-semibold">Axon BWC</h4>
              <p className="text-sm text-muted-foreground">
                Real law enforcement footage. 720p-1080p, variable lighting, motion, and audio challenges.
              </p>
            </div>

            <div className="space-y-2 p-4 border rounded-lg">
              <Badge className="bg-purple-500">CCTV Surveillance</Badge>
              <h4 className="font-semibold">Fixed Cameras</h4>
              <p className="text-sm text-muted-foreground">
                Business and municipal surveillance. 480p-1080p, compression artifacts, distance challenges.
              </p>
            </div>

            <div className="space-y-2 p-4 border rounded-lg">
              <Badge className="bg-green-500">High Quality</Badge>
              <h4 className="font-semibold">iPhone / DJI</h4>
              <p className="text-sm text-muted-foreground">
                Consumer and professional grade. 1080p-4K, excellent lighting and stabilization. Baseline performance.
              </p>
            </div>

            <div className="space-y-2 p-4 border rounded-lg">
              <Badge className="bg-red-500">YouTube/Social</Badge>
              <h4 className="font-semibold">Re-encoded Content</h4>
              <p className="text-sm text-muted-foreground">
                Public records and social media. Variable quality, multiple encoding passes, unknown source.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Law Enforcement Use Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Government & Law Enforcement Use Cases</CardTitle>
          </div>
          <CardDescription>
            Real-world applications being demonstrated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <h4 className="font-semibold">Use of Force Investigation</h4>
                <p className="text-sm text-muted-foreground">
                  Search across BWC footage to identify and review use of force incidents,
                  generate incident timelines, and create evidence packages.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <h4 className="font-semibold">Vehicle & Person Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Find vehicles or individuals across multiple camera feeds and video sources
                  using natural language descriptions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <h4 className="font-semibold">Evidence Timeline Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Auto-generate chronological breakdowns of incidents with chapters, summaries,
                  and highlights for court proceedings.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <h4 className="font-semibold">Multi-Source Evidence Correlation</h4>
                <p className="text-sm text-muted-foreground">
                  Correlate BWC, CCTV, and citizen-submitted videos of the same incident
                  to build comprehensive evidence packages.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Indexes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">View indexes page for details</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Videos Indexed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Hours of video content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Searches Performed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Testing ongoing</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Explore the application to understand TwelveLabs capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">
                <Link href="/indexes" className="font-semibold hover:underline">View Indexes</Link>
                {" "}- See your video indexes and create new ones
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span className="text-sm">
                <Link href="/videos" className="font-semibold hover:underline">Browse Videos</Link>
                {" "}- Explore videos categorized by type
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span className="text-sm">
                <Link href="/search" className="font-semibold hover:underline">Try Search</Link>
                {" "}- Test semantic search with natural language
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">
                <Link href="/insights" className="font-semibold hover:underline">View Insights</Link>
                {" "}- Government deployment considerations and use cases
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
