import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconUserCircle,
  IconShieldLock,
  IconAlertCircle,
  IconGavel,
  IconCoin,
  IconInfoCircle,
  IconMessageCircle,
  IconShield,
  IconScale,
} from "@tabler/icons-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "AMP(Alternative Music Platform) 서비스 이용약관입니다. 서비스 이용 전 반드시 확인해주세요.",
  openGraph: {
    title: "AMP 이용약관",
    description: "AMP 서비스 이용약관",
    url: "/docs/terms",
  },
  alternates: {
    canonical: "/docs/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconBook className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">AMP 이용약관</h1>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/60">시행일: 2025년 1월 1일</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 주요 정보 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={<IconUserCircle className="w-5 h-5" />}
          title="회원가입"
          content="만 14세 이상 구글 계정으로 가입 가능"
        />
        <InfoCard
          icon={<IconShieldLock className="w-5 h-5" />}
          title="콘텐츠 관리"
          content="저작권 관련 수칙 및 유해 콘텐츠 관리"
        />
        <InfoCard
          icon={<IconMessageCircle className="w-5 h-5" />}
          title="커뮤니티"
          content="건전한 댓글 문화 및 소통 환경 조성"
        />
        <InfoCard
          icon={<IconShield className="w-5 h-5" />}
          title="청소년 보호"
          content="청소년 보호정책 준수 및 유해 콘텐츠 차단"
        />
      </div>

      <div className="prose prose-invert max-w-none">
        {/* 제1조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconInfoCircle className="w-5 h-5 text-purple-400" />
            제1조 (총칙)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>
                본 약관은 AMP(Alternative Music Platform, 이하 &ldquo;서비스&rdquo;)가
                제공하는 음악 게시 및 청취 서비스를 이용함에 있어 서비스와
                이용자 간의 권리, 의무 및 책임 사항을 규정하는 것을 목적으로
                합니다.
              </li>
              <li>
                서비스 제공자 정보는 다음과 같습니다:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-white/60">
                  <li>서비스명: AMP (Alternative Music Platform)</li>
                  <li>대표자: 최정원</li>
                  <li>연락처: amp.from.vivian@gmail.com</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* 제2조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconInfoCircle className="w-5 h-5 text-purple-400" />
            제2조 (용어의 정의)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80 mb-4">
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>&ldquo;서비스&rdquo;란 AMP가 제공하는 음악 공유 플랫폼을 의미합니다.</li>
              <li>
                &ldquo;이용자&rdquo;란 본 약관에 따라 서비스를 이용하는 회원을 의미합니다.
              </li>
              <li>
                &ldquo;콘텐츠&rdquo;란 서비스 내에서 게시되는 음원, 이미지 등의 파일을
                의미합니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제3조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCircle className="w-5 h-5 text-purple-400" />
            제3조 (회원가입 및 계정)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>본 서비스는 회원가입을 통해서만 이용 가능합니다.</li>
              <li>
                회원가입은 구글 로그인 방식으로만 제공되며, 그 외 로그인 수단은
                지원하지 않습니다.
              </li>
              <li>만 14세 미만의 이용자는 서비스 가입이 제한됩니다.</li>
              <li>
                이용자는 하나의 구글 계정으로 하나의 서비스 계정만 생성할 수
                있습니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제4조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldLock className="w-5 h-5 text-purple-400" />
            제4조 (콘텐츠 이용 및 관리)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>
                이용자는 서비스에 사진과 오디오 파일 형태의 콘텐츠를 업로드할 수
                있습니다.
              </li>
              <li>
                콘텐츠 관리 기준:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-white/60">
                  <li>저작권 침해 콘텐츠</li>
                  <li>청소년 유해 콘텐츠</li>
                  <li>불법 또는 유해 콘텐츠</li>
                  <li>타인의 권리를 침해하는 콘텐츠</li>
                </ul>
              </li>
              <li>
                위반 시 조치:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-white/60">
                  <li>1차: 경고 및 콘텐츠 삭제</li>
                  <li>2차: 경고 및 콘텐츠 삭제</li>
                  <li>3차: 서비스 이용 영구 차단</li>
                </ul>
              </li>
              <li>
                신고된 콘텐츠는 가능한 한 접수 후 24시간 이내에 검토를
                시작합니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제5조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconScale className="w-5 h-5 text-purple-400" />
            제5조 (저작권과 콘텐츠 사용)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              저작권 관련 세부사항은 별도의{" "}
              <Link
                href="/docs/copyright"
                className="text-purple-400 hover:text-purple-300"
              >
                저작권 정책
              </Link>{" "}
              을 따릅니다.
            </ol>
          </div>
        </section>

        {/* 제6조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconMessageCircle className="w-5 h-5 text-purple-400" />
            제6조 (댓글 관리 정책)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-2 text-white/80">
              <li>
                댓글 금지 사항:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>타인에 대한 명예훼손, 욕설, 비방</li>
                  <li>상업적 광고 또는 스팸</li>
                  <li>개인정보 유출</li>
                  <li>음란성 또는 청소년 유해 내용</li>
                </ul>
              </li>
              <li>
                위반 시 조치:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>1차: 댓글 삭제</li>
                  <li>2차: 댓글 작성 제한 (30일)</li>
                  <li>3차: 서비스 이용 제한</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        {/* 제7조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCoin className="w-5 h-5 text-purple-400" />
            제7조 (수익 모델)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>현재 본 서비스는 별도의 수익 모델을 운영하지 않습니다.</li>
              <li>
                추후 수익 모델이나 유료 서비스 도입 시 별도 약관이 적용되며,
                시행 30일 전 공지합니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제8조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldLock className="w-5 h-5 text-purple-400" />
            제8조 (개인정보 보호)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              개인정보 수집 및 처리에 관한 사항은{" "}
              <Link
                href="/docs/privacy"
                className="text-purple-400 hover:text-purple-300"
              >
                개인정보 처리방침
              </Link>{" "}
              을 따릅니다.
            </ol>
          </div>
        </section>

        {/* 제9조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShield className="w-5 h-5 text-purple-400" />
            제9조 (청소년 보호)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              청소년 보호에 관한 사항은{" "}
              <Link
                href="/docs/youth"
                className="text-purple-400 hover:text-purple-300"
              >
                청소년 보호정책
              </Link>{" "}
              을 따릅니다.
            </ol>
          </div>
        </section>

        {/* 제10조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconGavel className="w-5 h-5 text-purple-400" />
            제10조 (손해배상)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>
                서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대해
                책임을 지지 않습니다.
              </li>
              <li>
                이용자가 본 약관의 이용 제한 규정을 위반하여 서비스에 손해가
                발생한 경우, 이용자는 서비스에 대해 손해배상 책임을 집니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제11조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconScale className="w-5 h-5 text-purple-400" />
            제11조 (분쟁해결)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>
                서비스 이용과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우
                대한민국 서울 소재의 법원을 관할 법원으로 합니다.
              </li>
              <li>
                서비스 이용 중 분쟁 발생 시 처리 절차:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-white/60">
                  <li>고객센터를 통한 분쟁 접수</li>
                  <li>분쟁조정 신청 (접수 후 7일 이내 답변)</li>
                  <li>분쟁해결 담당자 배정 (서비스 대표자와 동일)</li>
                  <li>조정 및 중재</li>
                </ul>
              </li>
              <li>
                기타 민원 처리는{" "}
                <Link
                  href="/docs/support"
                  className="text-purple-400 hover:text-purple-300"
                >
                  고객센터
                </Link>{" "}
                를 통해 접수 가능합니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제12조 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconAlertCircle className="w-5 h-5 text-purple-400" />
            제12조 (약관의 효력 및 변경)
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ol className="list-decimal list-inside space-y-3 text-white/80">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                공지함으로써 효력이 발생합니다.
              </li>
              <li>
                서비스는 약관의 규제에 관한 법률 등 관련 법령에 위배되지 않는
                범위에서 본 약관을 변경할 수 있습니다.
              </li>
              <li>
                약관 변경 시 시행일자, 변경사유, 변경내용을 명시하여 시행일자
                7일 전부터 공지합니다.
              </li>
              <li>
                이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고{" " }
                <Link
                  href="/settings/account"
                  className="text-purple-400 hover:text-purple-300"
                >
                  탈퇴
                </Link>{" "}
                할 수 있습니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 부칙 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconGavel className="w-5 h-5 text-purple-400" />
            부칙
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              본 약관은 2025년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </section>
      </div>

      {/* 문의하기 섹션 */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <IconAlertCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">문의하기</h3>
            <p className="text-sm text-white/60">
              이용약관에 대한 문의사항은{" "}
              <Link
                href="/docs/support"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                고객센터
              </Link>
              로 연락주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 정보 카드 컴포넌트
function InfoCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-purple-500/10">{icon}</div>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{content}</p>
    </div>
  );
}
