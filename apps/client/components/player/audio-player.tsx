"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolumeOff,
  IconPlayerSkipForward,
  IconPlayerSkipBack,
  IconAlertCircle,
  IconPlaylist,
  IconRepeat,
  IconRepeatOnce,
  IconArrowsShuffle,
  IconVolume2,
} from "@tabler/icons-react";
import { usePlayerStore } from "@/lib/store/player-store";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "@/components/common/LikeButton";
import { usePathname, useRouter } from "next/navigation";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    toggle,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    showQueue,
    toggleQueue,
    repeatMode,
    isShuffled,
    toggleRepeatMode,
    toggleShuffle,
    handleTrackEnd,
    handleTimeUpdate,
  } = usePlayerStore();

  // 트랙 변경 시의 useEffect 수정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const resetState = () => {
      setCurrentTime(0);
      setDuration(0);
      setBuffered(0);
      setIsLoading(true);
      setError(null);
    };

    resetState();

    // 오디오 소스 설정
    const audioUrl = getAudioUrl(currentTrack.audioUrl);
    audio.src = audioUrl;
    audio.load();

    // 이벤트 핸들러들
    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdateEvent = () => {
      const time = audio.currentTime || 0;
      if (!isDragging && !isNaN(time)) {
        setCurrentTime(time);
        handleTimeUpdate(time, audio.duration || 0);
      }
    };

    // 이벤트 리스너 등록
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdateEvent);
    audio.addEventListener("durationchange", handleLoadedMetadata);

    const handleProgress = () => {
      if (!audio) return;
      handleTimeUpdate(audio.currentTime, audio.duration);
    };

    // 1초마다 진행도 체크
    const progressInterval = setInterval(handleProgress, 1000);

    return () => {
      clearInterval(progressInterval);
      // 이벤트 리스너 제거
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdateEvent);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
    };
  }, [currentTrack, isDragging, handleTimeUpdate]);

  // 재생 상태 변경 시 처리
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setError("재생에 실패했습니다.");
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 프로그레스바 클릭/드래그 핸들러
  const handleProgressBarInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const progressBar = progressBarRef.current;
      if (!audio || !progressBar || !duration) return;

      const rect = progressBar.getBoundingClientRect();
      const percent = Math.min(
        Math.max((e.clientX - rect.left) / rect.width, 0),
        1
      );
      const newTime = percent * duration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  // 프로그레스바 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressBarInteraction(e);
  }, [handleProgressBarInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = progressBarRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const width = rect.width;
    const progress = Math.min(Math.max(x / width, 0), 1);
    setCurrentTime(progress * duration);
    
    if (audioRef.current) {
      audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  }, [isDragging, duration]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // 볼륨 상태가 변경될 때 오디오 요소 제어
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;
    audioRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // 트랙이 변경될 때 자동 재생
  useEffect(() => {
    if (currentTrack && isPlaying) {
      audioRef.current?.play();
    }
  }, [currentTrack, isPlaying]);

  // 트랙 변경 시 상태 초기화 부분 제거 (이벤트로 처리)
  useEffect(() => {
    setError(null);
  }, [currentTrack]);

  // 슬라이더 호버 시 시간 계산 함수
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1
    );
    const time = percent * duration;
    setHoverTime(time);
  };

  // 시간 포맷 함수
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  // 키보드 단축키 핸들러 추가
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault(); // 스크롤 방지
          toggle();
          break;
        case "ArrowLeft":
          if (e.ctrlKey || e.metaKey) {
            playPrevious();
          } else {
            // 5초 뒤로
            const newTime = Math.max(
              0,
              (audioRef.current?.currentTime || 0) - 5
            );
            if (audioRef.current) audioRef.current.currentTime = newTime;
          }
          break;
        case "ArrowRight":
          if (e.ctrlKey || e.metaKey) {
            playNext();
          } else {
            // 5초 앞으로
            const newTime = Math.min(
              duration,
              (audioRef.current?.currentTime || 0) + 5
            );
            if (audioRef.current) audioRef.current.currentTime = newTime;
          }
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyR":
          toggleRepeatMode();
          break;
        case "KeyS":
          toggleShuffle();
          break;
        case "KeyQ":
          toggleQueue();
          break;
        case "ArrowUp":
          e.preventDefault(); // 스크롤 방지
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault(); // 스크롤 방지
          setVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    toggle,
    playNext,
    playPrevious,
    toggleMute,
    volume,
    setVolume,
    toggleRepeatMode,
    toggleShuffle,
    toggleQueue,
    duration,
  ]);

  // 볼륨 아이콘 로직 수정
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return IconVolumeOff;
    if (volume <= 0.5) return IconVolume2;
    if (volume <= 1) return IconVolume;
  };

  const VolumeIcon = getVolumeIcon();

  // 트랙 종료 이벤트 처리 추가
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const handleEnded = () => {
      // 한 곡 반복 모드일 경우
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleTrackEnd(); // store의 handleTrackEnd 호출
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, repeatMode, handleTrackEnd]);

  if (!currentTrack) return null;

  // audioUrl이 전체 URL인지 확인하고 처리
  const getAudioUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  // 이미지 URL 처리 함수 수정
  const getImageUrl = (url?: string) => {
    if (!url) return "/images/logo.png";
    return url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  // 재생 버튼 렌더링 로직
  const renderPlayButton = () => {
    if (isLoading) {
      return (
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      );
    }
    if (error) {
      return <IconAlertCircle className="w-6 h-6 text-red-500" />;
    }
    return isPlaying ? (
      <IconPlayerPause className="w-6 h-6" />
    ) : (
      <IconPlayerPlay className="w-6 h-6" />
    );
  };

  // 반복 모드 아이콘 렌더링
  const renderRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return <IconRepeatOnce className="w-6 h-6" />;
      case "all":
        return <IconRepeat className="w-6 h-6" />;
      default:
        return <IconRepeat className="w-6 h-6 opacity-50" />;
    }
  };

  // queue 버튼 클릭 핸들러 수정
  const handleQueueClick = () => {
    if (pathname === '/watch') {
      router.back();
    } else {
      router.push('/watch');
    }
  };

  return (
    <>
      <div className="fixed lg:bottom-0 bottom-16 left-0 right-0 z-[60]">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-black to-white/5 backdrop-blur-2xl" />

        <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

        <div
          ref={progressBarRef}
          className="relative w-full h-1 cursor-pointer group"
          onMouseEnter={() => setIsHoveringProgress(true)}
          onMouseLeave={() => setIsHoveringProgress(false)}
          onMouseMove={handleProgressHover}
          onMouseDown={handleMouseDown}
          onClick={handleProgressBarInteraction}
        >
          <div className="absolute inset-0 bg-white/5 group-hover:h-2 transition-all" />

          <div
            className="absolute inset-y-0 left-0 bg-white/10 group-hover:h-2 transition-all pointer-events-none"
            style={{
              width: duration ? `${(buffered / duration) * 100}%` : "0%",
            }}
          />

          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e6c200] to-[#533483] group-hover:h-2 transition-all pointer-events-none"
            style={{
              width: `${duration > 0 && currentTime >= 0 ? (currentTime / duration) * 100 : 0}%`,
              transition: isDragging ? "none" : "width 0.1s linear",
            }}
          />

          <div className="absolute inset-0">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={(value: number[]) => {
                const newTime = value[0];
                if (!isNaN(newTime) && audioRef.current) {
                  audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              }}
              className="absolute inset-0 opacity-0"
            />
          </div>

          {isHoveringProgress && duration > 0 && (
            <div
              className="absolute -top-8 px-2 py-1 text-xs bg-black/90 rounded-md 
                transform -translate-x-1/2 pointer-events-none border border-white/10
                shadow-lg shadow-black/50"
              style={{
                left: `${(hoverTime / duration) * 100}%`,
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full 
              shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>

        <div className={cn(
          "relative mx-6",
          isMobile ? "container mx-auto" : "px-0"
        )}>
          {isMobile ? (
            <div className="py-2 px-4">
              <div className="flex items-center justify-between">
                {/* 왼쪽: 앨범 정보 */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <Image
                      src={getImageUrl(currentTrack.album?.coverImage)}
                      alt={currentTrack.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/album/${currentTrack.album?.id}`}
                      className="text-sm font-medium hover:underline line-clamp-1"
                    >
                      {currentTrack.title}
                    </Link>
                    <Link
                      href={`/${currentTrack.artist?.id}`}
                      className="text-xs text-white/60 hover:underline line-clamp-1"
                    >
                      {currentTrack.artist?.name}
                    </Link>
                  </div>
                </div>

                {/* 오른쪽: 컨트롤 버튼들 */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggle}
                    variant="ghost"
                    size="icon"
                    disabled={isLoading || !!error}
                    className="text-white bg-white/10 hover:bg-white/20"
                  >
                    {renderPlayButton()}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleQueueClick}
                    className={cn(
                      "text-white/60 hover:text-white hover:bg-white/10",
                      showQueue && "text-white bg-white/10"
                    )}
                    title="재생목록 (Q)"
                  >
                    <IconPlaylist className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 py-3">
              {/* 왼쪽 */}
              <div className="flex items-center justify-start gap-4">
                <div className="flex items-center gap-4 max-w-[600px] w-full">
                  <div
                    className="relative h-10 w-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 
                    shadow-lg shadow-black/20 hover:shadow-black/40 transition-all group"
                  >
                    <Image
                      src={getImageUrl(currentTrack.album?.coverImage)}
                      alt={currentTrack.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate hover:text-[#e6c200] transition-colors">
                          {currentTrack.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          {currentTrack.artist && (
                            <Link
                              href={`/${currentTrack.artist.id}`}
                              className="hover:text-white hover:underline truncate transition-colors"
                            >
                              {currentTrack.artist.name}
                            </Link>
                          )}
                          {currentTrack.album && (
                            <>
                              <span className="text-white/40">•</span>
                              <Link
                                href={`/album/${currentTrack.album.id}`}
                                className="hover:text-white hover:underline truncate transition-colors"
                              >
                                {currentTrack.album.title}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 중앙 */}
              <div className="flex-1 flex justify-center items-center">
                <div className="bg-white/10 rounded-2xl px-2">
                  <Button
                    onClick={toggleRepeatMode}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all",
                      repeatMode !== "off" && "text-[#e6c200]",
                      repeatMode === "off" && "opacity-60"
                    )}
                    title={`반복 (R): ${
                      repeatMode === "off"
                        ? "끄기"
                        : repeatMode === "all"
                          ? "전체 반복"
                          : "한 곡 반복"
                    }`}
                  >
                    {renderRepeatIcon()}
                  </Button>

                  <Button
                    onClick={playPrevious}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <IconPlayerSkipBack className="w-6 h-6" />
                  </Button>

                  <Button
                    onClick={toggle}
                    variant="ghost"
                    size="icon"
                    disabled={isLoading || !!error}
                    className="w-12 h-12 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    title="재생/일시정지 (Space)"
                  >
                    {renderPlayButton()}
                  </Button>

                  <Button
                    onClick={playNext}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <IconPlayerSkipForward className="w-6 h-6" />
                  </Button>

                  <Button
                    onClick={toggleShuffle}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all",
                      isShuffled && "text-[#e6c200]"
                    )}
                    title="셔플 (S)"
                  >
                    <IconArrowsShuffle className="w-7 h-7" />
                  </Button>
                </div>
              </div>

              {/* 오른쪽 */}
              <div className="flex items-center justify-end gap-2">
              <div className="text-xs text-white/60 mr-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>

                <div className="flex items-center">
                  <LikeButton type="track" id={currentTrack.id} />
                </div>

                <div className="relative group">
                  <div
                    className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 pb-2",
                      "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                      "transition-[opacity,visibility] duration-100"
                    )}
                  >
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-lg border border-white/10">
                      <div className="h-24 flex items-center justify-center">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          min={0}
                          max={1}
                          step={0.01}
                          orientation="vertical"
                          onValueChange={handleVolumeChange}
                          className="h-full"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title="음소거 (M)"
                  >
                    <VolumeIcon className="w-10 h-10" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleQueueClick}
                  className={cn(
                    "w-10 h-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all",
                    showQueue && "text-[#e6c200] bg-white/10"
                  )}
                  title="재생목록 (Q)"
                >
                  <IconPlaylist className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500/90 text-white text-sm py-2 px-4 rounded-lg backdrop-blur-lg border border-red-500/20">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
