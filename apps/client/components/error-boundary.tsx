'use client';

import { Component, ReactNode } from 'react';
import { IconAlertCircle, IconRefresh, IconHome } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 여기서 에러 로깅 서비스로 에러를 보낼 수 있습니다
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-zinc-900 to-black">
          {/* 배경 효과 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-700" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md p-8 rounded-3xl 
                     backdrop-blur-xl bg-white/10 border border-white/20 
                     shadow-2xl"
          >
            <div className="text-center space-y-6">
              {/* 에러 아이콘 */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                <div className="relative flex items-center justify-center w-full h-full">
                  <IconAlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              {/* 에러 메시지 */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  앗! 문제가 발생했습니다
                </h2>
                <p className="text-white/60 text-sm">
                  예기치 않은 오류가 발생했습니다.<br />
                  페이지를 새로고침하거나 홈으로 이동해주세요.
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-white/10 hover:bg-white/15 backdrop-blur-sm
                           border border-white/10 rounded-2xl
                           text-white text-sm font-medium transition-all
                           shadow-lg hover:shadow-xl hover:shadow-white/5"
                >
                  <IconRefresh className="w-4 h-4" />
                  새로고침
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500
                           hover:from-indigo-600 hover:via-purple-600 hover:to-violet-600
                           rounded-2xl text-white text-sm font-medium transition-all
                           shadow-lg shadow-purple-500/25"
                >
                  <IconHome className="w-4 h-4" />
                  홈으로
                </motion.button>
              </div>

              {/* 에러 코드 */}
              {this.state.error && (
                <div className="pt-6">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <code className="text-xs text-white/40 break-all">
                      {this.state.error.message}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
} 