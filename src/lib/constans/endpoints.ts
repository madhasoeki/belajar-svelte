export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    LOGOUT: "/logout",
  },
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
  },
  CABANG: {
    CREATE: "/cabang",
    UPDATE: "/cabang",
    LIST: "/cabang",
    UPDATE_STATUS: (id: string) => `/cabang/${id}/status`,
    DELETE: "/cabang",
  },
  TIM: {
    CREATE: "/tim",
    UPDATE: "/tim",
    LIST: "/tim",
    UPDATE_STATUS: (id: string) => `/tim/${id}/status`,
    DELETE: "/tim",
  },
  USER: {
    CREATE: "/user",
    UPDATE: "/user",
    LIST: "/user",
    UPDATE_STATUS: (id: string) => `/user/${id}/status`,
    DELETE: "/user",
  },
  ROLE: {
    LIST: "/role",
  }
} as const;
