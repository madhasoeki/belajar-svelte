<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  
  import Input from "$lib/components/ui/input/Input.svelte";
  // Import CurrencyInput yang baru kita buat
  import CurrencyInput from "$lib/components/ui/input/CurrencyInput.svelte";
  
  import { User, Mail, Lock, Search, CreditCard, AlertCircle, DollarSign, Hash } from "lucide-svelte";

  // State untuk demonstrasi binding
  let textValue = $state("");
  let emailValue = $state("");
  let passwordValue = $state("");
  let errorValue = $state("mada@domain"); // Sengaja diset salah untuk demo
  
  // State untuk angka dan mata uang
  let stockValue = $state<number | null>(null);
  let moneyValue = $state<number | null>(null);
  let donationValue = $state<number | null>(null);
</script>

<div class="p-8 space-y-8 max-w-5xl mx-auto pb-20">
  
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Input Showcase</h1>
    <p class="text-gray-500">Dokumentasi variasi, state, dan anatomi komponen Input.</p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>1. Tipe Dasar (Basic Types)</CardTitle>
      <CardDescription>Penggunaan input standar untuk berbagai jenis data tanpa modifikasi visual berat.</CardDescription>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input 
        label="Teks Standar" 
        placeholder="Masukkan nama lengkap..." 
        bind:value={textValue} 
      />
      
      <Input 
        label="Alamat Email" 
        type="email"
        placeholder="nama@perusahaan.com" 
        bind:value={emailValue} 
      />

      <Input 
        label="Nomor (Number Only)" 
        type="number"
        placeholder="0" 
      />

      <Input 
        label="Tanpa Label" 
        placeholder="Input ini tidak memiliki prop label..." 
      />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>2. Ikonografi & Keamanan</CardTitle>
      <CardDescription>Implementasi ikon untuk konteks visual dan fitur toggle bawaan pada input password.</CardDescription>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input 
        label="Ikon Kiri (iconLeft)" 
        iconLeft={User}
        placeholder="Username" 
      />

      <Input 
        label="Ikon Kanan (iconRight)" 
        iconRight={Search}
        placeholder="Cari data..." 
      />

      <Input 
        label="Kombinasi Dua Ikon" 
        iconLeft={CreditCard}
        iconRight={AlertCircle}
        placeholder="Nomor rekening..." 
      />

      <Input 
        label="Kata Sandi (Password Toggle)" 
        type="password"
        iconLeft={Lock}
        placeholder="Masukkan sandi rahasia" 
        bind:value={passwordValue}
      />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>3. State & Feedback</CardTitle>
      <CardDescription>Memberikan informasi tambahan kepada pengguna mengenai status input mereka.</CardDescription>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input 
        label="Teks Bantuan (Helper)" 
        placeholder="Misal: SIMGUDANG" 
        helper="Gunakan huruf kapital untuk kode singkatan."
      />

      <Input 
        label="Status Error" 
        iconLeft={Mail}
        bind:value={errorValue}
        error="Format email tidak valid. Gunakan @."
      />

      <Input 
        label="Dinonaktifkan (Disabled)" 
        value="Data dari database (Read-only)"
        disabled={true}
        helper="Input ini terkunci dan tidak bisa diedit."
      />

      <Input 
        label="Error & Disabled" 
        value="Sistem terkunci"
        disabled={true}
        error="Koneksi terputus."
      />
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>4. Format Numerik & Mata Uang</CardTitle>
      <CardDescription>Penanganan khusus untuk input angka murni dan nominal finansial berformat.</CardDescription>
    </CardHeader>
    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Input 
        label="Nomor Bawaan (Dengan Spin Button)" 
        type="number"
        placeholder="0"
        helper="Browser menampilkan tombol naik/turun (default)."
      />

      <Input 
        label="Nomor Bersih (Tanpa Spin Button)" 
        type="number"
        hideSpinButtons={true}
        iconLeft={Hash}
        bind:value={stockValue}
        placeholder="0"
        helper="Tombol naik/turun disembunyikan menggunakan prop."
      />

      <CurrencyInput 
        label="Nominal Donasi (Dengan Prefix)" 
        bind:value={donationValue}
        currencyPrefix="Rp"
        placeholder="Rp 0"
        helper="Nilai di database: {donationValue === null ? 'null' : donationValue}"
      />

      <CurrencyInput 
        label="Target Pengumpulan (Tanpa Prefix)" 
        iconLeft={DollarSign}
        bind:value={moneyValue}
        placeholder="1.000.000"
        helper="Nilai di database: {moneyValue === null ? 'null' : moneyValue}"
      />
      
    </CardContent>
  </Card>

</div>