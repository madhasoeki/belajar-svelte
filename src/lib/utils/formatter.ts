// src/lib/utils/formatter.ts

/**
 * Format angka menjadi standar Indonesia, Rupiah, atau bentuk ringkas (compact)
 * @param value Angka mentah (integer/float)
 * @param format "standard" (15.000) | "currency" (Rp 15.000) | "compact" (15 rb / 15 jt)
 */
export function formatNumber(
  value: number,
  format: "currency" | "compact" | "standard" = "standard",
) {
  if (format === "currency") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (format === "compact") {
    return new Intl.NumberFormat("id-ID", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value); 
  }
  
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Format angka persentase trend dengan tanda plus/minus
 * @param val Angka trend (contoh: 5.2, -1.5, 0)
 */
export function formatTrend(val: number) {
  if (val === 0) return "0%"; // Biar 0 gak dikasih tanda plus
  const isPositive = val > 0;
  // Angka negatif otomatis sudah bawa tanda "-" dari Javascript-nya
  return `${isPositive ? "+" : ""}${val}%`;
}