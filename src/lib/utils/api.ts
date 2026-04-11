import { PUBLIC_API_URL } from "$env/static/public";

const shouldForceLogout = (status: number, errorData: any) => {
  if (status !== 401) return false;

  const message = String(errorData?.pesan || errorData?.message || "").toLowerCase();
  // Hanya paksa logout jika memang indikasi token/sesi tidak valid atau expired.
  return /(token|jwt|expired|invalid|unauthorized|sesi|session)/.test(message);
};

const maybeRedirectToLogin = (status: number, errorData: any) => {
  if (
    shouldForceLogout(status, errorData) &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  ) {
    localStorage.removeItem("admin_token");
    window.location.href = "/login";
  }
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Pastikan kode ini berjalan di browser (window terdefinisi), bukan di server Svelte
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiClient = {

  // 1. Fungsi POST (Untuk Insert Data)
  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] POST ${endpoint}:`, error);
      throw error;
    }
  },

  // 2. Fungsi GET (Untuk Ambil Data / Search)
  async get(endpoint: string) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] GET ${endpoint}:`, error);
      throw error;
    }
  },

  // 2b. Fungsi GET Blob (Untuk Download CSV/File)
  async getBlob(endpoint: string) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`[API Error] GET(BLOB) ${endpoint}:`, error);
      throw error;
    }
  },

  // 3. Fungsi PATCH (Untuk Update Sebagian Data)
  async patch(endpoint: string, data: any) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] PATCH ${endpoint}:`, error);
      throw error;
    }
  },

  // 4. Fungsi PUT (Untuk Update Data Utuh)
  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] PUT ${endpoint}:`, error);
      throw error;
    }
  },

  // 5. Fungsi DELETE (Untuk Menghapus Data)
  async delete(endpoint: string, data?: any) {
    try {
      const options: RequestInit = {
        method: "DELETE",
        headers: getAuthHeaders(),
      };

      // Jika ada payload data (misalnya untuk hapus massal / bulk delete)
      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        maybeRedirectToLogin(response.status, errorData);

        throw new Error(errorData?.pesan || errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] DELETE ${endpoint}:`, error);
      throw error;
    }
  },

};