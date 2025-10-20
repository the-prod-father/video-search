import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Server, Lock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { LE_USE_CASES, DEPLOYMENT_SCENARIOS } from '@/lib/types';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Government & Security Deployment Insights</h1>
        <p className="text-muted-foreground">
          Understanding TwelveLabs for law enforcement and secure government applications
        </p>
      </div>

      {/* Law Enforcement Use Cases */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Law Enforcement Use Cases</CardTitle>
          </div>
          <CardDescription>
            Real-world applications tested in this demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {LE_USE_CASES.map((useCase) => (
              <div key={useCase.id} className="border-l-2 border-primary pl-4 space-y-2">
                <h3 className="font-semibold text-lg">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>

                <div>
                  <p className="text-sm font-medium mb-2">Applicable Video Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.applicableVideoTypes.map((type) => (
                      <Badge key={type} variant="outline">
                        {type.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Example Search Queries:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {useCase.searchQueries.map((query, i) => (
                      <div key={i} className="text-sm bg-muted p-2 rounded font-mono">
                        "{query}"
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Expected Accuracy by Video Type:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">BWC</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(useCase.expectedAccuracy.bwc * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">CCTV</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(useCase.expectedAccuracy.cctv * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">High Quality</p>
                      <p className="text-lg font-bold text-green-600">
                        {(useCase.expectedAccuracy.highQuality * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Scenarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Deployment Scenarios</CardTitle>
          </div>
          <CardDescription>
            Understanding deployment options for government customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DEPLOYMENT_SCENARIOS.map((scenario) => (
              <div key={scenario.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  <Badge>
                    {scenario.type === 'cloud' && 'Cloud'}
                    {scenario.type === 'on-premise' && 'On-Premise'}
                    {scenario.type === 'air-gapped' && 'Air-Gapped'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      Requirements
                    </h4>
                    <ul className="text-sm space-y-1">
                      {scenario.requirements.map((req, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-muted-foreground mr-2">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                      Considerations
                    </h4>
                    <ul className="text-sm space-y-1">
                      {scenario.considerations.map((con, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-muted-foreground mr-2">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-blue-600" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {scenario.certifications.map((cert, i) => (
                      <Badge key={i} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-primary/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>Key Insights from Testing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Video Quality Impact</h3>
            <p className="text-sm text-muted-foreground">
              Testing across four video types (BWC, CCTV, High-Quality, YouTube) reveals significant
              performance variance based on resolution, compression, and lighting conditions. High-quality
              consumer video (iPhone/DJI) establishes a ~95% accuracy baseline, while real-world BWC
              and CCTV footage typically achieves 75-85% accuracy depending on conditions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Deployment Complexity</h3>
            <p className="text-sm text-muted-foreground">
              Government deployments require more than technical capability. Success depends on:
              compliance certifications (FedRAMP, CJIS, ITAR), on-premise infrastructure support,
              audit trails for legal admissibility, and integration with existing evidence management
              systems. Air-gapped deployments add significant complexity but are required for high-security
              environments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Production Threshold</h3>
            <p className="text-sm text-muted-foreground">
              For law enforcement production deployment, 80%+ accuracy on real-world BWC footage is
              the critical threshold. Below this, investigators won't trust the system, leading to
              low adoption. Current testing helps establish realistic expectations for different
              video types and lighting conditions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cost vs. Quality Tradeoff</h3>
            <p className="text-sm text-muted-foreground">
              Agencies optimize for storage costs over video quality. A 1TB server holds 200 hours at
              1080p or 1,000 hours at 480p. Most choose quantity, which impacts AI model performance.
              Understanding this tradeoff is critical for setting accurate customer expectations and
              pricing models.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Multi-Source Evidence</h3>
            <p className="text-sm text-muted-foreground">
              Real investigations combine BWC from multiple officers, business CCTV, and citizen
              smartphone videos. The AI needs to work across all sources with consistent accuracy.
              This demo tests whether TwelveLabs can handle the quality variance inherent in
              multi-source evidence packages.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interview Talking Points */}
      <Card>
        <CardHeader>
          <CardTitle>Questions for TwelveLabs Interview</CardTitle>
          <CardDescription>
            Strategic questions to evaluate product-market fit and deployment readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Technical Questions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• How does model performance degrade with lower quality video (BWC/CCTV vs consumer)?</li>
                <li>• What's the minimum viable video quality for reliable analysis?</li>
                <li>• Can models be fine-tuned on specific video types (BWC footage)?</li>
                <li>• What's the GPU/CPU footprint for on-premise deployment?</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">Product/Business Questions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• What's current government/LE customer traction?</li>
                <li>• How do you handle compliance certifications (FedRAMP timeline)?</li>
                <li>• What's the strategy for competing with established players (Veritone, etc.)?</li>
                <li>• How do you think about pricing for government (per-video vs compute)?</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">Strategic Questions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• How do you balance cutting-edge AI with stability requirements of government?</li>
                <li>• What's the roadmap for real-time video analysis (live streams)?</li>
                <li>• How do you think about explainability/auditability for court admissibility?</li>
                <li>• What's the strategy for handling PII/sensitive content in government video?</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
