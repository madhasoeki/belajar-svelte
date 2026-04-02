<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
  import { toastStore } from "$lib/stores/toast.svelte";
  import { CircleCheck, CircleAlert, Info, TriangleAlert, Send, Trash2 } from "lucide-svelte";

  function triggerSuccess() {
    toastStore.success("Data donatur berhasil diverifikasi dan disimpan ke sistem.", "Verifikasi Berhasil");
  }

  function triggerError() {
    toastStore.error("Gagal mengunggah berkas. Pastikan ukuran file di bawah 2MB.", "Kesalahan Unggah");
  }

  function triggerWarning() {
    toastStore.warning("Koneksi internet tidak stabil. Data mungkin gagal disinkronkan.", "Peringatan Koneksi");
  }

  function triggerInfo() {
    toastStore.info("Sistem akan melakukan maintenance rutin pada pukul 23:00 WIB.", "Informasi Sistem");
  }

  function triggerLong() {
    toastStore.add(
      "Ini adalah notifikasi tanpa judul dengan pesan yang cukup panjang untuk menguji bagaimana teks membungkus (wrap) di dalam container toast yang terbatas.",
      "primary",
      undefined,
      10000 
    );
  }
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Komponen Toast Showcase</h1>
    <p class="text-gray-500">
      Sistem notifikasi dinamis untuk memberikan umpan balik instan atas aksi pengguna.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    
    <Card>
      <CardHeader>
        <CardTitle>1. Trigger Berdasarkan Tipe</CardTitle>
        <CardDescription>Klik tombol di bawah untuk memunculkan berbagai variasi status notifikasi.</CardDescription>
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-4">
        <button 
          onclick={triggerSuccess}
          class="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
        >
          <CircleCheck size={16} /> Success Toast
        </button>

        <button 
          onclick={triggerError}
          class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
        >
          <CircleAlert size={16} /> Error Toast
        </button>

        <button 
          onclick={triggerWarning}
          class="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition"
        >
          <TriangleAlert size={16} /> Warning Toast
        </button>

        <button 
          onclick={triggerInfo}
          class="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
        >
          <Info size={16} /> Info Toast
        </button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>2. Skenario Penggunaan Riil</CardTitle>
        <CardDescription>Simulasi integrasi toast pada alur kerja aplikasi SAMS/SIMGUDANG.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between p-3 border border-(--color-border) rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 rounded-md"><Send size={18} class="text-gray-600" /></div>
            <div>
              <p class="text-sm font-semibold">Kirim Laporan Bulanan</p>
              <p class="text-xs text-gray-500">Kirim ke email pengurus yayasan</p>
            </div>
          </div>
          <button 
            onclick={() => toastStore.success("Laporan telah dikirim ke 3 antrean email.", "Email Terkirim")}
            class="text-xs font-bold text-(--color-primary) hover:underline"
          >
            KIRIM SEKARANG
          </button>
        </div>

        <div class="flex items-center justify-between p-3 border border-(--color-border) rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-50 rounded-md"><Trash2 size={18} class="text-red-600" /></div>
            <div>
              <p class="text-sm font-semibold">Kosongkan Cache Sistem</p>
              <p class="text-xs text-gray-500">Hapus semua data sesi sementara</p>
            </div>
          </div>
          <button 
            onclick={() => toastStore.warning("Cache berhasil dibersihkan. Sesi Anda akan dimulai ulang.", "Cache Cleared")}
            class="text-xs font-bold text-red-600 hover:underline"
          >
            HAPUS CACHE
          </button>
        </div>

        <button 
          onclick={triggerLong}
          class="w-full py-2 border border-dashed border-gray-300 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition"
        >
          Trigger Notifikasi Durasi Lama (10 Detik)
        </button>
      </CardContent>
    </Card>

  </div>
</div>