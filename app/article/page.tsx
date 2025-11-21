'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Video, Plane, Car, Clock, Users, Shield, FileVideo, AlertTriangle, CheckCircle, Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArticlePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/')}
        className="mb-6 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Article Header */}
      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
        {/* Hero with Background Image */}
        <div className="relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/body-cams.webp)' }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/95 via-[#1E40AF]/90 to-[#2563EB]/85" />

          {/* Content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-white">
            <p className="text-xs sm:text-sm font-semibold text-amber-300 uppercase tracking-widest mb-4">
              Government & Secure Deployment
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              The Reality of Video AI in Public Safety
            </h1>
            <p className="text-xl sm:text-2xl font-light text-white/90 mb-6 max-w-2xl">
              Why Training Data Quality Matters More Than Model Size
            </p>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              Understanding the critical factors that determine whether AI video analysis succeeds or fails in real-world law enforcement deployments.
            </p>
          </div>
        </div>

        {/* Author */}
        <div className="border-b border-gray-100 p-6 sm:p-8 bg-gray-50/50">
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src="/profile.jpeg"
              alt="Gavin McNamara"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
            />
            <div>
              <p className="font-bold text-gray-900 text-lg">Gavin McNamara</p>
              <p className="text-sm text-[#2563EB] font-medium">
                7+ Years @ Axon Enterprise
              </p>
              <p className="text-sm text-gray-600">
                Senior Product Manager, Evidence.com
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Former NYPD Onsite Team • Domestic & International Agency Deployments
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-12 space-y-8">

          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              After seven years at Axon managing Evidence.com—the largest digital evidence management system in law enforcement—I've seen firsthand why most AI demos fail when they meet real-world video. The gap between controlled demonstrations and production deployments isn't about model architecture. It's about training data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This article outlines the critical factors that determine whether video AI succeeds or fails in government deployments, drawn from my direct experience working with agencies from the NYPD to international law enforcement organizations.
            </p>
          </section>

          {/* Section 1: Video Quality Gap */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#2563EB]" />
              The Video Quality Gap
            </h2>
            <p className="text-gray-700 leading-relaxed">
              When AI companies demonstrate video understanding, they use high-quality footage: 1080p, good lighting, stable cameras, clear audio. Real law enforcement video looks nothing like this.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Body-Worn Cameras</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  720p-1080p but heavily compressed for storage. Wide-angle distortion. Constant motion. Audio clipping during loud events. Low-light noise. Officers' hands blocking lens.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-900">CCTV Systems</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Often 480p or lower. Fixed angles miss context. Frame rates as low as 5fps. Infrared artifacts at night. Compression artifacts on motion. Legacy codecs.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">Drone Footage</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  High altitude means tiny subjects. Gimbal stabilization artifacts. Wind noise overwhelming audio. Thermal/IR modes with no color data. Rapid scene changes.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-semibold text-gray-900">Fleet/In-Car Video</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Windshield glare and reflections. Night vision artifacts. Engine/siren audio interference. Dashboard obstructions. Multi-angle sync issues.
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">
              An AI model trained on YouTube videos or stock footage will report 95%+ accuracy. Deploy it on actual BWC footage from a night shift and watch that number plummet to 60%. This isn't a bug—it's a fundamental training data problem.
            </p>
          </section>

          {/* Section 2: Compression Reality */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileVideo className="h-5 w-5 text-[#2563EB]" />
              Why Demo Footage Lies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Agencies don't keep video at original quality. Storage costs force aggressive compression. A 12-hour shift of BWC footage at full quality would be hundreds of gigabytes per officer. Multiply by thousands of officers, retain for years per policy, and the math doesn't work.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Real deployment means:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Bitrates of 2-4 Mbps</strong> instead of the 20+ Mbps of source footage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Keyframe intervals of 2-5 seconds</strong> causing blur on fast motion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Audio at 64kbps mono</strong> losing vocal clarity and background context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Re-encoding during redaction</strong> compounding quality loss</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              If your model hasn't seen video at these quality levels during training, it will fail in production. Period.
            </p>
          </section>

          {/* Section 3: Time of Day */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#2563EB]" />
              The Time-of-Day Problem
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Crime doesn't happen in optimal lighting. Models need extensive training on:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700"><strong>Dawn/Dusk:</strong> Rapidly changing exposure, mixed color temperatures</p>
              <p className="text-sm text-gray-700"><strong>Night with streetlights:</strong> Harsh shadows, color cast from sodium/LED lights</p>
              <p className="text-sm text-gray-700"><strong>Complete darkness:</strong> IR mode loses color, introduces noise patterns</p>
              <p className="text-sm text-gray-700"><strong>Indoor/Outdoor transitions:</strong> Auto-exposure lag causes blown highlights or crushed shadows</p>
              <p className="text-sm text-gray-700"><strong>Weather conditions:</strong> Rain, fog, snow all degrade visibility differently</p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              A model that can identify a weapon in daylight but fails at night isn't ready for deployment. Law enforcement needs consistent accuracy across all conditions.
            </p>
          </section>

          {/* Section 4: 3PV Problem */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#2563EB]" />
              The Third-Party Video (3PV) Challenge
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Here's a problem most AI companies don't even know exists: third-party video evidence.
            </p>
            <p className="text-gray-700 leading-relaxed">
              When agencies collect video from businesses, citizens, or other sources, it often comes in proprietary formats that require specific players. Think old DVR systems with custom codecs, security systems that only export to their own format, or dashcams with unusual containers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The workflow typically goes:
            </p>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-semibold">1.</span>
                <span>Receive video in proprietary format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-semibold">2.</span>
                <span>Can't play it without vendor's player (often Windows-only, outdated)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-semibold">3.</span>
                <span>Convert to standard format for review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-semibold">4.</span>
                <span>Conversion introduces artifacts, loses metadata, sometimes drops frames</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] font-semibold">5. </span>
                <span>AI analyzes degraded version, not original</span>
              </li>
            </ol>
            <p className="text-gray-700 leading-relaxed">
              Any AI system for law enforcement needs to handle these conversion artifacts—or better yet, work directly with proprietary formats. This is a massive gap in most solutions.
            </p>
          </section>

          {/* Section 5: Ethics */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2563EB]" />
              Ethical Training Requirements
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This is non-negotiable: AI for law enforcement must be trained on diverse populations to prevent bias. This means:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>All skin tones represented across all lighting conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Age diversity from children to elderly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Various body types, clothing styles, and cultural dress</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Geographic diversity (urban, suburban, rural environments)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Accent and dialect diversity for speech recognition</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              An AI that works better on some populations than others isn't just an accuracy problem—it's a civil rights problem. Agencies deploying biased AI face legal liability and public trust erosion.
            </p>
          </section>

          {/* Section 6: My Experience */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#2563EB]" />
              My Approach at Axon
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Axon, I owned Evidence.com including search, reporting, video playback, and third-party video ingestion. I saw these challenges daily across thousands of agencies.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The breakthrough came through our NYPD partnership. I spent two years onsite with the NYPD, embedded with their team, with CJIS-certified access to their Evidence.com instance. This wasn't remote product management—I was in their building, seeing their workflows, understanding their pain points firsthand.
            </p>

            <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-[#1E3A8A]">The NYPD Training Data Partnership</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Working with NYPD leadership, we established a partnership to train our models on a subset of their actual evidence—real BWC footage, real CCTV pulls, real 3PV submissions. In exchange, they received beta access to new features and direct input into the product roadmap.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                This wasn't easy. It required extensive legal review, data handling agreements, and technical safeguards. But the result was models trained on the exact video quality, conditions, and scenarios that real agencies encounter.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              The accuracy improvement was significant. Features that tested well on demo footage but failed in the field started working reliably. We weren't guessing what real video looked like—we were training on it.
            </p>
          </section>

          {/* Section 7: What This Means */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#2563EB]" />
              What This Means for Video AI Deployment
            </h2>
            <p className="text-gray-700 leading-relaxed">
              For TwelveLabs or any video AI company targeting government:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Partner with agencies for training data.</strong> Demo footage isn't enough. You need real BWC, CCTV, drone, and 3PV at production quality levels.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Test across the full quality spectrum.</strong> If accuracy drops more than 10% from high-quality to production-quality video, you're not ready.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Handle 3PV formats.</strong> This is a differentiator. Most solutions ignore it.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Audit for bias continuously.</strong> Not once at launch—continuously as models update.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2563EB] mt-1">•</span>
                <span><strong>Build for compliance first.</strong> FedRAMP, CJIS, ITAR aren't checkboxes—they're architecture decisions.</span>
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              The agencies that adopt video AI successfully will be those that choose vendors who understand these realities—not the ones with the best demo, but the ones with the best real-world accuracy.
            </p>
          </section>

          {/* Conclusion */}
          <section className="border-t border-gray-200 pt-8 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              After seven years building Evidence.com and working directly with agencies from the world's largest police department to small-town sheriffs, I've learned that the difference between AI that demos well and AI that deploys successfully comes down to one thing: training data that reflects reality.
            </p>
            <p className="text-gray-700 leading-relaxed font-medium">
              The technology is ready. The question is whether vendors are willing to do the hard work of getting real data, handling it responsibly, and building for the conditions that actually exist in the field.
            </p>
          </section>

        </div>
      </article>
    </div>
  );
}
