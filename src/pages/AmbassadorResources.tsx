import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { BookOpen, Video, FileText, Target, Download, ExternalLink } from "lucide-react";

export default function AmbassadorResources() {
  return (
    <>
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Resources</h1>
          <p className="text-muted-foreground">Everything you need to close deals and grow your income</p>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="scripts">
              <FileText className="h-4 w-4 mr-2" />
              Scripts
            </TabsTrigger>
            <TabsTrigger value="battlecards">
              <Target className="h-4 w-4 mr-2" />
              Battlecards
            </TabsTrigger>
            <TabsTrigger value="case-studies">
              <BookOpen className="h-4 w-4 mr-2" />
              Case Studies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Demo Videos</CardTitle>
                <CardDescription>Watch these to understand how to demo the product effectively</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Full Product Tour (12 min)</h3>
                  <p className="text-sm text-muted-foreground">Complete walkthrough of all features and benefits</p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Demo video coming soon - Contact admin for materials</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">ROI Pitch (5 min)</h3>
                  <p className="text-sm text-muted-foreground">How to effectively present the business case</p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Objection Handling (8 min)</h3>
                  <p className="text-sm text-muted-foreground">Common objections and how to overcome them</p>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Copy-paste templates for outreach at every stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Cold Intro Email</h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded text-sm font-mono">
                    <p>Subject: [Company] - Missing revenue from website visitors</p>
                    <p className="mt-2">Hi [First Name],</p>
                    <p className="mt-2">I analyzed [Company]'s website and found you're missing ~[X] leads per month...</p>
                    <p className="mt-2 text-muted-foreground">[Full template available soon]</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Follow-Up Sequence (3 emails)</h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Day 3, Day 7, Day 14 follow-up templates</p>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Proposal Email</h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">How to structure your pricing proposal</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discovery Call Framework</CardTitle>
                <CardDescription>Structure your sales calls for maximum conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Coming soon - Contact admin for materials</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battlecards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Comparison</CardTitle>
                <CardDescription>How we stack up against the competition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">vs. Leadfeeder</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ <strong>Better:</strong> Identity resolution (email-level, not just company)</li>
                    <li>✅ <strong>Better:</strong> Pricing ($100/mo vs $600+)</li>
                    <li>✅ <strong>Better:</strong> US-focused data quality</li>
                    <li>⚠️ <strong>Consider:</strong> They have CRM integrations (we're building this)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">vs. Clearbit (now HubSpot)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ <strong>Better:</strong> Standalone solution (no HubSpot required)</li>
                    <li>✅ <strong>Better:</strong> Transparent pricing</li>
                    <li>⚠️ <strong>Consider:</strong> They have firmographic data (we focus on leads)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">vs. Albacross</h3>
                  <ul className="space-y-1 text-sm">
                    <li>✅ <strong>Better:</strong> Better US coverage</li>
                    <li>✅ <strong>Better:</strong> Email-level identification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Objections</CardTitle>
                <CardDescription>How to handle pushback effectively</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-sm">"We already use Google Analytics"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    GA shows you traffic, not who's visiting. We identify the actual person and their contact info so you can follow up.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-sm">"This seems expensive"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If we recover even 1-2 deals per month, that's [X] in revenue. Your current cost is 100% of missed opportunities.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold text-sm">"We need to think about it"</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Totally understand. What specifically would you like to think about? [Schedule follow-up]
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="case-studies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Real Customer Wins</CardTitle>
                <CardDescription>Success stories you can reference in sales conversations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">HVAC Company - 40% Pipeline Increase</h3>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mid-sized HVAC company recovered 12 leads/month they were previously missing.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-semibold">ROI:</span> 8.5x
                    </div>
                    <div>
                      <span className="font-semibold">Payback:</span> 6 days
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Law Firm - $45K New Revenue</h3>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Personal injury firm closed 3 high-value cases from identified website visitors.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-semibold">ROI:</span> 37.5x
                    </div>
                    <div>
                      <span className="font-semibold">Payback:</span> 2 days
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  More case studies coming soon. Contact admin to share your wins!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
