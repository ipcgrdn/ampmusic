"use client";

import { useState } from "react";
import { Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { showToast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크가 클립보드에 복사되었습니다.", "success");
    } catch {
      showToast("링크 복사에 실패했습니다.", "error");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      showToast("공유되었습니다.", "success");
    } catch {
      showToast("공유에 실패했습니다.", "error");
      setIsSharing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            `rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 
            border border-white/10 transition-all duration-300 hover:scale-[1.02]
            hover:border-purple-500/50`,
            className
          )}
          disabled={isSharing}
        >
          <Share2 className="w-5 h-5 text-white hover:text-purple-400 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 bg-black backdrop-blur-sm border-white/10"
      >
        {typeof navigator.share === "function" && (
          <DropdownMenuItem
            onClick={handleNativeShare}
            className="focus:bg-white/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span>공유</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink} className="focus:bg-white/10">
          <Link2 className="w-4 h-4 mr-2" />
          <span>링크 복사</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
