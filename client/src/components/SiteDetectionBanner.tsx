import { CheckCircle } from "lucide-react";

interface SiteDetectionBannerProps {
  jobBoard: string | null;
}

export default function SiteDetectionBanner({ jobBoard }: SiteDetectionBannerProps) {
  if (!jobBoard) return null;
  
  return (
    <div className="bg-green-50 p-3 border-l-4 border-green-500 flex items-center">
      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
      <span className="text-sm font-medium">Active on <span className="font-semibold">{jobBoard}</span></span>
    </div>
  );
}
