"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarClock, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function ServiceShutdownModal() {
  const [open, setOpen] = useState(false);
  const shutdownDate = new Date("2025-04-14"); // 2025년 4월 14일
  
  // 사용자에게 다시 보이지 않도록 설정
  const [hideModal, setHideModal] = useState<boolean>(false);

  useEffect(() => {
    // 이미 모달을 숨기도록 한 경우 확인
    const hasHiddenModal = localStorage.getItem("hideShutdownModal") === "true";
    
    if (!hasHiddenModal) {
      // 모달을 바로 열지 않고 잠시 후에 열어 사용자 경험 개선
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setHideModal(true);
    }
  }, []);

  // 모달을 다시 보지 않기 처리
  const handleDoNotShowAgain = () => {
    localStorage.setItem("hideShutdownModal", "true");
    setHideModal(true);
    setOpen(false);
  };

  // 남은 날짜 계산
  const daysRemaining = Math.ceil((shutdownDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (hideModal) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 sm:max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-lg pointer-events-none" />
        
        <DialogHeader className="relative mb-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <AlertTriangle className="w-4 h-4 text-purple-400" />
            서비스 종료 안내
          </DialogTitle>
          <DialogDescription className="text-white/70 mt-1 text-sm">
            AMP 서비스가 곧 종료됩니다
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-purple-400" />
              <h3 className="font-medium text-white text-sm">서비스 종료일</h3>
            </div>
            <p className="text-white/90 font-bold text-base mb-1">
              {format(shutdownDate, "yyyy년 M월 d일 EEEE", { locale: ko })}
            </p>
            <p className="text-white/60 text-xs">
              서비스 종료까지 <span className="text-purple-400 font-bold">{daysRemaining}일</span> 남았습니다
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-white text-sm">안내사항</h3>
            </div>
            <div className="space-y-2 text-white/80 text-sm">
              <p>
                AMP 서비스는 2025년 4월 14일부로 종료되며, <br />그 이후에는 더 이상 접속할 수 없게 됩니다.
              </p>
              <p>
                서비스 종료 전까지 요청사항이 있다면 문의해주시길 바랍니다.  <br />
                계정 정보 및 업로드한 콘텐츠는 서비스 종료 후 복구가 불가능합니다.
              </p>
              <p>
                그동안 AMP 서비스를 이용해 주셔서 감사합니다.
              </p>
            </div>
          </motion.div>
        </div>
        
        <DialogFooter className="sm:space-x-2 gap-2 mt-3">
          <Button
            variant="ghost"
            onClick={handleDoNotShowAgain}
            className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8"
          >
            다시 보지 않기
          </Button>
          <Button
            onClick={() => setOpen(false)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 text-xs h-8"
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 