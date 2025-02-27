"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Track {
  file: File;
  title: string;
  duration: number;
  order: number;
  description?: string;
  lyrics?: string;
  credit?: string;
}

interface TrackUploadProps {
  value: Track[];
  onChange: (tracks: Track[]) => void;
  disabled?: boolean;
}

export function TrackUpload({ value, onChange, disabled }: TrackUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);
        
        const handleError = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load audio file'));
        };

        const handleLoad = () => {
          const duration = Math.round(audio.duration);
          URL.revokeObjectURL(objectUrl);
          resolve(duration);
        };

        audio.addEventListener('loadedmetadata', handleLoad);
        audio.addEventListener('error', handleError);
        
        audio.src = objectUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const newTracks = await Promise.all(
        acceptedFiles.map(async (file, index) => {
          try {
            // 파일 크기 체크 (20MB)
            if (file.size > 20 * 1024 * 1024) {
              throw new Error(`${file.name}의 크기가 20MB를 초과합니다.`);
            }

            const duration = await getAudioDuration(file);
            return {
              file,
              title: file.name.replace(/\.[^/.]+$/, ""),
              duration,
              order: value.length + index + 1,
            };
          } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
            return null;
          }
        })
      );

      // 실패한 파일들을 필터링
      const validTracks = newTracks.filter((track): track is Track => track !== null);
      
      if (validTracks.length > 0) {
        onChange([...value, ...validTracks]);
      }
    } catch (error) {
      console.error('Failed to process audio files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [value, onChange, isProcessing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg']
    },
    multiple: true,
    disabled: disabled || isProcessing,
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: DragEvent) => {
      e.preventDefault();
    }
  });

  const removeTrack = (index: number) => {
    const newTracks = value.filter((_, i) => i !== index);
    onChange(newTracks.map((track, i) => ({ ...track, order: i + 1 })));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors
          ${isDragActive ? 'border-white/50 bg-white/10' : 'border-white/20 hover:border-white/30'}
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} type="file" accept="audio/*" multiple />
        <div className="flex flex-col items-center justify-center gap-2">
          <Music className="h-10 w-10 text-white/50" />
          <p className="text-sm text-white/60 text-center">
            {isDragActive
              ? "오디오 파일을 여기에 놓아주세요"
              : isProcessing
                ? "오디오 파일 처리 중... ⏳"
                : "트랙 파일을 드래그하거나 클릭하여 업로드하세요"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {value.map((track, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border border-white/10 p-3 bg-white/5"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60 w-6 text-center">
                {track.order}
              </span>
              <div className="flex-1">
                <p className="font-medium text-white">{track.title}</p>
                <p className="text-sm text-white/60">
                  {formatDuration(track.duration)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTrack(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 pl-10 mt-2">
              <Textarea
                value={track.description || ""}
                onChange={(e) => {
                  const newTracks = [...value];
                  newTracks[index] = {
                    ...track,
                    description: e.target.value,
                  };
                  onChange(newTracks);
                }}
                placeholder="트랙 설명 (선택사항)"
                className="bg-transparent border-white/10 resize-none h-20 text-sm"
              />
              
              <Textarea
                value={track.lyrics || ""}
                onChange={(e) => {
                  const newTracks = [...value];
                  newTracks[index] = {
                    ...track,
                    lyrics: e.target.value,
                  };
                  onChange(newTracks);
                }}
                placeholder="가사 (선택사항)"
                className="bg-transparent border-white/10 resize-none h-32 text-sm"
              />

              <Textarea
                value={track.credit || ""}
                onChange={(e) => {
                  const newTracks = [...value];
                  newTracks[index] = {
                    ...track,
                    credit: e.target.value,
                  };
                  onChange(newTracks);
                }}
                placeholder="크레딧 정보 (선택사항)"
                className="bg-transparent border-white/10 text-sm resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 