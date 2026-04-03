import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Box, 
  Settings, 
  HelpCircle,
  Layers, 
  MousePointerClick,
  TableProperties,
  PanelTop,
  Activity,
  PieChart
} from "lucide-svelte";

export const appMenus = [
  // 1. MENU BISNIS UTAMA
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "transaksi", label: "Transaksi", icon: Receipt, href: "/transaksi" },
  { 
    id: "donatur", 
    label: "Donatur", 
    icon: Users,
    children: [
      { id: "data-donatur", label: "Data Donatur", href: "/donatur/data" },
      { id: "tambah-donatur", label: "Tambah Donatur", href: "/donatur/tambah" },
      { id: "segmen-donatur", label: "Segmen & Grup", href: "/donatur/segmen" }
    ]
  },
  { 
    id: "gudang", 
    label: "Gudang", 
    icon: Box,
    children: [
      { id: "stok-barang", label: "Stok Barang", href: "/gudang/stok" },
      { id: "barang-masuk", label: "Barang Masuk", href: "/gudang/masuk" },
      { id: "barang-keluar", label: "Barang Keluar", href: "/gudang/keluar" }
    ]
  },

  {
    id: "showcase",
    label: "Showcase UI",
    icon: Layers,
    children: [
      { id: "showcase-alert", label: "Alert", href: "/showcase/alert" },
      { id: "showcase-avatar", label: "Avatar", href: "/showcase/avatar" },
      { id: "showcase-badge", label: "Badge", href: "/showcase/badge" },
      { id: "showcase-button", label: "Button", href: "/showcase/button" },
      { id: "showcase-card", label: "Layout & Cards", href: "/showcase/card" },
      { id: "showcase-charts", label: "Data Visualization", href: "/showcase/charts" },
      { id: "showcase-dropdown", label: "Dropdown", href: "/showcase/dropdown" },
      { id: "showcase-forms", label: "Forms", href: "/showcase/forms" },
      { id: "showcase-metrics", label: "Metrics & Widgets", href: "/showcase/metrics" },
      { id: "showcase-modal", label: "Modal", href: "/showcase/modal" },
      { id: "showcase-table", label: "Data Table", href: "/showcase/table" },
      { id: "showcase-toast", label: "Toast", href: "/showcase/toast" },
    ]
  },

  // 3. MENU UTILITAS
  { id: "pengaturan", label: "Pengaturan", icon: Settings, href: "/pengaturan" },
  { id: "bantuan", label: "Bantuan", icon: HelpCircle, href: "/bantuan" },
];