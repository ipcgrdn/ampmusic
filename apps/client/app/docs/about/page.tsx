'use client';

import {
  IconBuildingStore,
  IconDeviceLaptop,
  IconHeartHandshake,
  IconMail,
  IconMusic,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 비전 섹션 */}
      <VisionSection />

      {/* 핵심 가치 섹션 */}
      <CoreValuesSection />

      {/* 주요 기능 섹션 */}
      <FeaturesSection />

      {/* 약속 섹션 */}
      <PromiseSection />

      {/* 연락처 섹션 */}
      <ContactSection />
    </div>
  );
}

function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-[40vh] flex items-center justify-center overflow-hidden rounded-3xl"
    >
      {/* 배경 효과 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-transparent to-blue-500/30" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Alternative
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Music Platform
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            누구나 아티스트가 될 수 있는 새로운 음악 플랫폼
          </p>
        </motion.div>
      </div>

      {/* 장식용 원형 */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
    </motion.div>
  );
}

function VisionSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-8">우리의 비전</h2>
        <p className="text-lg text-white/80 leading-relaxed">
          AMP는 기존 음악 산업의 대안이 되어, 더 자유롭고 다양한 음악 생태계를
          만들어가고자 합니다. 우리는 모든 창작자들이 자유롭게 음악을 공유하고,
          팬들과 직접 소통할 수 있는 플랫폼을 지향합니다.
        </p>
      </div>
    </motion.section>
  );
}

function CoreValuesSection() {
  const values = [
    {
      icon: <IconPencil className="w-6 h-6" />,
      title: "창작의 자유",
      description: "장르나 형식에 구애받지 않는 자유로운 음악 창작",
    },
    {
      icon: <IconUsers className="w-6 h-6" />,
      title: "커뮤니티 중심",
      description: "아티스트와 팬 간의 직접적인 소통과 교류",
    },
    {
      icon: <IconDeviceLaptop className="w-6 h-6" />,
      title: "접근성",
      description: "누구나 쉽게 이용할 수 있는 직관적인 인터페이스",
    },
    {
      icon: <IconMusic className="w-6 h-6" />,
      title: "창작자 중심",
      description: "누구나 아티스트가 될 수 있는 열린 플랫폼",
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <h2 className="text-3xl font-bold text-center mb-12">핵심 가치</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {values.map((value, index) => (
          <motion.div
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 
                     backdrop-blur-xl hover:bg-white/[0.04] transition-all
                     hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10">{value.icon}</div>
              <h3 className="text-xl font-semibold">{value.title}</h3>
            </div>
            <p className="text-white/60">{value.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "음악 업로드",
      items: ["간편한 음원 업로드", "앨범 아트워크 관리", "음원 정보 관리"],
    },
    {
      title: "소셜 네트워크",
      items: [
        "아티스트-팬 직접 소통",
        "플레이리스트 공유",
        "태그 기능",
        "실시간 알림",
      ],
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 
                     border border-white/10 backdrop-blur-xl"
          >
            <h3 className="text-xl font-semibold mb-6">{feature.title}</h3>
            <ul className="space-y-4">
              {feature.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function PromiseSection() {
  const promises = [
    {
      icon: <IconHeartHandshake className="w-6 h-6" />,
      title: "창작자를 위한 약속",
      items: ["지속적인 창작 지원", "창작 활동 지원", "저작권 보호"],
    },
    {
      icon: <IconUsers className="w-6 h-6" />,
      title: "이용자를 위한 약속",
      items: ["양질의 음악 콘텐츠", "안정적인 서비스", "개인정보 보호"],
    },
    {
      icon: <IconBuildingStore className="w-6 h-6" />,
      title: "음악 산업을 위한 약속",
      items: ["건전한 생태계 조성", "다양성 존중", "창작자 중심 발전"],
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <h2 className="text-3xl font-bold text-center mb-12">우리의 약속</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {promises.map((promise, index) => (
          <motion.div
            key={promise.title}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 
                     backdrop-blur-xl hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10">{promise.icon}</div>
              <h3 className="text-lg font-semibold">{promise.title}</h3>
            </div>
            <ul className="space-y-3">
              {promise.items.map((item) => (
                <li key={item} className="text-sm text-white/60">
                  • {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function ContactSection() {
  const contacts = [
    {
      icon: <IconMail className="w-5 h-5" />,
      label: "이메일",
      value: "amp.from.vivian@gmail.com",
      href: "mailto:amp.from.vivian@gmail.com",
    },
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">연락처</h2>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] 
                     border border-white/10 backdrop-blur-xl hover:bg-white/[0.04] 
                     transition-all group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 
                          transition-colors">
                {contact.icon}
              </div>
              <div>
                <div className="text-sm text-white/40">{contact.label}</div>
                <div className="text-white/80 group-hover:text-white transition-colors">
                  {contact.value}
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {/* 업데이트 예정 메시지 */}
        <p className="text-center text-sm text-white/40 mt-8">
          추후 정보가 업데이트될 예정입니다
        </p>
      </div>
    </motion.section>
  );
} 