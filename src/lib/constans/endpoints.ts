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
    DELETE: "/transaksi",
  },
  LABEL: {
    LIST: "/labels",
  },
  DOMISILI: {
    LIST: "/domisili",
  },
  REKENING: {
    LIST: "/rekening",
  },
  SUMBER: {
    LIST: "/sumber",
  },
  PROGRAM: {
    LIST: "/program",
  }
} as const;
