import { join } from 'path';

// 프로젝트 루트 디렉토리 (process.cwd() 사용)
export const PROJECT_ROOT = process.cwd();
// 업로드 디렉토리
export const UPLOAD_ROOT = join(PROJECT_ROOT, 'uploads');
// 아바타 업로드 디렉토리
export const AVATAR_UPLOAD_PATH = join(UPLOAD_ROOT, 'avatars'); 