import {
  IconHome,
  IconWorld,
  IconCirclePlus,
} from "@tabler/icons-react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: IconHome },
  { href: "/explore", label: "탐색", icon: IconWorld },
  { href: "/upload", label: "업로드", icon: IconCirclePlus },
];