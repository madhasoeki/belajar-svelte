<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";

  import Button from "$lib/components/ui/button/Button.svelte";
  import { Plus, ArrowRight, Trash, Download, Save, Send, Search, Bell } from "lucide-svelte";

  let isSubmitting = $state(false);

  function handleSimulateLoad() {
    isSubmitting = true;
    setTimeout(() => {
      isSubmitting = false;
    }, 2000);
  }
</script>

<div class="p-8 space-y-8 max-w-4xl mx-auto pb-20">
  
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Button Showcase</h1>
    <p class="text-gray-500">Dokumentasi penggunaan komponen Button dan variannya yang dibungkus dalam ekosistem Card.</p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>1. Varian (Variants)</CardTitle>
      <CardDescription>Digunakan untuk membedakan hierarki aksi (aksi utama, sekunder, atau destruktif).</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4">
      <Button variant="primary">Primary (Utama)</Button>
      <Button variant="secondary">Secondary (Alternatif)</Button>
      <Button variant="outline">Outline (Netral)</Button>
      <Button variant="ghost">Ghost (Transparan)</Button>
      <Button variant="danger">Danger (Destruktif)</Button>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>2. Ukuran (Sizes)</CardTitle>
      <CardDescription>Disesuaikan dengan ruang antarmuka. Gunakan 'sm' untuk tabel, 'md' untuk form standar.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap items-end gap-4">
      <Button size="sm">Small (Tabel/Card)</Button>
      <Button size="md">Medium (Default)</Button>
      <Button size="lg">Large (Hero/Banner)</Button>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>3. Ikon (Icons)</CardTitle>
      <CardDescription>Menambahkan konteks visual pada tombol. Perhatikan posisi logis ikon.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4">
      <Button icon={Plus}>Tambah Data</Button>
      <Button icon={Download} variant="outline">Unduh Laporan</Button>
      <Button icon={ArrowRight} iconPosition="right">Langkah Berikutnya</Button>
      
      <Button icon={Trash} variant="danger" aria-label="Hapus" />
      <Button icon={Search} variant="ghost" aria-label="Cari" />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>4. State: Loading & Disabled</CardTitle>
      <CardDescription>Memberikan feedback kepada user bahwa sistem sedang bekerja atau tidak bisa diakses.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-4 items-center">
      <Button disabled>Tidak Aktif</Button>
      <Button isLoading={true}>Menyimpan...</Button>
      
      <Button 
        variant="primary" 
        icon={Save} 
        isLoading={isSubmitting} 
        onclick={handleSimulateLoad}
      >
        Klik untuk Simulasi Loading
      </Button>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>5. Kustomisasi Lanjutan (Override Class)</CardTitle>
      <CardDescription>Menimpa lebar atau gaya spesifik menggunakan prop class untuk kebutuhan layout tertentu.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <Button class="w-full" icon={Send}>
        Tombol Selebar Kontainer (w-full)
      </Button>

      <div class="grid grid-cols-2 gap-4">
        <Button variant="outline" class="w-full">Batal</Button>
        <Button variant="primary" class="w-full">Simpan</Button>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>6. Badge & Notifikasi</CardTitle>
      <CardDescription>Indikator visual untuk menarik perhatian pengguna terhadap pembaruan atau tugas yang tertunda.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-wrap gap-6 items-center">
      <Button variant="outline" icon={Bell} badge={true}>
        Notifikasi Baru
      </Button>
      
      <Button variant="primary" icon={Bell} badge={3}>
        Pesan Masuk
      </Button>

      <Button variant="secondary" badge="99+">
        Semua Notifikasi
      </Button>

      <Button variant="ghost" icon={Bell} badge={true} aria-label="Notifikasi" class="text-gray-600 hover:text-gray-900" />
    </CardContent>
  </Card>

</div>