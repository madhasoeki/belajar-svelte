export const API_ENDPOINTS = {
  DONASI: {
    CREATE: "/transaksi",
  },
  DONATUR: {
    SEARCH: "/donatur/search",
    LIST: "/donatur",
    EXPORT: "/donatur/export",
    UPDATE_LABEL: (id: string) => `/donatur/${id}/label`,
  },
  TRANSAKSI: {
    LIST: "/transaksi",
    EXPORT: "/transaksi/export",
  },
  LABEL: {
    LIST: "/labels",
  },
  DOMISILI: {
    LIST: "/domisili",
  }
} as const;
