"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconX,
  IconBrowser,
  IconCopy,
  IconExternalLink,
  IconBrandSafari,
} from "@tabler/icons-react";

interface BrowserWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrowserWarningModal({
  isOpen,
  onClose,
}: BrowserWarningModalProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inAppBrowserType, setInAppBrowserType] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const aRef = useRef<HTMLAnchorElement>(null);

  // 현재 URL 가져오기 (UTM 파라미터 유지)
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 기기 유형 및 인앱 브라우저 감지
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      setIsAndroid(/android/.test(ua));

      // 인앱 브라우저 타입 탐지
      if (/instagram/.test(ua)) {
        setInAppBrowserType("instagram");
      } else if (/kakaotalk/.test(ua)) {
        setInAppBrowserType("kakaotalk");
      } else if (/naver/.test(ua)) {
        setInAppBrowserType("naver");
      } else if (/fban|fbav/.test(ua)) {
        setInAppBrowserType("facebook");
      } else if (/line/.test(ua)) {
        setInAppBrowserType("line");
      } else if (
        /\bsafari\b/.test(ua) &&
        /\bmobile\b/.test(ua) &&
        !/chrome|crios|firefox|fxios|edg|edge/.test(ua)
      ) {
        setInAppBrowserType("safari_mobile");
      }
    }
  }, []);

  // 링크 복사 후 상태 관리
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // 카카오톡 전용 외부 브라우저 열기 함수
  const openKakaoExternalBrowser = () => {
    if (inAppBrowserType !== "kakaotalk" || typeof window === "undefined")
      return;

    // 항상 링크를 클립보드에 복사 (폴백 방식)
    copyToClipboard();
    setIsRedirecting(true);

    try {
      // 카카오톡 전용 URL 스키마 사용
      window.location.href =
        "kakaotalk://web/openExternal?url=" + encodeURIComponent(currentUrl);

      // 백업: 실패 시 사용자 안내
      setTimeout(() => {
        setIsRedirecting(false);
      }, 1500);
    } catch (e) {
      console.error("카카오톡 외부 브라우저 열기 실패:", e);
      setIsRedirecting(false);
    }
  };

  // 라인 전용 외부 브라우저 열기 함수
  const openLineExternalBrowser = () => {
    if (inAppBrowserType !== "line" || typeof window === "undefined") return;

    // 항상 링크를 클립보드에 복사 (폴백 방식)
    copyToClipboard();
    setIsRedirecting(true);

    try {
      // 라인 전용 URL 파라미터 추가
      if (currentUrl.indexOf("?") !== -1) {
        window.location.href = currentUrl + "&openExternalBrowser=1";
      } else {
        window.location.href = currentUrl + "?openExternalBrowser=1";
      }

      // 백업: 실패 시 사용자 안내
      setTimeout(() => {
        setIsRedirecting(false);
      }, 1500);
    } catch (e) {
      console.error("라인 외부 브라우저 열기 실패:", e);
      setIsRedirecting(false);
    }
  };

  // Android 전용 외부 브라우저 열기 함수
  const openAndroidExternalBrowser = () => {
    if (!isAndroid || typeof window === "undefined") return;

    // 항상 링크를 클립보드에 복사 (폴백 방식)
    copyToClipboard();
    setIsRedirecting(true);

    // 카카오톡/라인 전용 처리가 있는지 확인
    if (inAppBrowserType === "kakaotalk") {
      openKakaoExternalBrowser();
      return;
    } else if (inAppBrowserType === "line") {
      openLineExternalBrowser();
      return;
    }

    try {
      // Android Intent URL 사용
      window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;

      // 백업: 정상적으로 리다이렉션되지 않는 경우
      setTimeout(() => {
        if (aRef.current) {
          aRef.current.click();
        }
        setIsRedirecting(false);
      }, 1500);
    } catch (e) {
      console.error("외부 브라우저 열기 실패:", e);
      setIsRedirecting(false);
    }
  };

  // iOS 전용 외부 브라우저 열기 함수
  const openIOSExternalBrowser = () => {
    if (!isIOS || typeof window === "undefined") return;

    // 항상 링크를 클립보드에 복사 (폴백 방식)
    copyToClipboard();
    setIsRedirecting(true);

    // 카카오톡/라인 전용 처리가 있는지 확인
    if (inAppBrowserType === "kakaotalk") {
      openKakaoExternalBrowser();
      return;
    } else if (inAppBrowserType === "line") {
      openLineExternalBrowser();
      return;
    }

    // 일반 iOS의 경우 Safari로 이동 시도
    try {
      window.location.href = "x-web-search://?";
      setTimeout(() => {
        setIsRedirecting(false);
      }, 1500);
    } catch (e) {
      console.error("Safari 열기 실패:", e);
      setIsRedirecting(false);
    }
  };

  // 링크 복사 함수
  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          setIsCopied(true);
        })
        .catch((err) => {
          console.error("클립보드 복사 실패:", err);
          fallbackCopyTextToClipboard(currentUrl);
        });
    } else {
      fallbackCopyTextToClipboard(currentUrl);
    }

    // 복사 성공 여부에 상관없이 사용자에게 피드백 제공
    setIsCopied(true);
  };

  // 대체 복사 방법
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      textArea.style.position = "fixed";
      textArea.style.left = "0";
      textArea.style.top = "0";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      if (successful) {
        setIsCopied(true);
      }

      document.body.removeChild(textArea);
    } catch (err) {
      console.error("대체 복사 방법 실패:", err);
    }
  };

  // iOS용 가이드 컴포넌트
  const IOSGuideComponent = () => (
    <div className="mt-4 p-4 bg-indigo-900/30 rounded-xl border border-indigo-900/50 text-white/90">
      <ol className="text-sm text-white/80 space-y-3 ml-2">
        <li className="flex items-center justify-start gap-4">
          <div className="mt-1 min-w-[18px] h-[18px] rounded-full bg-indigo-800 flex items-center justify-center text-xs">
            1
          </div>
          <div>
            <p className="text-xs text-left">아래 "링크 복사하기" 버튼을 눌러 링크를 복사하세요</p>
          </div>
        </li>

        <li className="flex items-center justify-start gap-4">
          <div className="mt-1 min-w-[18px] h-[18px] rounded-full bg-indigo-800 flex items-center justify-center text-xs">
            2
          </div>
          <div>
            <p className="text-xs text-left">
              브라우저(Safari/Chrome)를 열고 주소창에 복사한 링크를 붙여넣기
              하세요
            </p>
          </div>
        </li>
      </ol>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          {/* 숨겨진 링크 (외부 브라우저 열기용) */}
          <a
            ref={aRef}
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "none" }}
          >
            redirect
          </a>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-xl overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <IconX size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <IconBrowser size={28} className="text-purple-400" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                Google 로그인을 위해 외부 브라우저 필요
              </h3>

              <p className="text-white/70 mb-4 text-sm">
                Google 로그인은 보안상의 이유로 인앱 브라우저에서 작동하지
                않습니다. 외부 브라우저에서 계속 진행해주세요.
              </p>

              <div className="w-full space-y-4">
                {/* iOS와 Android에 따라 다른 UI 표시 */}
                {isIOS ? (
                  /* iOS는 가이드와 탈출 버튼 같이 표시 */
                  <>
                    {inAppBrowserType === "kakaotalk" ||
                    inAppBrowserType === "line" ? (
                      <button
                        onClick={openIOSExternalBrowser}
                        disabled={isRedirecting}
                        className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-medium 
                          ${
                            isRedirecting
                              ? "bg-gray-800 text-white/50"
                              : "bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 text-white"
                          } 
                          transition-all`}
                      >
                        <IconExternalLink size={18} />
                        <span>
                          {isRedirecting
                            ? "외부 브라우저로 여는 중..."
                            : "외부 브라우저로 열기"}
                        </span>
                      </button>
                    ) : null}
                    <IOSGuideComponent />
                  </>
                ) : isAndroid ? (
                  /* Android는 Intent 버튼 표시 */
                  <button
                    onClick={openAndroidExternalBrowser}
                    disabled={isRedirecting}
                    className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-medium 
                      ${
                        isRedirecting
                          ? "bg-gray-800 text-white/50"
                          : "bg-gradient-to-r from-indigo-900 via-purple-900 to-violet-900 text-white"
                      } 
                      transition-all`}
                  >
                    <IconExternalLink size={18} />
                    <span>
                      {isRedirecting
                        ? "외부 브라우저로 여는 중..."
                        : "외부 브라우저로 열기"}
                    </span>
                  </button>
                ) : null}

                <button
                  onClick={copyToClipboard}
                  className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl font-medium transition-all ${
                    isCopied
                      ? "bg-green-700 text-white"
                      : "bg-white/10 hover:bg-white/15 text-white/90"
                  }`}
                >
                  {isCopied ? (
                    <span>링크가 복사되었습니다!</span>
                  ) : (
                    <>
                      <IconCopy size={16} />
                      <span>링크 복사하기</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-white/50 mt-4">
                  이 제한은 Google의 보안 정책으로 인한 것입니다. 외부
                  브라우저에서 로그인하면 계정 보안이 더욱 강화됩니다.
                </p>

                {inAppBrowserType && (
                  <p className="text-xs text-indigo-400/70 mt-1">
                    감지된 브라우저:{" "}
                    {inAppBrowserType === "instagram"
                      ? "인스타그램"
                      : inAppBrowserType === "kakaotalk"
                        ? "카카오톡"
                        : inAppBrowserType === "naver"
                          ? "네이버"
                          : inAppBrowserType === "facebook"
                            ? "페이스북"
                            : inAppBrowserType === "line"
                              ? "라인"
                              : inAppBrowserType === "safari_mobile"
                                ? "모바일 Safari"
                                : "기타 인앱 브라우저"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
