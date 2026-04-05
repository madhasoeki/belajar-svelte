import { PUBLIC_API_URL } from "$env/static/public";

export const apiClient = {
  
  // 1. Fungsi POST (Untuk Insert Data)
  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Terjadi kesalahan: ${response.status}`);
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
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] GET ${endpoint}:`, error);
      throw error;
    }
  },

// 3. Fungsi PATCH (Untuk Update Sebagian Data)
  async patch(endpoint: string, data: any) {
    try {
      const response = await fetch(`${PUBLIC_API_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Terjadi kesalahan: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] PATCH ${endpoint}:`, error);
      throw error;
    }
  },

};