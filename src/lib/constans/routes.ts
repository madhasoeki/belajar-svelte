export const ROUTES = {
    DASHBOARD: "/dashboard",
    LOGIN: "/login",
    INPUT_DONASI: "/input-donasi",
    PENGATURAN: "/pengaturan",
    BANTUAN: "/bantuan",

    TRANSAKSI: {
        INDEX: "/transaksi",
        DETAIL: (id: string | number) => `/transaksi/${id}`,
        EDIT: (id: string | number) => `/transaksi/edit/${id}`,
    },

    DONATUR: {
        INDEX: "/donatur",
    },

    CABANG: {
        INDEX: "/cabang",
        CREATE: "/cabang/tambah",
        EDIT: (id: string | number) => `/cabang/edit/${id}`,
    },

    TIM: {
        INDEX: "/tim",
        CREATE: "/tim/tambah",
        EDIT: (id: string | number) => `/tim/edit/${id}`,
    },

    USER: {
        INDEX: "/user",
        CREATE: "/user/tambah",
        EDIT: (id: string | number) => `/user/edit/${id}`,
    },

    GUDANG: {
        STOK: "/gudang/stok",
        MASUK: "/gudang/masuk",
        KELUAR: "/gudang/keluar",
    },

    SHOWCASE: {
        ALERT: "/showcase/alert",
        AVATAR: "/showcase/avatar",
        BADGE: "/showcase/badge",
        BUTTON: "/showcase/button",
        CARD: "/showcase/card",
        CHARTS: "/showcase/charts",
        DROPDOWN: "/showcase/dropdown",
        FORMS: "/showcase/forms",
        METRICS: "/showcase/metrics",
        MODAL: "/showcase/modal",
        TABLE: "/showcase/table",
        TOAST: "/showcase/toast",
    },
} as const;