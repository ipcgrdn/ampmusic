import { Separator } from "@/components/ui/separator";
import {
  IconShieldCheck,
  IconAlertCircle,
  IconUserCheck,
  IconGavel,
  IconShieldLock,
  IconUsers,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";

export default function YouthProtectionPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              AMP 청소년보호정책
            </h1>
          </div>
          <p className="text-sm text-white/60">시행일: 2025년 1월 1일</p>
        </div>
      </div>

      <Separator />

      {/* 주요 정보 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={<IconUsers className="w-5 h-5" />}
          title="이용 기준"
          content="만 14세 이상 이용 가능"
        />
        <InfoCard
          icon={<IconShieldLock className="w-5 h-5" />}
          title="유해정보 차단"
          content="청소년 유해 콘텐츠 관리"
        />
        <InfoCard
          icon={<IconUserCheck className="w-5 h-5" />}
          title="책임자 지정"
          content="청소년보호 책임자 운영"
        />
        <InfoCard
          icon={<IconGavel className="w-5 h-5" />}
          title="제재 조치"
          content="위반 행위에 대한 단계별 조치"
        />
      </div>

      <div className="prose prose-invert max-w-none">
        {/* 1. 개요 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconInfoCircle className="w-5 h-5 text-purple-400" />
            1. 개요
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              Alternative Music Platform(이하 &ldquo;AMP&rdquo;)은 「청소년 보호법」 제2조
              및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라
              청소년들이 안전하게 서비스를 이용할 수 있도록 청소년보호정책을
              수립하여 시행하고 있습니다.
            </p>
          </div>
        </section>

        {/* 2. 서비스 이용 기준 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUsers className="w-5 h-5 text-purple-400" />
            2. 서비스 이용 기준
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>AMP는 구글 계정을 통한 로그인만을 제공합니다.</li>
                <li>
                  <Link
                    href="https://support.google.com/accounts/answer/1350409?hl=ko"
                    className="text-purple-400 hover:text-purple-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    구글 계정 정책
                  </Link>{" "}
                  에 따라 만 14세 이상의 사용자만 서비스 이용이 가능합니다.
                </li>
                <li>별도의 연령 확인 절차는 구글 계정 인증으로 대체됩니다.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 청소년 보호를 위한 조치 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldLock className="w-5 h-5 text-purple-400" />
            3. 청소년 보호를 위한 조치
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">3.1 유해정보 차단</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  음란, 폭력성, 반사회적 가사 등 청소년에게 유해한 내용이 포함된
                  음악은 제한 조치됩니다.
                </li>
                <li>
                  신고된 유해 콘텐츠는 검토 후 연령 제한 설정 또는 삭제
                  조치됩니다.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">3.2 모니터링 및 신고</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>청소년 유해정보에 대한 상시 신고를 접수하여 처리합니다.</li>
                <li>
                  각 콘텐츠의 신고하기 버튼을 통해 유해 콘텐츠 신고가
                  가능합니다.
                </li>
                <li>
                  신고된 정보는 심의를 거쳐 연령 제한 설정, 삭제 등의 조치가
                  이루어집니다.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. 청소년보호 책임자 지정 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCheck className="w-5 h-5 text-purple-400" />
            4. 청소년보호 책임자 지정
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">
                4.1 청소년보호 책임자
              </h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>책임자: 최정원</li>
                <li>연락처: amp.from.vivian@gmail.com</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4.2 책임자의 역할</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>청소년보호 정책 수립 및 시행</li>
                <li>유해정보로부터의 청소년 보호 조치 실행</li>
                <li>피해 청소년에 대한 보호 조치 실시</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. 제재 조치 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconGavel className="w-5 h-5 text-purple-400" />
            5. 제재 조치
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">
                5.1 위반 행위에 대한 조치
              </h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>청소년 유해정보 무단 게시: 경고 및 연령 제한 설정</li>
                <li>반복적 위반: 서비스 이용 제한</li>
                <li>심각한 위반: 계정 영구 정지 및 관련 기관 신고</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">5.2 제재 절차</h3>
              <ol className="list-decimal list-inside space-y-2 text-white/80">
                <li>신고 접수</li>
                <li>담당자 검토</li>
                <li>유해정보 판단</li>
                <li>연령 제한 설정 또는 삭제 조치</li>
                <li>결과 통보</li>
              </ol>
            </div>
          </div>
        </section>

        {/* 6. 청소년 보호를 위한 기타 사항 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldCheck className="w-5 h-5 text-purple-400" />
            6. 청소년 보호를 위한 기타 사항
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">6.1 콘텐츠 관리</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>청소년 유해 상품/서비스 광고를 금지합니다.</li>
                <li>선정적이거나 폭력적인 이미지의 사용을 제한합니다.</li>
                <li>유해 콘텐츠 식별 시 즉시 연령 제한 조치를 취합니다.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">6.2 개인정보 보호</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>청소년의 개인정보는 관련 법령에 따라 엄격히 보호됩니다.</li>
                <li>
                  청소년의 개인정보 유출 및 남용을 방지하기 위한 보호조치를
                  시행합니다.
                </li>
              </ul>
            </div>
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
              청소년보호정책에 대한 문의사항은{" "}
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
    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
      </div>
      <p className="text-white/80">{content}</p>
    </div>
  );
}
