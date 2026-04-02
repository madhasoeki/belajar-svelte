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
  import { TriangleAlert, Trash2, CircleCheck } from "lucide-svelte";
  import { toastStore } from "$lib/stores/toast.svelte"; // Kita gunakan toast yang baru dibuat!

  // State untuk masing-masing tipe Modal
  let showBasicModal = $state(false);
  let showFormModal = $state(false);
  let showDangerModal = $state(false);
  let showStrictModal = $state(false); // Modal yang tidak bisa di-close sembarangan

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
    newCategoryName = ""; // Reset
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
          <button 
            onclick={() => (showBasicModal = true)}
            class="px-4 py-2 bg-white border border-(--color-border) hover:bg-gray-50 text-sm font-medium rounded-lg transition"
          >
            Buka Syarat & Ketentuan
          </button>
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
          <button 
            onclick={() => (showFormModal = true)}
            class="px-4 py-2 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white text-sm font-medium rounded-lg transition"
          >
            Tambah Kategori Baru
          </button>
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
          <button 
            onclick={() => (showDangerModal = true)}
            class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-sm font-medium rounded-lg transition"
          >
            <Trash2 size={16} /> Hapus Data Gudang
          </button>
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
          <button 
            onclick={() => (showStrictModal = true)}
            class="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition"
          >
            Buka Strict Modal
          </button>
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
    <button 
      onclick={() => (showBasicModal = false)}
      class="px-4 py-2 bg-white border border-(--color-border) text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
    >
      Tutup
    </button>
    <button 
      onclick={() => (showBasicModal = false)}
      class="px-4 py-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-lg text-sm font-medium transition"
    >
      Saya Mengerti
    </button>
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
    <button 
      onclick={() => (showFormModal = false)}
      class="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
    >
      Batal
    </button>
    <button 
      onclick={handleSaveForm}
      class="px-4 py-2 bg-(--color-primary) text-white hover:bg-(--color-primary-hover) rounded-lg text-sm font-medium transition"
    >
      Simpan Kategori
    </button>
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
    <button 
      onclick={() => (showDangerModal = false)}
      class="px-4 py-2 w-full bg-white border border-(--color-border) text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
    >
      Batal
    </button>
    <button 
      onclick={handleDelete}
      class="px-4 py-2 w-full bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition"
    >
      Ya, Hapus
    </button>
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
    <button 
      onclick={() => {
        showStrictModal = false;
        toastStore.success("Verifikasi selesai.", "Verified");
      }}
      class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-black rounded-lg text-sm font-medium transition"
    >
      <CircleCheck size={16} /> Verifikasi Sekarang
    </button>
  {/snippet}
</Modal>