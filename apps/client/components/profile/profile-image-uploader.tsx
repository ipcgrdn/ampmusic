'use client';

import { useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/axios';
import { IconUpload } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';

interface ProfileImageUploaderProps {
  userId: string;
  currentAvatar: string;
  onUpdate: (newAvatar: string) => void;
}

export function ProfileImageUploader({ userId, currentAvatar, onUpdate }: ProfileImageUploaderProps) {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === userId;

  const handleUpload = async (file: File) => {
    if (!file) return;

    // 파일 크기 체크 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // 파일 타입 체크
    if (!file.type.match(/^image\/(jpg|jpeg|png)$/)) {
      alert('Only JPG, PNG files are allowed');
      return;
    }

    try {
      if (!isOwner) {
        showToast('You are not authorized to upload an image', 'error');
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdate(response.data.avatar);
      showToast('Profile image updated successfully', 'success');
    } catch  {
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative group">
      {/* 프로필 이미지 */}
      <div
        className={`relative w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden
          ${dragActive ? 'ring-2 ring-[#e6c200]' : 'ring-2 ring-white/20'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Image
          src={currentAvatar}
          alt="Profile"
          fill
          className="object-cover"
          priority
        />

        {/* 업로드 오버레이 */}
        {isOwner && (
          <motion.div
            initial={false}
          animate={{
            opacity: dragActive || isUploading ? 1 : 0,
            scale: dragActive ? 1.05 : 1,
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
        >
          {isUploading ? (
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
              <IconUpload className="w-6 h-6 text-white" />
            )}
          </motion.div>
        )}
      </div>

      {/* 파일 입력 */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        className="hidden"
        id="profile-image-input"
      />

      {/* 업로드 버튼 */}
      {isOwner && (
        <motion.label
          htmlFor="profile-image-input"
          className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white/10 backdrop-blur-sm 
          border border-white/20 cursor-pointer opacity-0 group-hover:opacity-100 
          hover:bg-white/20 transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
          <IconUpload className="w-4 h-4 text-white" />
        </motion.label>
      )}
    </div>
  );
} 