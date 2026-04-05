export const API_ENDPOINTS = {
  DONASI: {
    CREATE: "/transaksi",
  },
  DONATUR: {
    SEARCH: "/donatur/search",
    LIST: "/donatur",
    EXPORT: "/donatur/export",
  },
  TRANSAKSI: {
    LIST: "/transaksi",
    EXPORT: "/transaksi/export",
  },
} as const;
