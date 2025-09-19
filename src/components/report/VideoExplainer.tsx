import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Play } from "lucide-react";

const VideoExplainer = () => {
  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <CardTitle>How Identity Resolution Works</CardTitle>
        <CardDescription className="text-white">
          Watch our 6-minute explainer video
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-background">
          <video
            className="w-full h-full object-cover"
            controls
            poster="https://storage.googleapis.com/msgsndr/nhc9xkcyzpaPrEARWW66/media/685aaf88f1a84877bce891b5.webp"
          >
            <source
              src="https://storage.googleapis.com/msgsndr/nhc9xkcyzpaPrEARWW66/media/68cdb0502a247e0db3deb950.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
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