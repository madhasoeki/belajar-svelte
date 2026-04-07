import { apiClient } from "$lib/utils/api";
import { API_ENDPOINTS } from "$lib/constans/endpoints";

/**
 * Mengambil data master (Program, Rekening, Sumber) dan memformatnya untuk Dropdown UI.
 */
export async function getMasterDropdownOptions() {
  try {
    const [progRes, rekRes, sumberRes] = await Promise.all([
      apiClient.get(API_ENDPOINTS.PROGRAM.LIST),
      apiClient.get(API_ENDPOINTS.REKENING.LIST),
      apiClient.get(API_ENDPOINTS.SUMBER.LIST)
    ]);

    const programs = (progRes.data || []).map((item: any) => ({
      label: item.nama_program,
      value: item.id
    }));

    const rekenings = (rekRes.data || []).map((item: any) => ({
      label: `${item.alias || item.nama_bank} - ${item.nomor_rekening}`,
      value: item.id
    }));

    const sumbers = (sumberRes.data || []).map((item: any) => ({
      label: item.sumber_transaksi,
      value: item.id
    }));

    return { programs, rekenings, sumbers };
  } catch (error) {
    console.error("Gagal memuat master data dropdown:", error);
    // Return array kosong agar UI tidak crash jika API gagal
    return { programs: [], rekenings: [], sumbers: [] }; 
  }
}

/**
 * Menunda eksekusi fungsi selama beberapa milidetik (Debounce).
 * Sangat berguna untuk input pencarian agar tidak spam API.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number = 500) {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}