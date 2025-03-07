import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AMP - Alternative Music Platform',
    short_name: 'AMP',
    description: '아티스트와 팬을 위한 새로운 음악 플랫폼, AMP에서 당신의 음악을 공유하세요',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon'
      },
      {
        src: '/apple-icon.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  }
}