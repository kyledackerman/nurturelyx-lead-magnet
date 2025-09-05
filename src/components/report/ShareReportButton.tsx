
import { Share2, Facebook, Twitter, Linkedin, Link, ClipboardCopy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { ReportData } from "@/types/report";

interface ShareReportButtonProps {
  reportData: ReportData;
  reportId?: string;
}

const ShareReportButton = ({ reportData, reportId = "demo" }: ShareReportButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate a share URL for the report using custom domain
  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  const shareUrl = `${baseUrl}/reports/${reportId}`;
  
  // Create share text with key metrics
  const shareText = `I just discovered my website is losing ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(reportData.yearlyRevenueLost)} in revenue each year due to anonymous traffic! Check out my report:`;
  
  // Handle social media sharing
  const handleShare = (platform: string) => {
    let shareLink = "";
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("My Lead Opportunity Report")}&summary=${encodeURIComponent(shareText)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl).then(() => {
          setIsCopied(true);
          toast.success("Link copied to clipboard!", {
            description: "Share it with your team or on social media",
          });
          setTimeout(() => setIsCopied(false), 3000);
        });
        break;
      default:
        break;
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
          {isCopied ? (
            <CheckCheck size={16} className="text-green-500" />
          ) : (
            <ClipboardCopy size={16} />
          )}
          <span>{isCopied ? "Copied!" : "Copy Link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareReportButton;
