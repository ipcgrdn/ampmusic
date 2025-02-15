import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new HttpException(
        'Only image files are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};

export const editFileName = (req: any, file: any, callback: any) => {
  const fileExtName = extname(file.originalname);
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `avatar-${randomName}${fileExtName}`);
};

export const maxFileSize = 1024 * 1024 * 2; // 2MB 

export async function deleteOldAvatar(avatarUrl: string | null) {
  if (!avatarUrl || !avatarUrl.includes('/uploads/avatars/')) {
    return;
  }

  try {
    const filename = avatarUrl.split('/').pop();
    if (!filename) return;

    const filePath = join(process.cwd(), 'uploads', 'avatars', filename);
    await unlink(filePath);
  } catch (error) {
    // 파일이 이미 없는 경우 무시
    console.error('Failed to delete old avatar:', error);
  }
} 