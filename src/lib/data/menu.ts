import {
  LayoutDashboard,
  Receipt,
  Users,
  Box,
  Settings,
  HelpCircle,
  Layers,
  HandCoins,
  Building
} from "lucide-svelte";
import { ROUTES } from "$lib/constans/routes";

export const appMenus = [
  // 1. MENU BISNIS UTAMA
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
  { id: "input-donasi", label: "Input Donasi", icon: HandCoins, href: ROUTES.INPUT_DONASI, main: true },
  { id: "transaksi", label: "Transaksi", icon: Receipt, href: ROUTES.TRANSAKSI.INDEX },
  { id: "donatur", label: "Donatur", icon: Users, href: ROUTES.DONATUR.INDEX },
  {
    id: "gudang",
    label: "Gudang",
    icon: Box,
    children: [
      { id: "stok-barang", label: "Stok Barang", href: ROUTES.GUDANG.STOK },
      { id: "barang-masuk", label: "Barang Masuk", href: ROUTES.GUDANG.MASUK },
      { id: "barang-keluar", label: "Barang Keluar", href: ROUTES.GUDANG.KELUAR }
    ]
  },

  {
    id: "showcase",
    label: "Showcase UI",
    icon: Layers,
    children: [
      { id: "showcase-alert", label: "Alert", href: ROUTES.SHOWCASE.ALERT },
      { id: "showcase-avatar", label: "Avatar", href: ROUTES.SHOWCASE.AVATAR },
      { id: "showcase-badge", label: "Badge", href: ROUTES.SHOWCASE.BADGE },
      { id: "showcase-button", label: "Button", href: ROUTES.SHOWCASE.BUTTON },
      { id: "showcase-card", label: "Layout & Cards", href: ROUTES.SHOWCASE.CARD },
      { id: "showcase-charts", label: "Data Visualization", href: ROUTES.SHOWCASE.CHARTS },
      { id: "showcase-dropdown", label: "Dropdown", href: ROUTES.SHOWCASE.DROPDOWN },
      { id: "showcase-forms", label: "Forms", href: ROUTES.SHOWCASE.FORMS },
      { id: "showcase-metrics", label: "Metrics & Widgets", href: ROUTES.SHOWCASE.METRICS },
      { id: "showcase-modal", label: "Modal", href: ROUTES.SHOWCASE.MODAL },
      { id: "showcase-table", label: "Data Table", href: ROUTES.SHOWCASE.TABLE },
      { id: "showcase-toast", label: "Toast", href: ROUTES.SHOWCASE.TOAST },
    ]
  },

  // 3. MENU UTILITAS
  { id: "cabang", label: "Cabang", icon: Building, href: ROUTES.CABANG.INDEX },
  { id: "tim", label: "Tim", icon: Users, href: ROUTES.TIM.INDEX },
  { id: "user", label: "Users", icon: Users, href: ROUTES.USER.INDEX },
  { id: "pengaturan", label: "Pengaturan", icon: Settings, href: ROUTES.PENGATURAN },
  { id: "bantuan", label: "Bantuan", icon: HelpCircle, href: ROUTES.BANTUAN },
];