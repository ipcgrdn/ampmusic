import { Separator } from "@/components/ui/separator";
import {
  IconCookie,
  IconShieldLock,
  IconServer,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconCookie className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">AMP 쿠키 정책</h1>
          </div>
          <p className="text-sm text-white/60">
            마지막 업데이트: 2025년 2월 7일
          </p>
        </div>
      </div>

      <Separator />

      {/* 개요 섹션 */}
      <div className="prose prose-invert max-w-none">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <p className="text-white/80 leading-relaxed">
            AMP(Alternative Music Platform)는 서비스 제공을 위해 필수적인 쿠키를
            사용합니다. 본 쿠키 정책은 정보통신망 이용촉진 및 정보보호 등에 관한
            법률(이하 &ldquo;정보통신망법&rdquo;) 제22조 및 개인정보 보호법에 따라 당사가
            쿠키를 사용하는 방법과 목적에 대한 정보를 제공합니다.
          </p>
        </div>

        {/* 주요 정보 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <InfoCard
            icon={<IconCookie className="w-5 h-5" />}
            title="쿠키란?"
            content="쿠키는 사용자가 웹사이트를 방문할 때 사용자의 기기에 저장되는 작은 텍스트 파일입니다."
          />
          <InfoCard
            icon={<IconShieldLock className="w-5 h-5" />}
            title="보안"
            content="모든 쿠키는 암호화되어 저장되며, 보안을 위해 HTTPS 프로토콜을 사용합니다."
          />
          <InfoCard
            icon={<IconServer className="w-5 h-5" />}
            title="저장 기간"
            content="JWT 표준에 따른 만료 기간이 설정되어 있으며, 만료 시점에 자동으로 삭제됩니다."
          />
          <InfoCard
            icon={<IconSettings className="w-5 h-5" />}
            title="설정"
            content="AMP는 필수 쿠키만을 사용하므로 별도의 쿠키 설정 옵션을 제공하지 않습니다."
          />
        </div>

        {/* AMP 쿠키 목록 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            1. AMP가 사용하는 쿠키
          </h2>
          <div className="grid gap-4">
            <CookieCard
              name="XSRF-TOKEN"
              description="크로스 사이트 요청 위조(CSRF) 공격을 방지하기 위한 보안 쿠키"
              type="보안"
            />
            <CookieCard
              name="_csrf"
              description="보안 토큰으로, API 요청의 신뢰성을 보장"
              type="보안"
            />
            <CookieCard
              name="access_token"
              description="사용자의 로그인 상태를 유지하고 인증된 API 요청을 처리하기 위한 쿠키"
              type="인증"
            />
          </div>
        </section>

        {/* 쿠키의 사용 목적 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            2. 쿠키의 사용 목적
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              당사가 사용하는 모든 쿠키는 서비스의 기본적인 기능 제공을 위한
              필수 쿠키입니다. 이러한 쿠키들은 다음과 같은 목적으로 사용됩니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>사용자 로그인 상태 유지</li>
              <li>보안된 API 통신 보장</li>
              <li>서비스의 안전한 이용 보장</li>
            </ul>
          </div>
        </section>

        {/* 쿠키 저장 기간 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            3. 쿠키 저장 기간
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              모든 쿠키는 JWT(JSON Web Token) 표준에 따른 만료 기간이 설정되어
              있으며, 만료 시점에 자동으로 삭제됩니다.
            </p>
          </div>
        </section>

        {/* 제3자 쿠키 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            4. 제3자 쿠키
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              당사는 현재 어떠한 제3자 쿠키도 사용하지 않습니다. 다만, 콘텐츠
              공유 기능 사용 시 Navigator Share API를 통해 외부 서비스와의
              연동이 발생할 수 있습니다.
            </p>
          </div>
        </section>

        {/* 7. 쿠키 수집 정보 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            5. 쿠키 수집 정보
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              당사의 쿠키는 오직 사용자의 로그인 상태 정보만을 수집하며, 그 외의
              개인정보는 수집하지 않습니다.
            </p>
          </div>
        </section>

        {/* 8. 개인정보 저장 및 국외이전 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            6. 개인정보 저장 및 국외이전
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              당사는 Amazon Web Services(AWS)를 통해 서비스를 제공하며, 데이터는
              국내 리전에서 저장 및 처리됩니다. 서비스 제공을 위한 시스템 구성
              변경 시, 데이터 저장 위치가 변경될 수 있으며, 이 경우{" "}
              <Link
                href="/docs/privacy"
                className="text-purple-400 hover:text-purple-300"
              >
                개인정보 처리방침
              </Link>{" "}
              을 통해 별도 고지하겠습니다.
            </p>
          </div>
        </section>

        {/* 9. 쿠키 설정 및 거부 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            7. 쿠키 설정 및 거부
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              AMP 서비스는 필수 쿠키만을 사용하므로 별도의 쿠키 설정 옵션을
              제공하지 않습니다. 쿠키 사용을 거부할 경우 다음과 같은 제한이
              있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>로그인이 불가능합니다</li>
              <li>서비스의 대부분의 기능을 이용할 수 없습니다</li>
            </ul>
            <p className="text-white/80 mt-4">
              따라서 원활한 서비스 이용을 위해서는 쿠키 사용을 허용해야 합니다.
            </p>
          </div>
        </section>

        {/* 10. 이용자의 권리와 행사 방법 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            8. 이용자의 권리와 행사 방법
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              이용자는 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지 요구
              등의 권리를 가지고 있습니다. 이러한 권리는 고객센터를 통해
              언제든지 행사하실 수 있습니다.
            </p>
          </div>
        </section>

        {/* 11. 개인정보 보호책임자 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            9. 개인정보 보호책임자
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              개인정보 보호책임자 정보는{" "}
              <Link
                href="/docs/privacy"
                className="text-purple-400 hover:text-purple-300"
              >
                개인정보 처리방침
              </Link>
              에서 확인하실 수 있습니다.
            </p>
          </div>
        </section>

        {/* 12. 정책 변경 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            10. 정책 변경
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              본 쿠키 정책의 내용은 법령 변경이나 서비스 변경 등에 따라 수정될
              수 있습니다. 정책이 변경될 경우, 변경 사항을 서비스 내에
              공지하겠습니다.
            </p>
          </div>
        </section>

        {/* 13. 문의사항 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCookie className="w-5 h-5 text-purple-400" />
            11. 문의사항
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              쿠키 정책에 대해 궁금한 점이 있으시다면{" "}
              <Link
                href="/docs/support"
                className="text-purple-400 hover:text-purple-300"
              >
                고객센터
              </Link>
              를 통해 문의해 주시기 바랍니다.
            </p>
          </div>
        </section>
      </div>

      {/* 문의하기 섹션 */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <IconCookie className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">문의하기</h3>
            <p className="text-sm text-white/60">
              쿠키 정책에 대한 문의사항은{" "}
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

// 쿠키 카드 컴포넌트
function CookieCard({
  name,
  description,
  type,
}: {
  name: string;
  description: string;
  type: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white">{name}</h4>
        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400">
          {type}
        </span>
      </div>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  );
}
