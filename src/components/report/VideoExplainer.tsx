
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

const VideoExplainer = () => {
  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <CardTitle>How NurturelyX Works</CardTitle>
        <CardDescription className="text-white">
          Watch our 2-minute explainer video
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-background">
          {/* Placeholder for the video - will be replaced with actual video later */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-accent/90 p-4 rounded-full cursor-pointer hover:bg-accent transition-colors">
              <Play className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <img 
            src="/placeholder.svg" 
            alt="Video Thumbnail" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="mt-4 text-sm text-white">
          <p>In this video, learn how NurturelyX:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Identifies anonymous visitors without cookies</li>
            <li>Integrates with your existing CRM and marketing tools</li>
            <li>Complies with privacy regulations</li>
            <li>Delivers measurable ROI from day one</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoExplainer;
