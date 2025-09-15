
import { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ReportData } from "@/types/report";
import { reportService } from "@/services/reportService";

interface ShareReportButtonProps {
  reportData: ReportData;
  reportId?: string;
}

const ShareReportButton = ({ reportData, reportId }: ShareReportButtonProps) => {
  const [copied, setCopied] = useState(false);

  // Generate shareable URL using the actual report slug or ID
  const shareUrl = reportId 
    ? reportService.generateShareUrl(reportId)
    : `${window.location.origin}/report/demo-${reportData.domain.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  
  // Generate social sharing text with key metrics
  const shareText = reportService.generateShareText(reportData);

  const handleShare = async (platform: string) => {
    // Track sharing event
    if (reportId) {
      await reportService.trackShare(reportId, platform);
    }

    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("Lead Opportunity Report")}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success("Link copied to clipboard!", {
            description: "Share it with your team or on social media",
          });
          setTimeout(() => setCopied(false), 3000);
        } catch (err) {
          console.error('Failed to copy: ', err);
          toast.error("Failed to copy link");
        }
        return;
      default:
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
      toast.success(`Sharing on ${platform}!`);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="xs" 
          className="gap-1 border-accent text-white hover:bg-accent/10"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Share Report</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer gap-2">
          <Facebook size={16} className="text-blue-600" />
          <span>Share on Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer gap-2">
          <Twitter size={16} className="text-blue-400" />
          <span>Share on Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer gap-2">
          <Linkedin size={16} className="text-blue-700" />
          <span>Share on LinkedIn</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("copy")} className="cursor-pointer gap-2">
          {copied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} />
          )}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareReportButton;
