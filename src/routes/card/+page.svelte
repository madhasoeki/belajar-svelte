<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  
  // Asumsi Button dan Input sudah bisa di-import
  import Button from "$lib/components/ui/button/Button.svelte";
  import Input from "$lib/components/ui/forms/Input.svelte";
  
  import { Users, AlertTriangle, CheckCircle, TrendingUp, Save } from "lucide-svelte";
</script>

<div class="p-8 space-y-12 max-w-6xl mx-auto bg-gray-50 min-h-screen">
  
  <div class="border-b pb-4">
    <h1 class="text-2xl font-bold">Card Showcase</h1>
    <p class="text-gray-500">Dokumentasi komponen struktural untuk membungkus konten.</p>
  </div>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-800">1. Varian Warna (State/Status)</h2>
    <p class="text-sm text-gray-500">Digunakan untuk memberi sinyal visual tentang status dari data di dalamnya.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Background putih standar</CardDescription>
        </CardHeader>
        <CardContent><p class="text-3xl font-bold">1,245</p></CardContent>
      </Card>

      <Card variant="success">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-green-800">
            <CheckCircle size={18} /> Success
          </CardTitle>
        </CardHeader>
        <CardContent><p class="text-green-700">Operasi berhasil dilakukan.</p></CardContent>
      </Card>

      <Card variant="warning">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={18} /> Warning
          </CardTitle>
        </CardHeader>
        <CardContent><p class="text-amber-700">Kuota penyimpanan hampir penuh.</p></CardContent>
      </Card>

      <Card variant="danger">
        <CardHeader>
          <CardTitle class="text-red-800">Danger</CardTitle>
        </CardHeader>
        <CardContent><p class="text-red-700">Gagal terhubung ke database.</p></CardContent>
      </Card>
    </div>
  </section>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-800">2. Variasi Anatomi</h2>
    <p class="text-sm text-gray-500">Card bisa dirakit sebagian, tidak harus selalu memakai semua komponen Header/Content/Footer.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <Card>
        <CardContent class="pt-6"> <h3 class="font-bold text-gray-800 mb-2">Card Minimalis</h3>
          <p class="text-sm text-gray-500">Tanpa Header dan Footer. Cocok untuk komponen kecil atau widget statis.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi User</CardTitle>
          <CardDescription>Detail profil singkat</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="text-sm space-y-2">
            <li><span class="font-medium">Nama:</span> Mada</li>
            <li><span class="font-medium">Role:</span> Admin Gudang</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Pendapatan</CardTitle>
          <TrendingUp size={16} class="text-gray-400" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">Rp 12.500.000</div>
          <p class="text-xs text-gray-500">+19% dari bulan lalu</p>
        </CardContent>
      </Card>

    </div>
  </section>

  <section class="space-y-4">
    <h2 class="text-lg font-semibold text-gray-800">3. Implementasi Kompleks (Formulir)</h2>
    <p class="text-sm text-gray-500">Contoh merakit Card dengan komponen ekosistem lainnya.</p>
    
    <div class="max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kategori</CardTitle>
          <CardDescription>Buat kategori baru untuk pengelompokan barang inventaris.</CardDescription>
        </CardHeader>
        
        <CardContent class="space-y-4">
          <Input label="Nama Kategori" placeholder="Elektronik, ATK, dll" />
          <Input label="Kode Prefix" placeholder="Misal: ELK" />
        </CardContent>
        
        <CardFooter class="justify-between border-t border-gray-100 pt-4">
          <Button variant="ghost">Batal</Button>
          <Button variant="primary" icon={Save}>Simpan Kategori</Button>
        </CardFooter>
      </Card>
    </div>
  </section>

</div>