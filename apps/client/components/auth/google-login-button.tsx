'use client';

import { IconBrandGoogle } from '@tabler/icons-react';

export function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full px-6 py-3 flex items-center justify-center gap-3 
        bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white/90
        hover:bg-white/10 hover:border-white/20 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#ffd700]/20"
    >
      <IconBrandGoogle size={20} />
      <span className="text-sm font-medium">Continue with Google</span>
    </button>
  );
} 