"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange(file);
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    disabled,
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

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-4 transition-colors
        ${isDragActive ? 'border-white/50 bg-white/10' : 'border-white/20 hover:border-white/30'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <input {...getInputProps()} type="file" accept="image/*" />
      <div className="flex flex-col h-full items-center justify-center gap-2">
        {(value || preview) ? (
          <div className="relative aspect-square w-40">
            <Image
              src={value || preview || ''}
              alt="cover"
              fill
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <ImageIcon className="h-10 w-10 text-white/50" />
        )}
        {!preview && !value && (
          <p className="text-sm text-white/60 text-center">
            {isDragActive
              ? "이미지를 여기에 놓아주세요"
              : "이미지를 드래그하거나 클릭하여 업로드하세요"}
          </p>
        )}
      </div>
    </div>
  );
}