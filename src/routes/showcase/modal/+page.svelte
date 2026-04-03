<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import Modal from "$lib/components/ui/modal/Modal.svelte";
  import Input from "$lib/components/ui/forms/Input.svelte";
  import Button from "$lib/components/ui/button/Button.svelte"; // Pastikan path ini sesuai
  import { TriangleAlert, Trash2, CircleCheck } from "lucide-svelte";
  import { toastStore } from "$lib/stores/toast.svelte";

  // State untuk masing-masing tipe Modal
  let showBasicModal = $state(false);
  let showFormModal = $state(false);
  let showDangerModal = $state(false);
  let showStrictModal = $state(false);

  // Dummy state untuk Form dalam Modal
  let newCategoryName = $state("");

  // Handler simulasi
  function handleDelete() {
    showDangerModal = false;
    toastStore.error("Data barang berhasil dihapus permanen.", "Terhapus");
  }

  function handleSaveForm() {
    showFormModal = false;
    toastStore.success(`Kategori "${newCategoryName}" ditambahkan.`, "Berhasil");
    newCategoryName = "";
  }
</script>

<div class="p-8 max-w-7xl mx-auto pb-20">
  <div class="border-b pb-4 mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Komponen Modal Showcase</h1>
    <p class="text-gray-500">
      Dialog interaktif (Pop-up) untuk interupsi tugas, form cepat, dan konfirmasi keamanan.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    
    <div class="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Basic Information</CardTitle>
          <CardDescription>
            Modal standar untuk menampilkan informasi atau kesepakatan panjang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onclick={() => (showBasicModal = true)}>
            Buka Syarat & Ketentuan
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Input Form di dalam Modal</CardTitle>
          <CardDescription>
            Cocok untuk tugas cepat (seperti tambah kategori) tanpa meninggalkan halaman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="primary" onclick={() => (showFormModal = true)}>
            Tambah Kategori Baru
          </Button>
        </CardContent>
      </Card>
    </div>

    <div class="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>3. Konfirmasi Destruktif (Danger)</CardTitle>
          <CardDescription>
            Meminta persetujuan eksplisit sebelum melakukan aksi berbahaya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" icon={Trash2} onclick={() => (showDangerModal = true)}>
            Hapus Data Gudang
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Strict Mode (Prevent Close)</CardTitle>
          <CardDescription>
            Modal yang memaksa user melakukan aksi, tidak bisa ditutup lewat klik luar atau tombol ESC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="primary" class="bg-gray-800 hover:bg-gray-900" onclick={() => (showStrictModal = true)}>
            Buka Strict Modal
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

<Modal 
  bind:open={showBasicModal} 
  title="Syarat dan Ketentuan Sistem SAMS"
  description="Pembaruan terakhir: 12 April 2026"
  size="lg"
>
  <div class="space-y-4 text-sm text-(--color-text-secondary) leading-relaxed">
    <p>Dengan menggunakan sistem informasi ini, pengelola setuju untuk mematuhi seluruh protokol keamanan data donatur yang ditetapkan oleh Yayasan.</p>
    <p>Semua data transaksi yang diinput harus didukung dengan bukti nyata. Administrator berhak mencabut akses jika ditemukan indikasi penyalahgunaan kredensial.</p>
  </div>
  
  {#snippet footer()}
    <Button variant="outline" onclick={() => (showBasicModal = false)}>Tutup</Button>
    <Button variant="primary" onclick={() => (showBasicModal = false)}>Saya Mengerti</Button>
  {/snippet}
</Modal>

<Modal 
  bind:open={showFormModal} 
  title="Tambah Kategori Gudang"
  size="sm"
>
  <div class="space-y-4 pt-2 pb-6">
    <Input 
      label="Nama Kategori" 
      placeholder="Misal: Elektronik, Konsumsi..." 
      bind:value={newCategoryName} 
    />
  </div>
  
  {#snippet footer()}
    <Button variant="ghost" onclick={() => (showFormModal = false)}>Batal</Button>
    <Button variant="primary" onclick={handleSaveForm}>Simpan Kategori</Button>
  {/snippet}
</Modal>

<Modal 
  bind:open={showDangerModal} 
  size="sm"
>
  <div class="flex flex-col items-center text-center pt-4 pb-2">
    <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
      <TriangleAlert size={24} strokeWidth={2} />
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Data Permanen?</h3>
    <p class="text-sm text-gray-500 px-4">
      Data transaksi ini akan dihapus secara permanen dari sistem SIMGUDANG dan tidak dapat dipulihkan. Lanjutkan?
    </p>
  </div>
  
  {#snippet footer()}
    <Button variant="outline" class="w-full" onclick={() => (showDangerModal = false)}>Batal</Button>
    <Button variant="danger" class="w-full" onclick={handleDelete}>Ya, Hapus</Button>
  {/snippet}
</Modal>

<Modal 
  bind:open={showStrictModal} 
  title="Wajib Konfirmasi"
  description="Tindakan ini membutuhkan verifikasi."
  preventClose={true}
  size="md"
>
  <div class="py-4 text-sm text-(--color-text-secondary)">
    Anda tidak bisa menutup pop-up ini dengan menekan ESC atau mengklik latar belakang hitam. Anda harus mengeklik tombol persetujuan di bawah.
  </div>
  
  {#snippet footer()}
    <Button 
      variant="primary" 
      class="bg-gray-900 hover:bg-black" 
      icon={CircleCheck}
      onclick={() => {
        showStrictModal = false;
        toastStore.success("Verifikasi selesai.", "Verified");
      }}
    >
      Verifikasi Sekarang
    </Button>
  {/snippet}
</Modal>