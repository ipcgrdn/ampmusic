import { Separator } from "@/components/ui/separator";
import {
  IconCopyright,
  IconGavel,
  IconAlertCircle,
  IconShieldCheck,
  IconFlag,
  IconUserCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";
export default function CopyrightPage() {
  return (
    <div className="space-y-8">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <IconCopyright className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">AMP 저작권 정책</h1>
          </div>
          <p className="text-sm text-white/60">시행일: 2025년 1월 1일</p>
        </div>
      </div>

      <Separator />

      {/* 주요 정보 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          icon={<IconShieldCheck className="w-5 h-5" />}
          title="저작권 보호"
          content="국내외 저작권법 및 국제 협약 준수"
        />
        <InfoCard
          icon={<IconGavel className="w-5 h-5" />}
          title="제재 정책"
          content="단계별 제재 및 영구 차단 정책 운영"
        />
        <InfoCard
          icon={<IconFlag className="w-5 h-5" />}
          title="신고 절차"
          content="체계적인 저작권 침해 신고 및 처리"
        />
        <InfoCard
          icon={<IconUserCheck className="w-5 h-5" />}
          title="이용자 의무"
          content="창작자와 이용자의 권리와 의무"
        />
      </div>

      <div className="prose prose-invert max-w-none">
        {/* 저작권을 지켜야하는 이유 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconInfoCircle className="w-5 h-5 text-purple-400" />
            저작권을 지켜야하는 이유
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <ul className="list-disc list-inside space-y-2 text-white/80">
              <li>창작자의 권리를 보호하고 창작 의욕을 고취시킵니다.</li>
              <li>건전한 음악 생태계 조성에 기여합니다.</li>
              <li>법적 분쟁을 예방하고 안전한 서비스 이용이 가능합니다.</li>
              <li>글로벌 음악 시장에서의 신뢰성을 확보할 수 있습니다.</li>
            </ul>
          </div>
        </section>

        {/* 1. 개요 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconCopyright className="w-5 h-5 text-purple-400" />
            1. 개요
          </h2>
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-white/80">
              Alternative Music Platform(이하 &ldquo;AMP&rdquo;)은 전 세계 창작자들의 음악
              활동과 소통을 지원하는 글로벌 플랫폼으로서, 국내외 모든 이용자의
              저작권을 존중하며 건전한 창작 문화 조성을 위해 노력합니다.
            </p>
          </div>
        </section>

        {/* 2. 저작권 보호 원칙 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconShieldCheck className="w-5 h-5 text-purple-400" />
            2. 저작권 보호 원칙
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">
                2.1 국제 저작권법 준수
              </h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  AMP는 대한민국 저작권법을 기본으로 하되, 베른협약 등 국제
                  저작권 협약을 준수합니다.
                </li>
                <li>
                  이용자는 자신의 국가 및 서비스 이용 국가의 저작권법을 준수해야
                  합니다.
                </li>
                <li>
                  국가간 저작권 분쟁 발생 시, 관련 국제 협약 및 법률에 따라
                  처리됩니다.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                2.2 창작물의 권리와 책임
              </h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  업로드된 모든 창작물에 대한 저작권과 관리 책임은 전적으로
                  창작자 본인에게 있습니다.
                </li>
                <li>
                  AMP는 창작물에 대한 별도의 라이선스를 제공하지 않습니다.
                </li>
                <li>
                  창작자는 자신의 창작물 보호를 위해 필요한 법적 조치를 직접
                  취해야 합니다.
                </li>
                <li>
                  저작권 분쟁 발생 시 해당 창작물의 업로드 시점과 변경 이력만을
                  참고자료로 제공합니다.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">2.3 면책 조항</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  AMP는 플랫폼 내의 저작권 침해 행위에 대해 어떠한 법적 책임도
                  지지 않습니다.
                </li>
                <li>
                  저작권 침해로 인한 법적 분쟁 발생 시 AMP는 해당 이용자를
                  보호하지 않습니다.
                </li>
                <li>
                  본 저작권 정책에 동의한 이용자는 이러한 면책 조항을 충분히
                  이해한 것으로 간주됩니다.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 제재 정책 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconGavel className="w-5 h-5 text-purple-400" />
            3. 제재 정책
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">
                3.1 저작권 침해자에 대한 제재
              </h3>
              <p className="text-white/80 mb-2">
                저작권 침해가 확인된 이용자에게는 다음과 같은 제재가 적용됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                <li>1차 위반: 경고 및 해당 콘텐츠 삭제</li>
                <li>2차 위반: 최종 경고 및 해당 콘텐츠 삭제</li>
                <li>3차 위반: 서비스 이용 영구 차단</li>
              </ul>
              <p className="text-white/60 mt-2 text-sm">
                * 심각한 저작권 침해의 경우, 경고 없이 즉시 서비스 이용이 차단될
                수 있습니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                3.2 악의적 신고자에 대한 제재
              </h3>
              <p className="text-white/80 mb-2">
                허위 또는 악의적인 저작권 침해 신고에 대해서는 다음과 같은
                제재가 적용됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                <li>1차 위반: 경고</li>
                <li>2차 위반: 최종 경고</li>
                <li>3차 위반: 서비스 이용 영구 차단</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. 신고 및 처리 절차 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconFlag className="w-5 h-5 text-purple-400" />
            4. 신고 및 처리 절차
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">4.1 신고 절차</h3>
              <p className="text-white/80 mb-2">
                저작권 침해가 의심되는 콘텐츠는 게시물 신고 기능을 통해 신고할
                수 있습니다.
              </p>
              <p className="text-white/80 mb-2">
                신고 시 다음 정보를 포함해야 합니다:
              </p>
              <ul className="list-decimal list-inside space-y-2 text-white/80 ml-4">
                <li>침해당한 원본 창작물의 정보</li>
                <li>침해 의심 게시물의 URL</li>
                <li>침해 내용에 대한 구체적인 설명</li>
                <li>신고자의 저작권 소유 증명 자료</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4.2 처리 절차</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>접수된 신고는 관리자 검토 후 처리됩니다.</li>
                <li>
                  명백한 저작권 침해가 확인된 경우 해당 콘텐츠는 사전 통보 없이
                  삭제됩니다.
                </li>
                <li>
                  신고된 사항에 대한 이의제기는{" "}
                  <Link
                    href="/docs/support"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    고객센터
                  </Link>{" "}
                를 통해 할 수 있습니다.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. 이용자의 의무 */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <IconUserCheck className="w-5 h-5 text-purple-400" />
            5. 이용자의 의무
          </h2>
          <div className="space-y-6 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <h3 className="text-lg font-medium mb-2">5.1 창작자의 의무</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>
                  창작자는 자신의 창작물에 대한 저작권 보호를 위해 필요한 모든
                  조치를 직접 취해야 합니다.
                </li>
                <li>
                  필요한 경우 법적 대리인을 통해 저작권 보호 조치를 진행해야
                  합니다.
                </li>
                <li>
                  저작권 침해 발생 시 이를 입증할 수 있는 자료를 준비해야
                  합니다.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">5.2 이용자의 의무</h3>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>모든 이용자는 타인의 저작권을 존중해야 합니다.</li>
                <li>
                  저작권 침해 행위가 확인될 경우 관련 법령에 따른 모든 책임은
                  해당 이용자에게 있습니다.
                </li>
                <li>본 정책을 숙지하고 이를 준수할 책임이 있습니다.</li>
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
              저작권 정책에 대한 문의사항은{" "}
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

// InfoCard 컴포넌트
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
