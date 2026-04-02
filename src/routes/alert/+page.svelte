<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import Alert from "$lib/components/ui/alert/Alert.svelte";
  import { AlertCircle, CheckCircle2, Info, AlertTriangle, ShieldAlert, RotateCcw } from "lucide-svelte";

  // State untuk mendemonstrasikan alert yang bisa di-close
  let showDismissibleAlert = $state(true);

  function resetAlert() {
    showDismissibleAlert = false;
    setTimeout(() => {
      showDismissibleAlert = true;
    }, 100);
  }
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Komponen Alert Showcase</h1>
    <p class="text-gray-500">
      Dokumentasi pesan statis (Callout) untuk memberikan konteks informasi, peringatan, atau error pada struktur halaman.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    
    <div class="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle>1. Varian Status (Warna Tema)</CardTitle>
          <CardDescription>
            Alert standar menggunakan variabel warna sistem untuk konsistensi.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-4">
          <Alert variant="info" icon={Info}>
            Pembaruan sistem SAMS v2.0 akan dilakukan pada tengah malam.
          </Alert>

          <Alert variant="success" icon={CheckCircle2}>
            Laporan rekapitulasi gudang berhasil diekspor ke PDF.
          </Alert>

          <Alert variant="warning" icon={AlertTriangle}>
            Kuota penyimpanan AWS S3 untuk Yayasan hampir penuh (92%).
          </Alert>

          <Alert variant="danger" icon={AlertCircle}>
            Gagal terhubung ke database. Silakan periksa konfigurasi .env Anda.
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Struktur Teks (Tanpa Ikon)</CardTitle>
          <CardDescription>
            Penggunaan minimalis jika ruang terbatas atau ikon dirasa mengganggu.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-4">
          <Alert variant="primary">
            Ini adalah alert sederhana tanpa judul dan tanpa ikon.
          </Alert>
          
          <Alert variant="success">
            <strong>Berhasil!</strong> Data donatur telah diverifikasi.
          </Alert>
        </CardContent>
      </Card>

    </div>

    <div class="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle>3. Alert dengan Judul (Title)</CardTitle>
          <CardDescription>
            Digunakan untuk menjelaskan pesan error atau informasi yang cukup panjang.
          </CardDescription>
        </CardHeader>
        <CardContent class="grid grid-cols-1 gap-4">
          <Alert variant="danger" icon={ShieldAlert} title="Akses Ditolak (403)">
            Akun Anda tidak memiliki izin untuk menghapus data master barang. Silakan hubungi Administrator sistem jika ini adalah sebuah kesalahan.
          </Alert>

          <Alert variant="info" icon={Info} title="Tips Penggunaan">
            Anda dapat menggunakan shortcut <code class="bg-black/10 px-1 py-0.5 rounded text-xs">Ctrl + K</code> untuk membuka menu pencarian global dengan cepat.
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>4. Interaktif (Dismissible)</CardTitle>
              <CardDescription>
                Alert yang dapat ditutup oleh pengguna.
              </CardDescription>
            </div>
            <button 
              onclick={resetAlert}
              class="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition"
              title="Reset Alert"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </CardHeader>
        <CardContent class="min-h-30">
          {#if showDismissibleAlert}
            <Alert 
              variant="warning" 
              icon={AlertTriangle} 
              title="Selesaikan Profil Anda" 
              dismissible={true}
            >
              Mohon lengkapi data alamat dan nomor telepon institusi untuk mempercepat proses verifikasi pencairan dana. Klik tanda silang di kanan untuk menutup pesan ini.
            </Alert>
          {:else}
            <p class="text-sm text-gray-400 italic text-center py-4">Alert telah ditutup. Klik tombol putar di atas untuk memunculkan kembali.</p>
          {/if}
        </CardContent>
      </Card>

    </div>

  </div>
</div>