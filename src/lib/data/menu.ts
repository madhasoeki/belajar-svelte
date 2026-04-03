import { LayoutDashboard, Receipt, Users, Box, FileText, Settings, HelpCircle } from "lucide-svelte";

export const appMenus = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "transaksi", label: "Transaksi", icon: Receipt, href: "/transaksi" },
  { id: "donatur", label: "Donatur", icon: Users, href: "/donatur" },
  { id: "gudang", label: "Gudang", icon: Box, href: "/gudang" },
  { id: "laporan", label: "Laporan", icon: FileText, href: "/laporan" },
  { id: "pengaturan", label: "Pengaturan", icon: Settings, href: "/pengaturan" },
  { id: "alert", label: "Alert", icon: Settings, href: "/alert" },
  { id: "avatar", label: "Avatar", icon: Settings, href: "/avatar" },
  { id: "form", label: "Form", icon: Settings, href: "/form" },
  { id: "card", label: "Card", icon: Settings, href: "/card" },
  { id: "metrics", label: "Metrics", icon: Settings, href: "/metrics" },
  { id: "charts", label: "Charts", icon: Settings, href: "/charts" },
  { id: "bantuan", label: "Bantuan", icon: HelpCircle, href: "/bantuan" },
];