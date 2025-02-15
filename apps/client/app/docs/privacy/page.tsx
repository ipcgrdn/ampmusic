import { Separator } from "@/components/ui/separator";
import {
  IconLock,
  IconShieldLock,
  IconUserCircle,
  IconServer,
  IconClock,
  IconTrash,
  IconAlertCircle,
  IconMail,
} from "@tabler/icons-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "AMP(Alternative Music Platform)의 개인정보처리방침입니다. 개인정보 수집 및 이용에 대해 안내합니다.",
  openGraph: {
    title: "AMP 개인정보처리방침",
    description: "AMP 개인정보처리방침",
    url: "/docs/privacy",
  },
  alternates: {
    canonical: "/docs/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconLock className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              AMP 개인정보 처리방침
            </h1>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/60">시행일: 2025년 1월 1일</p>
            <p className="text-sm text-white/60">버전: 1.0</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 개요 섹션 */}
      <div className="prose prose-invert max-w-none">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-white/80 leading-relaxed">
            AMP(Alternative Music Platform)는 이용자의 개인정보를 보호하고 관련
            법령을 준수하기 위해 아래와 같은 처리방침을 수립합니다. 본 방침은
            AMP 서비스를 이용하는 모든 사용자에게 적용되며, 개인정보가 어떻게
            수집, 이용, 보호되는지 안내합니다.
          </p>
        </div>

        {/* 주요 정보 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <InfoCard
            icon={<IconUserCircle className="w-5 h-5" />}
            title="수집하는 개인정보"
            content="구글 로그인 정보, 서비스 이용 기록, 자동 수집 정보"
          />
          <InfoCard
            icon={<IconShieldLock className="w-5 h-5" />}
            title="보안 조치"
            content="개인정보 암호화 저장, 접근 권한 관리, 보안 통신구간 적용"
          />
          <InfoCard
            icon={<IconClock className="w-5 h-5" />}
            title="보유 기간"
            content="회원 탈퇴 시 즉시 삭제"
          />
          <InfoCard
            icon={<IconServer className="w-5 h-5" />}
            title="처리 목적"
            content="서비스 제공, 고객 응대, 서비스 개선, 법적 의무 이행"
          />
        </div>

        {/* 1. 개인정보의 수집 항목 및 수집 방법 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCircle className="w-5 h-5 text-purple-400" />
            1. 개인정보의 수집 항목 및 수집 방법
          </h2>

          <div className="space-y-6">
            <div className="grid gap-4">
              <CollectionCard
                title="필수적 수집 정보"
                items={[
                  "구글 로그인 정보: 이름, 이메일 주소, 프로필 사진",
                  "서비스 이용 기록: 음악 청취 기록, 콘텐츠 및 댓글 작성 기록, 좋아요, 팔로우 등 상호작용 기록",
                ]}
              />
              <CollectionCard
                title="자동 수집 정보"
                items={["IP 주소", "쿠키", "접속 로그"]}
              />
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <h3 className="text-md font-medium mb-2">수집 방법</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>구글 OAuth를 통한 로그인 시 자동 수집</li>
                <li>서비스 이용 중 생성되는 기록 자동 수집</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. 개인정보의 수집 및 이용 목적 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCircle className="w-5 h-5 text-purple-400" />
            2. 개인정보의 수집 및 이용 목적
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80 mb-2">
              AMP는 수집된 개인정보를 다음 목적을 위해 활용합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>서비스 제공 및 관리: 사용자 인증, 콘텐츠 제공</li>
              <li>커뮤니케이션: 서비스 관련 안내, 고객 문의 응대</li>
              <li>서비스 개선: 사용자 경험 분석, 서비스 최적화</li>
              <li>법적 의무 이행: 관계 법령에 따른 기록 보존</li>
            </ul>
          </div>
        </section>

        {/* 3. 개인정보의 보유 및 이용 기간 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconClock className="w-5 h-5 text-purple-400" />
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <div className="grid gap-4">
            <RetentionCard title="회원 정보" items={["회원 탈퇴 즉시 삭제"]} />
            <RetentionCard
              title="서비스 이용 기록"
              items={[
                "서비스 이용 기록은 기본적으로 삭제되지 않습니다.",
                "단, 장기간 서비스 미사용시 고지 후 삭제될 수 있습니다.",
                "서비스 이용 기록 또한 회원 탈퇴 시 삭제됩니다.",
              ]}
            />
          </div>
        </section>

        {/* 4. 개인정보의 제3자 제공 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCircle className="w-5 h-5 text-purple-400" />
            4. 개인정보의 제3자 제공
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              AMP는 사용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 법적
              요구가 있을 경우 예외적으로 제공될 수 있습니다.
            </p>
          </div>
        </section>

        {/* 5. 개인정보 보호를 위한 조치 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldLock className="w-5 h-5 text-purple-400" />
            5. 개인정보 보호를 위한 조치
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            {/* 5.1 기술적 조치 */}
            <div>
              <h3 className="text-lg font-medium mb-2">5.1 기술적 조치</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>개인정보 암호화 저장</li>
                <li>시스템 접근 권한 관리</li>
                <li>이상 접근 탐지 및 보안 점검</li>
                <li>보안 통신구간 적용 (HTTPS)</li>
              </ul>
            </div>

            {/* 5.2 관리적 조치 */}
            <div>
              <h3 className="text-lg font-medium mb-2">5.2 관리적 조치</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>개인정보 보호 정책 수립 및 시행</li>
                <li>내부 관리계획 수립 및 시행</li>
                <li>정기적인 자체 감사 실시</li>
              </ul>
            </div>

            {/* 5.3 보안 취약점 관리 */}
            <div>
              <h3 className="text-lg font-medium mb-2">5.3 보안 취약점 관리</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>정기적인 보안 취약점 진단 및 조치</li>
                <li>보안 업데이트 및 패치 관리</li>
              </ul>
            </div>

            {/* 5.4 데이터 보호 조치 */}
            <div>
              <h3 className="text-lg font-medium mb-2">5.4 데이터 보호 조치</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>데이터 암호화 보관</li>
                <li>데이터 접근 로그 기록 및 모니터링</li>
              </ul>
            </div>

            {/* 5.5 보안 사고 대응 */}
            <div>
              <h3 className="text-lg font-medium mb-2">5.5 보안 사고 대응</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>개인정보 유출 통지 및 신고 절차 수립</li>
                <li>피해 최소화를 위한 조치 계획 수립</li>
                <li>사고 분석 및 재발 방지 대책 수립</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. 개인정보 국외 이전 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconServer className="w-5 h-5 text-purple-400" />
            6. 개인정보 국외 이전
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              AMP는 구글 OAuth 인증 서비스(구글 LLC)를 사용하므로 개인정보가
              구글의 해외 서버에 저장될 수 있습니다. 구글은 글로벌 개인정보보호
              규정을 준수하며
              <a
                href="https://policies.google.com/privacy"
                className="text-purple-400 hover:text-purple-300 ml-1"
              >
                구글 개인정보 처리방침
              </a>
              을 통해 자세한 정보를 제공합니다.
            </p>
          </div>
        </section>

        {/* 7. 이용자의 권리와 행사 방법 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCircle className="w-5 h-5 text-purple-400" />
            7. 이용자의 권리와 행사 방법
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80 mb-2">
              이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제를 요청할
              수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>
                개인정보 수정 및 삭제 요청은 AMP{" "}
                <Link
                  href="/docs/support"
                  className="text-purple-400 hover:text-purple-300"
                >
                  고객센터
                </Link>{" "}
                를 통해 처리됩니다.
              </li>
              <li>
                개인정보 처리에 대한 동의 철회는 서비스 이용 해지로 이어질 수
                있습니다.
              </li>
            </ul>
          </div>
        </section>

        {/* 8. 개인정보 파기 절차 및 방법 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconTrash className="w-5 h-5 text-purple-400" />
            8. 개인정보 파기 절차 및 방법
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80 mb-2">
              AMP는 개인정보 보유 기간이 종료되거나 처리 목적이 달성되었을 때
              해당 정보를 지체 없이 파기합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>전자적 파일: 복구 불가능한 방식으로 삭제</li>
              <li>종이 문서: 분쇄 또는 소각</li>
            </ul>
          </div>
        </section>

        {/* 9. 개인정보 보호책임자 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconMail className="w-5 h-5 text-purple-400" />
            9. 개인정보 보호책임자
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60">성명</span>
                <span className="text-white">최정원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">직책</span>
                <span className="text-white">대표</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">연락처</span>
                <span className="text-white">010-6415-2584</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">이메일</span>
                <span className="text-white">amp.from.vivian@gmail.com</span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. 개인정보 관련 문의 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconMail className="w-5 h-5 text-purple-400" />
            10. 개인정보 관련 문의
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              개인정보와 관련된 문의는{" "}
              <Link
                href="/docs/support"
                className="text-purple-400 hover:text-purple-300"
              >
                고객센터
              </Link>
              를 통해 접수받습니다.
            </p>
          </div>
        </section>

        {/* 11. 개인정보 처리방침의 변경 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconAlertCircle className="w-5 h-5 text-purple-400" />
            11. 개인정보 처리방침의 변경
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              본 방침은 법령 또는 서비스 정책의 변경에 따라 수정될 수 있습니다. <br />
              변경 사항은 시행 7일 전부터 공지하며, 변경된 방침은 공지 후 효력이
              발생합니다.
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
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <h3 className="text-white font-medium mb-2">문의하기</h3>
            <p className="text-sm text-white/60">
              개인정보 처리방침에 대한 문의사항은{" "}
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

// 수집 정보 카드 컴포넌트
function CollectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
      <h4 className="text-base font-medium mb-2 text-white/90">{title}</h4>
      <ul className="list-disc list-inside space-y-2 text-white/80">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// 보유 기간 카드 컴포넌트
function RetentionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <ul className="list-disc list-inside text-white/80">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
